import axios from 'axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const loginQuery = createAsyncThunk(
  'authorizaiton/login',
  async ({ authValue, navigate }, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_BACK_URL}/api/auth/local`, {
        identifier: authValue.name,
        password: authValue.password,
      });
      localStorage.setItem(import.meta.env.VITE_LOCAL_STORAGE_USER_KEY, JSON.stringify(data));
      navigate('/');
      return dispatch(loginAction({ data }));
    } catch (error) {
      return { error: `Ошибка в LoginQuery: ${error}` };
    }
  }
);

export const logoutActionHandler = ({ dispatch, navigate }) => {
  localStorage.removeItem(import.meta.env.VITE_LOCAL_STORAGE_USER_KEY);
  dispatch(logoutAction());
  navigate('/login');
};

const initialState = {
  accessToken: null,
  isAuth: false,
  login: null,
  id: null,
  username: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginAction(state, { payload }) {
      state.isAuth = true;
      state.accessToken = payload.data.jwt;
      state.login = payload.data.user.email;
      state.id = payload.data.user.id;
      state.username = payload.data.user.username;
    },
    logoutAction(state) {
      state.isAuth = false;
      state.accessToken = null;
      state.login = null;
      state.id = null;
      state.username = null;
    },
  },
});

export const { loginAction, logoutAction } = authSlice.actions;
export const getIsAuthorized = (state) => state.login;
