import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const redPath = 'serviceApi';
const tagApi = 'services';
const get = 'getService';
const create = 'createService';
const update = 'updateService';
const remove = 'removeService';
const backUrl = import.meta.env.VITE_BACK_URL;

export const serviceApi = createApi({
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
  }),
});

export const {
  useGetServiceQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useRemoveServiceMutation,
} = serviceApi;
