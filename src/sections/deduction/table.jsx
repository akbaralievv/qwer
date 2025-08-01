import React from 'react';
import PropTypes from 'prop-types';

import Table from '@mui/material/Table';
import Paper from '@mui/material/Paper';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableContainer from '@mui/material/TableContainer';

import { useGetContragentsQuery } from 'src/store/api/contragentAPI';

export default function TableContragent({ setNewUser }) {
  const { data, isLoading, error } = useGetContragentsQuery(
    '?sort[0]=id:desc&populate[1]=subdivisions'
  );

  if (isLoading) return <div>Загрузка данных...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>ФИО</TableCell>
            <TableCell align="center">ИНН</TableCell>
            <TableCell align="right">Резидент</TableCell>
            <TableCell align="right">Номер телефона</TableCell>
            <TableCell align="left">Адрес</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data?.data?.map((row) => (
            <TableRow
              onClick={() => setNewUser(row.id)}
              key={row.id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {row.attributes.name}
              </TableCell>
              <TableCell align="right">{row.attributes.inn}</TableCell>
              <TableCell align="right">{row.attributes.resident}</TableCell>
              <TableCell align="right">{row.attributes.tel}</TableCell>
              <TableCell align="left">{row.attributes.address}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

TableContragent.propTypes = {
  setNewUser: PropTypes.func.isRequired,
};
