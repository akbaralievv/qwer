import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const redPath = 'divisionAPI';
const tagApi = 'divisions'; // Убедитесь, что это совпадает с серверным маршрутом
const get = 'getSubdivisions';
const create = 'createSubdivision';
const update = 'updateSubdivision';
const remove = 'removeSubdivision';
const backUrl = import.meta.env.VITE_BACK_URL;

export const divisionAPI = createApi({
  reducerPath: redPath,
  baseQuery: fetchBaseQuery({
    baseUrl: `${backUrl}/api`, // Здесь указан корректный базовый URL
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
  useGetSubdivisionsQuery,
  useCreateSubdivisionMutation,
  useUpdateSubdivisionMutation,
  useRemoveSubdivisionMutation, // <-- добавь сюда
} = divisionAPI;
