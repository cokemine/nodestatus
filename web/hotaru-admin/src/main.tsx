import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import 'virtual:svg-icons-register';
/* Ant Design */
import 'antd/dist/antd.css';
/* UnoCSS */
import 'virtual:uno.css';
import '@unocss/reset/tailwind-compat.css';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
