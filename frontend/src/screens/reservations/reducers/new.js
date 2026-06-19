import {
  actionTypes,
  createComponentReducer,
  onSuccessful,
} from '@/shared/base';

const initialState = {
  rooms: [],
  loading: true,
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
};

const reducer = createComponentReducer(
  actionTypes.NEW_RESERVATION_COMPONENT,
  initialState,
  actionHandlers,
);

export { reducer };
