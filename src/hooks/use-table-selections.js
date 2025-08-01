/* eslint-disable no-nested-ternary */
import { useMemo, useState, useEffect } from 'react';

export function useTableSelection(rows) {
  const [selectedIds, setSelectedIds] = useState([]);

  const isAllSelected = useMemo(
    () => rows.length > 0 && selectedIds.length === rows.length,
    [rows, selectedIds]
  );

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedIds(rows.map((row) => row.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  return {
    selectedIds,
    setSelectedIds,
    isAllSelected,
    handleSelectAll,
    handleSelectRow,
  };
}

export function useTableCellSelection() {
  const [selectedCell, setSelectedCell] = useState({ rowId: null, col: null });
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [selectedValue, setSelectedValue] = useState(null);

  const handleCellClick = (row, col, event) => {
    if (col === 'action' || event?.target?.type === 'checkbox') return;
    setSelectedCell({ rowId: row.id, col });
    setSelectedColumn(col);
    setSelectedValue(row[col]);
  };

  const resetCellSelection = () => {
    setSelectedCell({ rowId: null, col: null });
    setSelectedColumn(null);
    setSelectedValue(null);
  };

  return {
    selectedCell,
    setSelectedCell,
    selectedColumn,
    setSelectedColumn,
    selectedValue,
    setSelectedValue,
    handleCellClick,
    resetCellSelection,
  };
}

export function useTableSearch(rows, columns, searchValue, getCellDisplayValue) {
  const [searchIndex, setSearchIndex] = useState(0);

  const searchMatches = useMemo(() => {
    if (!searchValue) return [];
    const lower = searchValue.toLowerCase();
    return rows
      .map((row, idx) => {
        const hasMatch = columns.some(col => {
          const val = getCellDisplayValue ? getCellDisplayValue(row, col) : row[col];
          return String(val ?? '').toLowerCase().includes(lower);
        });
        return hasMatch ? idx : null;
      })
      .filter(idx => idx !== null);
  }, [rows, columns, searchValue, getCellDisplayValue]);

  useEffect(() => {
    setSearchIndex(0);
  }, [searchValue, rows.length]);

  const handleSearchNext = () => {
    if (!searchMatches.length) return;
    setSearchIndex(prev => (prev + 1) % searchMatches.length);
  };

  return {
    searchMatches,
    searchIndex,
    setSearchIndex,
    handleSearchNext,
  };
}
