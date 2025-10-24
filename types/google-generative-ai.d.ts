declare module "@google/generative-ai" {
  export class GoogleGenerativeAI {
    constructor(apiKey: string);
    getGenerativeModel(options?: { model?: string }): any;
    generate?(opts: any): Promise<any>;
    generateContent?(prompt: string): Promise<any>;
  }
  const _default: typeof GoogleGenerativeAI;
  export default _default;
}
