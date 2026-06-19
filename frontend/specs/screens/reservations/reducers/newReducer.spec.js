import { actionTypes, onSuccessful } from '@/shared/base';

import { newReducer } from '@/screens/reservations/reducers';

describe('reservations/reducers/newReducer tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle site/reservations/GET_ROOM_IDS_SUCCESS', () => {
    const rooms = [
      { id: 'room1', room_number: 101 },
      { id: 'room2', room_number: 102 },
      { id: 'room3', room_number: 103 },
    ];

    const response = { data: rooms };
    const initialState = { loading: true, rooms: [] };

    const action = {
      type: onSuccessful(actionTypes.GET_ROOM_IDS),
      response,
    };

    const state = newReducer(initialState, action);

    const expectedState = {
      loading: false,
      rooms,
    };

    expect(state).toEqual(expectedState);
  });
});
