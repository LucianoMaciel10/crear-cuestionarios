// vercel-dev.js
import { exec } from "child_process";

// Ejecutar Vite en modo desarrollo, intentando usar el puerto 3000
const viteProcess = exec("vite dev --port 3000");

viteProcess.stdout.on("data", (data) => {
  console.log(data);
});

viteProcess.stderr.on("data", (data) => {
  console.error(data);
});

viteProcess.on("close", (code) => {
  console.log(`Vite process exited with code ${code}`);
});
