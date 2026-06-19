import { expectSaga } from 'redux-saga-test-plan';
import { call } from 'redux-saga/effects';
import { throwError } from 'redux-saga-test-plan/providers';

import { actionTypes, onFailure, onSuccessful } from '@/shared/base';
import { fetchQuery, getAllRoomsQuery } from '@/shared/graphql';

import getAllRoomIds from '@/screens/reservations/sagas/getAllRoomIds';

describe('getAllRoomIds Saga', () => {
  let scenario;

  const action = { type: actionTypes.GET_ROOM_IDS };
  const expectedRequestParams = {};
  const mockRooms = [
    { id: 'room1', room_number: 101 },
    { id: 'room2', room_number: 102 },
    { id: 'room3', room_number: 103 },
  ];

  beforeEach(() => {
    scenario = expectSaga(getAllRoomIds).dispatch(action);
  });
  afterEach(() => {
    scenario = null;
  });

  it('should handle successful API response', () => {
    const mockResponse = {
      data: {
        getAllRooms: {
          rooms: mockRooms,
        },
      },
    };

    return scenario
      .provide([
        [
          call(fetchQuery, getAllRoomsQuery, expectedRequestParams),
          mockResponse,
        ],
      ])
      .put({
        type: onSuccessful(action.type),
        response: {
          data: mockRooms,
        },
      })
      .silentRun();
  });

  it('should handle API response with errors', () => {
    const errMessage = 'Some error message';
    const mockResponse = {
      data: {
        getAllRooms: {
          rooms: null,
          errors: errMessage,
        },
      },
    };
    const alertType = 'danger';
    const expectedErrMessage = `Could not retrieve rooms: Error: getallrooms-saga-error: "${errMessage}"`;

    return scenario
      .provide([
        [
          call(fetchQuery, getAllRoomsQuery, expectedRequestParams),
          mockResponse,
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

  it('should handle unexpected non-API errors', () => {
    const errMessage = new Error('Some error message');
    const alertType = 'danger';
    const expectedErrMessage =
      'Could not retrieve rooms: Error: Some error message';

    return scenario
      .provide([
        [
          call(fetchQuery, getAllRoomsQuery, expectedRequestParams),
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
