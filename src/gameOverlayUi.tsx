import React, { useEffect, useState } from 'react';
import { XRStore } from '@react-three/xr';
import { DEVICE, getWindowMode, toggleFullscreen, WINDOW_MODE } from './util';
import { useAtom } from 'jotai'
import { backAtom, baseTubeRadiusAtom, clearAtom, decreaseRadiusAtom, drawAtom, increaseRadiusAtom, xrAtom } from './atom'


interface GameOverlayUIProps {
 store: XRStore | null
 domOverlay?: boolean
}

const GameOverlayUI: React.FC<GameOverlayUIProps> = ({store = null, domOverlay=false }) => {

    const [radius] = useAtom(baseTubeRadiusAtom)
  
    const [, increase] = useAtom(increaseRadiusAtom)
    const [, decrease] = useAtom(decreaseRadiusAtom)
    const [, setBack] = useAtom(backAtom)
    const [, setClear] = useAtom(clearAtom)
    const [draw, setDraw] = useAtom(drawAtom)
    const [isXR, ] = useAtom(xrAtom)


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


    const exitAR = () =>{
      if(store)
      {
        store.getState().session?.end()
      }
    }

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

    useEffect(() => {
        
      if(isXR)
      {
        console.log("XR",isXR)
      }
      else
      {
        console.log("XR",isXR)
      }
        
    }, [isXR])

  return (
    <div id='interface' >

      <div className="vertical-right-column-top ">
    
        {/* ENTER AR BUTTON */}
        {!domOverlay && <button
          onClick={handleEnterAR}
          className='icon-right'
          style={{
            fontSize:"25px"
           }}
        >
          AR
        </button>}
         {/* ENTER VR BUTTON */}
        {!domOverlay && <button
          onClick={handleEnterVR}
          className='icon-right'
          style={{
           fontSize:"25px"
          }}
        >
          VR
        </button>}
        {domOverlay && <button
          onClick={exitAR}
          className='icon-right'
          style={{
           fontSize:"25px"
          }}
        >
          exit
        </button>}
      </div>

      <div className="vertical-right-column-bottom ">
    
      {/* camera */}
      <button
            onClick={() => setDraw(!draw)}
            className='icon-right'
        >
          <img 
            src="orbit.png"  
            alt="orbit"
            className={`icon ${draw ? 'visible' : 'hidden'}`}
            style={{
              position: 'absolute',
              width: "45px",
              height: "45px",
              objectFit: "contain",
              transition: 'opacity 0.3s',
            }}
          />
          <img 
            src="draw.png"  
            alt="draw"
            className={`icon ${!draw ? 'visible' : 'hidden'}`}
            style={{
              position: 'absolute',
              width: "45px",
              height: "45px",
              objectFit: "contain",
              transition: 'opacity 0.3s',
            }}
          />
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
          
          <img 
            src="nscreen.png"  
            alt="full screen"
            className={`icon ${windowMode === WINDOW_MODE.FULLSCREEN_API  ?  'visible' : 'hidden'}`}
            style={{
              position: 'absolute',
              width: "45px", 
              height: "45px",
              objectFit: "contain",
              transition: 'opacity 0.3s',
            }}/>

            <img 
            src="fscreen.png"  
            alt="full screen"
            className={`icon ${windowMode != WINDOW_MODE.FULLSCREEN_API  ? 'visible' : 'hidden'}`}
            style={{
              position: 'absolute',
              width: "45px", 
              height: "45px",
              objectFit: "contain",
              transition: 'opacity 0.3s',
            }}/>
            
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
         
        >
          <img 
            src="plus.png"  
            alt="plus"
            style={{
              position: 'absolute',
              width: "45px", 
              height: "45px",
              objectFit: "contain",
              transition: 'opacity 0.3s',
            }}/>
        </button>
        <button 
          className="icon-left"
          onClick={decrease}
          
        >
          <img 
            src="minus.png"  
            alt="minus"
            style={{
              position: 'absolute',
              width: "45px", 
              height: "45px",
              objectFit: "contain",
              transition: 'opacity 0.3s',
            }}/>
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