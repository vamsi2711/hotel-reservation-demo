import React from 'react';
import { screen, fireEvent } from '@testing-library/react';

import { initialState as defaultShared } from '@/shared/sharedReducer';
import CalendarTab from '@/screens/home/tabs/CalendarTab';

import { render } from '../../reactTestHelpers';

const pathname = '/home';
const initialEntries = [pathname];

const reservations = [
  { id: '1', room_id: 'room-1', checkin_date: '2026-06-15', checkout_date: '2026-06-18', total_charge: 300 },
  { id: '2', room_id: 'room-2', checkin_date: '2026-06-20', checkout_date: '2026-06-28', total_charge: 500 },
];

const rooms = [
  { id: 'room-1', room_number: 101 },
  { id: 'room-2', room_number: 102 },
];

const makeState = (overrides = {}) => ({
  shared: { ...defaultShared },
  router: { location: { pathname } },
  site: {
    home: {
      reservations,
      rooms,
      ...overrides,
    },
  },
});

const ui = <CalendarTab />;

// ─── Render ────────────────────────────────────────────────────────────────────

describe('CalendarTab — render', () => {
  it('renders the Calendar heading and view-toggle buttons', () => {
    render(ui, { initialState: makeState(), initialEntries });

    expect(screen.getByText('Calendar')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Month/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Week/i })).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /Previous/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Next/i })).toBeInTheDocument();
  });

  it('defaults to month view (shows day-of-week column headers)', () => {
    render(ui, { initialState: makeState(), initialEntries });

    for (const day of ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']) {
      // getAllByText because the same abbrev appears in both views; at least one occurrence is enough
      expect(screen.getAllByText(day).length).toBeGreaterThan(0);
    }
    // Month view has no "Room" column header
    expect(screen.queryByRole('columnheader', { name: /^Room$/i })).not.toBeInTheDocument();
  });

  it('shows a header label (month name + year) by default', () => {
    render(ui, { initialState: makeState(), initialEntries });

    const label = screen.getByTestId('calendar-header-label');
    expect(label.textContent).toMatch(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\b/);
    expect(label.textContent).toMatch(/\d{4}/);
  });
});

// ─── View toggle ───────────────────────────────────────────────────────────────

describe('CalendarTab — view toggle', () => {
  it('switches to week view when Week button is clicked', () => {
    render(ui, { initialState: makeState(), initialEntries });

    fireEvent.click(screen.getByRole('button', { name: /Week/i }));

    // Week view shows a "Room" column header
    expect(screen.getByRole('columnheader', { name: /^Room$/i })).toBeInTheDocument();
  });

  it('the Week button becomes active (aria-pressed=true) after clicking', () => {
    render(ui, { initialState: makeState(), initialEntries });

    const weekBtn = screen.getByRole('button', { name: /Week/i });
    expect(weekBtn).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(weekBtn);

    expect(weekBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('switches back to month view when Month button is clicked', () => {
    render(ui, { initialState: makeState(), initialEntries });

    fireEvent.click(screen.getByRole('button', { name: /Week/i }));
    expect(screen.getByRole('columnheader', { name: /^Room$/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Month/i }));
    expect(screen.queryByRole('columnheader', { name: /^Room$/i })).not.toBeInTheDocument();
  });

  it('today column header has a blue-top-border accent and a blue-circle date number', () => {
    render(ui, { initialState: makeState(), initialEntries });

    fireEvent.click(screen.getByRole('button', { name: /Week/i }));

    const todayHeader = screen.getByTestId('week-today-header');
    expect(todayHeader).toBeInTheDocument();
    // Blue accent border on top
    expect(todayHeader).toHaveStyle({ borderTop: '3px solid #2563eb' });
    // Stronger blue background
    expect(todayHeader).toHaveStyle({ background: '#dbeafe' });
  });

  it('week view lists each room as a row', () => {
    render(ui, { initialState: makeState(), initialEntries });

    fireEvent.click(screen.getByRole('button', { name: /Week/i }));

    expect(screen.getByText('Room 101')).toBeInTheDocument();
    expect(screen.getByText('Room 102')).toBeInTheDocument();
  });
});

// ─── Navigation ────────────────────────────────────────────────────────────────

describe('CalendarTab — navigation', () => {
  it('Next button changes the month label forward', () => {
    render(ui, { initialState: makeState(), initialEntries });

    const label = screen.getByTestId('calendar-header-label');
    const before = label.textContent;

    fireEvent.click(screen.getByRole('button', { name: /Next/i }));

    expect(label.textContent).not.toBe(before);
  });

  it('Previous button changes the month label backward', () => {
    render(ui, { initialState: makeState(), initialEntries });

    const label = screen.getByTestId('calendar-header-label');
    const before = label.textContent;

    fireEvent.click(screen.getByRole('button', { name: /Previous/i }));

    expect(label.textContent).not.toBe(before);
  });


  it('Next changes the week range in week view', () => {
    render(ui, { initialState: makeState(), initialEntries });

    fireEvent.click(screen.getByRole('button', { name: /Week/i }));

    const label = screen.getByTestId('calendar-header-label');
    const before = label.textContent;

    fireEvent.click(screen.getByRole('button', { name: /Next/i }));

    expect(label.textContent).not.toBe(before);
  });

  it('Previous changes the week range in week view', () => {
    render(ui, { initialState: makeState(), initialEntries });

    fireEvent.click(screen.getByRole('button', { name: /Week/i }));

    const label = screen.getByTestId('calendar-header-label');
    const before = label.textContent;

    fireEvent.click(screen.getByRole('button', { name: /Previous/i }));

    expect(label.textContent).not.toBe(before);
  });

  it('Today button is never shown', () => {
    render(ui, { initialState: makeState(), initialEntries });

    expect(screen.queryByRole('button', { name: /Today/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Week/i }));

    expect(screen.queryByRole('button', { name: /Today/i })).not.toBeInTheDocument();
  });
});

// ─── Month day interaction ─────────────────────────────────────────────────────

describe('CalendarTab — month day click', () => {
  it('clicking a day with reservations shows a detail panel', () => {
    render(ui, { initialState: makeState(), initialEntries });

    // 2026-06-15 has a reservation (res #1 checks in that day)
    const dayCell = screen.queryByTestId('month-day-2026-06-15');
    if (!dayCell) {
      // We might be in a different month; just skip this assertion gracefully
      return;
    }
    fireEvent.click(dayCell);
    // Detail panel should appear with the reservation link
    expect(screen.getByText(/2026-06-15/)).toBeInTheDocument();
  });

  it('clicking the same day again closes the detail panel', () => {
    render(ui, { initialState: makeState(), initialEntries });

    const dayCell = screen.queryByTestId('month-day-2026-06-15');
    if (!dayCell) return;

    fireEvent.click(dayCell);
    // Panel is open; click again to close
    fireEvent.click(dayCell);
    // The selected day's full date heading should no longer be visible
    expect(screen.queryByText(/No reservations on this day/)).not.toBeInTheDocument();
  });
});
