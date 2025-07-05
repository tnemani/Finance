import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PoliciesStocksIcon from '../components/icons/stocks.png';
import GridBanner from '../components/GridBanner';
import { gridTheme } from '../components/gridTheme';
import { ActionButton } from '../components/ActionButton';
import ConfirmModal from '../components/ConfirmModal';
import RoundedInput from '../components/RoundedInput';
import RoundedDropdown from '../components/RoundedDropdown';
import RoundedComboBox from '../components/RoundedComboBox';
import { currencyOptions } from '../components/gridTheme';
import { fetchSymbolSettingsMap } from '../utils/settingsUtils';

const API_URL = 'http://localhost:5226/api/stock';
const INVESTMENT_TYPE_STOCK = 'Stock';

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

  useEffect(() => {
    fetchUsers();
    fetchSymbolSettingsMap().then(setSymbolValueMap);
  }, []);

  useEffect(() => {
    if (!searchText) setFilteredStocks(stocks);
    else {
      const lower = searchText.toLowerCase();
      setFilteredStocks(
        stocks.filter(s =>
          Object.values(s).some(val =>
            (typeof val === 'string' && val.toLowerCase().includes(lower)) ||
            (typeof val === 'number' && String(val).includes(lower))
          )
        )
      );
    }
  }, [searchText, stocks]);

  // Always use latest users state for mapping
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
  const handleDelete = idx => {
    setUndoRow(filteredStocks[idx]);
    setUndoIdx(idx);
    setConfirm({ open: true, idx });
  };
  const handleConfirmDelete = async () => {
    // Actually delete the entity from the backend
    const row = filteredStocks[confirm.idx];
    if (row && row.id) {
      try {
        await axios.delete(`${API_URL}/${row.id}`);
        setConfirm({ open: false, idx: null });
        fetchStocks();
      } catch (err) {
        alert('Failed to delete record.');
      }
    } else {
      setConfirm({ open: false, idx: null });
    }
  };
  const handleAdd = async () => {
    // Always set type as 'Stock' before sending
    const { currentValue, ...rowToAdd } = { ...addRow, type: INVESTMENT_TYPE_STOCK };
    // Map userShortName to userId if needed
    if (rowToAdd.userShortName && !rowToAdd.userId) {
      const user = users.find(u => u.shortName === rowToAdd.userShortName);
      if (user) rowToAdd.userId = user.id;
    }
    // Remove empty/undefined fields and id if present
    Object.keys(rowToAdd).forEach(key => {
      if (rowToAdd[key] === undefined || rowToAdd[key] === null || rowToAdd[key] === '') {
        delete rowToAdd[key];
      }
      if (key.toLowerCase() === 'id') {
        delete rowToAdd[key];
      }
    });
    if (!rowToAdd.symbol) return;
    try {
      await axios.post(API_URL, rowToAdd);
      setAddRow({ type: INVESTMENT_TYPE_STOCK, symbol: '', qty: '', currency: '', currentValue: '', startDate: '', description: '' });
      fetchStocks();
    } catch (err) {
      alert('Failed to add record. ' + (err?.response?.data?.message || err.message));
    }
  };
  const handleUndo = () => {
    if (undoRow) {
      axios.post(API_URL, undoRow).then(() => {
        setUndoRow(null);
        setUndoIdx(null);
        fetchStocks();
      });
    }
  };

  function getTextWidth(text, font = '16px Arial') {
    if (typeof document === 'undefined') return 200;
    const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement('canvas'));
    const context = canvas.getContext('2d');
    context.font = font;
    return context.measureText(text).width;
  }

  // Remove 'type' from colKeys and colHeaders for grid rendering
  const colKeys = [
    'userShortName', /* 'type' removed */ 'policyNo', 'symbol', 'qtyCurrency', 'currentValue', 'startDate', 'financialnstitution', 'description'
  ];
  const colHeaders = [
    'User', /* 'Type' removed */ 'Policy No', 'Symbol', 'Quantity', 'Current Value', 'Start Date', 'Financial Institution', 'Description'
  ];
  const colFonts = Array(colKeys.length).fill('16px Arial');
  // Calculate max width for each column
  const allRows = [addRow, ...filteredStocks, editRow];
  const colWidths = colKeys.map((key, i) => {
    if (key === 'qtyCurrency') {
      const headerWidth = getTextWidth('Quantity', colFonts[i]);
      const cellWidths = allRows.map(row => getTextWidth((row && row.qty) ? String(row.qty) : '', colFonts[i]));
      return Math.max(headerWidth, ...cellWidths, 80) + 40;
    } else if (key === 'userShortName') {
      const headerWidth = getTextWidth(colHeaders[i], colFonts[i]);
      const cellWidths = allRows.map(row => getTextWidth((row && row[key]) ? String(row[key]) : '', colFonts[i]));
      return Math.max(headerWidth, ...cellWidths, 120) + 80;
    } else {
      const headerWidth = getTextWidth(colHeaders[i], colFonts[i]);
      const cellWidths = allRows.map(row => getTextWidth((row && row[key]) ? String(row[key]) : '', colFonts[i]));
      return Math.max(headerWidth, ...cellWidths, 80) + 40;
    }
  });

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
  const typeOptions = Array.from(new Set([addRow.type, ...filteredStocks.map(s => s.type), editRow.type].filter(Boolean))).map(t => ({ value: t, label: t }));
  const typeComboOptions = [{ value: '', label: 'Select' }, ...typeOptions];

  return (
    <div style={{ padding: 20, paddingTop: 0}}>
      <ConfirmModal open={confirm.open} message="Are you sure you want to delete this record?" onConfirm={handleConfirmDelete} onCancel={() => setConfirm({ open: false, idx: null })} />
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
      <div style={{ width: '100%', minWidth: 0, margin: '0 auto', maxWidth: '100%', display: 'flex', justifyContent: 'center' }}>
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
                  <th key={header} style={{ ...gridTheme.th, whiteSpace: 'normal', maxWidth: colWidths[i], minWidth: 60, width: colWidths[i], textAlign: 'left', fontWeight: 600, fontSize: 16 }}>{header}</th>
                ))}
                <th style={{ ...gridTheme.th, whiteSpace: 'nowrap' }}></th>
              </tr>
            </thead>
            <tbody>
              {/* Add Row */}
              <tr>
                {colKeys.map((key, i) => (
                  key === 'qtyCurrency' ? (
                    <td key={key} style={{ ...gridTheme.td, maxWidth: colWidths[i], minWidth: 60, width: colWidths[i], paddingRight: 8, whiteSpace: 'normal' }}>
                      <RoundedInput
                        value={addRow.qty}
                        onChange={e => setAddRow({ ...addRow, qty: e.target.value })}
                        placeholder="Quantity"
                        style={{ width: '100%', minWidth: 60, maxWidth: colWidths[i], textAlign: 'left' }}
                      />
                    </td>
                  ) : key === 'userShortName' ? (
                    <td key={key} style={{ ...gridTheme.td, maxWidth: colWidths[i], minWidth: 140, width: colWidths[i] }}>
                      <RoundedDropdown
                        value={addRow.userShortName}
                        onChange={e => setAddRow({ ...addRow, userShortName: e.target.value })}
                        options={[{ value: '', label: 'Select' }, ...users.map(u => ({ value: u.shortName, label: u.shortName }))]}
                        placeholder="User"
                        style={{ width: '100%', minWidth: 130, maxWidth: colWidths[i]}}
                      />
                    </td>
                  ) : key === 'currentValue' ? (
                    <td key={key} style={{ ...gridTheme.td, maxWidth: colWidths[i], minWidth: 80, width: colWidths[i] }}>
                      {/* Show current value for add row */}
                      {(() => {
                        const symbol = addRow.symbol;
                        const qty = parseFloat(addRow.qty) || 0;
                        const valuePerUnit = getValueForSymbol(symbol);
                        const value = qty * valuePerUnit;
                        let valueStr = value > 0 ? Math.round(value).toString() : '';
                        let currency = addRow.currency || '$';
                        let formattedValue = valueStr;
                        if (valueStr) {
                          if (currency === 'Rs' || currency === 'INR') {
                            formattedValue = Number(valueStr).toLocaleString('en-IN');
                          } else {
                            formattedValue = Number(valueStr).toLocaleString('en-US');
                          }
                        }
                        return valueStr ? `${formattedValue} ${currency}` : '';
                      })()}
                    </td>
                  ) : key === 'startDate' ? (
                    <td key={key} style={{ ...gridTheme.td, maxWidth: colWidths[i], minWidth: 80, width: colWidths[i] }}>
                      <RoundedInput
                        type="date"
                        value={addRow.startDate || ''}
                        onChange={e => setAddRow({ ...addRow, startDate: e.target.value })}
                        placeholder="Start Date"
                        style={{ width: '100%', minWidth: 80, maxWidth: colWidths[i] }}
                      />
                    </td>
                  ) : (
                    <td key={key} style={{ ...gridTheme.td, maxWidth: colWidths[i], minWidth: 80, width: colWidths[i] }}>
                      <RoundedInput value={addRow[key]} onChange={e => setAddRow({ ...addRow, [key]: e.target.value })} placeholder={colHeaders[i]} style={{ maxWidth: colWidths[i], minWidth: 80, width: colWidths[i] }} />
                    </td>
                  )
                ))}
                <td style={gridTheme.td}>
                  <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <ActionButton onClick={handleAdd} type="save" title="Add" />
                    <ActionButton onClick={() => setAddRow({ userShortName: '', type: '', policyNo: '', symbol: '', qty: '', currency: '', currentValue: '', startDate: '', financialnstitution: '', description: '' })} type="undo" title="Undo" />
                  </div>
                </td>
              </tr>
              {/* Data Rows */}
              {filteredStocks.map((s, idx) => {
                let cells = colKeys.map((key, i) => {
                  if (editIdx === idx) {
                    if (key === 'qtyCurrency') {
                      return (
                        <td key={key} style={{ ...gridTheme.td, maxWidth: colWidths[i], minWidth: 80, width: colWidths[i] }}>
                          <RoundedInput value={editRow.qty} onChange={e => setEditRow({ ...editRow, qty: e.target.value })} placeholder="Qty" style={{ width: '100%', minWidth: 50, textAlign: 'left' }} />
                        </td>
                      );
                    } else if (key === 'userShortName') {
                      return (
                        <td key={key} style={{ ...gridTheme.td, maxWidth: colWidths[i], minWidth: 140, width: colWidths[i] }}>
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
                            options={[{ value: '', label: 'Select' }, ...users.map(u => ({ value: u.shortName, label: u.shortName }))]}
                            placeholder="User"
                            style={{ width: '100%', minWidth: 130, maxWidth: colWidths[i] }}
                          />
                        </td>
                      );
                    } else if (key === 'currentValue') {
                      // Show current value for edit row
                      const symbol = editRow.symbol;
                      const qty = parseFloat(editRow.qty) || 0;
                      const valuePerUnit = getValueForSymbol(symbol);
                      const value = qty * valuePerUnit;
                      let valueStr = value > 0 ? Math.round(value).toString() : '';
                      let currency = editRow.currency || '$';
                      let formattedValue = valueStr;
                      if (valueStr) {
                        if (currency === 'Rs' || currency === 'INR') {
                          formattedValue = Number(valueStr).toLocaleString('en-IN');
                        } else {
                          formattedValue = Number(valueStr).toLocaleString('en-US');
                        }
                      }
                      return (
                        <td key={key} style={{ ...gridTheme.td, maxWidth: colWidths[i], minWidth: 80, width: colWidths[i] }}>
                          {valueStr ? `${formattedValue} ${currency}` : ''}
                        </td>
                      );
                    } else if (key === 'startDate') {
                      return (
                        <td key={key} style={{ ...gridTheme.td, maxWidth: colWidths[i], minWidth: 80, width: colWidths[i] }}>
                          <RoundedInput
                            type="date"
                            value={editRow.startDate || ''}
                            onChange={e => setEditRow({ ...editRow, startDate: e.target.value })}
                            placeholder="Start Date"
                            style={{ border: '1px solid #1976d2', width: '100%', minWidth: 80, maxWidth: colWidths[i] }}
                          />
                        </td>
                      );
                    } else {
                      return (
                        <td key={key} style={{ ...gridTheme.td, maxWidth: colWidths[i], minWidth: 80, width: colWidths[i] }}>
                          <RoundedInput value={editRow[key]} onChange={e => setEditRow({ ...editRow, [key]: e.target.value })} style={{ border: '1px solid #1976d2', maxWidth: colWidths[i], minWidth: 80, width: colWidths[i] }} />
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
                      let valueStr = value > 0 ? Math.round(value).toString() : '';
                      let currency = s.currency || '$';
                      let formattedValue = valueStr;
                      if (valueStr) {
                        if (currency === 'Rs' || currency === 'INR') {
                          formattedValue = Number(valueStr).toLocaleString('en-IN');
                        } else {
                          formattedValue = Number(valueStr).toLocaleString('en-US');
                        }
                      }
                      return (
                        <td key={key} style={{ ...gridTheme.td, maxWidth: colWidths[i], minWidth: 80, width: colWidths[i] }}>
                          {valueStr ? `${formattedValue} ${currency}` : ''}
                        </td>
                      );
                    } else if (key === 'startDate') {
                      // Format date as 'Month Date, yyyy'
                      let formatted = '';
                      if (s[key]) {
                        const d = new Date(s[key]);
                        if (!isNaN(d)) {
                          const options = { year: 'numeric', month: 'short', day: 'numeric' };
                          formatted = d.toLocaleDateString('en-US', options);
                        } else {
                          formatted = s[key];
                        }
                      }
                      return (
                        <td key={key} style={{ ...gridTheme.td, maxWidth: colWidths[i], minWidth: 80, width: colWidths[i] }}>{formatted}</td>
                      );
                    } else if (key === 'userShortName') {
                      return (
                        <td key={key} style={{ ...gridTheme.td, maxWidth: colWidths[i], minWidth: 140, width: colWidths[i] }}>
                          {editIdx === idx ? (
                            <RoundedDropdown
                              value={editRow.userShortName}
                              onChange={e => setEditRow({ ...editRow, userShortName: e.target.value })}
                              options={[{ value: '', label: 'Select' }, ...users.map(u => ({ value: u.shortName, label: u.shortName }))]}
                              placeholder="User"
                              style={{ width: '100%', minWidth: 130, maxWidth: colWidths[i] }}
                            />
                          ) : (
                            s.userShortName
                          )}
                        </td>
                      );
                    } else if (key === 'qtyCurrency') {
                      return (
                        <td key={key} style={{ ...gridTheme.td, maxWidth: colWidths[i], minWidth: 80, width: colWidths[i] }}>{s.qty}</td>
                      );
                    } else {
                      return (
                        <td key={key} style={{ ...gridTheme.td, maxWidth: colWidths[i], minWidth: 80, width: colWidths[i] }}>{s[key]}</td>
                      );
                    }
                  }
                });
                // Add actions cell
                if (editIdx === idx) {
                  cells.push(
                    <td key="actions" style={gridTheme.td}>
                      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <ActionButton onClick={() => handleSave(idx)} type="save" title="Save" />
                        <ActionButton onClick={handleCancel} type="cancel" title="Cancel" />
                      </div>
                    </td>
                  );
                } else {
                  cells.push(
                    <td key="actions" style={gridTheme.td}>
                      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
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
