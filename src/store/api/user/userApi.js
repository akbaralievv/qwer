import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const redPath = 'userApi';
const tagApi = 'users/me';
const get = 'getUser';
const backUrl = import.meta.env.VITE_BACK_URL;

export const userApi = createApi({
  reducerPath: redPath,
  baseQuery: fetchBaseQuery({
    baseUrl: `${backUrl}/api`,
    tagTypes: [tagApi],
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
      query: (param) => `${tagApi}${param || '?populate=*'}`,
      providesTags: [tagApi],
    }),
  }),
});

export const { useGetUserQuery } = userApi;
