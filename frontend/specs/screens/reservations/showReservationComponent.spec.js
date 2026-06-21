import React from 'react';
import { render as tlRender, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import { initialState as defaultShared } from '@/shared/sharedReducer';
import ShowReservationComponent from '@/screens/reservations/show';
import { actionTypes } from '@/shared/base';
import { render, mockStore } from '../../reactTestHelpers';

const TODAY = new Date().toISOString().slice(0, 10);
const PAST = '2020-01-01';
const FUTURE = '2099-12-31';

const makeState = (checkin, checkout) => ({
  shared: { ...defaultShared },
  router: { location: { pathname: `/reservations/1` } },
  site: {
    showReservations: {
      loading: false,
      reservation: {
        id: '1',
        room_id: 'room-id-1',
        checkin_date: checkin,
        checkout_date: checkout,
        total_charge: 500,
      },
    },
    home: { rooms: [{ id: 'room-id-1', room_number: 101 }] },
  },
});

const initialEntries = ['/reservations/1'];

describe('ShowReservationComponent — Check Out Now button visibility', () => {
  it('shows Check Out Now for an active reservation (checked in, not yet checked out)', () => {
    render(<ShowReservationComponent />, {
      initialState: makeState(PAST, FUTURE),
      initialEntries,
    });
    expect(screen.getByRole('button', { name: /Check Out Now/i })).toBeInTheDocument();
  });

  it('does not show Check Out Now for a past reservation', () => {
    render(<ShowReservationComponent />, {
      initialState: makeState(PAST, PAST),
      initialEntries,
    });
    expect(screen.queryByRole('button', { name: /Check Out Now/i })).not.toBeInTheDocument();
  });

  it('does not show Check Out Now for a future reservation', () => {
    render(<ShowReservationComponent />, {
      initialState: makeState(FUTURE, FUTURE),
      initialEntries,
    });
    expect(screen.queryByRole('button', { name: /Check Out Now/i })).not.toBeInTheDocument();
  });
});

describe('ShowReservationComponent — Check Out Now confirmation modal', () => {
  it('opens the confirmation modal with the correct message when Check Out Now is clicked', () => {
    render(<ShowReservationComponent />, {
      initialState: makeState(PAST, FUTURE),
      initialEntries,
    });

    fireEvent.click(screen.getByRole('button', { name: /Check Out Now/i }));

    expect(
      screen.getByText(/Check out this guest now\? This will end the stay today\./i),
    ).toBeInTheDocument();
  });

  it('closes the modal without dispatching when Keep Reservation is clicked', () => {
    const store = mockStore(makeState(PAST, FUTURE));

    tlRender(
      <Provider store={store}>
        <MemoryRouter initialEntries={initialEntries}>
          <Routes>
            <Route path="/reservations/:id" element={<ShowReservationComponent />} />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /Check Out Now/i }));
    fireEvent.click(screen.getByRole('button', { name: /Keep Reservation/i }));

    const dispatchedTypes = store.getActions().map((a) => a.type);
    expect(dispatchedTypes).not.toContain(actionTypes.UPDATE_RESERVATION);
  });
});

describe('ShowReservationComponent — Check Out Now confirmation dispatches correct action', () => {
  it('dispatches UPDATE_RESERVATION with today as checkout_date on confirm', () => {
    const store = mockStore(makeState(PAST, FUTURE));

    tlRender(
      <Provider store={store}>
        <MemoryRouter initialEntries={initialEntries}>
          <Routes>
            <Route path="/reservations/:id" element={<ShowReservationComponent />} />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /Check Out Now/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Check Out' }));

    expect(store.getActions()).toContainEqual(
      expect.objectContaining({
        type: actionTypes.UPDATE_RESERVATION,
        reservationId: 1,
        checkout_date: TODAY,
      }),
    );
  });
});
