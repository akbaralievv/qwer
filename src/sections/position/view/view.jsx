import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

import {
  Card,
  Stack,
  Table,
  Button,
  TableRow,
  Snackbar,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
  TablePagination,
} from '@mui/material';

import ModalUi from 'src/ui/ModalUi';
import { useGetPositionQuery, useUpdatePositionMutation } from 'src/store/api/positionApi';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

// import TableNoData from '../table-no-data';
import SubdivisionsTableRow from '../table-row';
import SubdivisonsTableHead from '../table-head';
import UpdateSubdivision from '../UpdatePosition';
import CreateSubdivision from '../CreatePosition';
import { applyFilter, getComparator } from '../utils';
import SubdivisionsTableToolbar from '../table-toolbar';
// eslint-disable-next-line
import Loading from 'src/ui/Loading';

const headTable = [
  { id: 'title', label: 'Название', mapping: true },
  { id: 'user', label: 'Название', mapping: true },
  { id: 'action', label: 'Действие', align: 'right', mapping: false },
];

export default function PositionPage() {
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState(false);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [pageCount, setPageCount] = useState();
  const [allUsers, setAllUsers] = useState([]);
  const [orderBy, setOrderBy] = useState('title');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(3);
  const [selectedUser, setSelectedUser] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [openAddUserModal, setOpenAddUserModal] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(headTable.map((col) => col.label));

  const [updateData] = useUpdatePositionMutation();
  const { data, isLoading } = useGetPositionQuery('?populate=*');
  useEffect(() => {
    if (data && data.meta && data.meta.pagination) {
      setAllUsers(data.data);
      setPage(data.meta.pagination.page - 1);
      setRowsPerPage(data.meta.pagination.pageSize);
      setPageCount(data.meta.pagination.total);
    }
  }, [data]);

  const handleSort = (id) => {
    const isAsc = orderBy === id && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(id);
  };

  const handleSnackbarClose = (_, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = allUsers.map((n) => n.attributes.title);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (name) => {
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
    setOpen(true);
  };

  const dataFiltered = applyFilter({
    inputData: allUsers,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  // const notFound = !dataFiltered.length && !!filterName;
  const filteredColumns = headTable.filter((col) => visibleColumns.includes(col.label));
  // const emptyRows = Math.max(0, rowsPerPage - dataFiltered.length);
console.log('dataFiltered', dataFiltered);
  return (
    <>
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3} mt={3}>
          <Typography variant="h4">Ответственные лица</Typography>
          <Button
            onClick={() => setOpenAddUserModal(true)}
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon="eva:plus-fill" />}
          >
            Добавить
          </Button>
        </Stack>

        <Card>
          <SubdivisionsTableToolbar
            names={headTable}
            numSelected={selected.length}
            filterName={filterName}
            onFilterName={handleFilterByName}
            setVisibleColumns={setVisibleColumns}
          />

          <Scrollbar>
            <TableContainer sx={{
              width: '100%', maxHeight: 500, minHeight: 220, overflowY: 'auto',
            }}>
              <Table sx={{ minWidth: 800, height: '100%' }} stickyHeader>
                <SubdivisonsTableHead
                  order={order}
                  orderBy={orderBy}
                  rowCount={allUsers.length}
                  numSelected={selected.length}
                  onRequestSort={handleSort}
                  onSelectAllClick={handleSelectAllClick}
                  headLabel={filteredColumns}
                />
                {isLoading ? (
                  <Loading />
                ) : (
                  <TableBody>
                    {dataFiltered.map((row, id) => (
                      <SubdivisionsTableRow
                        key={id}
                        row={row.attributes}
                        columns={filteredColumns}
                        selected={selected.indexOf(row.attributes.title) !== -1}
                        handleClick={() => handleClick(row.attributes.title)}
                        onRowClick={() => handleDialogOpen(row)}
                      />
                    ))}
                    {/* <TableEmptyRows height={77} emptyRows={emptyRows} />
                    {notFound && <TableNoData query={filterName} />} */}
                  </TableBody>
                )}
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            rowsPerPageOptions={[3, 25, 50]}
            component="div"
            count={pageCount || 0}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>
      {selectedUser && (
        <ModalUi open={open} setOpen={setOpen}>
          <UpdateSubdivision
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
            updateData={updateData}
            open={open}
            setOpen={setOpen}
            setSnackbarMessage={setSnackbarMessage}
            setSnackbarOpen={setSnackbarOpen}
            snackbarOpen={snackbarOpen}
            snackbarMessage={snackbarMessage}
          />
        </ModalUi>
      )}
      <ModalUi setOpen={setOpenAddUserModal} open={openAddUserModal}>
        <CreateSubdivision
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

// Компонент для отображения пустых строк
function TableEmptyRows({ emptyRows, height }) {
  return (
    <>
      {emptyRows > 0 && (
        <TableRow style={{ height: height * emptyRows }}>
          <TableCell colSpan={headTable.length} />
        </TableRow>
      )}
    </>
  );
}

TableEmptyRows.propTypes = {
  emptyRows: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
};