import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PoliciesStocksIcon from '../components/icons/stocks.png';
import GridBanner from '../components/GridBanner';
import { gridTheme } from '../components/gridTheme';
import { ActionButton } from '../components/ActionButton';
import ConfirmModal from '../components/ConfirmModal';
import RoundedInput from '../components/RoundedInput';
import RoundedDropdown from '../components/RoundedDropdown';
import { fetchSymbolSettingsMap } from '../utils/settingsUtils';
import { currencyOptions } from '../constants/Fixedlist';
import { formatCurrencyValue, getCurrencyDisplayLabel, getColWidth, formatMonthDayYear, formatDateForInput } from '../helpers/Helper';

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

const API_URL = 'http://localhost:5226/api/stock';
const INVESTMENT_TYPE_STOCK = 'Stock';

// Column definitions for dynamic width calculation
const STOCK_COLUMNS = [
  { key: 'userShortName', label: 'User', type: 'dropdown' },
  { key: 'type', label: 'Type', type: 'text' },
  { key: 'symbol', label: 'Symbol', type: 'text' },
  { key: 'qty', label: 'Qty', type: 'number' },
  { key: 'currency', label: 'Currency', type: 'dropdown' },
  { key: 'currentValue', label: 'Current Value', type: 'number' },
  { key: 'startDate', label: 'Start Date', type: 'date' },
  { key: 'description', label: 'Description', type: 'text' }
];

// Helper function to parse stock row data for API
const parseStockRow = (row) => ({
  ...row,
  qty: row.qty !== undefined && row.qty !== '' ? Number(row.qty) : null,
  currentValue: row.currentValue !== undefined && row.currentValue !== '' ? Number(row.currentValue) : null,
  userId: row.userId !== undefined ? Number(row.userId) : null
});

function StockPage() {
  const [stocks, setStocks] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [editIdx, setEditIdx] = useState(null);
  const [editRow, setEditRow] = useState({});
  const [addRow, setAddRow] = useState({ type: INVESTMENT_TYPE_STOCK, symbol: '', qty: '', currency: '', currentValue: '', startDate: '', description: '' });
  const [confirm, setConfirm] = useState({ open: false, idx: null });
  const [undoRow, setUndoRow] = useState(null);
  const [undoIdx, setUndoIdx] = useState(null);
  const [symbolValueMap, setSymbolValueMap] = useState({});

  // DiamondPage pattern: Define column structure
  const colKeys = ['userShortName', 'symbol', 'qty', 'currency', 'currentValue', 'startDate', 'description'];
  const colHeaders = ['User', 'Symbol', 'Qty', 'Currency', 'Current Value', 'Start Date', 'Description'];

  // Declare fetch functions first to avoid temporal dead zone
  const fetchStocks = async () => {
    const res = await axios.get(API_URL);
    setStocks(res.data.map(stock => {
      const user = users.find(u => u.id === stock.userId);
      return { ...stock, userShortName: user ? user.shortName : '' };
    }));
  };

  const fetchUsers = async () => {
    const res = await axios.get('http://localhost:5226/api/users');
    setUsers(res.data);
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
    fetchData: fetchStocks,
    parseRow: parseStockRow,
    modalConfig: {
      update: 'Are you sure you want to update this stock?',
      delete: 'Are you sure you want to delete this stock?',
      add: 'Are you sure you want to add this stock?'
    },
    setConfirm
  });

  useEffect(() => {
    fetchUsers();
    fetchSymbolSettingsMap().then(setSymbolValueMap);
  }, []);

  useEffect(() => {
    setFilteredStocks(createSearchFilter(stocks, searchText));
  }, [searchText, stocks]);

  // When users change, refetch stocks for correct mapping
  useEffect(() => {
    if (users.length > 0) fetchStocks();
    // eslint-disable-next-line
  }, [users]);

  const handleEdit = idx => {
    setEditIdx(idx);
    setEditRow({ ...filteredStocks[idx] });
  };
  const handleCancel = () => {
    setEditIdx(null);
    setEditRow({});
  };
  const handleSave = async idx => {
    const row = { ...editRow };
    // Map userShortName to userId if needed
    if (row.userShortName && !row.userId) {
      const user = users.find(u => u.shortName === row.userShortName);
      if (user) row.userId = user.id;
    }
    // Remove empty/undefined fields and id if present
    Object.keys(row).forEach(key => {
      if (row[key] === undefined || row[key] === null || row[key] === '') {
        delete row[key];
      }
    });
    // Remove userShortName from payload before saving
    delete row.userShortName;
    try {
      await axios.put(`${API_URL}/${row.id}`, row);
      setEditIdx(null);
      setEditRow({});
      fetchStocks();
    } catch (err) {
      alert('Failed to update record.');
    }
  };

  // Add common helper functions
  const columnFonts = createColumnFonts(colKeys.length);
  const allRows = createAllRows(addRow, filteredStocks, editRow);

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

  // Create user options for dropdowns
  const filteredUsers = users.filter(u => u.shortName && u.group.toLowerCase().includes('family'));

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
        title="Stocks & Mutual Funds"
        searchText={searchText}
        setSearchText={setSearchText}
        placeholder="Search stocks & MF..."
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', textAlign: 'left', width: '100%' }}
        titleStyle={{ fontSize: 28, fontWeight: 600, marginLeft: 12, textAlign: 'left', display: 'inline-block' }}
        iconStyle={{ height: 40, display: 'inline-block' }}
      />
      <div style={{ height: 12 }} />
      <div style={{ width: '100%',  margin: '0 auto', maxWidth: '100%', display: 'flex', justifyContent: 'center' }}>
        <div style={{
          ...gridTheme.scrollContainer,
          maxHeight: 320, // 5 rows (48px each) + header (48px) + some padding
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'auto',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <table style={{ ...gridTheme.table, width: 'auto', tableLayout: 'auto', margin: '0 auto' }}>
            <thead>
              <tr>
                {colHeaders.map((header, i) => (
                  <th key={header} style={{ ...gridTheme.th, whiteSpace: 'normal', maxWidth: getColWidth(colKeys[i], header, allRows),  width: getColWidth(colKeys[i], header, allRows), textAlign: 'left', fontWeight: 600, fontSize: 16 }}>{header}</th>
                ))}
                <th style={{ ...gridTheme.th, whiteSpace: 'nowrap' }}></th>
              </tr>
            </thead>
            <tbody>
              {/* Add Row */}
              <tr>
                {colKeys.map((key, i) => (
                  key === 'qty' ? (
                    <td key={key} style={{ ...gridTheme.td, maxWidth: getColWidth(key, colHeaders[i], allRows),  width: getColWidth(key, colHeaders[i], allRows), paddingRight: 8, whiteSpace: 'normal' }}>
                      <RoundedInput
                        value={addRow.qty}
                        onChange={e => setAddRow({ ...addRow, qty: e.target.value })}
                        placeholder="Quantity"
                        style={{ width: '100%',  maxWidth: getColWidth(key, colHeaders[i], allRows), textAlign: 'left' }}
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
                    <td key={key} style={{ ...gridTheme.td, maxWidth: getColWidth(key, colHeaders[i], allRows), width: getColWidth(key, colHeaders[i], allRows) }}>
                      <RoundedDropdown
                        value={addRow.currency}
                        onChange={e => setAddRow({ ...addRow, currency: e.target.value })}
                        options={currencyOptions}
                        placeholder="Currency"
                        style={{ width: '100%', maxWidth: getColWidth(key, colHeaders[i], allRows) }}
                        colFonts={columnFonts}
                        colHeaders={colHeaders}
                        allRows={allRows}
                        colKey={key}
                        i={i}
                      />
                    </td>
                  ) : key === 'currentValue' ? (
                    <td key={key} style={{ ...gridTheme.td, maxWidth: getColWidth(key, colHeaders[i], allRows), width: getColWidth(key, colHeaders[i], allRows) }}>
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
                    <td key={key} style={{ ...gridTheme.td, maxWidth: getColWidth(key, colHeaders[i], allRows), width: getColWidth(key, colHeaders[i], allRows) }}>
                      <RoundedInput
                        type="date"
                        value={addRow.startDate || ''}
                        onChange={e => setAddRow({ ...addRow, startDate: e.target.value })}
                        placeholder="Start Date"
                        style={{ width: '100%', maxWidth: getColWidth(key, colHeaders[i], allRows) }}
                        colFonts={columnFonts}
                        colHeaders={colHeaders}
                        allRows={allRows}
                        colKey={key}
                        i={i}
                      />
                    </td>
                  ) : (
                    <td key={key} style={{ ...gridTheme.td, maxWidth: getColWidth(key, colHeaders[i], allRows), width: getColWidth(key, colHeaders[i], allRows) }}>
                      <RoundedInput 
                        value={addRow[key]} 
                        onChange={e => setAddRow({ ...addRow, [key]: e.target.value })} 
                        placeholder={colHeaders[i]} 
                        style={{ maxWidth: getColWidth(key, colHeaders[i], allRows), width: getColWidth(key, colHeaders[i], allRows) }}
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
                    <ActionButton onClick={() => setAddRow({ userShortName: '', type: '', policyNo: '', symbol: '', qty: '', currency: '', currentValue: '', startDate: '', financialnstitution: '', description: '' })} type="undo" title="Undo" />
                  </div>
                </td>
              </tr>
              {/* Data Rows */}
              {filteredStocks.map((s, idx) => {
                let cells = colKeys.map((key, i) => {
                  if (editIdx === idx) {
                    if (key === 'qty') {
                      return (
                        <td key={key} style={{ ...gridTheme.td, maxWidth: getColWidth(key, colHeaders[i], allRows), width: getColWidth(key, colHeaders[i], allRows) }}>
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
                              const user = users.find(u => u.shortName === selectedShortName);
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
                        <td key={key} style={{ ...gridTheme.td, maxWidth: getColWidth(key, colHeaders[i], allRows), width: getColWidth(key, colHeaders[i], allRows) }}>
                          <RoundedDropdown
                            value={editRow.currency}
                            onChange={e => setEditRow({ ...editRow, currency: e.target.value })}
                            options={currencyOptions}
                            placeholder="Currency"
                            style={{ width: '100%', maxWidth: getColWidth(key, colHeaders[i], allRows) }}
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
                        <td key={key} style={{ ...gridTheme.td, maxWidth: getColWidth(key, colHeaders[i], allRows), width: getColWidth(key, colHeaders[i], allRows) }}>
                          {formattedValue ? `${formattedValue}` : ''}
                        </td>
                      );
                    } else if (key === 'startDate') {
                      return (
                        <td key={key} style={{ ...gridTheme.td, maxWidth: getColWidth(key, colHeaders[i], allRows), width: getColWidth(key, colHeaders[i], allRows) }}>
                          <RoundedInput
                            type="date"
                            value={formatDateForInput(editRow.startDate) || ''}
                            onChange={e => setEditRow({ ...editRow, startDate: e.target.value })}
                            placeholder="Start Date"
                            style={{ border: '1px solid #1976d2', width: '100%', maxWidth: getColWidth(key, colHeaders[i], allRows) }}
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
                        <td key={key} style={{ ...gridTheme.td, maxWidth: getColWidth(key, colHeaders[i], allRows), width: getColWidth(key, colHeaders[i], allRows) }}>
                          <RoundedInput 
                            value={editRow[key]} 
                            onChange={e => setEditRow({ ...editRow, [key]: e.target.value })} 
                            style={{ border: '1px solid #1976d2', maxWidth: getColWidth(key, colHeaders[i], allRows), width: getColWidth(key, colHeaders[i], allRows) }}
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
                    if (key === 'currentValue') {
                      // Calculate current value as qty * value from settings map where key contains symbol
                      const symbol = s.symbol;
                      const qty = parseFloat(s.qty) || 0;
                      const valuePerUnit = getValueForSymbol(symbol);
                      const value = qty * valuePerUnit;
                      let currency = s.currency;
                      const formattedValue = formatCurrencyValue(value, currency);
                      return (
                        <td key={key} style={{ ...gridTheme.td, maxWidth: getColWidth(key, colHeaders[i], allRows), width: getColWidth(key, colHeaders[i], allRows) }}>
                          {formattedValue ? `${formattedValue}` : ''}
                        </td>
                      );
                    } else if (key === 'startDate') {
                      return (
                        <td key={key} style={{ ...gridTheme.td, maxWidth: getColWidth(key, colHeaders[i], allRows), width: getColWidth(key, colHeaders[i], allRows) }}>{formatMonthDayYear(s[key])}</td>
                      );
                    } else if (key === 'qty') {
                      return (
                        <td key={key} style={{ ...gridTheme.td, maxWidth: getColWidth(key, colHeaders[i], allRows), width: getColWidth(key, colHeaders[i], allRows) }}>{s.qty}</td>
                      );
                    } else if (key === 'currency') {
                      return (
                        <td key={key} style={{ ...gridTheme.td, maxWidth: getColWidth(key, colHeaders[i], allRows), width: getColWidth(key, colHeaders[i], allRows) }}>{getCurrencyDisplayLabel(s.currency)}</td>
                      );
                    } else {
                      return (
                        <td key={key} style={{ ...gridTheme.td, maxWidth: getColWidth(key, colHeaders[i], allRows), width: getColWidth(key, colHeaders[i], allRows) }}>{s[key]}</td>
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

export default StockPage;
