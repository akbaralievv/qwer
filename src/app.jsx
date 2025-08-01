/* eslint-disable perfectionist/sort-imports */
import 'src/global.css';

import { useScrollToTop } from 'src/hooks/use-scroll-to-top';

import Router from 'src/routes/sections';
import ThemeProvider from 'src/theme';

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
    const USER_DATA = localStorage.getItem(import.meta.env.VITE_LOCAL_STORAGE_USER_KEY);
    const parseredData = JSON.parse(USER_DATA);

    if (parseredData?.jwt) {
      const tokenParts = parseredData.jwt.split('.');
      const decodedPayload = JSON.parse(atob(tokenParts[1]));
      
      const currentTime = Date.now() / 1000;
      if (decodedPayload.exp < currentTime) {
        logoutActionHandler({ dispatch, navigate });
      } else {
        dispatch(loginAction({ data: parseredData }));
      }
    }
    if (isAuth) {
      navigate('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuth, dispatch]);
  return (
    <ThemeProvider>
      <Router isAuth={isAuth} />
    </ThemeProvider>
  );
}
