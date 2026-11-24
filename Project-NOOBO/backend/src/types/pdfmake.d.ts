declare module 'pdfmake' {
  interface PdfDocumentDefinition {
    content: unknown[];
    info?: Record<string, unknown>;
    defaultStyle?: Record<string, unknown>;
    styles?: Record<string, unknown>;
  }

  interface PdfOutput {
    getBuffer(): Promise<Buffer>;
    getStream(): Promise<unknown>;
    write(filename: string): Promise<void>;
  }

  interface PdfMake {
    addFonts(fonts: Record<string, unknown>): void;
    setLocalAccessPolicy(callback: (path: string) => boolean): void;
    setUrlAccessPolicy(callback: (url: string) => boolean): void;
    createPdf(document: PdfDocumentDefinition): PdfOutput;
  }

  const pdfmake: PdfMake;
  export default pdfmake;
}

declare module 'pdfmake/fonts/Roboto.js' {
  const fonts: Record<string, unknown>;
  export default fonts;
}
