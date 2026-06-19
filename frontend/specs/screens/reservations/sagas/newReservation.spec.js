import { expectSaga } from 'redux-saga-test-plan';
import { call } from 'redux-saga/effects';
import { throwError } from 'redux-saga-test-plan/providers';

import { actionTypes, onFailure, onSuccessful } from '@/shared/base';
import { fetchQuery, createReservationMutation } from '@/shared/graphql';

import newReservation from '@/screens/reservations/sagas/newReservation';

describe('newReservation Saga', () => {
  let scenario;

  const input = {
    room_id: 'room1',
    checkin_date: '2024-01-01',
    checkout_date: '2024-01-05',
  };

  const action = {
    type: actionTypes.CREATE_RESERVATION,
    ...input,
  };

  const expectedRequestParams = {
    input: { ...input },
  };

  beforeEach(() => {
    scenario = expectSaga(newReservation).dispatch(action);
  });

  afterEach(() => {
    scenario = null;
  });

  it('should handle successful reservation creation', () => {
    const mockResponse = {
      data: {
        createReservation: {
          errors: null,
          reservations: [],
        },
      },
    };
    return scenario
      .provide([
        [
          call(fetchQuery, createReservationMutation, expectedRequestParams),
          mockResponse,
        ],
      ])
      .put({
        type: actionTypes.SET_ALERT,
        alertType: 'success',
        message: 'Reservation created.',
      })
      .put({
        type: onSuccessful(actionTypes.CREATE_RESERVATION),
        response: {
          data: mockResponse.data.createReservation.reservations,
        },
      })
      .silentRun();
  });

  it('should handle API response with errors', () => {
    const errMessage = 'Some error message';
    const mockResponse = {
      data: {
        createReservation: {
          errors: errMessage,
        },
      },
    };
    const alertType = 'danger';
    const expectedErrMessage = errMessage;

    return scenario
      .provide([
        [
          call(fetchQuery, createReservationMutation, expectedRequestParams),
          mockResponse,
        ],
      ])
      .put({
        type: onFailure(actionTypes.CREATE_RESERVATION),
        alertType,
        message: expectedErrMessage,
      })
      .put({
        type: actionTypes.SET_ALERT,
        alertType,
        message: expectedErrMessage,
      })
      .silentRun();
  });

  it('should handle unexpected non-API errors', () => {
    const errMessage = new Error('Some error message');
    const alertType = 'danger';
    const expectedErrMessage = errMessage.message;

    return scenario
      .provide([
        [
          call(fetchQuery, createReservationMutation, expectedRequestParams),
          throwError(errMessage),
        ],
      ])
      .put({
        type: onFailure(action.type),
        alertType,
        message: expectedErrMessage,
      })
      .put({
        type: actionTypes.SET_ALERT,
        alertType,
        message: expectedErrMessage,
      })
      .silentRun();
  });
});
