import { actionTypes, onSuccessful } from '@/shared/base';
import { homeReducer } from '@/screens/home/reducers';

describe('home/reducers/homeReducer tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle site/home/GET_RESERVATIONS_SUCCESS', () => {
    const reservations = [
      { id: '1', Name: 'Test Reservation 1' },
      { id: '2', Name: 'Test Reservation 2' },
    ];
    const rooms = [];

    const response = { reservations, rooms };
    const initialState = { loading: true, reservations: [], rooms: [] };

    const action = {
      type: onSuccessful(actionTypes.GET_RESERVATIONS),
      response,
    };

    const state = homeReducer(initialState, action);

    const expectedState = {
      loading: false,
      reservations,
      rooms,
    };

    expect(state).toEqual(expectedState);
  });

  it('should patch the updated reservation in the list on UPDATE_RESERVATION_SUCCESS', () => {
    const original = {
      id: '1',
      room_id: 'room-a',
      checkin_date: '2026-06-01',
      checkout_date: '2026-06-10',
      total_charge: 500,
    };
    const updated = { ...original, checkout_date: '2026-06-15', total_charge: 700 };

    const initialState = {
      loading: false,
      reservations: [original, { id: '2', room_id: 'room-b', total_charge: 200 }],
      rooms: [],
    };

    const action = {
      type: onSuccessful(actionTypes.UPDATE_RESERVATION),
      response: { data: updated },
    };

    const state = homeReducer(initialState, action);

    expect(state.reservations[0]).toEqual(updated);
    expect(state.reservations[1]).toEqual(initialState.reservations[1]);
  });
});
