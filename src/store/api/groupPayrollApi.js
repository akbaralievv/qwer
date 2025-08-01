import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const redPath = 'groupPayrollApi';
const createOperation = 'createOperationForPayroll';
const readPayrollGroup = 'readPayrollGroup';
const createPayrollGroup = 'createPayrollGroup';
const deletePayrollGroup = 'deletePayrollGroup';
const backUrl = import.meta.env.VITE_BACK_URL;

export const groupPayrollApi = createApi({
  reducerPath: redPath,
  baseQuery: fetchBaseQuery({
    baseUrl: `${backUrl}/api`,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.accessToken;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (build) => ({
    [createOperation]: build.mutation({
      query: (data) => ({
        url: 'operations-for-payroll',
        method: 'POST',
        body: {
          ...data,
        },
      }),
    }),
    createOperationOneForPayroll: build.mutation({
      query: (data) => ({
        url: 'operations-for-payroll/one',
        method: 'POST',
        body: {
          ...data,
        },
      }),
    }),
    [readPayrollGroup]: build.mutation({
      query: (data) => ({
        url: 'payroll-group/read',
        method: 'POST',
        body: {
          ...data,
        },
      }),
    }),
    [createPayrollGroup]: build.mutation({
      query: (data) => ({
        url: 'payroll-group/create',
        method: 'POST',
        body: {
          ...data,
        },
      }),
    }),
    [deletePayrollGroup]: build.mutation({
      query: (data) => ({
        url: 'payroll-group/delete',
        method: 'POST',
        body: {
          ...data,
        },
      }),
    }),
  }),
});

export const {
  useCreateOperationForPayrollMutation,
  useReadPayrollGroupMutation,
  useCreatePayrollGroupMutation,
  useDeletePayrollGroupMutation,
  useCreateOperationOneForPayrollMutation,
} = groupPayrollApi;
