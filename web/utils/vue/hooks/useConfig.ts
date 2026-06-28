import type { IWebConfig } from '../../types';
import { inject } from 'vue';

const useConfig = () => inject<IWebConfig>('config');
export default useConfig;
