import axios from 'axios';

import { actionTypes } from '@/shared/base';

let instance = null;
let storeRef = null;
let apiUrl = '';

const createInstance = (url, token) => {
  return axios.create({
    baseURL: `${url}`,
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      Authorization: `Bearer ${token}`,
    },
  });
};

const handleRequest = (config, store) => {
  store.dispatch({ type: actionTypes.API_REQUEST });
  return config;
};

const handleRequestError = (error, store) => {
  store.dispatch({ type: actionTypes.API_REQUEST_ERROR, error });
  return Promise.reject(error);
};

const handleResponse = (response, store) => {
  store.dispatch({ type: actionTypes.API_REQUEST_DONE });
  return response?.data || response;
};

const handleResponseError = (error, store) => {
  const { message, name } = error;
  store.dispatch({
    type: actionTypes.API_REQUEST_ERROR,
    error: { message, name },
  });
  return Promise.reject(error);
};

export const getToken = async (url, credentials = {}) => {
  const formData = new FormData();
  formData.append('grant_type', 'password');
  formData.append('username', credentials.username ?? 'example-user');
  formData.append('password', credentials.password ?? 'example-user');

  const response = await axios.post(`${url}/token`, formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      accept: 'application/json',
    },
  });
  return response?.data?.access_token || '';
};

export const setStore = (store) => {
  storeRef = store;
};

export const setApiUrl = (url) => {
  apiUrl = url;
};

export const getApiBaseUrl = () => apiUrl;

export const initBaseApi = (url, token) => {
  instance = createInstance(url, token);

  instance.interceptors.request.use(
    (config) => handleRequest(config, storeRef),
    (error) => handleRequestError(error, storeRef),
  );
  instance.interceptors.response.use(
    (response) => handleResponse(response, storeRef),
    (error) => handleResponseError(error, storeRef),
  );

  return instance;
};

export const createBaseApi = async (url, store, credentials = {}) => {
  try {
    setStore(store);
    setApiUrl(url);
    const tokenValue = await getToken(url, credentials);
    return initBaseApi(url, tokenValue);
  } catch (error) {
    throw new Error(`Failed to initialize API: ${error.message}`);
  }
};

export const getBaseApi = () => {
  if (instance == null) throw new Error('Base API not initialized.');
  return instance;
};
