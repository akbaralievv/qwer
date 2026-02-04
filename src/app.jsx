/* eslint-disable perfectionist/sort-imports */
import 'src/global.css';

import { useScrollToTop } from 'src/hooks/use-scroll-to-top';

import Router from 'src/routes/sections';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginAction, logoutActionHandler } from './store/slice/auth';

// ----------------------------------------------------------------------

export default function App() {
  useScrollToTop();
  const { isAuth } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const storedUser = localStorage.getItem(import.meta.env.VITE_LOCAL_STORAGE_USER_KEY);
    if (!storedUser) {
      return;
    }

    let parsedData = null;
    try {
      parsedData = JSON.parse(storedUser);
    } catch (error) {
      return;
    }

    if (!parsedData?.jwt) {
      return;
    }

    const tokenParts = parsedData.jwt.split('.');
    if (tokenParts.length < 2) {
      return;
    }

    let decodedPayload = null;
    try {
      decodedPayload = JSON.parse(atob(tokenParts[1]));
    } catch (error) {
      return;
    }

    const currentTime = Date.now() / 1000;
    if (decodedPayload.exp < currentTime) {
      logoutActionHandler({ dispatch, navigate });
      return;
    }

    dispatch(loginAction({ data: parsedData }));
  }, [dispatch, navigate]);

  useEffect(() => {
    if (isAuth) {
      navigate('/');
    }
  }, [isAuth, navigate]);
  return (
    <Router isAuth={isAuth} />
  );
}
