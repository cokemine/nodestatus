import { inject } from 'vue';
import type { IWebConfig } from '../../types';

const useConfig = () => inject<IWebConfig>('config');
export default useConfig;
