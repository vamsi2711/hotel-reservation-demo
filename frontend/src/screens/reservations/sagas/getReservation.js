import { call, put, takeLatest } from 'redux-saga/effects';

import { actionTypes, onFailure, onSuccessful } from '@/shared/base';
import { fetchQuery, getReservationQuery } from '@/shared/graphql';

export function* getReservation({ id }) {
  try {
    const response = yield call(fetchQuery, getReservationQuery, { id });
    const data = response?.data;
    const errors = data?.getReservation?.errors;

    if (errors?.length) {
      throw new Error(`getreservation-saga-error: ${JSON.stringify(errors)}`);
    }

    const reservation = data?.getReservation?.reservation;
    yield put({
      type: onSuccessful(actionTypes.GET_RESERVATION),
      response: { data: reservation },
    });
  } catch (ex) {
    const message = `Could not retrieve reservation. ${ex}`;
    yield put({
      type: onFailure(actionTypes.GET_RESERVATION),
      alertType: 'danger',
      message,
    });
    yield put({ type: actionTypes.SET_ALERT, alertType: 'danger', message });
  }
}

function* saga() {
  yield takeLatest(actionTypes.GET_RESERVATION, getReservation);
}

export default saga;
