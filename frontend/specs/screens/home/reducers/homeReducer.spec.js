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
});
