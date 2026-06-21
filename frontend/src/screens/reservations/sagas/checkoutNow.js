import { put, race, take, takeLatest } from 'redux-saga/effects';

import { actionTypes } from '@/shared/base';

function* checkoutNow({ reservationId, room_id, checkin_date }) {
  yield put({
    type: actionTypes.OPEN_CONFIRMATION_MODAL,
    title: 'Check Out Now?',
    message: 'Check out this guest now? This will end the stay today.',
    confirmationText: 'Check Out',
    cancellationText: 'Keep Reservation',
    buttonStyle: 'warning',
  });

  const { confirm } = yield race({
    confirm: take(actionTypes.CONFIRM_CONFIRMATION_MODAL),
    no: take(actionTypes.REJECT_CONFIRMATION_MODAL),
  });

  if (!confirm) return;

  yield put({
    type: actionTypes.UPDATE_RESERVATION,
    reservationId,
    room_id,
    checkin_date,
    checkout_date: new Date().toISOString().slice(0, 10),
  });
}

function* saga() {
  yield takeLatest(actionTypes.CHECKOUT_NOW, checkoutNow);
}

export default saga;
