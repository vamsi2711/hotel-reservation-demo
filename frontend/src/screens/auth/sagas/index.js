import { all } from 'redux-saga/effects';

import loginSaga from './login';

export default function* authSagas() {
  yield all([loginSaga()]);
}
