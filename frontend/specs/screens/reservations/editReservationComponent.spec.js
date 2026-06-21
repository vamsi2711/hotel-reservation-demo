import { screen } from '@testing-library/react';
import React from 'react';

import { initialState as defaultShared } from '@/shared/sharedReducer';
import EditReservationComponent from '@/screens/reservations/edit';

import { render } from '../../reactTestHelpers';

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
