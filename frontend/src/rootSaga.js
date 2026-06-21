import { all } from 'redux-saga/effects';

import sharedSagas from '@/shared/sagas/index';
import authSagas from '@/screens/auth/sagas/index';
import homeComponentSagas from '@/screens/home/sagas/index';
import reservationComponentSagas from '@/screens/reservations/sagas/index';
import dashboardSagas from '@/screens/dashboard/sagas/index';

export default function* rootSaga() {
  yield all([
    sharedSagas(),
    authSagas(),
    homeComponentSagas(),
    reservationComponentSagas(),
    dashboardSagas(),
  ]);
}
