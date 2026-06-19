import { all } from 'redux-saga/effects';

import getAllRoomIds from './getAllRoomIds';
import newReservation from './newReservation';
import getReservation from './getReservation';
import updateReservation from './updateReservation';

export default function* rootSaga() {
  yield all([getAllRoomIds(), newReservation(), getReservation(), updateReservation()]);
}
