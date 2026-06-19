import { actionTypes, createComponentReducer, onSuccessful } from '@/shared/base';

const initialState = {
  reservation: null,
  roomIds: [],
  loading: true,
};

const actionHandlers = {
  [onSuccessful(actionTypes.GET_RESERVATION)]: (state, action) => ({
    ...state,
    reservation: action?.response?.data || null,
    loading: false,
  }),
  [onSuccessful(actionTypes.GET_ROOM_IDS)]: (state, action) => ({
    ...state,
    rooms: action?.response?.data || [],
  }),
};

const reducer = createComponentReducer(
  actionTypes.EDIT_RESERVATION_COMPONENT,
  initialState,
  actionHandlers,
);

export { reducer };
