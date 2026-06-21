import { actionTypes } from '@/shared/base';

export const initialState = {
  isAuthenticated: !!localStorage.getItem('access_token'),
  token: localStorage.getItem('access_token') || null,
  loginError: null,
  loginLoading: false,
};

export const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.LOGIN:
      return { ...state, loginLoading: true, loginError: null };
    case actionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        token: action.token,
        loginLoading: false,
        loginError: null,
      };
    case actionTypes.LOGIN_FAILURE:
      return {
        ...state,
        isAuthenticated: false,
        loginLoading: false,
        loginError: action.error,
      };
    case actionTypes.CLEAR_USER_DATA:
      return {
        ...state,
        isAuthenticated: false,
        token: null,
        loginError: null,
        loginLoading: false,
      };
    default:
      return state;
  }
};
