import { call, put, takeLatest } from 'redux-saga/effects';

import { actionTypes, getApiBaseUrl, getToken, initBaseApi } from '@/shared/base';

export function* login(action) {
  try {
    const url = getApiBaseUrl();
    const token = yield call(getToken, url, {
      username: action.username,
      password: action.password,
    });
    localStorage.setItem('access_token', token);
    initBaseApi(url, token);
    yield put({ type: actionTypes.LOGIN_SUCCESS, token });
  } catch {
    yield put({
      type: actionTypes.LOGIN_FAILURE,
      error: 'Invalid username or password',
    });
  }
}

function* loginSaga() {
  yield takeLatest(actionTypes.LOGIN, login);
}

export default loginSaga;
