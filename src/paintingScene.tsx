import React from "react";
import { BrushPainting } from "./brushPainting";
import Lights from "./lights";
import { ZenScene } from "./zenScene";

  
interface PaintingSceneProps {}

const PaintingScene: React.FC<PaintingSceneProps> = ({}) => {


  return (
   <>
  
    <Lights/>

    <BrushPainting/>

    <ZenScene/>

    
   </>
  );
};

export default PaintingScene;