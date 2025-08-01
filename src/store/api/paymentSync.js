import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const backUrl = import.meta.env.VITE_BACK_URL;

export const paymentSyncAPI = createApi({
  reducerPath: 'paymentSync',
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
    syncPayment: build.mutation({
      query: ({ date_from, date_to }) => ({
        url: '/payment/synchronize/receive',
        method: 'POST',
        body: {
          region: 11,
          date_from,
          date_to,
        },
      }),
    }),
  }),
});

export const { useSyncPaymentMutation } = paymentSyncAPI;