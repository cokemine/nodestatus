import React, { FC, Suspense } from 'react';
import {
  BrowserRouter as Router
} from 'react-router-dom';
import { SWRConfig } from 'swr';
import GlobalRoutes from './routes/GlobalRoutes';
import Loading from './components/Loading';
import api from './lib/api';
import type { IResp } from './types';
import './App.css';

const App: FC = () => (
  <SWRConfig value={{
    fetcher: (url: string) => api.get(url).json<IResp>(),
    revalidateOnFocus: false
  }}
  >
    <Router basename="/admin">
      <Suspense fallback={<Loading />}>
        <GlobalRoutes />
      </Suspense>
    </Router>
  </SWRConfig>
);

export default App;
