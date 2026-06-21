import { screen, fireEvent, waitFor } from '@testing-library/react';

import React from 'react';

import { initialState as defaultShared } from '@/shared/sharedReducer';
import NewReservationComponent from '@/screens/reservations/new';

import { render } from '../../reactTestHelpers';

const TODAY = new Date().toISOString().slice(0, 10);

const makeState = (rooms = [], availableRooms = null, availableRoomsLoading = false) => {
  const pathname = '/reservations/new';
  return {
    initialEntries: [pathname],
    initialState: {
      shared: { ...defaultShared },
      router: { location: { pathname } },
      site: { newReservations: { rooms, availableRooms, availableRoomsLoading } },
    },
  };
};

describe('NewReservationComponent', () => {
  it('should render component with rooms populated for selection', async () => {
    const { initialState, initialEntries } = makeState([
      { id: 'room1', room_number: 101 },
      { id: 'room2', room_number: 102 },
      { id: 'room3', room_number: 103 },
    ]);

    render(<NewReservationComponent />, { initialState, initialEntries });

    expect(screen.getByText(/Book a Room/i)).toBeInTheDocument();
    expect(screen.getByText(/Room 101/i)).toBeInTheDocument();
    expect(screen.getByText(/Room 102/i)).toBeInTheDocument();
    expect(screen.getByText(/Room 103/i)).toBeInTheDocument();

    const roomLabel = screen.getAllByText(/^Room$/i)[0];
    expect(roomLabel).toBeInTheDocument();

    const checkinLabel = screen.getAllByText(/Check-in Date/i)[0];
    expect(checkinLabel).toBeInTheDocument();

    const checkoutLabel = screen.getAllByText(/Check-out Date/i)[0];
    expect(checkoutLabel).toBeInTheDocument();

    const submitButton = screen.getByRole('button', {
      name: /Book Reservation/i,
    });
    expect(submitButton).toBeInTheDocument();
  });

  it('sets the check-in date min attribute to today', () => {
    const { initialState, initialEntries } = makeState();
    render(<NewReservationComponent />, { initialState, initialEntries });

    const checkinInput = screen.getByLabelText(/check-in date/i);
    expect(checkinInput).toHaveAttribute('min', TODAY);
  });

  it('sets the check-out date min attribute to today when no check-in is selected', () => {
    const { initialState, initialEntries } = makeState();
    render(<NewReservationComponent />, { initialState, initialEntries });

    const checkoutInput = screen.getByLabelText(/check-out date/i);
    expect(checkoutInput).toHaveAttribute('min', TODAY);
  });

  it('shows hint text when no dates selected and room dropdown is not restricted', () => {
    const { initialState, initialEntries } = makeState([{ id: 'r1', room_number: 101 }]);
    render(<NewReservationComponent />, { initialState, initialEntries });

    expect(
      screen.getByText(/Select dates first to see available rooms/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Choose check-in and check-out dates to filter available rooms/i),
    ).toBeInTheDocument();
  });

  it('shows only available rooms after dates are selected and availableRooms is populated', () => {
    const allRooms = [
      { id: 'r1', room_number: 101 },
      { id: 'r2', room_number: 102 },
      { id: 'r3', room_number: 103 },
    ];
    const available = [{ id: 'r2', room_number: 102 }];
    const { initialState, initialEntries } = makeState(allRooms, available);
    const { container } = render(<NewReservationComponent />, { initialState, initialEntries });

    const checkinInput = container.querySelector('#checkin_date');
    const checkoutInput = container.querySelector('#checkout_date');
    fireEvent.change(checkinInput, { target: { name: 'checkin_date', value: '2099-01-01' } });
    fireEvent.change(checkoutInput, { target: { name: 'checkout_date', value: '2099-01-05' } });

    expect(screen.getByText(/Room 102/i)).toBeInTheDocument();
    expect(screen.queryByText(/Room 101/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Room 103/i)).not.toBeInTheDocument();
  });

  it('shows no-rooms-available alert when availableRooms is empty after dates selected', () => {
    const allRooms = [{ id: 'r1', room_number: 101 }];
    const { initialState, initialEntries } = makeState(allRooms, []);

    // Pre-populate dates in rendered state by providing both dates via initial form interaction
    const { container } = render(<NewReservationComponent />, { initialState, initialEntries });

    const checkinInput = container.querySelector('#checkin_date');
    const checkoutInput = container.querySelector('#checkout_date');

    fireEvent.change(checkinInput, { target: { name: 'checkin_date', value: '2099-01-01' } });
    fireEvent.change(checkoutInput, { target: { name: 'checkout_date', value: '2099-01-05' } });

    expect(
      screen.getByText(/No rooms available for these dates/i),
    ).toBeInTheDocument();
  });

  it('disables room dropdown while availableRooms is loading', () => {
    const { initialState, initialEntries } = makeState(
      [{ id: 'r1', room_number: 101 }],
      null,
      true,
    );
    render(<NewReservationComponent />, { initialState, initialEntries });

    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
  });
});
