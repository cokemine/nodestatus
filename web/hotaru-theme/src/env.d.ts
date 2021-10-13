/// <reference types="vite/client" />

declare module '*.vue' {
  // eslint-disable-next-line import/named
  import { DefineComponent } from 'vue';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>;
  export default component;

  interface Window {
    __PRE_CONFIG__: {
      header: string;
      subHeader: string;
      interval: number;
      footer: string;
    }
  }
}
