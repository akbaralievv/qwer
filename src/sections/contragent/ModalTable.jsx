/* eslint-disable */
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import { Snackbar } from '@mui/material';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import ModalUi from 'src/ui/ModalUi';
import UpdateModalUi from 'src/sections/contragent/UpdateModalUi';
import CreateUserUi from 'src/sections/contragent/CreateModalUser';
import { useUpdateContragentMutation } from 'src/store/api/contragentAPI';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

import TableNoData from './table-no-data';
import ContragentTableRow from './table-rowModal';
import ContragentTableHead from './table-head';
import ContragentTableToolbar from './table-toolbar';
import { applyFilter, getComparator } from './utils';
import { Box } from '@mui/system';
import { useGetOperationQuery } from 'src/store/api/orderForAdmissions';

const headTable = [
  { id: 'contragent.data.attributes.name', label: 'ФИО', mapping: true },
  { id: 'contragent.data.attributes.tel', label: 'Номер телефона', mapping: true },
  { id: 'contragent.data.attributes.email', label: 'Email адрес', mapping: true },
  { id: 'contragent.data.attributes.address', label: 'Адрес', mapping: true },
  { id: 'contragent.data.attributes.inn', label: 'ИНН', mapping: true },
  { id: 'contragent.data.attributes.resident', label: 'Резидент', mapping: true },
  { id: 'contragent.data.attributes.ls', label: 'лицевой счет', mapping: true },
  {
    id: 'contragent.data.attributes.form',
    label: 'формат обучения',
    align: 'right',
    mapping: true,
  },
  { id: 'contract', label: 'Контракт', mapping: true }, // Пример для прямого доступа к данным
  { id: 'docDate', label: 'Дата документа', mapping: true }, // Ещё одно поле
  { id: 'action', label: 'Действие', align: 'right', mapping: false },
];

export default function ModalTable({ open, setOpen, setContragent }) {
  const [openAddUserModal, setOpenAddUserModal] = useState(false);
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('contract');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(7);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [updateData] = useUpdateContragentMutation();
  const { data } = useGetOperationQuery(
    `?filters[oper_type][id][$eq]=1&populate[0]=contragent&populate[1]=autor&sort[1]=${orderBy}:${order}&pagination[page]=${
      page + 1
    }&pagination[pageSize]=${rowsPerPage}`
  );
  const [visibleColumns, setVisibleColumns] = useState(headTable.map((col) => col.label));
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  console.log('ZACHIS', data);

  useEffect(() => {
    if (data) {
      const requests = data.data;
      setPage(data.meta.pagination.page - 1);
      setPageCount(data.meta.pagination.total);
      setRowsPerPage(data.meta.pagination.pageSize);
      setAllUsers(requests);
    }
  }, [data]);
  console.log('zachis', data);

  const handleSnackbarClose = (_, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  const handleSort = (_, id) => {
    const isAsc = orderBy === id && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(id);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = allUsers.map((n) => n.attributes.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (_, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const handleDialogOpen = (user) => {
    setSelectedUser({ dataUser: user.attributes, idUser: user.id });
    setContragent({ dataUser: user.attributes, idUser: user?.attributes?.contragent?.data?.id });
    console.log('usedr', user);

    setOpen(false);
  };

  const dataFiltered = applyFilter({
    inputData: allUsers,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;
  const filteredColumns = headTable.filter((col) => visibleColumns.includes(col.label));

  const emptyRows = Math.max(0, rowsPerPage - dataFiltered.length);

  return (
    <>
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4">Студенты</Typography>

          <Box display="flex" gap={5} alignItems="center">
            <Button
              onClick={() => setOpenAddUserModal(true)}
              variant="contained"
              color="inherit"
              startIcon={<Iconify icon="eva:plus-fill" />}
            >
              Добавить
            </Button>
            <Button
              onClick={() => setOpen(false)}
              color="error"
              sx={{ display: 'flex', justifyContent: 'center' }}
            >
              <Iconify icon="eva:close-fill" width={30} />
            </Button>
          </Box>
        </Stack>

        <Card>
          <ContragentTableToolbar
            names={headTable}
            numSelected={selected.length}
            filterName={filterName}
            onFilterName={handleFilterByName}
            setVisibleColumns={setVisibleColumns}
          />

          <Scrollbar>
            <TableContainer sx={{ overflow: 'unset', width: '100%' }}>
              <Table sx={{ minWidth: 800 }}>
                <ContragentTableHead
                  order={order}
                  orderBy={orderBy}
                  rowCount={allUsers.length}
                  numSelected={selected.length}
                  onRequestSort={handleSort}
                  onSelectAllClick={handleSelectAllClick}
                  headLabel={filteredColumns}
                />
                <TableBody>
                  {dataFiltered?.map((row, id) => (
                    <ContragentTableRow
                      key={id}
                      row={row.attributes}
                      columns={filteredColumns}
                      selected={selected.indexOf(row.attributes.name) !== -1}
                      handleClick={(event) => handleClick(event, row.attributes.name)}
                      onRowClick={() => handleDialogOpen(row)}
                    />
                  ))}
                  <TableEmptyRows height={77} emptyRows={emptyRows} />

                  {notFound && <TableNoData query={filterName} />}
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>
          <TablePagination
            rowsPerPageOptions={[7, 25, 50]}
            component="div"
            count={pageCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>
      {selectedUser && (
        <ModalUi open={open} setOpen={setOpen}>
          <UpdateModalUi
            setOpen={setOpen}
            selectedUser={{
              ...selectedUser,
              idUser: String(selectedUser.idUser),
            }}
            setSelectedUser={setSelectedUser}
            updateData={updateData}
          />
        </ModalUi>
      )}
      <ModalUi setOpen={setOpenAddUserModal} open={openAddUserModal}>
        <CreateUserUi
          setOpen={setOpenAddUserModal}
          setSnackbarMessage={setSnackbarMessage}
          setSnackbarOpen={setSnackbarOpen}
          snackbarOpen={snackbarOpen}
          snackbarMessage={snackbarMessage}
          open={openAddUserModal}
        />
      </ModalUi>
      <Snackbar
        color="white"
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      />
    </>
  );
}

// Пустой строкалардын утилитасы
function TableEmptyRows({ emptyRows, height }) {
  return (
    <>
      {emptyRows > 0 && (
        <tr style={{ height: height * emptyRows }}>
          <td colSpan={headTable.length} />
        </tr>
      )}
    </>
  );
}

TableEmptyRows.propTypes = {
  emptyRows: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
};
