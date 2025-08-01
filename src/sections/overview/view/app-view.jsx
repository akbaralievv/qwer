import React, { useState, useEffect } from 'react';

import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import { Box, Stack } from '@mui/system';
import { Card, Button } from '@mui/material';
import TableRow from '@mui/material/TableRow';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import Timestamp from 'src/utils/time';
import { fNumber } from 'src/utils/format-number';
import { convertToRuFormat } from 'src/utils/convernRuFormat';

import ModalUi from 'src/ui/ModalUi';
// import { useGetSubdivOnesQuery } from 'src/store/api/subdivOnes';
import { useGetOperationQuery } from 'src/store/api/orderForAdmissions';

// import AppCurrentVisits from '../app-current-visits';
// import AppWebsiteVisits from '../app-website-visits';
import AppWidgetSummary from '../app-widget-summary';
// eslint-disable-next-line
import Loading from 'src/ui/Loading';

// ----------------------------------------------------------------------

const monthNames = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];

const headTable = [
  { id: 'name', label: 'ФИО', mapping: true },
  { id: 'tel', label: 'Номер телефона', mapping: true },
  { id: 'email', label: 'Email адрес', mapping: true },
  { id: 'address', label: 'Адрес', mapping: true },
  { id: 'inn', label: 'ИНН', mapping: true },
  { id: 'amount', label: 'Сумма', mapping: true },
  { id: 'docDate', label: 'Дата', mapping: true },
  { id: 'actions', label: '', mapping: true },
];

export default function AppView() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [rows, setRows] = useState([]);

  const { data: orderForAdmissions } = useGetOperationQuery(
    `?filters[oper_type][id][$eq]=1&populate[0]=contragent&populate[1]=autor`
  );
  useEffect(() => {
    if (typeof month === 'number') {
      setMonth(monthNames[month - 1]);
    }
  }, [month]);
  useEffect(() => {
    if (orderForAdmissions?.data) {
      const newRows = orderForAdmissions.data.map((el) =>
        createData(
          el.attributes?.contragent?.data?.attributes.name,
          el.attributes?.contragent?.data?.attributes.tel,
          el.attributes?.contragent?.data?.attributes.email,
          el.attributes?.contragent?.data?.attributes.address,
          el.attributes?.contragent?.data?.attributes.inn,
          el.attributes.amount,
          el.attributes.docDate
        )
      );
      setRows(newRows);
    }
  }, [orderForAdmissions, page]);

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  function createData(name, tel, email, address, inn, amount, docDate, docNumber) {
    return { name, tel, email, address, inn, amount, docDate, docNumber };
  }

  const handleRowClick = (row) => {
    setSelectedUser(row);
    setOpen(true);
  };

  return (
    <Container maxWidth="xl" sx={{ pt: 2 }}>
      <Typography variant="h4" sx={{ mb: 5 }}>
        <Timestamp />
      </Typography>

      <Box display="flex" gap={3} mb={4}>
        <AppWidgetSummary
          title={`Платежи за ${new Date().getDate()} ${month}`}
          total={fNumber(0)}
          color="info"
          sx={{ width: '320px' }}
          icon={<img alt="icon" src="https://cdn-icons-png.flaticon.com/512/10384/10384161.png" />}
        />
        <AppWidgetSummary
          title={`Платежи за ${month}`}
          total={fNumber(0)}
          sx={{ width: '320px' }}
          icon={<img alt="icon" src="assets/moneyMount.png" />}
          color="success"
        />
        <AppWidgetSummary
          sx={{ width: '320px' }}
          title={`Платежи за ${new Date().getFullYear()}г`}
          total={fNumber(0)}
          color="warning"
          icon={<img alt="icon" src="assets/money1.png" />}
        />
      </Box>

      <Grid container spacing={3}>
        <Grid xs={12} md={6} lg={12}>
          <Card
            component={Stack}
            spacing={3}
            sx={{
              px: 2,
              py: 5,
              borderRadius: 2,
              height: 'auto',
            }}
          >
            <Typography variant="h3" mb={2} color="#000">
              Задолженность
            </Typography>
            <Paper sx={{ width: '100%' }}>
              <TableContainer sx={{ maxHeight: 440 }}>
                <Table stickyHeader aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      {headTable.map((column) => (
                        <TableCell key={column.id}>{column.label}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((row, inx1) => (
                        <TableRow
                          onClick={() => handleRowClick(row)}
                          hover
                          role="checkbox"
                          tabIndex={-1}
                          key={inx1}
                          sx={{ cursor: 'pointer' }}
                        >
                          {Object.keys(row).map((key, inx) => (
                            <TableCell key={inx}>
                              {key === 'docDate' ? convertToRuFormat(row[key]) : row[key]}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[10, 25, 100]}
                component="div"
                count={rows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Paper>
          </Card>
        </Grid>
      </Grid>

      {/* Modal */}
      <ModalUi open={open} setOpen={setOpen} width="45%" radius="12">
        <Box width="100%" display="flex" justifyContent="end">
          <Button onClick={() => setOpen(false)}>
            <img width={12} src="https://cdn-icons-png.flaticon.com/512/75/75519.png" alt="" />
          </Button>
        </Box>
        <Typography variant="h6" textAlign="center" component="h2" gutterBottom>
          Информация о пользователе
        </Typography>
        {selectedUser ? (
          <Box>
            <Typography>ФИО: {selectedUser.name}</Typography>
            <Typography>
              Телефон:{' '}
              <a
                target="_blank"
                rel="noreferrer"
                href={`https://wa.me/+996${selectedUser.tel.slice(1)}`}
              >
                {selectedUser.tel}
              </a>
            </Typography>
            <Typography>Email: {selectedUser.email}</Typography>
            <Typography>Адрес: {selectedUser.address}</Typography>
            <Typography>ИНН: {selectedUser.inn}</Typography>
            <Typography>Сумма задолженности: {fNumber(selectedUser.amount)} сом</Typography>
            <Typography>Дата документа: {convertToRuFormat(selectedUser.docDate)}</Typography>
          </Box>
        ) : (
          <Typography>Пользователь не выбран</Typography>
        )}
      </ModalUi>
    </Container>
  );
}
