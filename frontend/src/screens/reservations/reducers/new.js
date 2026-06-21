import {
  actionTypes,
  createComponentReducer,
  onFailure,
  onSuccessful,
} from '@/shared/base';

const initialState = {
  rooms: [],
  loading: true,
  availableRooms: null,
  availableRoomsLoading: false,
};

const actionHandlers = {
  [onSuccessful(actionTypes.GET_ROOM_IDS)]: (state, action) => ({
    ...state,
    rooms: action?.response?.data || [],
    loading: false,
  }),
  [onSuccessful(actionTypes.CREATE_RESERVATION)]: (state, action) => {
    const reservations = action?.response?.data || [];
    return {
      ...state,
      reservations,
      loading: false,
    };
  },
  [actionTypes.GET_AVAILABLE_ROOMS]: (state) => ({
    ...state,
    availableRoomsLoading: true,
    availableRooms: null,
  }),
  [onSuccessful(actionTypes.GET_AVAILABLE_ROOMS)]: (state, action) => ({
    ...state,
    availableRoomsLoading: false,
    availableRooms: action?.response?.data || [],
  }),
  [onFailure(actionTypes.GET_AVAILABLE_ROOMS)]: (state) => ({
    ...state,
    availableRoomsLoading: false,
    availableRooms: [],
  }),
};

const reducer = createComponentReducer(
  actionTypes.NEW_RESERVATION_COMPONENT,
  initialState,
  actionHandlers,
);

export { reducer };
