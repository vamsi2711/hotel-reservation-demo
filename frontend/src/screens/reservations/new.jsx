import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import { connectComponent, actionTypes } from '@/shared/base';
import AlertModal from '@/shared/components/AlertModal';

const today = new Date().toISOString().slice(0, 10);

const NewReservationComponent = ({
  createReservation = (_formData) => {},
  handleCloseAlert = () => {},
  getAvailableRooms = (_dates) => {},
}) => {
  const [formData, setFormData] = useState({
    room_id: '',
    checkin_date: '',
    checkout_date: '',
  });

  const navigate = useNavigate();

  const rooms = useSelector((state) => state?.site?.newReservations?.rooms || []);
  const availableRooms = useSelector((state) => state?.site?.newReservations?.availableRooms);
  const availableRoomsLoading = useSelector(
    (state) => state?.site?.newReservations?.availableRoomsLoading || false,
  );
  const alert = {
    message: useSelector((state) => state?.shared?.alertMessage),
    type: useSelector((state) => state?.shared?.alertType),
  };

  const datesSelected = formData.checkin_date && formData.checkout_date;

  useEffect(() => {
    if (datesSelected) {
      getAvailableRooms({
        checkin_date: formData.checkin_date,
        checkout_date: formData.checkout_date,
      });
      setFormData((prev) => ({ ...prev, room_id: '' }));
    }
  }, [formData.checkin_date, formData.checkout_date]);

  const handleSubmit = (e) => {
    e.preventDefault();
    createReservation(formData);
    navigate('/home');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const minCheckout = formData.checkin_date || today;

  const roomOptions = datesSelected ? (availableRooms ?? rooms) : rooms;
  const roomsDisabled = availableRoomsLoading;
  const noRoomsAvailable = datesSelected && !availableRoomsLoading && availableRooms?.length === 0;

  return (
    <div className="col-lg-12">
      <div className="jumbotron p-3 p-md-5 text-white rounded bg-dark">
        <div className="col-lg-12 px-0">
          <h1 className="display-4 font-italic">NEW RESERVATION</h1>
        </div>
      </div>

      <div data-name="new-reservation-component" style={{ background: '#f8f9fa', minHeight: '60vh', padding: '2rem 0' }}>
        <div className="container" style={{ maxWidth: '720px' }}>
          <div className="mb-3">
            <Link to="/home" className="btn btn-sm btn-outline-secondary">
              &larr; Back to Dashboard
            </Link>
          </div>

          <div className="card border-0 shadow-sm">
            <div
              className="card-header border-0 py-3"
              style={{ background: '#1a2e4a' }}
            >
              <h5 className="mb-0 text-white fw-semibold">Book a Room</h5>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label
                      htmlFor="checkin_date"
                      className="form-label text-uppercase fw-semibold"
                      style={{ fontSize: '0.75rem', letterSpacing: '0.06em', color: '#6c757d' }}
                    >
                      Check-in Date
                    </label>
                    <input
                      type="date"
                      id="checkin_date"
                      name="checkin_date"
                      className="form-control"
                      value={formData.checkin_date}
                      onChange={handleInputChange}
                      min={today}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label
                      htmlFor="checkout_date"
                      className="form-label text-uppercase fw-semibold"
                      style={{ fontSize: '0.75rem', letterSpacing: '0.06em', color: '#6c757d' }}
                    >
                      Check-out Date
                    </label>
                    <input
                      type="date"
                      id="checkout_date"
                      name="checkout_date"
                      className="form-control"
                      value={formData.checkout_date}
                      onChange={handleInputChange}
                      min={minCheckout}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="room_id"
                    className="form-label text-uppercase fw-semibold"
                    style={{ fontSize: '0.75rem', letterSpacing: '0.06em', color: '#6c757d' }}
                  >
                    Room
                  </label>
                  <select
                    id="room_id"
                    name="room_id"
                    className="form-select"
                    value={formData.room_id}
                    onChange={handleInputChange}
                    disabled={roomsDisabled || noRoomsAvailable}
                    required
                  >
                    <option value="">
                      {!datesSelected
                        ? 'Select dates first to see available rooms'
                        : availableRoomsLoading
                        ? 'Loading available rooms…'
                        : 'Select a Room'}
                    </option>
                    {roomOptions.map((room) => (
                      <option key={room.id} value={room.id}>
                        Room {room.room_number}
                      </option>
                    ))}
                  </select>
                  {!datesSelected && (
                    <div className="form-text text-muted">
                      Choose check-in and check-out dates to filter available rooms.
                    </div>
                  )}
                  {noRoomsAvailable && (
                    <div className="alert alert-warning mt-2 mb-0 py-2" role="alert">
                      No rooms available for these dates. Please choose different dates.
                    </div>
                  )}
                </div>

                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-warning fw-semibold"
                    disabled={noRoomsAvailable || availableRoomsLoading}
                  >
                    Book Reservation
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {alert.message && (
        <AlertModal
          type={alert.type}
          message={alert.message}
          onClose={handleCloseAlert}
        />
      )}
    </div>
  );
};

const screen = connectComponent(NewReservationComponent, {
  componentName: actionTypes.NEW_RESERVATION_COMPONENT,
  state: (state) => state?.site?.newReservations || {},
  load: {
    roomIds: () => ({ type: actionTypes.GET_ROOM_IDS }),
  },
  mapDispatchToProps: (dispatch) => ({
    createReservation: (formData) =>
      dispatch({ type: actionTypes.CREATE_RESERVATION, ...formData }),
    handleCloseAlert: () => dispatch({ type: actionTypes.CLEAR_ALERT }),
    getAvailableRooms: ({ checkin_date, checkout_date }) =>
      dispatch({ type: actionTypes.GET_AVAILABLE_ROOMS, checkin_date, checkout_date }),
  }),
});

export default screen;
