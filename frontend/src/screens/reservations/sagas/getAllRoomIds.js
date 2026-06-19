import { call, takeLatest, put } from 'redux-saga/effects';

import { actionTypes, onFailure, onSuccessful } from '@/shared/base';
import { fetchQuery, getAllRoomsQuery } from '@/shared/graphql';

export function* getAllRoomIds() {
  try {
    const response = yield call(fetchQuery, getAllRoomsQuery, {});
    const data = response?.data;
    const errors = data?.getAllRooms?.errors;

    if (errors)
      throw new Error(`getallrooms-saga-error: ${JSON.stringify(errors)}`);

    const { rooms } = data.getAllRooms || {};
    yield put({
      type: onSuccessful(actionTypes.GET_ROOM_IDS),
      response: { data: rooms },
    });
  } catch (ex) {
    const message = `Could not retrieve rooms: ${ex}`;
    yield put({
      type: onFailure(actionTypes.GET_ROOM_IDS),
      alertType: 'danger',
      message,
    });
    yield put({ type: actionTypes.SET_ALERT, alertType: 'danger', message });
  }
}

function* saga() {
  yield takeLatest(actionTypes.GET_ROOM_IDS, getAllRoomIds);
}

export default saga;
