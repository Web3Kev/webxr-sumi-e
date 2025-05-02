import { Canvas } from '@react-three/fiber'
import {createXRStore, IfInSessionMode, XR, XRDomOverlay } from '@react-three/xr'
import { Loader} from '@react-three/drei'
import { Suspense } from 'react'
import PaintingScene from './paintingScene'
import GameOverlayUI from './gameOverlayUi'


const store = createXRStore();

function App() {

  return (
    <>
      <Loader/>
      <GameOverlayUI store={store}/>
      <Canvas 
        gl={{ localClippingEnabled: true }}
        style={{ width: '100%', flexGrow: 1,touchAction: 'none'  }}
      >
        <Suspense>
          <XR store={store}>
            
            <IfInSessionMode allow={['immersive-ar']}>
              <XRDomOverlay>
                <GameOverlayUI store={store} domOverlay={true}/>
              </XRDomOverlay>
            </IfInSessionMode>

            <PaintingScene/>
          
          </XR>
        </Suspense>
      </Canvas>
    </>
  )
}



export default App
