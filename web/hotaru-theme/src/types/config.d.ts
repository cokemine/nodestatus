declare global {
  interface Window {
    __PRE_CONFIG__: {
      header: string;
      subHeader: string;
      interval: number;
      footer: string;
    }
  }
}
export {};
