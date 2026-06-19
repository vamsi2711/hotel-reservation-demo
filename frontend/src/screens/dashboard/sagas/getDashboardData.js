import { call, takeLatest, put, all } from 'redux-saga/effects';

import { actionTypes, onFailure, onSuccessful } from '@/shared/base';
import {
  fetchQuery,
  getExistingReservationsQuery,
  getAllRoomsQuery,
} from '@/shared/graphql';

export function* getDashboardData() {
  try {
    const [reservationsResponse, roomsResponse] = yield all([
      call(fetchQuery, getExistingReservationsQuery, {}),
      call(fetchQuery, getAllRoomsQuery, {}),
    ]);

    const reservationsErrors =
      reservationsResponse?.data?.getAllReservations?.errors;
    const roomsErrors = roomsResponse?.data?.getAllRooms?.errors;

    if (reservationsErrors || roomsErrors) {
      throw new Error(
        `dashboard-saga-error: ${JSON.stringify(reservationsErrors || roomsErrors)}`,
      );
    }

    const reservations =
      reservationsResponse?.data?.getAllReservations?.reservations || [];
    const rooms = roomsResponse?.data?.getAllRooms?.rooms || [];

    yield put({
      type: onSuccessful(actionTypes.GET_DASHBOARD_DATA),
      response: { reservations, rooms },
    });
  } catch (ex) {
    const message = `Could not load dashboard data. ${ex}`;
    yield put({
      type: onFailure(actionTypes.GET_DASHBOARD_DATA),
      alertType: 'danger',
      message,
    });
    yield put({
      type: actionTypes.SET_ALERT,
      alertType: 'danger',
      message,
    });
  }
}

function* saga() {
  yield takeLatest(actionTypes.GET_DASHBOARD_DATA, getDashboardData);
}

export default saga;
