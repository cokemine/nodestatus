import React, { FC, Suspense } from 'react';
import {
  BrowserRouter as Router
} from 'react-router-dom';
import axios from 'axios';
import { SWRConfig } from 'swr';
import GlobalRoutes from './routes/GlobalRoutes';
import { IResp } from './types';
import Loading from './components/Loading';
import { notify } from './utils';
import './App.css';

axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});
axios.interceptors.response.use(_ => _, error => {
  const resp = error.response;
  const { data }: { data: IResp } = resp;
  notify(`${resp.status} ${resp.statusText}`, data?.msg, 'error');
  return Promise.reject(error);
});

const App: FC = () => (
  <SWRConfig value={{
    fetcher: (url: string) => axios.get<IResp>(url).then(res => res.data),
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
