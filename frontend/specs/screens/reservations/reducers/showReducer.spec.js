import { actionTypes, onSuccessful } from '@/shared/base';
import { showReducer } from '@/screens/reservations/reducers';

const updatedReservation = {
  id: '1',
  room_id: 'room-id-1',
  checkin_date: '2099-01-01',
  checkout_date: '2099-01-05',
  total_charge: 400,
};

describe('reservations/reducers/showReducer', () => {
  it('sets reservation and clears loading on GET_RESERVATION success', () => {
    const state = showReducer(undefined, {
      type: onSuccessful(actionTypes.GET_RESERVATION),
      response: { data: updatedReservation },
    });

    expect(state.reservation).toEqual(updatedReservation);
    expect(state.loading).toBe(false);
  });

  it('sets reservation AND clears loading on UPDATE_RESERVATION success (bug fix)', () => {
    // Before the fix, UPDATE_RESERVATION success left loading: true.
    // The show page would therefore show a spinner instead of buttons.
    const initialState = { reservation: null, loading: true };

    const state = showReducer(initialState, {
      type: onSuccessful(actionTypes.UPDATE_RESERVATION),
      response: { data: updatedReservation },
    });

    expect(state.reservation).toEqual(updatedReservation);
    expect(state.loading).toBe(false);
  });

  it('falls back to existing reservation when UPDATE_RESERVATION response data is absent', () => {
    const existing = { id: '1', room_id: 'room-id-1', total_charge: 100 };
    const prevState = { reservation: existing, loading: false };

    const state = showReducer(prevState, {
      type: onSuccessful(actionTypes.UPDATE_RESERVATION),
      response: { data: null },
    });

    expect(state.reservation).toEqual(existing);
    expect(state.loading).toBe(false);
  });
});
