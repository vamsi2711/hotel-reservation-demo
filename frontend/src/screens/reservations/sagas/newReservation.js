import { call, put, takeLatest } from 'redux-saga/effects';

import { actionTypes, onFailure, onSuccessful } from '@/shared/base';
import { fetchQuery, createReservationMutation } from '@/shared/graphql';

export function* newReservation({ room_id, checkin_date, checkout_date }) {
  try {
    const response = yield call(fetchQuery, createReservationMutation, {
      input: { room_id, checkin_date, checkout_date },
    });
    const data = response?.data;
    const errors = data?.createReservation?.errors;
    if (errors)
      throw new Error(Array.isArray(errors) ? errors[0] : errors);
    else {
      const { reservations } = data?.createReservation || [];
      yield put({
        type: actionTypes.SET_ALERT,
        alertType: 'success',
        message: 'Reservation created.',
      });
      yield put({
        type: onSuccessful(actionTypes.CREATE_RESERVATION),
        response: {
          data: reservations,
        },
      });
    }
  } catch (ex) {
    const message = ex.message || 'Could not create reservation.';
    yield put({
      type: onFailure(actionTypes.CREATE_RESERVATION),
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

export function* saga() {
  yield takeLatest(actionTypes.CREATE_RESERVATION, newReservation);
}

export default saga;
