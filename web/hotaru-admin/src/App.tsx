import React, { FC, Suspense } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import axios from 'axios';
import { SWRConfig } from 'swr';
import routes from './routes/global';
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
        <Switch>
          {
              routes.map(
                route => (
                  <Route
                    exact={route.exact !== false}
                    key={route.path}
                    path={route.path}
                    component={route.component}
                  />
                )
              )
            }
        </Switch>
      </Suspense>
    </Router>
  </SWRConfig>
);

export default App;
