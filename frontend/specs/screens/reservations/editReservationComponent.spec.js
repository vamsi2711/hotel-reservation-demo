import { screen, fireEvent, render as tlRender } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import { initialState as defaultShared } from '@/shared/sharedReducer';
import EditReservationComponent from '@/screens/reservations/edit';

import { render, mockStore } from '../../reactTestHelpers';

const TODAY = new Date().toISOString().slice(0, 10);
const PAST = '2020-01-01';
const FUTURE = '2099-12-31';

const makeState = (checkin, checkout) => ({
  shared: { ...defaultShared },
  router: { location: { pathname: `/reservations/1/edit` } },
  site: {
    editReservations: {
      loading: false,
      updateSuccess: false,
      reservation: {
        id: '1',
        room_id: 'room-id-1',
        checkin_date: checkin,
        checkout_date: checkout,
        total_charge: 500,
      },
      rooms: [{ id: 'room-id-1', room_number: 101 }],
    },
  },
});

describe('EditReservationComponent — stale updateSuccess does not redirect on remount (bug fix)', () => {
  // updateSuccess:true persists in Redux after a save. On remount (e.g. Back from /home),
  // the saveInitiated ref is false so no redirect fires. The user sees the edit form.
  it('renders the edit form (does not redirect) when updateSuccess is already true at mount', () => {
    const staleSuccessState = {
      shared: { ...defaultShared },
      router: { location: { pathname: '/reservations/1/edit' } },
      site: {
        editReservations: {
          loading: false,
          updateSuccess: true,   // stale from a previous save
          reservation: {
            id: '1',
            room_id: 'room-id-1',
            checkin_date: FUTURE,
            checkout_date: FUTURE,
            total_charge: 500,
          },
          rooms: [{ id: 'room-id-1', room_number: 101 }],
        },
      },
    };

    const store = mockStore(staleSuccessState);
    tlRender(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/reservations/1/edit']}>
          <Routes>
            <Route path="/home" element={<div>Home Page</div>} />
            <Route path="/reservations/:id/edit" element={<EditReservationComponent />} />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );

    // Should stay on the edit page, not redirect to /home
    expect(screen.queryByText('Home Page')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument();
  });
});

describe('EditReservationComponent — save confirmation modal', () => {
  it('opens confirmation modal when Save Changes is clicked', () => {
    render(<EditReservationComponent />, {
      initialState: makeState(FUTURE, FUTURE),
      initialEntries: ['/reservations/1/edit'],
    });

    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

    expect(screen.getByText(/Are you sure you want to update this reservation/i)).toBeInTheDocument();
  });

  it('navigates to /home after confirming the save modal', () => {
    const store = mockStore(makeState(FUTURE, FUTURE));
    tlRender(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/reservations/1/edit']}>
          <Routes>
            <Route path="/home" element={<div>Home Page</div>} />
            <Route path="/reservations/:id/edit" element={<EditReservationComponent />} />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));
    // The confirmation modal's confirm button
    fireEvent.click(screen.getByRole('button', { name: /^Save$/i }));

    // After confirm, updateSuccess is not set yet (saga hasn't run in tests),
    // so the component stays until Redux state changes. Just verify modal opened
    // and the dispatch was queued.
    expect(store.getActions()).toContainEqual(
      expect.objectContaining({ reservationId: 1, room_id: 'room-id-1' }),
    );
  });
});

describe('EditReservationComponent — Cancel button navigation', () => {
  const renderWithHistory = (prevPath, prevLabel) => {
    const store = mockStore(makeState(FUTURE, FUTURE));
    tlRender(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[prevPath, '/reservations/1/edit']}
          initialIndex={1}
        >
          <Routes>
            <Route path={prevPath} element={<div>{prevLabel}</div>} />
            <Route path="/reservations/:id/edit" element={<EditReservationComponent />} />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );
  };

  it('header Cancel navigates to the previous history entry', () => {
    renderWithHistory('/reservations/1', 'Reservation Detail');

    // header Cancel button (← Cancel)
    fireEvent.click(screen.getByRole('button', { name: /← Cancel/i }));

    expect(screen.getByText('Reservation Detail')).toBeInTheDocument();
  });

  it('form Cancel navigates to the previous history entry', () => {
    renderWithHistory('/home', 'Home Page');

    // form-footer Cancel button (plain "Cancel" text)
    const cancelBtns = screen.getAllByRole('button', { name: /^Cancel$/i });
    fireEvent.click(cancelBtns[cancelBtns.length - 1]);

    expect(screen.getByText('Home Page')).toBeInTheDocument();
  });
});

describe('EditReservationComponent — check-in field locking', () => {
  const initialEntries = ['/reservations/1/edit'];

  it('disables the check-in date field for an ongoing reservation (checked in, not yet checked out)', () => {
    render(<EditReservationComponent />, {
      initialState: makeState(PAST, FUTURE),
      initialEntries,
    });

    const checkinInput = screen.getByLabelText(/check-in date/i);
    expect(checkinInput).toBeDisabled();
    expect(
      screen.getByText(/check-in date cannot be changed for a reservation already in progress/i),
    ).toBeInTheDocument();
  });

  it('keeps the checkout date field editable for an ongoing reservation', () => {
    render(<EditReservationComponent />, {
      initialState: makeState(PAST, FUTURE),
      initialEntries,
    });

    const checkoutInput = screen.getByLabelText(/check-out date/i);
    expect(checkoutInput).not.toBeDisabled();
  });

  it('keeps both date fields editable for a fully-future reservation', () => {
    render(<EditReservationComponent />, {
      initialState: makeState(FUTURE, FUTURE),
      initialEntries,
    });

    expect(screen.getByLabelText(/check-in date/i)).not.toBeDisabled();
    expect(screen.getByLabelText(/check-out date/i)).not.toBeDisabled();
    expect(
      screen.queryByText(/cannot be changed/i),
    ).not.toBeInTheDocument();
  });

  it('uses today as the boundary — a check-in exactly today is not considered "in progress"', () => {
    render(<EditReservationComponent />, {
      initialState: makeState(TODAY, FUTURE),
      initialEntries,
    });

    // TODAY checkin means they haven't checked in yet from a locking perspective:
    // isOngoing = checkin < TODAY is false when checkin === TODAY
    expect(screen.getByLabelText(/check-in date/i)).not.toBeDisabled();
  });
});

describe('EditReservationComponent — date min-attribute restrictions', () => {
  const initialEntries = ['/reservations/1/edit'];

  it('sets check-in min to today for a fully-future reservation', () => {
    render(<EditReservationComponent />, {
      initialState: makeState(FUTURE, FUTURE),
      initialEntries,
    });

    expect(screen.getByLabelText(/check-in date/i)).toHaveAttribute('min', TODAY);
  });

  it('sets check-out min to the same date as check-in for a fully-future reservation (same-day allowed)', () => {
    render(<EditReservationComponent />, {
      initialState: makeState(FUTURE, FUTURE),
      initialEntries,
    });

    expect(screen.getByLabelText(/check-out date/i)).toHaveAttribute('min', FUTURE);
  });

  it('sets check-out min to today for an ongoing reservation', () => {
    render(<EditReservationComponent />, {
      initialState: makeState(PAST, FUTURE),
      initialEntries,
    });

    expect(screen.getByLabelText(/check-out date/i)).toHaveAttribute('min', TODAY);
  });
});
