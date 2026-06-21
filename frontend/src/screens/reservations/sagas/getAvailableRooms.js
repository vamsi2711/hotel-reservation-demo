import { call, put, takeLatest } from 'redux-saga/effects';

import { actionTypes, onFailure, onSuccessful } from '@/shared/base';
import { fetchQuery, getAvailableRoomsQuery } from '@/shared/graphql';

export function* getAvailableRooms({ checkin_date, checkout_date }) {
  try {
    const response = yield call(fetchQuery, getAvailableRoomsQuery, {
      input: { checkin_date, checkout_date },
    });
    const rooms = response?.data?.getAvailableRooms?.rooms || [];
    yield put({
      type: onSuccessful(actionTypes.GET_AVAILABLE_ROOMS),
      response: { data: rooms },
    });
  } catch (ex) {
    yield put({
      type: onFailure(actionTypes.GET_AVAILABLE_ROOMS),
      alertType: 'danger',
      message: `Could not retrieve available rooms: ${ex}`,
    });
  }
}

function* saga() {
  yield takeLatest(actionTypes.GET_AVAILABLE_ROOMS, getAvailableRooms);
}

export default saga;
