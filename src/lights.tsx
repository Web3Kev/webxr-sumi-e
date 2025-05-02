
import React from "react";


interface LightsProps {
    position?: [number,number,number];
    mapSize?: number;
}

const Lights: React.FC<LightsProps> = ({
    position=[5, 10, -10], 
}) => {
  
  return <group>
     <ambientLight color={"rgb(192, 219, 211)"} intensity={2}/>
      <hemisphereLight intensity={2} groundColor="rgb(6, 166, 123)"/>
      <directionalLight 
        position={position} 
        intensity={3} 
        color={"white"}
      />
  </group>
}


export default Lights;