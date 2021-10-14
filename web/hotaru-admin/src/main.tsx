import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
// eslint-disable-next-line import/no-unresolved
import 'virtual:svg-icons-register';
import ids from 'virtual:svg-icons-names';

console.log(ids);

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
