import { call, takeLatest, put, all } from 'redux-saga/effects';

import { actionTypes, onFailure, onSuccessful } from '@/shared/base';
import { fetchQuery, getExistingReservationsQuery, getAllRoomsQuery } from '@/shared/graphql';

export function* getAllReservations() {
  try {
    const [reservationsResponse, roomsResponse] = yield all([
      call(fetchQuery, getExistingReservationsQuery, {}),
      call(fetchQuery, getAllRoomsQuery, {}),
    ]);

    const errors =
      reservationsResponse?.data?.getAllReservations?.errors ||
      roomsResponse?.data?.getAllRooms?.errors;
    if (errors)
      throw new Error(`getallreservations-saga-error: ${JSON.stringify(errors)}`);

    const { reservations } = reservationsResponse?.data?.getAllReservations || {};
    const { rooms } = roomsResponse?.data?.getAllRooms || {};
    yield put({
      type: onSuccessful(actionTypes.GET_RESERVATIONS),
      response: { reservations, rooms },
    });
  } catch (ex) {
    const message = `Could not retrieve reservations.  ${ex}`;
    yield put({
      type: onFailure(actionTypes.GET_RESERVATIONS),
      alertType: 'danger',
      message,
    });
    yield put({ type: actionTypes.SET_ALERT, alertType: 'danger', message });
  }
}

function* saga() {
  yield takeLatest(actionTypes.GET_RESERVATIONS, getAllReservations);
}

export default saga;
