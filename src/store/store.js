import { configureStore } from '@reduxjs/toolkit';

import { authSlice } from './slice/auth';
import { paymentAPI } from './api/payment';
import { userApi } from './api/user/userApi';
import { position } from './api/positionApi';
import { subdivOnes } from './api/subdivOnes';
import { payrollApi } from './api/payrollAPI';
import { serviceApi } from './api/serviceApi';
import { divisionAPI } from './api/subdivsion';
import { paymentSyncAPI } from './api/paymentSync';
import { contragentApi } from './api/contragentAPI';
import { agregatorsApi } from './api/agregatorsApi';
import { operationAPI } from './api/orderForAdmissions';
import { groupPayrollApi } from './api/groupPayrollApi';
import { subcompaniesApi } from './api/dataOrganizationAPI';
import { contragentTypeApi } from './api/contragentTypeApi';

export const store = configureStore({
  reducer: {
    [authSlice.name]: authSlice.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [contragentApi.reducerPath]: contragentApi.reducer,
    [divisionAPI.reducerPath]: divisionAPI.reducer,
    [subdivOnes.reducerPath]: subdivOnes.reducer,
    [subcompaniesApi.reducerPath]: subcompaniesApi.reducer,
    [payrollApi.reducerPath]: payrollApi.reducer,
    [paymentAPI.reducerPath]: paymentAPI.reducer,
    [position.reducerPath]: position.reducer,
    [operationAPI.reducerPath]: operationAPI.reducer,
    [serviceApi.reducerPath]: serviceApi.reducer,
    [groupPayrollApi.reducer]: groupPayrollApi.reducer,
    [paymentSyncAPI.reducerPath]: paymentSyncAPI.reducer,
    [agregatorsApi.reducerPath]: agregatorsApi.reducer,
    [contragentTypeApi.reducerPath]: contragentTypeApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(userApi.middleware)
      .concat(payrollApi.middleware)
      .concat(paymentAPI.middleware)
      .concat(contragentApi.middleware)
      .concat(divisionAPI.middleware)
      .concat(operationAPI.middleware)
      .concat(subcompaniesApi.middleware)
      .concat(position.middleware)
      .concat(subdivOnes.middleware)
      .concat(serviceApi.middleware)
      .concat(groupPayrollApi.middleware)
      .concat(paymentSyncAPI.middleware)
      .concat(agregatorsApi.middleware)
      .concat(contragentTypeApi.middleware),
  devTools: true,
});
