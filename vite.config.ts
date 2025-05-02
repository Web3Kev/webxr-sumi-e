// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react-swc'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import fs from 'fs';
import path from 'path';


export default defineConfig({
  plugins: [react(),],
  server: {
    https: process.env.NODE_ENV === 'development' && 
    fs.existsSync(path.resolve(__dirname, 'localhost.key')) && 
    fs.existsSync(path.resolve(__dirname, 'localhost.crt'))
      ? {
          key: fs.readFileSync(path.resolve(__dirname, 'localhost.key')),
          cert: fs.readFileSync(path.resolve(__dirname, 'localhost.crt')),
        }
      : undefined,
    host: 'localhost',
    port: 3000,
  },
  assetsInclude: ['**/*.vert', '**/*.frag'],
});