import {
  actionTypes,
  createComponentReducer,
  onSuccessful,
} from '@/shared/base';

const initialState = {
  reservations: [],
  rooms: [],
  loading: true,
};

const actionHandlers = {
  [onSuccessful(actionTypes.GET_RESERVATIONS)]: (state, action) => ({
    ...state,
    reservations: action?.response?.reservations || [],
    rooms: action?.response?.rooms || state.rooms,
    loading: false,
  }),
  [onSuccessful(actionTypes.DELETE_RESERVATION)]: (state, action) => ({
    ...state,
    reservations: action?.response?.data || [],
    loading: false,
  }),
  [onSuccessful(actionTypes.CREATE_RESERVATION)]: (state, action) => ({
    ...state,
    reservations: action?.response?.data || [],
    loading: false,
  }),
};

const reducer = createComponentReducer(
  actionTypes.HOME_COMPONENT,
  initialState,
  actionHandlers,
);

export { reducer };
