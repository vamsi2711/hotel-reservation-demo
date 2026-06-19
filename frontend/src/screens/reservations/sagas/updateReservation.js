import { call, put, takeLatest } from 'redux-saga/effects';

import { actionTypes, onFailure, onSuccessful } from '@/shared/base';
import { fetchQuery, updateReservationMutation } from '@/shared/graphql';

export function* updateReservation({ reservationId, room_id, checkin_date, checkout_date }) {
  try {
    const response = yield call(fetchQuery, updateReservationMutation, {
      reservationId,
      input: { room_id, checkin_date, checkout_date },
    });
    const data = response?.data;
    const errors = data?.updateReservation?.errors;

    if (errors?.length) {
      throw new Error(Array.isArray(errors) ? errors[0] : errors);
    }

    const reservation = data?.updateReservation?.reservation;
    yield put({
      type: onSuccessful(actionTypes.UPDATE_RESERVATION),
      response: { data: reservation },
    });
    yield put({
      type: actionTypes.SET_ALERT,
      alertType: 'success',
      message: 'Reservation updated.',
    });
    yield put({ type: actionTypes.GET_RESERVATIONS });
  } catch (ex) {
    const message = ex.message || 'Could not update reservation.';
    yield put({
      type: onFailure(actionTypes.UPDATE_RESERVATION),
      alertType: 'danger',
      message,
    });
    yield put({ type: actionTypes.SET_ALERT, alertType: 'danger', message });
  }
}

function* saga() {
  yield takeLatest(actionTypes.UPDATE_RESERVATION, updateReservation);
}

export default saga;
