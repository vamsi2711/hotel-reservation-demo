export const getExistingReservationsQuery = `
  query { getAllReservations { reservations { id room_id checkin_date checkout_date total_charge  } } }
`;

export const getRoomIdsQuery = 'query { getAllRooms { rooms { id room_number } } }';

export const getAllRoomsQuery =
  'query { getAllRooms { rooms { id room_number num_beds allow_smoking daily_rate cleaning_fee } } }';

export const getAvailableRoomsQuery = `
  query getAvailableRooms($input: AvailableRoomInput!) {
    getAvailableRooms(input: $input) {
      rooms { id room_number }
    }
  }
`;

export const getReservationQuery = `
  query getReservation($id: ID!) {
    getReservation(id: $id) {
      success
      errors
      reservation { id room_id checkin_date checkout_date total_charge }
    }
  }
`;
