import { all } from 'redux-saga/effects';

import getAllRoomIds from './getAllRoomIds';
import getAvailableRooms from './getAvailableRooms';
import newReservation from './newReservation';
import getReservation from './getReservation';
import updateReservation from './updateReservation';
import checkoutNow from './checkoutNow';

export default function* rootSaga() {
  yield all([
    getAllRoomIds(),
    getAvailableRooms(),
    newReservation(),
    getReservation(),
    updateReservation(),
    checkoutNow(),
  ]);
}
