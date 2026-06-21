import React from 'react';

import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';

import App from '@/shared/components/App';
import { initBaseApi, setApiUrl, setStore } from '@/shared/base';
import { getApiUrl } from '@/shared/utils/urls';
import { store } from './configureStore';

const url = getApiUrl();
setStore(store);
setApiUrl(url);

const savedToken = localStorage.getItem('access_token');
if (savedToken) {
  initBaseApi(url, savedToken);
}

ReactDOM.createRoot(document.getElementById('react-app')).render(
  <React.StrictMode>
    <Provider store={store}>
      <Router>
        <App />
      </Router>
    </Provider>
  </React.StrictMode>,
);
