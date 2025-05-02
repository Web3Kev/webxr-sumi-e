import React, { useEffect } from "react";
import { BrushPainting } from "./brushPainting";
import Lights from "./lights";
import { ZenScene } from "./zenScene";
import { useXR } from "@react-three/xr";
import { xrAtom } from "./atom";
import { useAtom } from "jotai";

  
interface PaintingSceneProps {}

const PaintingScene: React.FC<PaintingSceneProps> = ({}) => {

  const [, setIsAR] = useAtom(xrAtom)
  const XRstate = useXR().visibilityState;
  
  useEffect(() => {
      
    if(XRstate==="visible")
    {
      setIsAR(true);
    }
    else
    {
      setIsAR(false);
    }
      
  }, [XRstate])


  return (
   <>
  
    <Lights/>

    <BrushPainting/>

    <ZenScene/>

    
   </>
  );
};

export default PaintingScene;