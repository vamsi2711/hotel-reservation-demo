import React from 'react';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { default as utils } from '@/shared/utils';
import { Loading } from '@/shared/components';

const TODAY = new Date().toISOString().slice(0, 10);

const completedTooltip = 'Stay already completed';

const DefaultTab = ({
  reservations = [],
  actions = { cancelReservation: () => {}, checkoutNow: () => {} },
}) => {
  const { cancelReservation, checkoutNow } = actions;
  const loading = useSelector((state) => state?.site?.home?.loading);
  const rooms = useSelector((state) => state?.site?.home?.rooms || []);
  const roomMap = React.useMemo(
    () => new Map(rooms.map((r) => [r.id, r])),
    [rooms],
  );

  return (
    <div data-name="reservations-tab" style={{ background: '#f8f9fa', padding: '1.5rem 0.5rem 2rem' }}>
      <div className="card border-0 shadow-sm">
        {/* Card header — matches New Reservation and dashboard card pattern */}
        <div
          className="card-header d-flex justify-content-between align-items-center py-3 border-0"
          style={{ background: '#1a2e4a' }}
        >
          <h5 className="mb-0 text-white fw-semibold">Reservations</h5>
          <Link to="/reservations/new">
            <Button variant="warning" size="sm" className="fw-semibold px-3">
              Book
            </Button>
          </Link>
        </div>

        <div className="card-body p-0">
          {loading && reservations.length === 0 && (
            <div className="p-4">
              <Loading />
            </div>
          )}

          {!loading && reservations.length === 0 && (
            <div className="p-5 text-center text-muted">
              <p className="mb-2" style={{ fontSize: '0.95rem' }}>No reservations yet.</p>
              <Link to="/reservations/new">
                <Button variant="warning" size="sm" className="fw-semibold">
                  Book your first stay
                </Button>
              </Link>
            </div>
          )}

          {reservations.length > 0 && (
            <div className="table-responsive">
              <table className="table table-hover table-striped reservations-table mb-0">
                <thead>
                  <tr>
                    <th scope="col">Room</th>
                    <th scope="col">Check-In</th>
                    <th scope="col">Check-Out</th>
                    <th scope="col">Total Charge</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((reservation) => {
                    const checkoutDate = reservation?.checkout_date?.slice(0, 10) || '';
                    const checkinDate = reservation?.checkin_date?.slice(0, 10) || '';
                    const isPast = checkoutDate <= TODAY;
                    const isActive = checkinDate <= TODAY && checkoutDate > TODAY;

                    return (
                      <tr key={reservation?.id}>
                        <td>
                          {roomMap.get(reservation?.room_id)?.room_number
                            ? `Room ${roomMap.get(reservation?.room_id).room_number}`
                            : `Room …${reservation?.room_id?.slice(-8)}`}
                        </td>
                        <td>{utils.formatStayDate(reservation?.checkin_date)}</td>
                        <td>{utils.formatStayDate(reservation?.checkout_date)}</td>
                        <td>{utils.formatNumberAsMoney(reservation?.total_charge)}</td>
                        <td>
                          <div className="d-flex gap-2 flex-wrap align-items-center">
                            <Link to={`/reservations/${reservation.id}`}>
                              <Button variant="primary" size="sm">View</Button>
                            </Link>

                            {isPast ? (
                              <span
                                title={completedTooltip}
                                style={{ cursor: 'not-allowed', display: 'inline-block' }}
                              >
                                <Button
                                  variant="info"
                                  size="sm"
                                  disabled
                                  style={{ pointerEvents: 'none', opacity: 0.45 }}
                                >
                                  Edit
                                </Button>
                              </span>
                            ) : (
                              <Link to={`/reservations/${reservation.id}/edit`}>
                                <Button variant="info" size="sm">Edit</Button>
                              </Link>
                            )}

                            {isPast ? (
                              <span
                                title={completedTooltip}
                                style={{ cursor: 'not-allowed', display: 'inline-block' }}
                              >
                                <Button
                                  variant="danger"
                                  size="sm"
                                  disabled
                                  style={{ pointerEvents: 'none', opacity: 0.45 }}
                                >
                                  Cancel
                                </Button>
                              </span>
                            ) : (
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() =>
                                  cancelReservation &&
                                  cancelReservation(Number(reservation.id))
                                }
                              >
                                Cancel
                              </Button>
                            )}

                            {isActive && (
                              <Button
                                variant="success"
                                size="sm"
                                className="fw-semibold"
                                onClick={() =>
                                  checkoutNow &&
                                  checkoutNow({
                                    reservationId: Number(reservation.id),
                                    room_id: reservation.room_id,
                                    checkin_date: utils.formatStayDate(reservation.checkin_date),
                                  })
                                }
                              >
                                Check Out Now
                              </Button>
                            )}
                          </div>
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
  );
};

export default DefaultTab;
