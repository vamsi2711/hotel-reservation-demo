import React from 'react';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { default as utils } from '@/shared/utils';
import { Loading } from '@/shared/components';

const TODAY = new Date().toISOString().slice(0, 10);

const DefaultTab = ({
  reservations = [],
  actions = { cancelReservation: () => {} },
}) => {
  const { cancelReservation } = actions;
  const loading = useSelector((state) => state?.site?.home?.loading);
  const rooms = useSelector((state) => state?.site?.home?.rooms || []);
  const roomMap = React.useMemo(
    () => new Map(rooms.map((r) => [r.id, r])),
    [rooms],
  );

  return (
    <div data-name="reservations-tab">
      <div className="col-lg-12 bg-dark mx-auto">
        <div className="d-flex justify-content-between align-items-center">
          <h3>Reservations</h3>
          <Link to="/reservations/new">
            <Button variant="warning">Book</Button>
          </Link>
        </div>
        <div className="container flex-column">
          {loading && reservations.length === 0 && <Loading />}
          {!loading && reservations.length === 0 && (
            <div>No reservations exist.</div>
          )}
          {reservations.length > 0 && (
            <table className="table bg-light">
              <thead>
                <tr>
                  <th scope="col">Room Identifier</th>
                  <th scope="col">Check-In</th>
                  <th scope="col">Check-Out</th>
                  <th scope="col">Total Charge</th>
                  <th></th>
                  <th></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((reservation) => {
                  const isPast =
                    (reservation?.checkout_date?.slice(0, 10) || '') < TODAY;
                  const completedTooltip = 'Stay already completed';
                  return (
                    <tr key={reservation?.id}>
                      <td>
                        {roomMap.get(reservation?.room_id)?.room_number
                          ? `Room ${roomMap.get(reservation?.room_id).room_number}`
                          : `Room …${reservation?.room_id?.slice(-8)}`}
                      </td>
                      <td>{utils.formatStayDate(reservation?.checkin_date)}</td>
                      <td>{utils.formatStayDate(reservation?.checkout_date)}</td>
                      <td>
                        {utils.formatNumberAsMoney(reservation?.total_charge)}
                      </td>
                      <td>
                        <Link to={`/reservations/${reservation.id}`}>
                          <Button variant="primary">View</Button>
                        </Link>
                      </td>
                      <td>
                        {isPast ? (
                          <span title={completedTooltip} style={{ cursor: 'not-allowed', display: 'inline-block' }}>
                            <Button variant="info" disabled style={{ pointerEvents: 'none', opacity: 0.45 }}>
                              Edit
                            </Button>
                          </span>
                        ) : (
                          <Link to={`/reservations/${reservation.id}/edit`}>
                            <Button variant="info">Edit</Button>
                          </Link>
                        )}
                      </td>
                      <td>
                        {isPast ? (
                          <span title={completedTooltip} style={{ cursor: 'not-allowed', display: 'inline-block' }}>
                            <Button variant="danger" disabled style={{ pointerEvents: 'none', opacity: 0.45 }}>
                              Cancel
                            </Button>
                          </span>
                        ) : (
                          <Button
                            onClick={() =>
                              cancelReservation &&
                              cancelReservation(Number(reservation.id))
                            }
                            variant="danger"
                          >
                            Cancel
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default DefaultTab;
