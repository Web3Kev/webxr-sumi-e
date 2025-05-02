import { useState, useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3, BufferGeometry, BufferAttribute, CatmullRomCurve3 } from 'three'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useXRControllerButtonEvent, useXRInputSourceState } from '@react-three/xr'
import { useAtom } from 'jotai'
import { backAtom, baseTubeRadiusAtom, clearAtom, decreaseRadiusAtom, drawAtom, increaseRadiusAtom } from './atom'


interface BrushStrokePoint {
  position: Vector3
  pressure: number
  timestamp: number
}

interface BrushStroke {
  points: BrushStrokePoint[]
  geometry: BufferGeometry
  active: boolean
  id: string
}

const MIN_DISTANCE = 0.01
const MAX_POINTS = 2000
const BASE_TUBE_SEGMENTS = 8
const MIN_CURVE_DIVISIONS = 32
const MAX_CURVE_DIVISIONS = 256
const SEGMENTS_PER_POINT = 4
const controllerPosition = new Vector3();
const paintBallPosition = new Vector3();
const controllerQuaternion = new THREE.Quaternion();

const brushVertexShader = `
  varying float vOpacity;
  attribute float opacity;
  
  void main() {
    vOpacity = opacity;
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    
    gl_Position = projectedPosition;
  }
`

const brushFragmentShader = `
  varying float vOpacity;
  
  void main() {
    gl_FragColor = vec4(0, 0, 0, vOpacity);
  }
`

export const BrushPainting = () => {
  
  const { camera, gl } = useThree()

  const [strokes, setStrokes] = useState<BrushStroke[]>([])
  const activeStrokeRef = useRef<BrushStroke | null>(null)
  const strokesRef = useRef<BrushStroke[]>([])

  const [trigger, setTrigger ]= useState(false);

  const triggerPressed= useRef(false);

  const controller_right = useXRInputSourceState("controller", "right");
  const controller_left = useXRInputSourceState("controller", "left");

  const paintBallRef = useRef<THREE.Mesh>(null);
  const controllerRef = useRef<THREE.Group>(null);

  // const [BASE_TUBE_RADIUS,setRadius] = useState(0.01)
  const [radius] = useAtom(baseTubeRadiusAtom)

  const [, increase] = useAtom(increaseRadiusAtom)
  const [, decrease] = useAtom(decreaseRadiusAtom)

  const [back, setBack] = useAtom(backAtom)
  const [clear, setClear] = useAtom(clearAtom)
   const [draw, setDraw] = useAtom(drawAtom)

  const brushMaterial = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: brushVertexShader,
    fragmentShader: brushFragmentShader,
    transparent: true,
    blending: THREE.NormalBlending,
    depthWrite: false,
  }), [])

  const vibrate = (controller: ReturnType<typeof useXRInputSourceState>) => {
    try {
      controller?.inputSource?.gamepad?.vibrationActuator?.playEffect("dual-rumble", {
        duration: 10,
        strongMagnitude: 1,
        weakMagnitude: 0.5,
      });
    } catch {
      console.log("No haptic feedback available");
    }
  };

  useXRControllerButtonEvent(controller_right!, "b-button", (state) => {
    if (state === "pressed") {
      vibrate(controller_right);
      setClear(true);
    }
    if (state === "touched") {
    }
    if (state === "default") {
      // setClear(false);
    }
  });

  useXRControllerButtonEvent(controller_right!, "a-button", (state) => {
    if (state === "pressed") {
      vibrate(controller_right);
      setBack(true)
    }
    if (state === "touched") {
    }
    if (state === "default") {
      // setBack(false)
    }
  });

  useXRControllerButtonEvent(controller_right!, "xr-standard-trigger", (state) => {
    if (state === "pressed") {
      if(!draw){setDraw(true);}
      vibrate(controller_right);
     setTrigger(true);
    }
    if (state === "default") {
      setTrigger(false);
    }
  });

  useXRControllerButtonEvent(controller_left!, "y-button", (state) => {
    if (state === "pressed") {
     increase();
    }
  });

  useXRControllerButtonEvent(controller_left!, "x-button", (state) => {
    if (state === "pressed") {
      decrease();
    }
  });

const createTubeGeometry = (points: BrushStrokePoint[], radius: number): BufferGeometry => {
  if (points.length < 2) return new BufferGeometry()

  // Calculate total stroke length
  let totalLength = 0
  for (let i = 1; i < points.length; i++) {
    totalLength += points[i].position.distanceTo(points[i - 1].position)
  }

  // Calculate dynamic segments based on stroke length and point count
  const curvePoints = points.map(p => p.position)
  const curve = new CatmullRomCurve3(curvePoints)
  
  // Dynamic radial segments based on stroke length
  const dynamicRadialSegments = Math.max(
    BASE_TUBE_SEGMENTS,
    Math.min(16, Math.floor(totalLength * 2))
  )

  // Dynamic curve divisions based on point count and stroke length
  const pointBasedDivisions = points.length * SEGMENTS_PER_POINT
  const lengthBasedDivisions = Math.floor(totalLength * 50) // 50 divisions per unit length
  const curveDivisions = Math.min(
    MAX_CURVE_DIVISIONS,
    Math.max(MIN_CURVE_DIVISIONS, pointBasedDivisions, lengthBasedDivisions)
  )

  // Create tube geometry with dynamic segmentation
  const tubeGeometry = new THREE.TubeGeometry(
    curve,
    curveDivisions,
    radius,
    dynamicRadialSegments,
    false
  )

  // Calculate dynamic radius based on stroke length and pressure
  const radiusArray = new Float32Array(points.length)
  for (let i = 0; i < points.length; i++) {
    const t = i / (points.length - 1)
    const pressure = points[i].pressure
    
    // Taper the ends more gradually for longer strokes
    const taperStart = Math.min(0.1, 2 / points.length)
    const taperEnd = Math.max(0.9, 1 - (2 / points.length))
    
    let taper = 1
    if (t < taperStart) {
      taper = t / taperStart
    } else if (t > taperEnd) {
      taper = (1 - t) / (1 - taperEnd)
    }
    
    radiusArray[i] = radius * pressure * taper
  }

  // Apply dynamic radius to vertices
  const positionAttribute = tubeGeometry.attributes.position
  const normalAttribute = tubeGeometry.attributes.normal
  const positions = positionAttribute.array as Float32Array
  const normals = normalAttribute.array as Float32Array
  
  for (let i = 0; i < positions.length; i += 3) {
    const vertexIndex = i / 3
    const curveIndex = Math.floor(vertexIndex / dynamicRadialSegments)
    const t = curveIndex / curveDivisions
    const radiusIndex = Math.min(points.length - 1, Math.floor(t * points.length))
    const radius = radiusArray[radiusIndex]

    // Scale vertex position based on radius
    const nx = normals[i]
    const ny = normals[i + 1]
    const nz = normals[i + 2]
    const centerX = positions[i] - nx * radius
    const centerY = positions[i + 1] - ny * radius
    const centerZ = positions[i + 2] - nz * radius
    
    positions[i] = centerX + nx * radius
    positions[i + 1] = centerY + ny * radius
    positions[i + 2] = centerZ + nz * radius
  }

  // Update position attribute
  positionAttribute.needsUpdate = true


    const opacityAttribute = new Float32Array(tubeGeometry.attributes.position.count)
    for (let i = 0; i < opacityAttribute.length; i++) {
      const vertexIndex = i
      const curveIndex = Math.floor(vertexIndex / dynamicRadialSegments)
      const t = curveIndex / curveDivisions
      
      const pressureIndex = Math.min(points.length - 1, Math.floor(t * points.length))
      const pressure = points[pressureIndex].pressure
      
      // Adjusted fade parameters for sharper transition
      const fadeStart = 0.5//0.85  // Starts fading later
      const fadeEnd = 1.0
      
      // Calculate opacity
      let opacity = 1.0  // Start fully opaque
      
      if (t > fadeStart) {
        // Only apply fade near the end
        const fadeT = (t - fadeStart) / (fadeEnd - fadeStart)
        opacity = 1.0 - fadeT * fadeT  // Quadratic falloff for smoother fade
      }
      
      // Apply pressure to opacity only at the fade point
      opacityAttribute[i] = opacity * (t > fadeStart ? pressure : 1.0)
    }

    tubeGeometry.setAttribute('opacity', new BufferAttribute(opacityAttribute, 1))
    return tubeGeometry

}

const updateStrokes = (newStrokes: BrushStroke[]) => {

  strokesRef.current = newStrokes
  setStrokes([...newStrokes])
}

const onPaintStart = (position: Vector3, pressure = 1) => {

  const newStroke: BrushStroke = {
    points: [{ position: position.clone(), pressure, timestamp: Date.now() }],
    geometry: new BufferGeometry(),
    active: true,
    id: Math.random().toString(36).substr(2, 9)  // Generate unique ID
  }
  activeStrokeRef.current = newStroke
  updateStrokes([...strokesRef.current, newStroke])
}

const onPaintMove = (position: Vector3, pressure = 1) => {

  if (!activeStrokeRef.current) return

  const lastPoint = activeStrokeRef.current.points[activeStrokeRef.current.points.length - 1]
  const distance = position.distanceTo(lastPoint.position)

  if (distance > MIN_DISTANCE && activeStrokeRef.current.points.length < MAX_POINTS) {
    const newPoints = [...activeStrokeRef.current.points, {
      position: position.clone(),
      pressure,
      timestamp: Date.now()
    }]

    // Update with new geometry
    activeStrokeRef.current.points = newPoints
    activeStrokeRef.current.geometry = createTubeGeometry(newPoints, radius)
    
    // re-render
    updateStrokes([...strokesRef.current])
  }
}

const onPaintEnd = () => {

  if (activeStrokeRef.current) {

    const finalGeometry = createTubeGeometry(activeStrokeRef.current.points,radius)

    // Update with final geometry
    activeStrokeRef.current.geometry = finalGeometry
    activeStrokeRef.current.active = false

    // re-render
    updateStrokes([...strokesRef.current])

    activeStrokeRef.current = null
  }
}

const eraseLastStroke = () => {
  updateStrokes(strokesRef.current.slice(0, -1))
  setBack(false);
}

const eraseAll = () => {
  updateStrokes([])
  setClear(false);
}


useFrame(() => {

    //make sphere paintBallRef with its offsetting parent controllerRef, follow controller
    if(controller_right)
    {
        controller_right.object?.getWorldPosition(controllerPosition);
        controller_right.object?.getWorldQuaternion(controllerQuaternion);

        if(controllerRef.current)
        {
            controllerRef.current.position.copy(controllerPosition);
            controllerRef.current.quaternion.copy(controllerQuaternion);
        }
    }

    // Call onPaintMove if triggerPressed, at paintBallRef position
    if (controller_right && triggerPressed.current && paintBallRef.current) 
    {
      paintBallRef.current.getWorldPosition(paintBallPosition);
      onPaintMove(paintBallPosition);
    }
    
});


useEffect(() => {
    
  if(paintBallRef.current)
  {
    if(trigger)
    {
      if(!triggerPressed.current)
      {
        triggerPressed.current=true;
        if(paintBallRef.current)
        {
            paintBallRef.current.getWorldPosition(paintBallPosition);
            onPaintStart(paintBallPosition)
        }
      }
    }
    else
    {
      if(triggerPressed.current)
      {
        triggerPressed.current=false;
        onPaintEnd()
      }
    }
  }
    
}, [trigger])



useEffect(() => {
  
  if(back)
  {
      eraseLastStroke();
  }
  
}, [back])

useEffect(() => {
  
  if(clear)
  {
      eraseAll();
  }
  
}, [clear])


useEffect(() => {
  
  if(controller_right)
  {
      console.log("controller found")
  }
  else
  {
      console.log("no controller")
  }
  
}, [controller_right])


////////////////////////////////////////
// TOUCH DEVICE && DESKTOP MOUSEDOWN
////////////////////////////////////////

useEffect(() => {
  const canvas = gl.domElement
  let isDrawing = false
  let lastTouchPos = new Vector3()

  const getTouchPosition = (event: TouchEvent | MouseEvent) => {
    const rect = canvas.getBoundingClientRect()
    const clientX = (event instanceof TouchEvent ? event.touches[0].clientX : event.clientX)
    const clientY = (event instanceof TouchEvent ? event.touches[0].clientY : event.clientY)
    const x = ((clientX - rect.left) / rect.width) * 2 - 1
    const y = -((clientY - rect.top) / rect.height) * 2 + 1
    const vector = new Vector3(x, y, 0.5)
    vector.unproject(camera)
    return vector
  }

  const startDrawing = (event: TouchEvent | MouseEvent) => {
    if (!draw) return
    isDrawing = true
    lastTouchPos = getTouchPosition(event)
    onPaintStart(lastTouchPos)
  }

  const moveDrawing = (event: TouchEvent | MouseEvent) => {
    if (!isDrawing || !draw) return
    // event.preventDefault() 
    const currentPos = getTouchPosition(event)
    onPaintMove(currentPos)
    lastTouchPos = currentPos
  }

  const endDrawing = () => {
    if (!isDrawing) return
    isDrawing = false
    onPaintEnd()
  }

  canvas.addEventListener('mousedown', startDrawing)
  canvas.addEventListener('mousemove', moveDrawing)
  canvas.addEventListener('mouseup', endDrawing)
  canvas.addEventListener('mouseleave', endDrawing)

  canvas.addEventListener('touchstart', startDrawing)
  canvas.addEventListener('touchmove', moveDrawing, { passive: false }) // prevent scroll
  canvas.addEventListener('touchend', endDrawing)
  canvas.addEventListener('touchcancel', endDrawing)

  return () => {
    canvas.removeEventListener('mousedown', startDrawing)
    canvas.removeEventListener('mousemove', moveDrawing)
    canvas.removeEventListener('mouseup', endDrawing)
    canvas.removeEventListener('mouseleave', endDrawing)

    canvas.removeEventListener('touchstart', startDrawing)
    canvas.removeEventListener('touchmove', moveDrawing)
    canvas.removeEventListener('touchend', endDrawing)
    canvas.removeEventListener('touchcancel', endDrawing)
  }
}, [camera, gl.domElement, radius, draw])

return (
  <>
    {strokes.map((stroke) => (
      <mesh
        key={stroke.id}
        geometry={stroke.geometry}
        material={brushMaterial}
      />
    ))}

    {controller_right && 
    <group ref={controllerRef}>
      <mesh ref={paintBallRef} position={[-0.02,-0.05,-0.07]}>
          <sphereGeometry args={[radius,16,16]}/>
          <meshBasicMaterial color={"black"}/>
      </mesh>
    </group>
    }

  </>
)
}