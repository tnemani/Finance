import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PoliciesStocksIcon from '../components/icons/policies.png';
import GridBanner from '../components/GridBanner';
import { gridTheme } from '../components/gridTheme';
import { ActionButton } from '../components/ActionButton';
import ConfirmModal from '../components/ConfirmModal';
import RoundedInput from '../components/RoundedInput';
import RoundedDropdown from '../components/RoundedDropdown';
import { fetchSymbolSettingsMap } from '../utils/settingsUtils';
import { currencyOptions } from '../constants/Fixedlist';
import { formatCurrencyValue, getCurrencyDisplayLabel, formatMonthDayYear } from '../helpers/Helper';

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

const API_URL = 'http://localhost:5226/api/investment/policy';
const POLICY_TYPE = 'Policy';

// Column definitions for dynamic width calculation
const POLICY_COLUMNS = [
  { key: 'userShortName', label: 'User', type: 'dropdown' },
  { key: 'policyNo', label: 'Policy No', type: 'text' },
  { key: 'symbol', label: 'Symbol', type: 'text' },
  { key: 'qty', label: 'Qty', type: 'number' },
  { key: 'currency', label: 'Currency', type: 'dropdown' },
  { key: 'currentValue', label: 'Current Value', type: 'number' },
  { key: 'startDate', label: 'Start Date', type: 'date' },
  { key: 'financialnstitution', label: 'Financial Institution', type: 'text' },
  { key: 'description', label: 'Description', type: 'text' }
];

// Helper function to parse policy row data for API
const parsePolicyRow = (row) => ({
  ...row,
  qty: row.qty !== undefined && row.qty !== '' ? Number(row.qty) : null,
  currentValue: row.currentValue !== undefined && row.currentValue !== '' ? Number(row.currentValue) : null,
  userId: row.userId !== undefined ? Number(row.userId) : null
});

function PolicyPage() {
  const [policies, setPolicies] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filteredPolicies, setFilteredPolicies] = useState([]);
  const [editIdx, setEditIdx] = useState(null);
  const [editRow, setEditRow] = useState({});
  const [addRow, setAddRow] = useState({ userShortName: '', policyNo: '', symbol: '', qty: '', currency: '', currentValue: '', startDate: '', financialnstitution: '', description: '' });
  const [confirm, setConfirm] = useState({ open: false, idx: null });
  const [undoRow, setUndoRow] = useState(null);
  const [undoIdx, setUndoIdx] = useState(null);
  const [symbolValueMap, setSymbolValueMap] = useState({});

  // DiamondPage pattern: Define column structure
  const colKeys = ['userShortName', 'policyNo', 'symbol', 'qty', 'currency', 'currentValue', 'startDate', 'financialnstitution', 'description'];
  const colHeaders = ['User', 'Policy No', 'Symbol', 'Qty', 'Currency', 'Current Value', 'Start Date', 'Financial Institution', 'Description'];

  // Declare fetch functions first to avoid temporal dead zone
  const fetchPolicies = async () => {
    const res = await axios.get(API_URL);
    // Only keep records with type === 'Policy'
    setPolicies(res.data.filter(p => p.type === 'Policy'));
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
    fetchData: fetchPolicies,
    parseRow: parsePolicyRow,
    modalConfig: {
      update: 'Are you sure you want to update this policy?',
      delete: 'Are you sure you want to delete this policy?',
      add: 'Are you sure you want to add this policy?'
    },
    setConfirm
  });

  useEffect(() => { fetchPolicies(); fetchUsers(); fetchSymbolSettingsMap().then(setSymbolValueMap); }, []);

  useEffect(() => {
    setFilteredPolicies(createSearchFilter(policies, searchText));
  }, [searchText, policies]);

  const handleEdit = idx => {
    setEditIdx(idx);
    setEditRow({ ...filteredPolicies[idx] });
  };
  const handleCancel = () => {
    setEditIdx(null);
    setEditRow({});
  };
  const handleSave = async idx => {
    const row = editRow;
    // Map userShortName to userId
    const user = users.find(u => u.shortName === row.userShortName);
    const payload = {
      ...row,
      userId: user ? user.id : undefined,
      type: 'Policy'
    };
    delete payload.userShortName;
    await axios.put(`${API_URL}/${row.id}`, payload);
    setEditIdx(null);
    setEditRow({});
    fetchPolicies();
  };

  // Add common helper functions
  const columnFonts = createColumnFonts(colKeys.length);
  const allRows = createAllRows(addRow, filteredPolicies, editRow);

  function getTextWidth(text, font = '16px Arial') {
    if (typeof document === 'undefined') return 200;
    const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement('canvas'));
    const context = canvas.getContext('2d');
    context.font = font;
    return context.measureText(text).width;
  }

  // Calculate column widths based on content
  function getColWidth(key, header, index) {
    if (key === 'qty') {
      const headerWidth = getTextWidth(header, '16px Arial');
      const cellWidths = allRows.map(row => getTextWidth((row && row.qty) ? String(row.qty) : '', '16px Arial'));
      return Math.max(headerWidth, ...cellWidths, 120);
    } else if (key === 'userShortName') {
      const headerWidth = getTextWidth(header, '16px Arial');
      const cellWidths = allRows.map(row => getTextWidth((row && row[key]) ? String(row[key]) : '', '16px Arial'));
      return Math.max(headerWidth, ...cellWidths, 120);
    } else if (key === 'currency') {
      const headerWidth = getTextWidth(header, '16px Arial');
      const cellWidths = allRows.map(row => getTextWidth((row && row.currency) ? String(row.currency) : '', '16px Arial'));
      return Math.max(headerWidth, ...cellWidths, getTextWidth('Select', '16px Arial') + 40, 90) + 40;
    } else {
      const headerWidth = getTextWidth(header, '16px Arial');
      const cellWidths = allRows.map(row => getTextWidth((row && row[key]) ? String(row[key]) : '', '16px Arial'));
      return Math.max(headerWidth, ...cellWidths, 80) + 40;
    }
  }

  // Create user options for dropdowns
  const userOptions = users.map(u => ({ value: u.shortName, label: u.shortName }));

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
        title="Policies"
        searchText={searchText}
        setSearchText={setSearchText}
        placeholder="Search policies..."
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', textAlign: 'left', width: '100%' }}
        titleStyle={{ fontSize: 28, fontWeight: 600, marginLeft: 12, textAlign: 'left', display: 'inline-block' }}
        iconStyle={{ height: 40, display: 'inline-block' }}
      />
      <div style={{ height: 16 }} />
      <div style={{ width: 'fit-content',  margin: '0 auto', maxWidth: '100%' }}>
        <div style={{
          ...gridTheme.scrollContainer,
          maxHeight: 260, // 4 rows (48px each) + header (48px) + some padding
          minHeight: 0,
          overflowY: 'auto',
        }}>
          <table style={{ ...gridTheme.table, tableLayout: 'auto', minWidth: 900 }}>
            <thead>
              <tr>
                {colHeaders.map((header, i) => (
                  <th key={header} style={{ ...gridTheme.th, whiteSpace: 'normal', maxWidth: getColWidth(colKeys[i], header, i),  width: getColWidth(colKeys[i], header, i), textAlign: 'left', fontWeight: 600, fontSize: 16 }}>{header}</th>
                ))}
                <th style={{ ...gridTheme.th, whiteSpace: 'nowrap' }}></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                {colKeys.map((key, i) => (
                  key === 'qty' ? (
                    <td key={key} style={{ ...gridTheme.td, maxWidth: getColWidth(key, colHeaders[i], i),  width: getColWidth(key, colHeaders[i], i), paddingRight: 8 }}>
                      <RoundedInput
                        value={addRow.qty}
                        onChange={e => setAddRow({ ...addRow, qty: e.target.value })}
                        placeholder="Quantity"
                        style={{ width: '100%',  maxWidth: getColWidth(key, colHeaders[i], i), textAlign: 'left' }}
                        colFonts={columnFonts}
                        colHeaders={colHeaders}
                        allRows={allRows}
                        colKey={key}
                        i={i}
                      />
                    </td>
                  ) : key === 'userShortName' ? (
                    <td key={key} style={{ ...gridTheme.td, maxWidth: getColWidth(key, colHeaders[i], i),  width: getColWidth(key, colHeaders[i], i) }}>
                      <RoundedDropdown
                        value={addRow.userShortName}
                        onChange={e => setAddRow({ ...addRow, userShortName: e.target.value })}
                        options={userOptions}
                        placeholder="User"
                        style={{ width: '100%',  maxWidth: getColWidth(key, colHeaders[i], i) }}
                        colFonts={columnFonts}
                        colHeaders={colHeaders}
                        allRows={allRows}
                        colKey={key}
                        i={i}
                      />
                    </td>
                  ) : key === 'currency' ? (
                    <td key={key} style={{ ...gridTheme.td, maxWidth: getColWidth(key, colHeaders[i], i),  width: getColWidth(key, colHeaders[i], i) }}>
                      <RoundedDropdown
                        value={addRow.currency}
                        onChange={e => setAddRow({ ...addRow, currency: e.target.value })}
                        options={currencyOptions}
                        placeholder="Currency"
                        style={{ width: '100%',  maxWidth: getColWidth(key, colHeaders[i], i) }}
                        colFonts={columnFonts}
                        colHeaders={colHeaders}
                        allRows={allRows}
                        colKey={key}
                        i={i}
                      />
                    </td>
                  ) : key === 'currentValue' ? (
                    <td key={key} style={{ ...gridTheme.td, maxWidth: getColWidth(key, colHeaders[i], i),  width: getColWidth(key, colHeaders[i], i) }}></td>
                  ) : key === 'startDate' ? (
                    <td key={key} style={{ ...gridTheme.td, maxWidth: getColWidth(key, colHeaders[i], i),  width: getColWidth(key, colHeaders[i], i) }}>
                      <RoundedInput
                        type="date"
                        value={addRow.startDate}
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
                    <td key={key} style={{ ...gridTheme.td}}>
                      <RoundedInput 
                        value={addRow[key]} 
                        onChange={e => setAddRow({ ...addRow, [key]: e.target.value })} 
                        placeholder={colHeaders[i]} 
                        style={{ }}
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
                    <ActionButton onClick={() => setAddRow({ userShortName: '', policyNo: '', symbol: '', qty: '', currency: '', currentValue: '', startDate: '', financialnstitution: '', description: '' })} type="undo" title="Undo" />
                  </div>
                </td>
              </tr>
              {filteredPolicies.map((s, idx) => {
                let cells = colKeys.map((key, i) => {
                  if (editIdx === idx) {
                    if (key === 'qty') {
                      return (
                        <td key={key} style={{ ...gridTheme.td, paddingRight: 8 }}>
                          <RoundedInput
                            value={editRow.qty}
                            onChange={e => setEditRow({ ...editRow, qty: e.target.value })}
                            placeholder="Quantity"
                            style={{ width: '100%',  maxWidth: getColWidth(key, colHeaders[i], i), textAlign: 'left' }}
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
                        <td key={key} style={{ ...gridTheme.td, maxWidth: getColWidth(key, colHeaders[i], i),  width: getColWidth(key, colHeaders[i], i) }}>
                          <RoundedDropdown
                            value={editRow.userShortName}
                            onChange={e => setEditRow({ ...editRow, userShortName: e.target.value })}
                            options={userOptions}
                            placeholder="User"
                            style={{ width: '100%',  maxWidth: getColWidth(key, colHeaders[i], i) }}
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
                        <td key={key} style={{ ...gridTheme.td, maxWidth: getColWidth(key, colHeaders[i], i),  width: getColWidth(key, colHeaders[i], i) }}>
                          <RoundedDropdown
                            value={editRow.currency}
                            onChange={e => setEditRow({ ...editRow, currency: e.target.value })}
                            options={currencyOptions}
                            placeholder="Currency"
                            style={{ width: '100%',  maxWidth: getColWidth(key, colHeaders[i], i) }}
                            colFonts={columnFonts}
                            colHeaders={colHeaders}
                            allRows={allRows}
                            colKey={key}
                            i={i}
                          />
                        </td>
                      );
                    } else if (key === 'currentValue') {
                      return (
                        <td key={key} style={{ ...gridTheme.td, maxWidth: getColWidth(key, colHeaders[i], i),  width: getColWidth(key, colHeaders[i], i) }}></td>
                      );
                    } else if (key === 'startDate') {
                      return (
                        <td key={key} style={{ ...gridTheme.td, maxWidth: getColWidth(key, colHeaders[i], i),  width: getColWidth(key, colHeaders[i], i) }}>
                          <RoundedInput
                            type="date"
                            value={editRow.startDate}
                            onChange={e => setEditRow({ ...editRow, startDate: e.target.value })}
                            placeholder="Start Date"
                            style={{ border: '1px solid #1976d2', width: '100%', maxWidth: getColWidth(key, colHeaders[i], i) }}
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
                        <td key={key} style={{ ...gridTheme.td, maxWidth: getColWidth(key, colHeaders[i], i),  width: getColWidth(key, colHeaders[i], i) }}>
                          <RoundedInput 
                            value={editRow[key]} 
                            onChange={e => setEditRow({ ...editRow, [key]: e.target.value })} 
                            style={{ border: '1px solid #1976d2', maxWidth: getColWidth(key, colHeaders[i], i),  width: getColWidth(key, colHeaders[i], i) }}
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
                    if (key === 'qty') {
                      return (
                        <td key={key} style={{ ...gridTheme.td, maxWidth: getColWidth(key, colHeaders[i], i),  width: getColWidth(key, colHeaders[i], i), overflow: 'hidden', whiteSpace: 'nowrap', paddingRight: 8 }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', width: '100%', overflow: 'hidden', whiteSpace: 'nowrap', justifyContent: 'flex-start' }}>
                            <span style={{  textAlign: 'left', font: columnFonts[i] }}>{s.qty}</span>
                          </span>
                        </td>
                      );
                    } else if (key === 'userShortName') {
                      return (
                        <td key={key} style={{ ...gridTheme.td, maxWidth: getColWidth(key, colHeaders[i], i),  width: getColWidth(key, colHeaders[i], i) }}>
                          {s.userShortName}
                        </td>
                      );
                    } else if (key === 'currentValue') {
                      // Show qty * random number (simulate price) and currency, no decimals, formatted by currency
                      const price = 10 + (s.id ? (s.id % 10) : Math.floor(Math.random() * 10));
                      const value = (parseFloat(s.qty) || 0) * price;
                      let currency = s.currency;
                      const formattedValue = formatCurrencyValue(value, currency);
                      return (
                        <td key={key} style={{ ...gridTheme.td, maxWidth: getColWidth(key, colHeaders[i], i),  width: getColWidth(key, colHeaders[i], i), textAlign: 'right' }}>
                          {formattedValue ? `${formattedValue}` : ''}
                        </td>
                      );
                    } else if (key === 'startDate') {
                     return (
                        <td key={key} style={{ ...gridTheme.td, maxWidth: getColWidth(key, colHeaders[i], i),  width: getColWidth(key, colHeaders[i], i) }}>{formatMonthDayYear(s[key])}</td>
                      );
                    } else if (key === 'currency') {
                      return (
                        <td key={key} style={{ ...gridTheme.td, maxWidth: getColWidth(key, colHeaders[i], i),  width: getColWidth(key, colHeaders[i], i) }}>{getCurrencyDisplayLabel(s.currency)}</td>
                      );
                    } else {
                      return (
                        <td key={key} style={{ ...gridTheme.td, maxWidth: getColWidth(key, colHeaders[i], i),  width: getColWidth(key, colHeaders[i], i) }}>{s[key]}</td>
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

export default PolicyPage;
