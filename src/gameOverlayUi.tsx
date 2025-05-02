import React, { useEffect, useState } from 'react';
import { XRStore } from '@react-three/xr';
import { DEVICE, getWindowMode, toggleFullscreen, WINDOW_MODE } from './util';
import { useAtom } from 'jotai'
import { backAtom, baseTubeRadiusAtom, clearAtom, decreaseRadiusAtom, drawAtom, increaseRadiusAtom } from './atom'


interface GameOverlayUIProps {
 store: XRStore | null
}

const GameOverlayUI: React.FC<GameOverlayUIProps> = ({store = null }) => {

    const [radius] = useAtom(baseTubeRadiusAtom)
  
    const [, increase] = useAtom(increaseRadiusAtom)
    const [, decrease] = useAtom(decreaseRadiusAtom)
    const [, setBack] = useAtom(backAtom)
    const [, setClear] = useAtom(clearAtom)
    const [draw, setDraw] = useAtom(drawAtom)


    const [windowMode, setWindowMode] = useState<WINDOW_MODE>(getWindowMode());

    useEffect(() => {
      const handleChange = () => {
        setWindowMode(getWindowMode());
      };
  
      document.addEventListener("fullscreenchange", handleChange);
      window.addEventListener("resize", handleChange); // for FULLSCREEN_BROWSER
  
      return () => {
        document.removeEventListener("fullscreenchange", handleChange);
        window.removeEventListener("resize", handleChange);
      };
    }, []);


    // const exitAR = () =>{
    //   if(store)
    //   {
    //     store.getState().session?.end()
    //   }
    // }

    const handleEnterAR = async () => {
      if (store) {
        store.enterAR();
      }
    };

    const handleEnterVR = async () => {
      if (store) {
        store.enterVR();
      }
    };

  return (
    <div id='interface' >

      <div className="vertical-right-column-top ">
    
        {/* ENTER AR BUTTON */}
        <button
          onClick={handleEnterAR}
          className='icon-right'
          style={{
            fontSize:"25px"
           }}
        >
          AR
        </button>
         {/* ENTER VR BUTTON */}
         <button
          onClick={handleEnterVR}
          className='icon-right'
          style={{
           fontSize:"25px"
          }}
        >
          VR
        </button>
      </div>

      <div className="vertical-right-column-bottom ">
    
      {/* camera */}
      <button
            onClick={() => setDraw(!draw)}
            className='icon-right'
        >
          {draw === true ?
          (<img 
            src="orbit.png"  
            alt="orbit"
            style={{
              width: "45px", 
              height: "45px",
              objectFit: "contain",
            }}/>):(<img 
              src="draw.png"  
              alt="draw"
              style={{
                width: "45px", 
                height: "45px",
                objectFit: "contain",
              }}/>)
          }
        </button>

        {/* erase all */}
        <button
          onClick={() => setClear(true)}
          className='icon-right'
         
        >
     
          <img 
            src="trash.png"  
            alt="delete"
            style={{
              width: "45px", 
              height: "45px",
              objectFit: "contain",
            }}/>
        </button>
         {/* erase last */}
         <button
          onClick={() => setBack(true)}
          className='icon-right'
        >
         <img 
            src="back.png"  
            alt="delete"
            style={{
              width: "45px", 
              height: "45px",
              objectFit: "contain",
            }}/>
        </button>
      </div>
       
      <div className="vertical-left-column-top">

        {/* FULL SCREEN BUTTON */}
        <button 
          className="icon-left"
          onClick={()=>{toggleFullscreen()}}
        >
          {windowMode === WINDOW_MODE.FULLSCREEN_API  ? (<img 
            src="nscreen.png"  
            alt="full screen"
            style={{
              width: "45px", 
              height: "45px",
              objectFit: "contain",
            }}/>):
            (<img 
            src="fscreen.png"  
            alt="full screen"
            style={{
              width: "45px", 
              height: "45px",
              objectFit: "contain",
            }}/>)
            }
        </button>
      </div>

      <div className="vertical-left-column-bottom">
        <div className='icon-left'
        style={{
          background: "white", 
          // boxShadow:"none",
          cursor:"default",
          // border:
        }}
        >
      <div
        style={{
          width: `${radius * 1000}%`,
          height: `${radius * 1000}%`,
          backgroundColor: "#111", // dark color
          borderRadius: "50%",     // makes it a circle

        }}
      ></div></div>
      <button 
          className="icon-left"
          onClick={increase}
          style={{
            fontSize:"50px"
          }}
        >
          +
        </button>
        <button 
          className="icon-left"
          onClick={decrease}
          style={{
            fontSize:"50px",
            paddingBottom:"8px"
          }}
        >
          -
        </button>
      
     
      </div>
      

      {/* INSTRUCTION */}
      {<div className="middle-screen-info">
        {DEVICE.isTouchDevice() ?draw?<p>Touch and Drag to Draw</p>:<p>One Finger to Look Around, Two Fingers Zoom or Pan</p>:draw?<p>Click and Drag to Draw</p>:<p>Use the Mouse to Look Around, Zoom In/Out, or Pan</p>}
      </div>}

  
    </div>

  );
};

export default GameOverlayUI;