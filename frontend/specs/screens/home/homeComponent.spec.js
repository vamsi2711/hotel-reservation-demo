import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import React from 'react';

import { initialState as defaultShared } from '@/shared/sharedReducer';
import HomeComponent from '@/screens/home';

import { render } from '../../reactTestHelpers';

describe('HomeComponent', () => {
  const pathname = `/home`;
  const initialEntries = [pathname];
  const initialState = {
    shared: { ...defaultShared },
    router: { location: { pathname } },
    site: {
      home: {
        reservations: [
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
            checkin_date: '2021-01-01',
            checkout_date: '2021-01-02',
            total_charge: 100,
          },
        ],
        rooms: [
          { id: 'room-id-1', room_number: 101 },
          { id: 'room-id-2', room_number: 102 },
        ],
      },
    },
  };
  it(`should render component with reservations populated`, async () => {
    const ui = (
      <HomeComponent
        cancelReservation={() => {}}
        handleCloseAlert={() => {}}
        handleConfirmAction={() => {}}
        handleRejectAction={() => {}}
      />
    );
    render(ui, { initialState, initialEntries });

    expect(screen.getByText('Room 101')).toBeInTheDocument();
    expect(screen.getByText('Room 102')).toBeInTheDocument();

    const cancelButtons = screen.getAllByRole('button', { name: /Cancel/i });
    expect(cancelButtons.length).toBe(2);

    const editButtons = screen.getAllByRole('button', { name: /Edit/i });
    expect(editButtons.length).toBe(2);

    const viewButtons = screen.getAllByRole('button', { name: /View/i });
    expect(viewButtons.length).toBe(2);

    const bookButton = screen.getByRole('button', { name: /Book/i });
    expect(bookButton).toBeInTheDocument();
  });
});
