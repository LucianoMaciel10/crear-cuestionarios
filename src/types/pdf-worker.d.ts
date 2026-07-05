// Type declaration for PDF.js worker module
// This allows TypeScript to recognize the ESM worker import
declare module "pdfjs-dist/build/pdf.worker.min.mjs" {
  const workerUrl: string;
  export default workerUrl;
}
