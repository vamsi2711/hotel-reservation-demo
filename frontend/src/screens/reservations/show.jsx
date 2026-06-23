import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import { actionTypes } from '@/shared/base';
import { Loading, ConfirmationModal } from '@/shared/components';
import utils from '@/shared/utils';

const TODAY = new Date().toISOString().slice(0, 10);

const formatRoomLabel = (id, roomMap) => {
  const num = roomMap?.get(id)?.room_number;
  return num ? `Room ${num}` : (id ? `Room …${id.slice(-8)}` : '—');
};

const DetailRow = ({ label, value }) => (
  <div className="row py-2 border-bottom align-items-center">
    <div
      className="col-4 fw-semibold text-uppercase"
      style={{ fontSize: '0.75rem', letterSpacing: '0.06em', color: '#6c757d' }}
    >
      {label}
    </div>
    <div className="col-8" style={{ fontSize: '0.95rem' }}>
      {value}
    </div>
  </div>
);

const ShowReservationComponent = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const fromTab = location.state?.fromTab;
  const [checkoutConfirmOpen, setCheckoutConfirmOpen] = useState(false);

  const reservation = useSelector((state) => state?.site?.showReservations?.reservation);
  const loading = useSelector((state) => state?.site?.showReservations?.loading);
  const rooms = useSelector(
    (state) => state?.site?.home?.rooms || state?.site?.dashboard?.rooms || [],
  );
  const roomMap = React.useMemo(() => new Map(rooms.map((r) => [r.id, r])), [rooms]);

  useEffect(() => {
    dispatch({ type: actionTypes.GET_RESERVATION, id: parseInt(id) });
  }, [id]);

  if (loading || !reservation) {
    return (
      <div className="container mt-5">
        <Loading />
      </div>
    );
  }

  const checkin = utils.formatStayDate(reservation.checkin_date);
  const checkout = utils.formatStayDate(reservation.checkout_date);
  const nights = Math.round(
    (new Date(checkout + 'T00:00:00') - new Date(checkin + 'T00:00:00')) /
      (1000 * 60 * 60 * 24),
  );
  const isPast = checkout <= TODAY;
  const isActive = checkin <= TODAY && checkout > TODAY;

  const handleCheckoutConfirm = () => {
    setCheckoutConfirmOpen(false);
    dispatch({
      type: actionTypes.UPDATE_RESERVATION,
      reservationId: parseInt(id),
      room_id: reservation.room_id,
      checkin_date: checkin,
      checkout_date: TODAY,
    });
  };

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', paddingBottom: '3rem' }}>
      <div className="container py-4" style={{ maxWidth: '720px' }}>

        {/* Header */}
        <div
          className="d-flex align-items-center mb-4 gap-3 px-3 py-3 rounded"
          style={{ backgroundColor: '#1a2e4a' }}
        >
          <button
            className="btn btn-sm btn-light fw-semibold"
            onClick={() => {
              if (fromTab) {
                navigate('/home', { state: { activeTab: fromTab } });
              } else {
                window.history.length > 1 ? navigate(-1) : navigate('/home');
              }
            }}
          >
            ← Back
          </button>
          <h5 className="mb-0 fw-bold text-white flex-grow-1">
            Reservation #{reservation.id}
          </h5>
          {isActive && (
            <button
              className="btn btn-sm btn-success fw-semibold"
              onClick={() => setCheckoutConfirmOpen(true)}
            >
              Check Out Now
            </button>
          )}
          {isPast ? (
            <span title="Stay already completed" style={{ cursor: 'not-allowed', display: 'inline-block' }}>
              <button
                className="btn btn-sm btn-warning fw-semibold"
                disabled
                style={{ pointerEvents: 'none', opacity: 0.45 }}
              >
                Edit
              </button>
            </span>
          ) : (
            <Link
              to={`/reservations/${id}/edit`}
              state={{ fromTab }}
              className="btn btn-sm btn-warning fw-semibold"
            >
              Edit
            </Link>
          )}
        </div>

        {/* Detail card */}
        <div className="card border-0 shadow-sm">
          <div className="card-body px-4 py-3">
            <DetailRow label="Room" value={formatRoomLabel(reservation.room_id, roomMap)} />
            <DetailRow label="Check-in" value={checkin} />
            <DetailRow label="Check-out" value={checkout} />
            <DetailRow
              label="Duration"
              value={`${nights} night${nights !== 1 ? 's' : ''}`}
            />
            <DetailRow
              label="Total Charge"
              value={
                <span className="fw-bold" style={{ color: '#1a2e4a' }}>
                  {utils.formatNumberAsMoney(reservation.total_charge)}
                </span>
              }
            />
          </div>
        </div>

      </div>
      <ConfirmationModal
        isOpen={checkoutConfirmOpen}
        title="Check Out Now?"
        message="Check out this guest now? This will end the stay today."
        confirmationText="Check Out"
        cancellationText="Keep Reservation"
        confirmButtonStyle="warning"
        handleConfirm={handleCheckoutConfirm}
        handleReject={() => setCheckoutConfirmOpen(false)}
      />
    </div>
  );
};

export default ShowReservationComponent;
