import ky, { type BeforeRequestHook, type AfterResponseHook } from 'ky';
import { notify } from '../utils';
import type { IResp } from '../types';

const beforeRequest: BeforeRequestHook = request => {
  const token = localStorage.getItem('token');
  if (token) {
    request.headers.set('Authorization', `Bearer ${token}`);
  }
};

const afterResponse: AfterResponseHook = async (_request, _options, response) => {
  if (!response.ok) {
    let msg: string | undefined;
    try {
      const data = await response.clone().json() as IResp;
      msg = data?.msg;
    } catch {
      // ignore parse error
    }
    notify(`${response.status} ${response.statusText}`, msg, 'error');
  }
};

const api = ky.create({
  hooks: {
    beforeRequest: [beforeRequest],
    afterResponse: [afterResponse]
  }
});

export default api;
