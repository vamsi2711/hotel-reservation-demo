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
  [onSuccessful(actionTypes.GET_DASHBOARD_DATA)]: (state, action) => ({
    ...state,
    reservations: action?.response?.reservations || [],
    rooms: action?.response?.rooms || [],
    loading: false,
  }),
};

const reducer = createComponentReducer(
  actionTypes.DASHBOARD_COMPONENT,
  initialState,
  actionHandlers,
);

export { reducer };
