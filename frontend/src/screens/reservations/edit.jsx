import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import { actionTypes } from '@/shared/base';
import { Loading } from '@/shared/components';
import utils from '@/shared/utils';

const TODAY = new Date().toISOString().slice(0, 10);

const EditReservationComponent = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const reservation = useSelector((state) => state?.site?.editReservations?.reservation);
  const rooms = useSelector((state) => state?.site?.editReservations?.rooms || []);
  const loading = useSelector((state) => state?.site?.editReservations?.loading);
  const updateSuccess = useSelector((state) => state?.site?.editReservations?.updateSuccess);

  const [formData, setFormData] = useState(null);

  useEffect(() => {
    dispatch({ type: actionTypes.GET_RESERVATION, id: parseInt(id) });
    dispatch({ type: actionTypes.GET_ROOM_IDS });
  }, [id]);

  useEffect(() => {
    if (reservation && !formData) {
      const checkoutDate = utils.formatStayDate(reservation.checkout_date);
      if (checkoutDate < TODAY) {
        navigate(`/reservations/${id}`);
        return;
      }
      setFormData({
        room_id: reservation.room_id,
        checkin_date: utils.formatStayDate(reservation.checkin_date),
        checkout_date: checkoutDate,
      });
    }
  }, [reservation]);

  useEffect(() => {
    if (updateSuccess) {
      navigate(`/reservations/${id}`);
    }
  }, [updateSuccess]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch({
      type: actionTypes.UPDATE_RESERVATION,
      reservationId: parseInt(id),
      ...formData,
    });
  };

  const isOngoing =
    formData &&
    formData.checkin_date < TODAY &&
    formData.checkout_date >= TODAY;

  if (loading || !formData) {
    return (
      <div className="container mt-5">
        <Loading />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', paddingBottom: '3rem' }}>
    <div className="container py-4" style={{ maxWidth: '720px' }}>
      <div
        className="d-flex align-items-center mb-4 gap-3 px-3 py-3 rounded"
        style={{ backgroundColor: '#1a2e4a' }}
      >
        <button
          className="btn btn-sm btn-light fw-semibold"
          onClick={() => navigate(`/reservations/${id}`)}
        >
          ← Cancel
        </button>
        <h5 className="mb-0 fw-bold text-white">
          Edit Reservation #{id}
        </h5>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body px-4 py-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label
                htmlFor="edit-room"
                className="form-label fw-semibold text-uppercase"
                style={{ fontSize: '0.75rem', letterSpacing: '0.06em', color: '#6c757d' }}
              >
                Room
              </label>
              <select
                id="edit-room"
                name="room_id"
                className="form-select"
                value={formData.room_id}
                onChange={handleChange}
                required
              >
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    Room {room.room_number}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label
                htmlFor="edit-checkin"
                className="form-label fw-semibold text-uppercase"
                style={{ fontSize: '0.75rem', letterSpacing: '0.06em', color: '#6c757d' }}
              >
                Check-in Date
              </label>
              <input
                id="edit-checkin"
                type="date"
                name="checkin_date"
                className="form-control"
                value={formData.checkin_date}
                onChange={handleChange}
                disabled={isOngoing}
                required
              />
              {isOngoing && (
                <div className="form-text text-muted">
                  Check-in date cannot be changed for a reservation already in progress.
                </div>
              )}
            </div>

            <div className="mb-3">
              <label
                htmlFor="edit-checkout"
                className="form-label fw-semibold text-uppercase"
                style={{ fontSize: '0.75rem', letterSpacing: '0.06em', color: '#6c757d' }}
              >
                Check-out Date
              </label>
              <input
                id="edit-checkout"
                type="date"
                name="checkout_date"
                className="form-control"
                value={formData.checkout_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="d-flex gap-2 pt-2">
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate(`/reservations/${id}`)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    </div>
  );
};

export default EditReservationComponent;
