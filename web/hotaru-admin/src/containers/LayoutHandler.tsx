import React, { FC } from 'react';
import { Navigate } from 'react-router-dom';
import useSWR from 'swr';
import Loading from '../components/Loading';
import { IResp } from '../types';
import Layout from './Layout';

const LayoutHandler: FC = () => {
  const { data, error } = useSWR<IResp>('/api/session');
  const isLogin = data?.code === 0;

  /*
  * Bug: mutate not clearing errors after swr@2.0.0-beta7
  * Trace: https://github.com/vercel/swr/issues/2440
  * */
  return (
    isLogin
      ? <Layout />
      : error
        ? <Navigate to="/login" />
        : <Loading />
  );
};

export default LayoutHandler;
