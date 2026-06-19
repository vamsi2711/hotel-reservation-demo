export const createReservationMutation = `
  mutation createReservation($input: ReservationInput!) {
    createReservation(input: $input) {
      success
      errors
      reservations {
        id
        room_id
        checkin_date
        checkout_date
        total_charge
      }
    }
  }`;

export const deleteReservationMutation = `
  mutation deleteReservation($reservationId: Int!) {
    deleteReservation(reservationId: $reservationId) {
      success
      errors
      reservations {
        id
        room_id
        checkin_date
        checkout_date
        total_charge
      }
    }
  }`;

export const updateReservationMutation = `
  mutation updateReservation($reservationId: Int!, $input: UpdateReservationInput!) {
    updateReservation(reservationId: $reservationId, input: $input) {
      success
      errors
      reservation { id room_id checkin_date checkout_date total_charge }
    }
  }`;
