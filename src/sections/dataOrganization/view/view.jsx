import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

import {
  Card,
  Stack,
  Table,
  TableRow,
  Snackbar,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
} from '@mui/material';

import ModalUi from 'src/ui/ModalUi';
import { useGetUserQuery } from 'src/store/api/user/userApi';
import {
  useGetDataOrganizationQuery,
  useUpdateDataOrganizationMutation,
} from 'src/store/api/dataOrganizationAPI';

import Scrollbar from 'src/components/scrollbar';

import SubdivisionsTableRow from '../table-row';
import SubdivisonsTableHead from '../table-head';
import SubdivisionsTableToolbar from '../table-toolbar';
import UpdateDataOrganization from '../UpdateDataOrganization';

const headTable = [
  { id: 'title', label: 'Название', mapping: true },
  { id: 'address', label: 'Адрес', mapping: true },
  { id: 'fullName', label: 'Название компании', mapping: true },
  { id: 'inn', label: 'ИНН', mapping: true },
  { id: 'bik', label: 'БИК', mapping: true },
  { id: 'okpo', label: 'ОКПО', mapping: true },
  { id: 'regNumber', label: 'Регистрационный номер', mapping: true },
  { id: 'action', label: 'Действие', align: 'right', mapping: false },
];

export default function DataOrganizationPage() {
  const [data1, setData1] = useState([]);
  const [open, setOpen] = useState(false);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('title');
  const [filterName, setFilterName] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [updateData] = useUpdateDataOrganizationMutation();
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [visibleColumns, setVisibleColumns] = useState(headTable.map((col) => col.label));

  const { data: mycompany } = useGetUserQuery('');
  const { data: dataOrganization } = useGetDataOrganizationQuery(
    `/${mycompany?.mycompany?.id}?sort[0]=${orderBy}:${order}`
  );

  useEffect(() => {
    if (dataOrganization) {
      setData1([dataOrganization.data]);
    }
  }, [dataOrganization]);

  const handleSort = (_, id) => {
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
      const newSelecteds = data1.map((n) => n.attributes.title);
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

  const handleFilterByName = (event) => {
    setFilterName(event.target.value);
  };

  const handleDialogOpen = (user) => {
    setSelectedUser({ dataUser: user.attributes, idUser: user.id });
    setOpen(true);
  };

  const filteredColumns = headTable.filter((col) => visibleColumns.includes(col.label));

  return (
    <>
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5} mt={2}>
          <Typography variant="h4">Реквизиты</Typography>
        </Stack>

        <Card>
          <SubdivisionsTableToolbar
            names={headTable}
            filterName={filterName}
            onRequestSort={handleSort}
            numSelected={selected.length}
            onFilterName={handleFilterByName}
            setVisibleColumns={setVisibleColumns}
          />

          <Scrollbar>
            <TableContainer sx={{ overflow: 'unset', width: '100%' }}>
              <Table sx={{ minWidth: 800 }}>
                <SubdivisonsTableHead
                  order={order}
                  orderBy={orderBy}
                  rowCount={data1?.length}
                  onRequestSort={handleSort}
                  headLabel={filteredColumns}
                  numSelected={selected.length}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {data1.length > 0 ? (
                    data1.map((row, id) => (
                      <SubdivisionsTableRow
                        key={id}
                        row={row.attributes}
                        columns={filteredColumns}
                        onRowClick={() => handleDialogOpen(row)}
                        handleClick={() => handleClick(row.attributes.title)}
                        selected={selected.indexOf(row.attributes.title) !== -1}
                      />
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={filteredColumns.length}>No data available</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>
        </Card>
      </Container>

      {selectedUser && (
        <ModalUi radius="15" open={open} setOpen={setOpen}>
          <UpdateDataOrganization
            open={open}
            setOpen={setOpen}
            updateData={updateData}
            snackbarOpen={snackbarOpen}
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
            snackbarMessage={snackbarMessage}
            setSnackbarOpen={setSnackbarOpen}
            setSnackbarMessage={setSnackbarMessage}
          />
        </ModalUi>
      )}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        message={snackbarMessage}
        onClose={handleSnackbarClose}
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
  height: PropTypes.number.isRequired,
  emptyRows: PropTypes.number.isRequired,
};
