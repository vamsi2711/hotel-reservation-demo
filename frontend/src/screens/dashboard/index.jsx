import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

import { actionTypes, connectComponent } from '@/shared/base';
import { Loading } from '@/shared/components';

const CHART_COLOR = '#4e8ccd';
const CHART_COLOR_HOVER = '#2a5f9e';

const StatCard = ({ label, value, sub, accent }) => (
  <div className="col-md-3 mb-3">
    <div
      className="card h-100 border-0 shadow-sm"
      style={{ borderLeft: `4px solid ${accent}`, borderRadius: '6px' }}
    >
      <div className="card-body">
        <p
          className="text-uppercase mb-1"
          style={{ fontSize: '0.72rem', letterSpacing: '0.08em', color: '#6c757d' }}
        >
          {label}
        </p>
        <h3 className="fw-bold mb-0" style={{ color: accent }}>
          {value}
        </h3>
        {sub && <p className="text-muted mb-0" style={{ fontSize: '0.8rem' }}>{sub}</p>}
      </div>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="bg-white border rounded px-3 py-2 shadow-sm"
        style={{ fontSize: '0.85rem' }}
      >
        <p className="mb-0 fw-semibold">{label}</p>
        <p className="mb-0 text-primary">{payload[0].value} reservation{payload[0].value !== 1 ? 's' : ''}</p>
      </div>
    );
  }
  return null;
};

const formatRoomLabel = (id, roomMap) => {
  const num = roomMap?.get(id)?.room_number;
  return num ? `Room ${num}` : (id ? `…${id.slice(-8)}` : '—');
};

const DEMO_TODAY = '2026-06-18';
const getStatus = (r) => {
  const checkin = r.checkin_date.slice(0, 10);
  const checkout = r.checkout_date.slice(0, 10);
  return checkin <= DEMO_TODAY && checkout >= DEMO_TODAY ? 'active' : 'completed';
};

const DashboardComponent = () => {
  const reservations = useSelector(
    (state) => state?.site?.dashboard?.reservations || [],
  );
  const rooms = useSelector((state) => state?.site?.dashboard?.rooms || []);
  const loading = useSelector((state) => state?.site?.dashboard?.loading);

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [roomSearch, setRoomSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activeBar, setActiveBar] = useState(null);

  const totalReservations = reservations.length;
  const totalRooms = rooms.length;
  const roomMap = useMemo(() => new Map(rooms.map((r) => [r.id, r])), [rooms]);

  const reservedRoomIds = useMemo(
    () => new Set(reservations.map((r) => r.room_id)),
    [reservations],
  );
  const availableRooms = totalRooms - reservedRoomIds.size;
  const utilizationRate =
    totalRooms > 0
      ? Math.round((reservedRoomIds.size / totalRooms) * 100)
      : 0;

  const totalRevenue = useMemo(
    () => reservations.reduce((sum, r) => sum + (r.total_charge || 0), 0),
    [reservations],
  );

  const chartData = useMemo(() => {
    const byMonth = {};
    reservations.forEach((r) => {
      const [year, month] = r.checkin_date.split('-');
      const key = `${year}-${month}`;
      byMonth[key] = (byMonth[key] || 0) + 1;
    });
    const monthNames = [
      '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    return Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, count]) => {
        const [yr, mo] = key.split('-');
        return { month: `${monthNames[parseInt(mo)]} ${yr}`, count, key };
      });
  }, [reservations]);

  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      if (dateFrom && r.checkin_date.slice(0, 10) < dateFrom) return false;
      if (dateTo && r.checkin_date.slice(0, 10) > dateTo) return false;
      if (roomSearch) {
        const label = formatRoomLabel(r.room_id, roomMap).toLowerCase();
        if (!label.includes(roomSearch.toLowerCase())) return false;
      }
      if (statusFilter && getStatus(r) !== statusFilter) return false;
      return true;
    });
  }, [reservations, dateFrom, dateTo, roomSearch, statusFilter]);

  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setRoomSearch('');
    setStatusFilter('');
  };

  const hasFilters = dateFrom || dateTo || roomSearch || statusFilter;

  if (loading && reservations.length === 0) {
    return (
      <div className="container mt-5 pt-4">
        <Loading />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
    <div className="container-fluid px-4 py-4" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div className="mb-4">
        <h2 className="fw-bold mb-0" style={{ color: '#1a2e4a' }}>
          Reservation Analytics Dashboard
        </h2>
        <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
          Facility utilization and booking trends &mdash; ACME Research Lodging
        </p>
      </div>

      {/* Stats Row */}
      <div className="row mb-4">
        <StatCard
          label="Total Reservations"
          value={totalReservations}
          sub="All-time bookings"
          accent="#4e8ccd"
        />
        <StatCard
          label="Total Rooms"
          value={totalRooms}
          sub="Facility capacity"
          accent="#28a745"
        />
        <StatCard
          label="Available Rooms"
          value={availableRooms}
          sub={`${reservedRoomIds.size} room${reservedRoomIds.size !== 1 ? 's' : ''} reserved`}
          accent="#fd7e14"
        />
        <StatCard
          label="Utilization Rate"
          value={`${utilizationRate}%`}
          sub={`$${totalRevenue.toLocaleString()} total revenue`}
          accent="#6f42c1"
        />
      </div>

      {/* Bar Chart */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <h6
            className="text-uppercase fw-semibold mb-3"
            style={{ fontSize: '0.75rem', letterSpacing: '0.08em', color: '#6c757d' }}
          >
            Reservations by Check-in Month
          </h6>
          {chartData.length === 0 ? (
            <p className="text-muted">No reservation data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={chartData}
                margin={{ top: 4, right: 24, left: 0, bottom: 4 }}
                onMouseLeave={() => setActiveBar(null)}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: '#6c757d' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: '#6c757d' }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f3f5' }} />
                <Bar
                  dataKey="count"
                  radius={[4, 4, 0, 0]}
                  onMouseEnter={(_, idx) => setActiveBar(idx)}
                >
                  {chartData.map((entry, idx) => (
                    <Cell
                      key={entry.key}
                      fill={activeBar === idx ? CHART_COLOR_HOVER : CHART_COLOR}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Filter Controls */}
      <div className="card border-0 shadow-sm mb-0">
        <div className="card-body">
          <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
            <h6
              className="text-uppercase fw-semibold mb-0"
              style={{ fontSize: '0.75rem', letterSpacing: '0.08em', color: '#6c757d' }}
            >
              Reservation Records
              <span className="ms-2 badge bg-secondary fw-normal" style={{ fontSize: '0.7rem' }}>
                {filteredReservations.length} of {totalReservations}
              </span>
            </h6>
            {hasFilters && (
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={clearFilters}
                style={{ fontSize: '0.78rem' }}
              >
                Clear filters
              </button>
            )}
          </div>

          <div className="row g-2 mb-3">
            <div className="col-md-3">
              <label className="form-label" style={{ fontSize: '0.78rem', color: '#6c757d' }}>
                Check-in from
              </label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label" style={{ fontSize: '0.78rem', color: '#6c757d' }}>
                Check-in to
              </label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label" style={{ fontSize: '0.78rem', color: '#6c757d' }}>
                Search by Room
              </label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="e.g. 101"
                value={roomSearch}
                onChange={(e) => setRoomSearch(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label" style={{ fontSize: '0.78rem', color: '#6c757d' }}>
                Status
              </label>
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {filteredReservations.length === 0 ? (
            <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
              No reservations match the current filters.
            </p>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm table-hover align-middle mb-0">
                <thead>
                  <tr style={{ borderBottom: '2px solid #dee2e6' }}>
                    <th
                      scope="col"
                      style={{ fontSize: '0.8rem', color: '#6c757d', fontWeight: 600 }}
                    >
                      ID
                    </th>
                    <th
                      scope="col"
                      style={{ fontSize: '0.8rem', color: '#6c757d', fontWeight: 600 }}
                    >
                      Room
                    </th>
                    <th
                      scope="col"
                      style={{ fontSize: '0.8rem', color: '#6c757d', fontWeight: 600 }}
                    >
                      Check-In
                    </th>
                    <th
                      scope="col"
                      style={{ fontSize: '0.8rem', color: '#6c757d', fontWeight: 600 }}
                    >
                      Check-Out
                    </th>
                    <th
                      scope="col"
                      style={{ fontSize: '0.8rem', color: '#6c757d', fontWeight: 600 }}
                    >
                      Nights
                    </th>
                    <th
                      scope="col"
                      style={{ fontSize: '0.8rem', color: '#6c757d', fontWeight: 600 }}
                    >
                      Total Charge
                    </th>
                    <th
                      scope="col"
                      style={{ fontSize: '0.8rem', color: '#6c757d', fontWeight: 600 }}
                    >
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReservations.map((r) => {
                    const checkin = new Date(r.checkin_date.slice(0, 10) + 'T00:00:00');
                    const checkout = new Date(r.checkout_date.slice(0, 10) + 'T00:00:00');
                    const nights = Math.round(
                      (checkout - checkin) / (1000 * 60 * 60 * 24),
                    );
                    const isActive = getStatus(r) === 'active';
                    return (
                      <tr key={r.id}>
                        <td
                          className="font-monospace"
                          style={{ fontSize: '0.8rem', color: '#495057' }}
                        >
                          #{r.id}
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>
                          {formatRoomLabel(r.room_id, roomMap)}
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>{r.checkin_date.slice(0, 10)}</td>
                        <td style={{ fontSize: '0.85rem' }}>{r.checkout_date.slice(0, 10)}</td>
                        <td style={{ fontSize: '0.85rem' }}>{nights}</td>
                        <td style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                          ${r.total_charge?.toLocaleString()}
                        </td>
                        <td>
                          <span
                            className={`badge ${isActive ? 'bg-success' : 'bg-secondary'}`}
                            style={{ fontSize: '0.7rem' }}
                          >
                            {isActive ? 'Active' : 'Completed'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
};

const screen = connectComponent(DashboardComponent, {
  componentName: actionTypes.DASHBOARD_COMPONENT,
  state: (state) => state?.site?.dashboard || {},
  load: {
    data: () => ({ type: actionTypes.GET_DASHBOARD_DATA }),
  },
  mapDispatchToProps: () => ({}),
});

export default screen;
