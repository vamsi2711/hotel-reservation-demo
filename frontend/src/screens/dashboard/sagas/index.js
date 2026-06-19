import { all } from 'redux-saga/effects';

import getDashboardData from './getDashboardData';

export default function* dashboardSagas() {
  yield all([getDashboardData()]);
}
