export const visuallyHidden = {
  border: 0,
  margin: -1,
  padding: 0,
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  position: 'absolute',
  whiteSpace: 'nowrap',
  clip: 'rect(0 0 0 0)',
};

export function emptyRows(page, rowsPerPage, arrayLength) {
  return page ? Math.max(0, (1 + page) * rowsPerPage - arrayLength) : 0;
}

function descendingComparator(a, b, orderBy) {
  if (b.attributes[orderBy] < a.attributes[orderBy]) {
    return -1;
  }
  if (b.attributes[orderBy] > a.attributes[orderBy]) {
    return 1;
  }
  return 0;
}

export function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

export const applyFilter = ({ inputData, comparator, filterName }) => {
  if (!inputData || !filterName) {
    return inputData; // Return all data if no filter is applied
  }

  return inputData.filter((row) => {
    const title = row.attributes.title || ''; // Use empty string if title is undefined
    return title.toLowerCase().includes(filterName.toLowerCase());
  });
};
