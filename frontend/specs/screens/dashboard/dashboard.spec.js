import { screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { initialState as defaultShared } from '@/shared/sharedReducer';
import DashboardScreen, { isActiveOn } from '@/screens/dashboard/index';

import { render } from '../../reactTestHelpers';

// ─── isActiveOn unit tests ────────────────────────────────────────────────────

describe('isActiveOn', () => {
  const reservation = (checkin, checkout) => ({
    checkin_date: checkin,
    checkout_date: checkout,
  });

  it('returns true when date falls between checkin and checkout (inclusive)', () => {
    expect(isActiveOn(reservation('2026-05-01', '2026-05-10'), '2026-05-05')).toBe(true);
  });

  it('returns true on the checkin date itself', () => {
    expect(isActiveOn(reservation('2026-05-01', '2026-05-10'), '2026-05-01')).toBe(true);
  });

  it('returns true on the checkout date itself', () => {
    expect(isActiveOn(reservation('2026-05-01', '2026-05-10'), '2026-05-10')).toBe(true);
  });

  it('returns false when date is before checkin', () => {
    expect(isActiveOn(reservation('2026-05-05', '2026-05-10'), '2026-05-01')).toBe(false);
  });

  it('returns false when date is after checkout', () => {
    expect(isActiveOn(reservation('2026-05-01', '2026-05-05'), '2026-05-10')).toBe(false);
  });

  it('handles datetime strings from the backend (ignores time/timezone portion)', () => {
    expect(
      isActiveOn(
        reservation('2026-05-01 00:00:00+00:00', '2026-05-10 00:00:00+00:00'),
        '2026-05-05',
      ),
    ).toBe(true);
  });
});

// ─── DashboardComponent integration tests ────────────────────────────────────

const makeReservation = (id, roomId, checkin, checkout, charge = 100) => ({
  id,
  room_id: roomId,
  checkin_date: checkin,
  checkout_date: checkout,
  total_charge: charge,
});

const baseState = (reservations = [], rooms = []) => ({
  shared: { ...defaultShared },
  router: { location: { pathname: '/dashboard' } },
  site: {
    dashboard: { reservations, rooms, loading: false },
  },
});

describe('DashboardComponent', () => {
  const pathname = '/dashboard';
  const initialEntries = [pathname];

  it('renders the occupancy date picker defaulting to today', () => {
    const today = new Date().toISOString().slice(0, 10);
    render(<DashboardScreen />, {
      initialState: baseState(),
      initialEntries,
    });
    const picker = screen.getByLabelText(/occupancy date/i);
    expect(picker).toBeInTheDocument();
    expect(picker.value).toBe(today);
  });

  it('shows "Available Today" and "Today\'s Occupancy" labels when date is today', () => {
    render(<DashboardScreen />, {
      initialState: baseState(),
      initialEntries,
    });
    expect(screen.getByText(/available today/i)).toBeInTheDocument();
    expect(screen.getByText(/today's occupancy/i)).toBeInTheDocument();
  });

  it('updates labels when a different date is selected', () => {
    render(<DashboardScreen />, {
      initialState: baseState(),
      initialEntries,
    });
    const picker = screen.getByLabelText(/occupancy date/i);
    fireEvent.change(picker, { target: { value: '2026-05-05' } });

    expect(screen.getByText(/available on/i)).toBeInTheDocument();
    expect(screen.getByText(/occupancy on/i)).toBeInTheDocument();
    expect(screen.queryByText(/available today/i)).not.toBeInTheDocument();
  });

  it('shows "Back to today" button only when a non-today date is selected', () => {
    render(<DashboardScreen />, {
      initialState: baseState(),
      initialEntries,
    });
    expect(screen.queryByText(/back to today/i)).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/occupancy date/i), {
      target: { value: '2026-05-05' },
    });
    expect(screen.getByText(/back to today/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/back to today/i));
    expect(screen.queryByText(/back to today/i)).not.toBeInTheDocument();
  });

  it('recalculates occupied rooms when occupancy date changes', () => {
    const reservations = [
      makeReservation(1, 'room-a', '2026-05-01', '2026-05-10'),
      makeReservation(2, 'room-b', '2026-06-01', '2026-06-15'),
    ];
    const rooms = [
      { id: 'room-a', room_number: 101 },
      { id: 'room-b', room_number: 102 },
    ];

    render(<DashboardScreen />, {
      initialState: baseState(reservations, rooms),
      initialEntries,
    });

    const picker = screen.getByLabelText(/occupancy date/i);

    // On May 5: room-a is occupied → 1 occupied, 1 available
    fireEvent.change(picker, { target: { value: '2026-05-05' } });
    expect(screen.getByText('1 room occupied')).toBeInTheDocument();

    // On Jun 10: room-b is occupied → 1 occupied, 1 available
    fireEvent.change(picker, { target: { value: '2026-06-10' } });
    expect(screen.getByText('1 room occupied')).toBeInTheDocument();

    // On Jul 1: neither occupied → 0 occupied, 2 available
    fireEvent.change(picker, { target: { value: '2026-07-01' } });
    expect(screen.getByText('0 rooms occupied')).toBeInTheDocument();
  });

  it('reflects correct utilization rate for selected date', () => {
    const reservations = [
      makeReservation(1, 'room-a', '2026-05-01', '2026-05-10'),
    ];
    const rooms = [
      { id: 'room-a', room_number: 101 },
      { id: 'room-b', room_number: 102 },
    ];

    render(<DashboardScreen />, {
      initialState: baseState(reservations, rooms),
      initialEntries,
    });

    const picker = screen.getByLabelText(/occupancy date/i);

    // May 5: 1 of 2 rooms occupied → 50%
    fireEvent.change(picker, { target: { value: '2026-05-05' } });
    expect(screen.getByText('50%')).toBeInTheDocument();

    // Jul 1: 0 of 2 rooms occupied → 0%
    fireEvent.change(picker, { target: { value: '2026-07-01' } });
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('shows revenue only from reservations active on the selected date', () => {
    const reservations = [
      makeReservation(1, 'room-a', '2026-05-01', '2026-05-10', 200),
      makeReservation(2, 'room-b', '2026-06-01', '2026-06-15', 350),
    ];
    const rooms = [
      { id: 'room-a', room_number: 101 },
      { id: 'room-b', room_number: 102 },
    ];

    render(<DashboardScreen />, {
      initialState: baseState(reservations, rooms),
      initialEntries,
    });

    const picker = screen.getByLabelText(/occupancy date/i);

    // May 5: only room-a active → $200 in stat card subtitle
    fireEvent.change(picker, { target: { value: '2026-05-05' } });
    expect(screen.getByText(/\$200 revenue on/i)).toBeInTheDocument();

    // Jun 10: only room-b active → $350 in stat card subtitle
    fireEvent.change(picker, { target: { value: '2026-06-10' } });
    expect(screen.getByText(/\$350 revenue on/i)).toBeInTheDocument();

    // Jul 1: no active reservations → $0 in stat card subtitle
    fireEvent.change(picker, { target: { value: '2026-07-01' } });
    expect(screen.getByText(/\$0 revenue on/i)).toBeInTheDocument();
  });

  it('uses "revenue today" label when occupancy date is today', () => {
    render(<DashboardScreen />, {
      initialState: baseState(),
      initialEntries,
    });
    expect(screen.getByText(/revenue today/i)).toBeInTheDocument();
  });
});
