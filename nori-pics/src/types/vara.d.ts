declare module 'vara' {
  interface VaraOptions {
    text: string;
    fontSize?: number;
    strokeWidth?: number;
    color?: string;
    duration?: number;
    textAlign?: string;
  }

  class Vara {
    constructor(
      container: string,
      fontUrl: string,
      options: VaraOptions[]
    );
    
    destroy(): void;
  }

  export default Vara;
}
