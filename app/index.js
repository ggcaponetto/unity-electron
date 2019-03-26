import React from 'react';
import { render } from 'react-dom';
import './app.global.css';
import Main from "./components/Main";

render(
  <Main/>,
  document.getElementById('root')
);


if (module.hot) {
  module.hot.accept('./containers/Root', () => {
    // eslint-disable-next-line global-require
    render(
      <Main/>,
      document.getElementById('root')
    );
  });
}
