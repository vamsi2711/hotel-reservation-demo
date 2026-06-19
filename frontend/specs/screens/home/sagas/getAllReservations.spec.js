import { expectSaga } from 'redux-saga-test-plan';
import { call } from 'redux-saga/effects';
import { throwError } from 'redux-saga-test-plan/providers';

import { actionTypes, onFailure, onSuccessful } from '@/shared/base';
import { fetchQuery, getExistingReservationsQuery, getAllRoomsQuery } from '@/shared/graphql';

import getAllReservations from '@/screens/home/sagas/getAllReservations';

describe('getAllReservations Saga', () => {
  let scenario;

  const action = {
    type: actionTypes.GET_RESERVATIONS,
  };
  const expectedRequestParams = {};

  const mockRooms = [
    { id: 'room1', room_number: 101 },
    { id: 'room2', room_number: 102 },
  ];
  const mockRoomsResponse = {
    data: {
      getAllRooms: {
        errors: null,
        rooms: mockRooms,
      },
    },
  };

  beforeEach(() => {
    scenario = expectSaga(getAllReservations).dispatch(action);
  });
  afterEach(() => {
    scenario = null;
  });

  it('should handle successful API response', () => {
    const mockReservations = [
      { id: '1', Name: 'Test Reservation 1' },
      { id: '2', Name: 'Test Reservation 2' },
    ];
    const mockResponse = {
      data: {
        getAllReservations: {
          errors: null,
          reservations: mockReservations,
        },
      },
    };

    return scenario
      .provide([
        [
          call(fetchQuery, getExistingReservationsQuery, expectedRequestParams),
          mockResponse,
        ],
        [
          call(fetchQuery, getAllRoomsQuery, expectedRequestParams),
          mockRoomsResponse,
        ],
      ])
      .put({
        type: onSuccessful(action.type),
        response: {
          reservations: mockReservations,
          rooms: mockRooms,
        },
      })
      .silentRun();
  });

  it('should handle API response with errors', () => {
    const errMessage = 'Some error message';
    const mockResponse = {
      data: {
        getAllReservations: {
          errors: errMessage,
          reservations: [],
        },
      },
    };
    const alertType = 'danger';
    const expectedErrMessage = `Could not retrieve reservations.  Error: getallreservations-saga-error: "${errMessage}"`;

    return scenario
      .provide([
        [
          call(fetchQuery, getExistingReservationsQuery, expectedRequestParams),
          mockResponse,
        ],
        [
          call(fetchQuery, getAllRoomsQuery, expectedRequestParams),
          mockRoomsResponse,
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
    const expectedErrMessage = 'Could not retrieve reservations.  Error';
    const alertType = 'danger';

    return scenario
      .provide([
        [
          call(fetchQuery, getExistingReservationsQuery, expectedRequestParams),
          throwError(new Error()),
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
