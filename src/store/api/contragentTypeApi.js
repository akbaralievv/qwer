import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const redPath = 'contragentTypeApi';
const tagApi = 'contragent-types';
const get = 'getContragentTypes';
const create = 'createContragentType';
const update = 'updateContragentType';
const remove = 'removeContragentType';
const backUrl = import.meta.env.VITE_BACK_URL;

export const contragentTypeApi = createApi({
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
      query: (param = '') => `${tagApi}${param}`,
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
  useGetContragentTypesQuery,
  useCreateContragentTypeMutation,
  useUpdateContragentTypeMutation,
  useRemoveContragentTypeMutation,
} = contragentTypeApi;
