import { IfInSessionMode } from "@react-three/xr";
import React from "react";
import { Skybox } from "./skybox";
import { BackSide } from "three";
import { useAtom } from "jotai";
import { drawAtom } from "./atom";
import { OrbitControls } from "@react-three/drei";


interface ZenSceneProps {
}

export const ZenScene: React.FC<ZenSceneProps> = ({
}) => {
  const [draw] = useAtom(drawAtom)
  return (
  
  <group>
     
    <IfInSessionMode deny={['immersive-ar']}>
        <mesh scale={205}>
            <sphereGeometry args={[1,16,16]}/>
            <meshBasicMaterial color={"white"} side={BackSide} />
        </mesh>
        <Skybox scale={200} rotation={[0,-8.2*Math.PI/16,0]}/>
    </IfInSessionMode>

    <IfInSessionMode deny={['immersive-ar', 'immersive-vr']}>
      <OrbitControls enabled={!draw} target={[0,2,0]}/>
    </IfInSessionMode>

  </group>);
}


