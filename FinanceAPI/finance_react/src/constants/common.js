// Common constants and utilities shared across pages
import axios from 'axios';

// Common styling constants
export const SPACING = {
  small: 4,
  medium: 8,
  large: 16,
  extraLarge: 32
};

export const BUTTON_STYLE = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 2
};

export const FLEX_ROW_CENTER = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center'
};

export const FLEX_COLUMN_CENTER = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
};

export const TABLE_CONTAINER_STYLE = {
  width: 'fit-content',
  minWidth: 0,
  margin: '0 auto',
  maxWidth: '100%'
};

export const SCROLL_CONTAINER_STYLE = {
  maxHeight: '100%',
  minHeight: 0,
  overflowY: 'auto'
};

export const PAGE_CONTAINER_STYLE = {
  padding: 0,
  paddingTop: 0
};

// Common table styles
export const ACTION_BUTTON_CONTAINER_STYLE = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: SPACING.small,
  minWidth: 90
};

// Common confirm modal utilities
export const createConfirmConfig = (message, onConfirm, onCancel = null) => ({
  open: true,
  message,
  onConfirm,
  onCancel: onCancel || (() => {})
});

// Common CRUD operation helpers
export const createGenericHandlers = (
  apiUrl,
  setItems,
  setEditRowId = null,
  setEditRowData = null,
  setNewRow = null,
  setConfirm,
  fetchItems
) => {
  
  const handleAdd = async (newRow) => {
    if (!newRow || Object.values(newRow).every(v => !v)) return;
    
    setConfirm(createConfirmConfig(
      'Are you sure you want to add this record?',
      async () => {
        setConfirm({ open: false });
        try {
          await axios.post(apiUrl, newRow);
          if (setNewRow) setNewRow({});
          await fetchItems();
        } catch (err) {
          alert('Failed to add record. Please check your input and try again.');
        }
      },
      () => setConfirm({ open: false })
    ));
  };

  const handleDelete = async (id) => {
    setConfirm(createConfirmConfig(
      'Are you sure you want to delete this record?',
      async () => {
        setConfirm({ open: false });
        try {
          await axios.delete(`${apiUrl}/${id}`);
          await fetchItems();
        } catch (err) {
          alert('Failed to delete record. Please try again.');
        }
      },
      () => setConfirm({ open: false })
    ));
  };

  const handleRowEdit = (item) => {
    if (setEditRowId) setEditRowId(item.id);
    if (setEditRowData) setEditRowData(item);
  };

  const handleRowSave = async (id, editRowData) => {
    setConfirm(createConfirmConfig(
      'Are you sure you want to update this record?',
      async () => {
        setConfirm({ open: false });
        try {
          await axios.put(`${apiUrl}/${id}`, editRowData);
          if (setEditRowId) setEditRowId(null);
          if (setEditRowData) setEditRowData({});
          await fetchItems();
        } catch (err) {
          alert('Failed to update record. Please try again.');
        }
      },
      () => setConfirm({ open: false })
    ));
  };

  const handleRowCancel = () => {
    if (setEditRowId) setEditRowId(null);
    if (setEditRowData) setEditRowData({});
  };

  const handleRowChange = (e, col, setEditRowData, editRowData) => {
    setEditRowData({ ...editRowData, [col]: e.target.value });
  };

  return {
    handleAdd,
    handleDelete,
    handleRowEdit,
    handleRowSave,
    handleRowCancel,
    handleRowChange
  };
};

// Common search filter utility
export const createSearchFilter = (items, searchText, searchableFields = null) => {
  if (!searchText) return items;
  
  const lower = searchText.toLowerCase();
  return items.filter(item => {
    if (searchableFields) {
      return searchableFields.some(field => 
        item[field] && 
        typeof item[field] === 'string' && 
        item[field].toLowerCase().includes(lower)
      );
    } else {
      return Object.values(item).some(val =>
        val && typeof val === 'string' && val.toLowerCase().includes(lower)
      );
    }
  });
};

// Common column helpers
export const createColumnFonts = (columnCount, fontSize = '16px') => {
  return Array(columnCount).fill(`${fontSize} Arial`);
};

export const createAllRows = (newRow, filteredItems, editRowData) => {
  return [newRow, ...filteredItems, editRowData];
};
