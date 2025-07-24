import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PoliciesStocksIcon from '../components/icons/graduate.png';
import GridBanner from '../components/GridBanner';
import { gridTheme} from '../components/gridTheme';
import { ActionButton } from '../components/ActionButton';
import ConfirmModal from '../components/ConfirmModal';
import RoundedInput from '../components/RoundedInput';
import RoundedDropdown from '../components/RoundedDropdown';
import { fetchSymbolSettingsMap } from '../utils/settingsUtils';
import { currencyOptions } from '../constants/Fixedlist';
import { formatCurrencyValue, getCurrencyDisplayLabel, formatMonthDayYear, formatDateForInput } from '../helpers/Helper';

import {
  createGenericHandlers,
  createSearchFilter,
  SPACING,
  FLEX_ROW_CENTER,
  ACTION_BUTTON_CONTAINER_STYLE,
  createColumnFonts,
  createAllRows
} from '../constants/common';
import '../constants/common.css';

const API_URL = 'http://localhost:5226/api/StudentGET';


// Helper function to parse student get row data for API
const parseStudentGetRow = (row) => ({
  ...row,
  qty: row.qty !== undefined && row.qty !== '' ? Number(row.qty) : null,
  currentValue: row.currentValue !== undefined && row.currentValue !== '' ? Number(row.currentValue) : null,
  userId: row.userId !== undefined ? Number(row.userId) : null
});

function StudentGetPage() {
  const [gets, setGets] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filteredGets, setFilteredGets] = useState([]);
  const [editIdx, setEditIdx] = useState(null);
  const [editRow, setEditRow] = useState({});
  const [addRow, setAddRow] = useState({ userShortName: '', type: 'Student', symbol: '', qty: '', currency: '', currentValue: '', startDate: '', description: '' });
  const [confirm, setConfirm] = useState({ open: false, idx: null });
  const [undoRow, setUndoRow] = useState(null);
  const [undoIdx, setUndoIdx] = useState(null);
  const [symbolValueMap, setSymbolValueMap] = useState({});

  // Define column structure similar to DiamondPage
  const colKeys = ['userShortName', 'policyNo', 'symbol', 'qty', 'currency', 'currentValue', 'startDate', 'financialnstitution', 'description'];
  const colHeaders = ['User', 'Policy No', 'Symbol', 'Quantity', 'Currency', 'Current Value', 'Start Date', 'Financial Institution', 'Description'];

  // Declare fetch functions first to avoid temporal dead zone
  const fetchUsers = async () => {
    const res = await axios.get('http://localhost:5226/api/users');
    setUsers(res.data);
  };

  const fetchGets = async () => {
    const res = await axios.get(API_URL);
    setGets(res.data.map(get => {
      const user = users.find(u => u.id === get.userId);
      return { ...get, userShortName: user ? user.shortName : '' };
    }));
  };

  // Use common generic handlers
  const {
    handleRowSave,
    handleRowCancel,
    handleDelete,
    handleAdd
  } = createGenericHandlers({
    apiUrl: API_URL,
    editRowData: editRow,
    setEditRowId: setEditIdx,
    setEditRowData: setEditRow,
    newRow: addRow,
    setNewRow: setAddRow,
    fetchData: fetchGets,
    parseRow: parseStudentGetRow,
    modalConfig: {
      update: 'Are you sure you want to update this student get?',
      delete: 'Are you sure you want to delete this student get?',
      add: 'Are you sure you want to add this student get?'
    },
    setConfirm
  });

  // Fetch users first, then gets, and always map userShortName
  useEffect(() => {
    fetchUsers();
    fetchSymbolSettingsMap().then(setSymbolValueMap);
  }, []);

  // When users change, refetch gets and map userShortName
  useEffect(() => {
    if (users.length > 0) fetchGets();
    // eslint-disable-next-line
  }, [users]);

  useEffect(() => {
    setFilteredGets(createSearchFilter(gets, searchText));
  }, [searchText, gets]);

  const handleEdit = idx => {
    setEditIdx(idx);
    setEditRow({ ...filteredGets[idx] });
  };
  const handleCancel = () => {
    setEditIdx(null);
    setEditRow({});
  };
  const handleSave = async idx => {
    const row = { ...editRow };
    // Remove userShortName from payload before saving
    delete row.userShortName;
    await axios.put(`${API_URL}/${row.id}`, row);
    setEditIdx(null);
    setEditRow({});
    fetchGets();
  };

  // Add common helper functions
  const columnFonts = createColumnFonts(colKeys.length);
  const allRows = createAllRows(addRow, filteredGets, editRow);

  function getTextWidth(text, font = '16px Arial') {
    if (typeof document === 'undefined') return 200;
    const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement('canvas'));
    const context = canvas.getContext('2d');
    context.font = font;
    return context.measureText(text).width;
  }

  // Utility: find value for a symbol by matching substring (case-insensitive)
  function getValueForSymbol(symbol) {
    if (!symbol) return 0;
    const symbolLower = symbol.trim().toLowerCase();
    for (const key in symbolValueMap) {
      if (key && key.toLowerCase().includes(symbolLower)) {
        return parseFloat(symbolValueMap[key]) || 0;
      }
    }
    return 0;
  }

  // Unique type options for the Type combo box
  const typeOptions = Array.from(new Set([addRow.type, ...filteredGets.map(s => s.type), editRow.type].filter(Boolean))).map(t => ({ value: t, label: t }));
  const typeComboOptions = typeOptions;

  // Create user options for dropdowns - Filter for Manikanta only
  const userOptions = users
    .filter(u => u.shortName && u.shortName === 'Manikanta')
    .map(u => ({ value: u.shortName, label: u.shortName }));

  // Also create a filtered users array for consistency
  const filteredUsers = users.filter(u => u.shortName && u.shortName === 'Manikanta');

  // Calculate column widths similar to original colWidths logic
  function getColWidth(key, header, index) {
    if (key === 'qtyCurrency') {
      // Only use qty for width calculation
      const headerWidth = getTextWidth('Quantity', '16px Arial');
      const cellWidths = allRows.map(row => getTextWidth((row && row.qty) ? String(row.qty) : '', '16px Arial'));
      return Math.max(headerWidth, ...cellWidths, 80) + 40;
    } else if (key === 'userShortName') {
      // Match PolicyPage pattern - no extra padding
      const headerWidth = getTextWidth(header, '16px Arial');
      const cellWidths = allRows.map(row => getTextWidth((row && row[key]) ? String(row[key]) : '', '16px Arial'));
      return Math.max(headerWidth, ...cellWidths, 120);
    } else {
      const headerWidth = getTextWidth(header, '16px Arial');
      const cellWidths = allRows.map(row => getTextWidth((row && row[key]) ? String(row[key]) : '', '16px Arial'));
      return Math.max(headerWidth, ...cellWidths, 80) + 40;
    }
  }

  return (
    <div className="page-container">
      <ConfirmModal 
        open={confirm.open} 
        message={confirm.message || "Are you sure you want to delete this record?"} 
        onConfirm={confirm.onConfirm} 
        onCancel={() => setConfirm({ open: false, idx: null })} 
      />
      <GridBanner
        icon={PoliciesStocksIcon}
        title="Student Investments"
        searchText={searchText}
        setSearchText={setSearchText}
        placeholder="Search student investments..."
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', textAlign: 'left', width: '100%' }}
        titleStyle={{ fontSize: 28, fontWeight: 600, marginLeft: 12, textAlign: 'left', display: 'inline-block' }}
        iconStyle={{ height: 40, display: 'inline-block' }}
      />
      <div style={{ height: 12 }} />
      {/* Remove undoRow notification if not needed, or keep as per your requirements */}
      <div style={{ width: 'fit-content', margin: '0 auto', maxWidth: '100%' }}>
        <div style={{
          ...gridTheme.scrollContainer,
          maxHeight: 260, // 4 rows (48px each) + header (48px) + some padding
          minHeight: 0,
          overflowY: 'auto',
        }}>
          <table style={gridTheme.table}>
            <thead>
              <tr>
                {colHeaders.map((header, i) => (
                  <th key={header} style={{ ...gridTheme.th, whiteSpace: 'nowrap', maxWidth: getColWidth(colKeys[i], header, i), width: getColWidth(colKeys[i], header, i), textAlign: 'left', fontWeight: 600, fontSize: 16 }}>{header}</th>
                ))}
                <th style={{ ...gridTheme.th, whiteSpace: 'nowrap' }}></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                {colKeys.map((key, i) => (
                  key === 'qtyCurrency' ? (
                    <td key={key} style={{ ...gridTheme.td, maxWidth: getColWidth(key, colHeaders[i], i), width: getColWidth(key, colHeaders[i], i), paddingRight: 8 }}>
                      <RoundedInput
                        value={addRow.qty}
                        onChange={e => setAddRow({ ...addRow, qty: e.target.value })}
                        placeholder="Quantity"
                        style={{ width: '100%', maxWidth: getColWidth(key, colHeaders[i], i), textAlign: 'left' }}
                        colFonts={columnFonts}
                        colHeaders={colHeaders}
                        allRows={allRows}
                        colKey={key}
                        i={i}
                      />
                    </td>
                  ) : key === 'userShortName' ? (
                    <td key={key} style={{ ...gridTheme.td }}>
                      <RoundedDropdown
                        value={addRow.userShortName}
                        onChange={e => setAddRow({ ...addRow, userShortName: e.target.value })}
                        options={filteredUsers.map(u => ({ value: u.shortName, label: u.shortName }))}
                        placeholder="User"
                        colFonts={columnFonts}
                        colHeaders={colHeaders}
                        allRows={allRows}
                        colKey={key}
                        i={i}
                      />
                    </td>
                  ) : key === 'currency' ? (
                    <td key={key} style={{ ...gridTheme.td, maxWidth: getColWidth(key, colHeaders[i], i), width: getColWidth(key, colHeaders[i], i) }}>
                      <RoundedDropdown
                        value={addRow.currency}
                        onChange={e => setAddRow({ ...addRow, currency: e.target.value })}
                        options={currencyOptions}
                        placeholder="Currency"
                        style={{ width: '100%', maxWidth: getColWidth(key, colHeaders[i], i) }}
                        colFonts={columnFonts}
                        colHeaders={colHeaders}
                        allRows={allRows}
                        colKey={key}
                        i={i}
                      />
                    </td>
                  ) : key === 'currentValue' ? (
                    <td key={key} style={{ ...gridTheme.td, maxWidth: getColWidth(key, colHeaders[i], i), width: getColWidth(key, colHeaders[i], i) }}>
                      {/* Show current value for add row */}
                      {(() => {
                        const symbol = addRow.symbol;
                        const qty = parseFloat(addRow.qty) || 0;
                        const valuePerUnit = getValueForSymbol(symbol);
                        const value = qty * valuePerUnit;
                        let currency = addRow.currency;
                        const formattedValue = formatCurrencyValue(value, currency);
                        return formattedValue ? `${formattedValue}` : '';
                      })()}
                    </td>
                  ) : key === 'startDate' ? (
                    <td key={key} style={{ ...gridTheme.td, maxWidth: getColWidth(key, colHeaders[i], i), width: getColWidth(key, colHeaders[i], i) }}>
                      <RoundedInput
                        type="date"
                        value={addRow.startDate || ''}
                        onChange={e => setAddRow({ ...addRow, startDate: e.target.value })}
                        placeholder="Start Date"
                        style={{ width: '100%', maxWidth: getColWidth(key, colHeaders[i], i) }}
                        colFonts={columnFonts}
                        colHeaders={colHeaders}
                        allRows={allRows}
                        colKey={key}
                        i={i}
                      />
                    </td>
                  ) : (
                    <td key={key} style={{ ...gridTheme.td }}>
                      <RoundedInput 
                        value={addRow[key]} 
                        onChange={e => setAddRow({ ...addRow, [key]: e.target.value })} 
                        placeholder={colHeaders[i]} 
                        style={{ maxWidth: getColWidth(key, colHeaders[i], i), width: getColWidth(key, colHeaders[i], i) }}
                        colFonts={columnFonts}
                        colHeaders={colHeaders}
                        allRows={allRows}
                        colKey={key}
                        i={i}
                      />
                    </td>
                  )
                ))}
                <td style={gridTheme.td}>
                  <div style={ACTION_BUTTON_CONTAINER_STYLE}>
                    <ActionButton onClick={handleAdd} type="save" title="Add" />
                    <ActionButton onClick={() => setAddRow({ userShortName: '', type: 'Student', policyNo: '', symbol: '', qty: '', currency: '', currentValue: '', startDate: '', financialnstitution: '', description: '' })} type="undo" title="Undo" />
                  </div>
                </td>
              </tr>
              {/* Data Rows */}
              {filteredGets.map((s, idx) => {
                let cells = colKeys.map((key, i) => {
                  if (editIdx === idx) {
                    if (key === 'qtyCurrency') {
                      return (
                        <td key={key} style={{ ...gridTheme.td }}>
                          <RoundedInput 
                            value={editRow.qty} 
                            onChange={e => setEditRow({ ...editRow, qty: e.target.value })} 
                            placeholder="Qty" 
                            style={{ width: '100%', textAlign: 'left' }}
                            colFonts={columnFonts}
                            colHeaders={colHeaders}
                            allRows={allRows}
                            colKey={key}
                            i={i}
                          />
                        </td>
                      );
                    } else if (key === 'userShortName') {
                      return (
                        <td key={key} style={{ ...gridTheme.td }}>
                          <RoundedDropdown
                            value={editRow.userShortName}
                            onChange={e => {
                              const selectedShortName = e.target.value;
                              const user = filteredUsers.find(u => u.shortName === selectedShortName);
                              setEditRow({
                                ...editRow,
                                userShortName: selectedShortName,
                                userId: user ? user.id : undefined
                              });
                            }}
                            options={filteredUsers.map(u => ({ value: u.shortName, label: u.shortName }))}
                            placeholder="User"
                            style={{ border: '1px solid #1976d2' }}
                            colFonts={columnFonts}
                            colHeaders={colHeaders}
                            allRows={allRows}
                            colKey={key}
                            i={i}
                          />
                        </td>
                      );
                    } else if (key === 'currency') {
                      return (
                        <td key={key} style={{ ...gridTheme.td}}>
                          <RoundedDropdown
                            value={editRow.currency}
                            onChange={e => setEditRow({ ...editRow, currency: e.target.value })}
                            options={currencyOptions}
                            placeholder="Currency"
                            style={{ width: '100%', maxWidth: getColWidth(key, colHeaders[i], i) }}
                            colFonts={columnFonts}
                            colHeaders={colHeaders}
                            allRows={allRows}
                            colKey={key}
                            i={i}
                          />
                        </td>
                      );
                    } else if (key === 'currentValue') {
                      // Show current value for edit row
                      const symbol = editRow.symbol;
                      const qty = parseFloat(editRow.qty) || 0;
                      const valuePerUnit = getValueForSymbol(symbol);
                      const value = qty * valuePerUnit;
                      let currency = editRow.currency;
                      const formattedValue = formatCurrencyValue(value, currency);
                      return (
                        <td key={key} style={{ ...gridTheme.td }}>
                          {formattedValue ? `${formattedValue}` : ''}
                        </td>
                      );
                    } else if (key === 'startDate') {
                      return (
                        <td key={key} style={{ ...gridTheme.td}}>
                          <RoundedInput
                            type="date"
                            value={formatDateForInput(editRow.startDate) || ''}
                            onChange={e => setEditRow({ ...editRow, startDate: e.target.value })}
                            placeholder="Start Date"
                            style={{ border: '1px solid #1976d2'}}
                            colFonts={columnFonts}
                            colHeaders={colHeaders}
                            allRows={allRows}
                            colKey={key}
                            i={i}
                          />
                        </td>
                      );
                    } else {
                      return (
                        <td key={key} style={{ ...gridTheme.td }}>
                          <RoundedInput 
                            value={editRow[key]} 
                            onChange={e => setEditRow({ ...editRow, [key]: e.target.value })} 
                            style={{ border: '1px solid #1976d2' }}
                            colFonts={columnFonts}
                            colHeaders={colHeaders}
                            allRows={allRows}
                            colKey={key}
                            i={i}
                          />
                        </td>
                      );
                    }
                  } else {
                    if (key === 'qtyCurrency') {
                      // Always show the quantity value in view mode
                      return (
                        <td key={key} style={{ ...gridTheme.td, textAlign: 'left' }}>
                          <span style={{ textAlign: 'left', font: columnFonts[i] }}>{s.qty}</span>
                        </td>
                      );
                    } else if (key === 'currentValue') {
                      // Calculate current value as qty * value from settings map where key contains symbol
                      const symbol = s.symbol;
                      const qty = parseFloat(s.qty) || 0;
                      const valuePerUnit = getValueForSymbol(symbol);
                      const value = qty * valuePerUnit;
                      let currency = s.currency;
                      const formattedValue = formatCurrencyValue(value, currency);
                      return (
                        <td key={key} style={{ ...gridTheme.td }}>
                          {formattedValue ? `${formattedValue}` : ''}
                        </td>
                      );
                    } else if (key === 'startDate') {
                      return (
                        <td key={key} style={{ ...gridTheme.td }}>{formatMonthDayYear(s[key])}</td>
                      );
                    } else if (key === 'userShortName') {
                      return (
                        <td key={key} style={{ ...gridTheme.td, maxWidth: getColWidth(key, colHeaders[i], i), width: getColWidth(key, colHeaders[i], i) }}>
                          {s.userShortName}
                        </td>
                      );
                    } else if (key === 'currency') {
                      return (
                        <td key={key} style={{ ...gridTheme.td, maxWidth: getColWidth(key, colHeaders[i], i), width: getColWidth(key, colHeaders[i], i) }}>
                          {getCurrencyDisplayLabel(s.currency)}
                        </td>
                      );
                    } else {
                      return (
                        <td key={key} style={{ ...gridTheme.td }}>{s[key]}</td>
                      );
                    }
                  }
                });
                // Add actions cell
                if (editIdx === idx) {
                  cells.push(
                    <td key="actions" style={gridTheme.td}>
                      <div style={ACTION_BUTTON_CONTAINER_STYLE}>
                        <ActionButton onClick={() => handleSave(idx)} type="save" title="Save" />
                        <ActionButton onClick={handleCancel} type="cancel" title="Cancel" />
                      </div>
                    </td>
                  );
                } else {
                  cells.push(
                    <td key="actions" style={gridTheme.td}>
                      <div style={ACTION_BUTTON_CONTAINER_STYLE}>
                        <ActionButton onClick={() => handleEdit(idx)} type="edit" title="Edit" />
                        <ActionButton onClick={() => handleDelete(idx)} type="delete" title="Delete" />
                      </div>
                    </td>
                  );
                }
                return (
                  <tr key={idx}>
                    {cells}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default StudentGetPage;
