import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const redPath = 'payment';
const tagApi = '/payments';
const get = 'getPayment';
const create = 'createPayment';
const update = 'updatePayment';
const remove = 'removePayment';
const backUrl = import.meta.env.VITE_BACK_URL;
export const paymentAPI = createApi({
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
    [get]: build.query({
      query: (param) => `${tagApi}${param}`,
      providesTags: [tagApi],
    }),
    [create]: build.mutation({
      query: (newData) => ({
        url: `${tagApi}`,
        method: 'POST',
        body: {
          data: {
            ...newData,
          },
        },
      }),
      invalidatesTags: [tagApi],
    }),
    [update]: build.mutation({
      query: (newData) => ({
        url: `${tagApi}/${newData.id}`,
        method: 'PUT',
        body: {
          data: {
            ...newData.updated,
          },
        },
      }),
      invalidatesTags: [tagApi],
    }),
    [remove]: build.mutation({
      query: (id) => ({
        url: `${tagApi}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [tagApi],
    }),
    paymentGroupRead: build.mutation({
      query: (newData) => ({
        url: `/synchroniza/get`,
        method: 'POST',
        body: {
          ...newData,
        },
      }),
      invalidatesTags: [tagApi],
    }),
  }),
});

export const {
  useGetPaymentQuery,
  useCreatePaymentMutation,
  useUpdatePaymentMutation,
  usePaymentGroupReadMutation,
  useRemovePaymentMutation,
} = paymentAPI;
