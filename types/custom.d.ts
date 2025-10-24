declare module 'pdf-parse' {
  interface PDFInfo {
    numpages?: number;
    numrender?: number;
    info?: any;
    metadata?: any;
    version?: string;
    text?: string;
  }

  function pdf(buffer: Buffer | Uint8Array | ArrayBuffer, options?: any): Promise<PDFInfo>;

  export default pdf;
}

declare module 'node-fetch' {
  // Minimal fetch types for runtime usage in this project
  import type { RequestInit, Response as NodeFetchResponse } from 'node-fetch';

  // Re-export the global fetch signature
  export interface Response {
    ok: boolean;
    status: number;
    statusText: string;
    json(): Promise<any>;
    text(): Promise<string>;
    arrayBuffer(): Promise<ArrayBuffer>;
  }

  declare function fetch(input: string, init?: RequestInit): Promise<Response>;

  export default fetch;
}
