import { actionTypes, createComponentReducer, onSuccessful } from '@/shared/base';

const initialState = {
  reservation: null,
  loading: true,
};

const actionHandlers = {
  [onSuccessful(actionTypes.GET_RESERVATION)]: (state, action) => ({
    ...state,
    reservation: action?.response?.data || null,
    loading: false,
  }),
  [onSuccessful(actionTypes.UPDATE_RESERVATION)]: (state, action) => ({
    ...state,
    reservation: action?.response?.data || state.reservation,
    loading: false,
  }),
};

const reducer = createComponentReducer(
  actionTypes.SHOW_RESERVATION_COMPONENT,
  initialState,
  actionHandlers,
);

export { reducer };
