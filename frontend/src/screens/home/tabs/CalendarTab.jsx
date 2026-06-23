import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const BAR_COLORS = ['#2563eb', '#16a34a', '#d97706', '#9333ea', '#dc2626', '#0891b2', '#be185d'];

// Local-time YYYY-MM-DD — avoids UTC-offset issues from toISOString()
const isoDate = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// Normalize any date-like value (string or Date) to YYYY-MM-DD
const toDateStr = (v) => (v instanceof Date ? isoDate(v) : (v ?? '').slice(0, 10));

const buildMonthGrid = (year, month) => {
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const grid = [];
  for (let i = 0; i < cells.length; i += 7) grid.push(cells.slice(i, i + 7));
  return grid;
};

// Returns the Sunday that starts the week containing `date`
const getWeekStart = (date) => {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() - d.getDay());
  return d;
};

// ─── Main component ────────────────────────────────────────────────────────────

const CalendarTab = () => {
  const [view, setView] = useState('month');
  const [anchor, setAnchor] = useState(() => new Date());
  const [selectedDayStr, setSelectedDayStr] = useState(null);

  const reservations = useSelector((s) => s?.site?.home?.reservations ?? []);
  const rooms = useSelector((s) => s?.site?.home?.rooms ?? []);

  const todayStr = isoDate(new Date());

  const navigate = (dir) => {
    setAnchor((prev) => {
      const d = new Date(prev.getFullYear(), prev.getMonth(), prev.getDate());
      if (view === 'month') d.setMonth(d.getMonth() + dir);
      else d.setDate(d.getDate() + dir * 7);
      return d;
    });
    setSelectedDayStr(null);
  };

  const goToToday = () => {
    setAnchor(new Date());
    setSelectedDayStr(null);
  };

  // ── Month data ──────────────────────────────────────────────────────────────

  const monthGrid = useMemo(
    () => buildMonthGrid(anchor.getFullYear(), anchor.getMonth()),
    [anchor],
  );

  // dayStr → reservations active that day (checkin inclusive, checkout exclusive)
  const resByDay = useMemo(() => {
    const map = {};
    for (const res of reservations) {
      const ci = toDateStr(res.checkin_date);
      const co = toDateStr(res.checkout_date);
      if (!ci || !co || ci >= co) continue;
      const cur = new Date(ci + 'T12:00:00');
      const end = new Date(co + 'T12:00:00');
      while (cur < end) {
        const key = isoDate(cur);
        (map[key] ??= []).push(res);
        cur.setDate(cur.getDate() + 1);
      }
    }
    return map;
  }, [reservations]);

  // ── Week data ───────────────────────────────────────────────────────────────

  const weekDays = useMemo(() => {
    const start = getWeekStart(anchor);
    return Array.from({ length: 7 }, (_, i) =>
      new Date(start.getFullYear(), start.getMonth(), start.getDate() + i),
    );
  }, [anchor]);

  const weekStartStr = isoDate(weekDays[0]);
  const weekEndStr = isoDate(weekDays[6]);

  // roomId → reservations overlapping this week
  const resByRoom = useMemo(() => {
    const map = Object.fromEntries(rooms.map((r) => [r.id, []]));
    for (const res of reservations) {
      const ci = toDateStr(res.checkin_date);
      const co = toDateStr(res.checkout_date);
      if (!ci || !co) continue;
      // overlaps week: checkin ≤ weekEnd && checkout > weekStart
      if (ci <= weekEndStr && co > weekStartStr && res.room_id in map) {
        map[res.room_id].push(res);
      }
    }
    return map;
  }, [reservations, rooms, weekStartStr, weekEndStr]);

  // Column span (0-indexed) for a reservation within the current week
  const getSpan = (res) => {
    const ci = toDateStr(res.checkin_date);
    const co = toDateStr(res.checkout_date);
    const coDate = new Date(co + 'T12:00:00');
    coDate.setDate(coDate.getDate() - 1);
    const lastDayStr = isoDate(coDate);

    const startStr = ci < weekStartStr ? weekStartStr : ci;
    const endStr = lastDayStr > weekEndStr ? weekEndStr : lastDayStr;

    const startIdx = weekDays.findIndex((d) => isoDate(d) === startStr);
    const endIdx = weekDays.findIndex((d) => isoDate(d) === endStr);
    if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) return null;
    return { startIdx, endIdx };
  };

  const headerLabel =
    view === 'month'
      ? `${MONTH_NAMES[anchor.getMonth()]} ${anchor.getFullYear()}`
      : `${weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  const selectedReservations = selectedDayStr ? (resByDay[selectedDayStr] ?? []) : [];

  return (
    <div data-name="calendar-tab" style={{ background: '#f8f9fa', padding: '1.5rem 0.5rem 2rem' }}>
      <div className="card border-0 shadow-sm">
        {/* ── Header ── */}
        <div
          className="card-header d-flex justify-content-between align-items-center py-3 border-0 flex-wrap gap-2"
          style={{ background: '#1a2e4a' }}
        >
          <h5 className="mb-0 text-white fw-semibold">Calendar</h5>
          <div className="d-flex gap-2 align-items-center flex-wrap">
            <div className="btn-group btn-group-sm" role="group" aria-label="View mode">
              <button
                type="button"
                className={`btn ${view === 'month' ? 'btn-warning' : 'btn-outline-light'}`}
                onClick={() => setView('month')}
                aria-pressed={view === 'month'}
              >
                Month
              </button>
              <button
                type="button"
                className={`btn ${view === 'week' ? 'btn-warning' : 'btn-outline-light'}`}
                onClick={() => setView('week')}
                aria-pressed={view === 'week'}
              >
                Week
              </button>
            </div>
            <button
              className="btn btn-sm btn-outline-light"
              onClick={() => navigate(-1)}
              aria-label="Previous"
            >
              ‹
            </button>

            <button
              className="btn btn-sm btn-outline-light"
              onClick={() => navigate(1)}
              aria-label="Next"
            >
              ›
            </button>
            <span
              data-testid="calendar-header-label"
              className="text-white fw-semibold"
              style={{ minWidth: 200, textAlign: 'center' }}
            >
              {headerLabel}
            </span>
          </div>
        </div>

        <div className="card-body p-0">
          {view === 'month' ? (
            <MonthView
              grid={monthGrid}
              todayStr={todayStr}
              resByDay={resByDay}
              selectedDayStr={selectedDayStr}
              onSelectDay={setSelectedDayStr}
              selectedReservations={selectedReservations}
            />
          ) : (
            <WeekView
              weekDays={weekDays}
              todayStr={todayStr}
              rooms={rooms}
              resByRoom={resByRoom}
              getSpan={getSpan}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Month view ────────────────────────────────────────────────────────────────

const MonthView = ({ grid, todayStr, resByDay, selectedDayStr, onSelectDay, selectedReservations }) => (
  <>
    <div className="table-responsive">
      <table className="mb-0 w-100" style={{ borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <thead>
          <tr>
            {DAYS_SHORT.map((d) => (
              <th
                key={d}
                style={{
                  textAlign: 'center', padding: '8px 4px',
                  background: '#f1f5f9', borderBottom: '1px solid #dee2e6',
                  fontWeight: 600, fontSize: '0.8rem', color: '#64748b', width: '14.285%',
                }}
              >
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {grid.map((week, wi) => (
            <tr key={wi}>
              {week.map((day, di) => {
                if (!day) {
                  return (
                    <td
                      key={di}
                      style={{ height: 72, border: '1px solid #e9ecef', background: '#f8f9fa' }}
                    />
                  );
                }
                const ds = isoDate(day);
                const isToday = ds === todayStr;
                const isSel = ds === selectedDayStr;
                const count = (resByDay[ds] ?? []).length;
                return (
                  <td
                    key={di}
                    data-testid={`month-day-${ds}`}
                    onClick={() => onSelectDay(isSel ? null : ds)}
                    style={{
                      height: 72, border: '1px solid #e9ecef',
                      verticalAlign: 'top', padding: '4px 6px',
                      cursor: 'pointer',
                      background: isSel ? '#e8f0fe' : 'white',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span
                        style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          width: 26, height: 26, borderRadius: '50%',
                          fontSize: '0.85rem', fontWeight: isToday ? 700 : 400,
                          background: isToday ? '#1a2e4a' : 'transparent',
                          color: isToday ? 'white' : '#212529',
                        }}
                      >
                        {day.getDate()}
                      </span>
                      {count > 0 && (
                        <span
                          style={{
                            background: '#2563eb', color: 'white', borderRadius: 10,
                            padding: '1px 6px', fontSize: '0.72rem', fontWeight: 600, marginTop: 2,
                          }}
                        >
                          {count}
                        </span>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {selectedDayStr && (
      <div style={{ borderTop: '2px solid #1a2e4a', padding: '1rem 1.25rem', background: 'white' }}>
        <div style={{ fontWeight: 600, marginBottom: '0.75rem', color: '#1a2e4a' }}>
          {new Date(selectedDayStr + 'T12:00:00').toLocaleDateString('en-US', {
            weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
          })}
        </div>
        {selectedReservations.length === 0 ? (
          <p style={{ color: '#6c757d', fontSize: '0.9rem', margin: 0 }}>
            No reservations on this day.
          </p>
        ) : (
          <ul
            style={{
              listStyle: 'none', padding: 0, margin: 0,
              display: 'flex', gap: '0.5rem', flexWrap: 'wrap',
            }}
          >
            {selectedReservations.map((res) => (
              <li key={res.id}>
                <Link
                  to={`/reservations/${res.id}`}
                  state={{ fromTab: 'calendar' }}
                  style={{
                    display: 'inline-block', background: '#f1f5f9',
                    border: '1px solid #dee2e6', borderRadius: 6,
                    padding: '4px 12px', fontSize: '0.85rem',
                    color: '#1a2e4a', textDecoration: 'none',
                  }}
                >
                  #{res.id} · {toDateStr(res.checkin_date)} → {toDateStr(res.checkout_date)}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    )}
  </>
);

// ─── Week view ─────────────────────────────────────────────────────────────────

const WeekView = ({ weekDays, todayStr, rooms, resByRoom, getSpan }) => {
  if (rooms.length === 0) {
    return <div className="p-4 text-center text-muted">No rooms available.</div>;
  }

  return (
    <div className="table-responsive">
      <table className="mb-0 w-100" style={{ borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <thead>
          <tr>
            <th
              style={{
                width: 90, padding: '8px 12px',
                background: '#f1f5f9', borderBottom: '1px solid #dee2e6',
                fontSize: '0.8rem', fontWeight: 600, color: '#64748b',
              }}
            >
              Room
            </th>
            {weekDays.map((day) => {
              const ds = isoDate(day);
              const isToday = ds === todayStr;
              return (
                <th
                  key={ds}
                  data-testid={isToday ? 'week-today-header' : undefined}
                  style={{
                    textAlign: 'center', padding: '10px 4px 8px',
                    background: isToday ? '#dbeafe' : '#f1f5f9',
                    borderBottom: '1px solid #dee2e6', borderLeft: '1px solid #e9ecef',
                    borderTop: isToday ? '3px solid #2563eb' : '3px solid transparent',
                    fontSize: '0.8rem',
                    color: isToday ? '#1e40af' : '#64748b',
                    fontWeight: isToday ? 700 : 600,
                  }}
                >
                  <div style={{ fontWeight: isToday ? 700 : 600, marginBottom: 2 }}>
                    {DAYS_SHORT[day.getDay()]}
                  </div>
                  <div
                    style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 32, height: 32, borderRadius: '50%', margin: '0 auto',
                      background: isToday ? '#2563eb' : 'transparent',
                      color: isToday ? 'white' : '#374151',
                      fontSize: '1rem', fontWeight: isToday ? 800 : 500,
                    }}
                  >
                    {day.getDate()}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => {
            const roomRes = (resByRoom[room.id] ?? []).sort(
              (a, b) => (toDateStr(a.checkin_date) < toDateStr(b.checkin_date) ? -1 : 1),
            );

            // Build colspan cell list, merging spanned columns into single cells
            const cells = [];
            const absorbed = new Set();
            for (let di = 0; di < 7; di++) {
              if (absorbed.has(di)) continue;
              const bar = roomRes.find((res) => {
                const span = getSpan(res);
                return span?.startIdx === di;
              });
              if (bar) {
                const span = getSpan(bar);
                const cs = span.endIdx - span.startIdx + 1;
                for (let k = di + 1; k <= span.endIdx; k++) absorbed.add(k);
                cells.push({ type: 'bar', res: bar, colSpan: cs, di });
              } else {
                cells.push({ type: 'empty', di, colSpan: 1 });
              }
            }

            return (
              <tr key={room.id}>
                <td
                  style={{
                    padding: '8px 12px', border: '1px solid #e9ecef',
                    fontWeight: 600, fontSize: '0.85rem',
                    background: '#f8f9fa', color: '#1a2e4a',
                  }}
                >
                  {room.room_number ? `Room ${room.room_number}` : room.id}
                </td>
                {cells.map((cell) => {
                  const dayStr = isoDate(weekDays[cell.di]);
                  const isToday = dayStr === todayStr;

                  if (cell.type === 'bar') {
                    const colorIdx = roomRes.indexOf(cell.res) % BAR_COLORS.length;
                    return (
                      <td
                        key={cell.di}
                        colSpan={cell.colSpan}
                        style={{
                          border: '1px solid #e9ecef', padding: '6px 4px',
                          verticalAlign: 'middle', height: 48,
                          background: isToday ? '#e8f4fd' : 'white',
                        }}
                      >
                        <Link
                          to={`/reservations/${cell.res.id}`}
                          state={{ fromTab: 'calendar' }}
                          title={`Check-in: ${toDateStr(cell.res.checkin_date)} · Check-out: ${toDateStr(cell.res.checkout_date)}`}
                          style={{
                            display: 'block', background: BAR_COLORS[colorIdx],
                            color: 'white', borderRadius: 4, padding: '4px 8px',
                            fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                          }}
                        >
                          {toDateStr(cell.res.checkin_date)} → {toDateStr(cell.res.checkout_date)}
                        </Link>
                      </td>
                    );
                  }

                  return (
                    <td
                      key={cell.di}
                      style={{
                        border: '1px solid #e9ecef', height: 48,
                        background: isToday ? '#e8f4fd' : 'white',
                      }}
                    />
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default CalendarTab;
