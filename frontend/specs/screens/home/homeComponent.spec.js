import { screen } from '@testing-library/react';

import React from 'react';

import { initialState as defaultShared } from '@/shared/sharedReducer';
import HomeComponent from '@/screens/home';

import { render } from '../../reactTestHelpers';

describe('HomeComponent', () => {
  const pathname = `/home`;
  const initialEntries = [pathname];

  const makeState = (reservations) => ({
    shared: { ...defaultShared },
    router: { location: { pathname } },
    site: {
      home: {
        reservations,
        rooms: [
          { id: 'room-id-1', room_number: 101 },
          { id: 'room-id-2', room_number: 102 },
        ],
      },
    },
  });

  const ui = (
    <HomeComponent
      cancelReservation={() => {}}
      handleCloseAlert={() => {}}
      handleConfirmAction={() => {}}
      handleRejectAction={() => {}}
    />
  );

  it('renders room labels and always-visible buttons', () => {
    const initialState = makeState([
      {
        id: '998',
        room_id: 'room-id-1',
        checkin_date: '2021-01-01',
        checkout_date: '2021-01-02',
        total_charge: 100,
      },
      {
        id: '999',
        room_id: 'room-id-2',
        checkin_date: '2030-01-01',
        checkout_date: '2030-12-31',
        total_charge: 200,
      },
    ]);

    render(ui, { initialState, initialEntries });

    expect(screen.getByText('Room 101')).toBeInTheDocument();
    expect(screen.getByText('Room 102')).toBeInTheDocument();

    // View and Book buttons always present
    const viewButtons = screen.getAllByRole('button', { name: /View/i });
    expect(viewButtons.length).toBe(2);
    expect(screen.getByRole('button', { name: /Book/i })).toBeInTheDocument();
  });

  it('disables Cancel and Edit with tooltip for past reservations', () => {
    const initialState = makeState([
      {
        id: '998',
        room_id: 'room-id-1',
        checkin_date: '2021-01-01',
        checkout_date: '2021-01-02',
        total_charge: 100,
      },
    ]);

    render(ui, { initialState, initialEntries });

    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    expect(cancelBtn).toBeDisabled();
    expect(cancelBtn.closest('[title]')).toHaveAttribute('title', 'Stay already completed');

    const editBtn = screen.getByRole('button', { name: /Edit/i });
    expect(editBtn).toBeDisabled();
    expect(editBtn.closest('[title]')).toHaveAttribute('title', 'Stay already completed');
  });

  it('shows active Cancel and Edit buttons for future reservations', () => {
    const initialState = makeState([
      {
        id: '999',
        room_id: 'room-id-2',
        checkin_date: '2030-01-01',
        checkout_date: '2030-12-31',
        total_charge: 200,
      },
    ]);

    render(ui, { initialState, initialEntries });

    expect(screen.getByRole('button', { name: /Cancel/i })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: /Edit/i })).not.toBeDisabled();
  });

  it('disables past-reservation buttons and keeps future-reservation buttons active when both are present', () => {
    const initialState = makeState([
      {
        id: '998',
        room_id: 'room-id-1',
        checkin_date: '2021-01-01',
        checkout_date: '2021-01-02',
        total_charge: 100,
      },
      {
        id: '999',
        room_id: 'room-id-2',
        checkin_date: '2030-01-01',
        checkout_date: '2030-12-31',
        total_charge: 200,
      },
    ]);

    render(ui, { initialState, initialEntries });

    const cancelBtns = screen.getAllByRole('button', { name: /Cancel/i });
    expect(cancelBtns).toHaveLength(2);
    expect(cancelBtns[0]).toBeDisabled();
    expect(cancelBtns[1]).not.toBeDisabled();

    const editBtns = screen.getAllByRole('button', { name: /Edit/i });
    expect(editBtns).toHaveLength(2);
    expect(editBtns[0]).toBeDisabled();
    expect(editBtns[1]).not.toBeDisabled();

    // All rows have View
    expect(screen.getAllByRole('button', { name: /View/i })).toHaveLength(2);
  });
});
