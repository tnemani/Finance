import React, { useEffect, useState } from 'react';
import axios from 'axios';
import GridBanner from '../components/GridBanner';
import { gridTheme } from '../components/gridTheme';
import { ActionButton } from '../components/ActionButton';
import ConfirmModal from '../components/ConfirmModal';
import RoundedInput from '../components/RoundedInput';
import RoundedDropdown from '../components/RoundedDropdown';
import { fetchSymbolSettingsMap } from '../utils/settingsUtils';
import { currencyOptions } from '../constants/Fixedlist';
import { formatCurrencyValue, getCurrencyDisplayLabel, formatMonthDayYear } from '../helpers/Helper';
import FourOhOneKIcon from '../components/icons/401k.png';

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

const API_URL = 'http://localhost:5226/api/investment/401k';
const FOUR_OH_ONE_K_TYPE = '401K';

// Column definitions for dynamic width calculation
const FOUR_OH_ONE_K_COLUMNS = [
  { key: 'userShortName', label: 'User', type: 'dropdown' },
  { key: 'accountNo', label: 'Account No', type: 'text' },
  { key: 'symbol', label: 'Symbol', type: 'text' },
  { key: 'qty', label: 'Qty', type: 'number' },
  { key: 'currency', label: 'Currency', type: 'dropdown' },
  { key: 'currentValue', label: 'Current Value', type: 'number' },
  { key: 'startDate', label: 'Start Date', type: 'date' },
  { key: 'financialnstitution', label: 'Financial Institution', type: 'text' },
  { key: 'description', label: 'Description', type: 'text' }
];

// Helper function to parse 401K row data for API
const parse401KRow = (row) => ({
  ...row,
  qty: row.qty !== undefined && row.qty !== '' ? Number(row.qty) : null,
  currentValue: row.currentValue !== undefined && row.currentValue !== '' ? Number(row.currentValue) : null,
  userId: row.userId !== undefined ? Number(row.userId) : null
});

function FourOhOneKPage() {
  const [fourOhOneKs, setFourOhOneKs] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filteredFourOhOneKs, setFilteredFourOhOneKs] = useState([]);
  const [editIdx, setEditIdx] = useState(null);
  const [editRow, setEditRow] = useState({});
  const [addRow, setAddRow] = useState({ userShortName: '', accountNo: '', symbol: '', qty: '', currency: '', currentValue: '', startDate: '', financialnstitution: '', description: '' });
  const [confirm, setConfirm] = useState({ open: false, idx: null });
  const [undoRow, setUndoRow] = useState(null);
  const [undoIdx, setUndoIdx] = useState(null);
  const [symbolValueMap, setSymbolValueMap] = useState({});

  // Define column structure
  const colKeys = ['userShortName', 'accountNo', 'symbol', 'qty', 'currency', 'currentValue', 'startDate', 'financialnstitution', 'description'];
  const colHeaders = ['User', 'Account No', 'Symbol', 'Qty', 'Currency', 'Current Value', 'Start Date', 'Financial Institution', 'Description'];

  // Declare fetch functions first to avoid temporal dead zone
  const fetch401Ks = async () => {
    const res = await axios.get(API_URL);
    // Only keep records with type === '401K'
    setFourOhOneKs(res.data.filter(p => p.type === '401K'));
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
    fetchData: fetch401Ks,
    parseRow: parse401KRow,
    modalConfig: {
      update: 'Are you sure you want to update this 401K account?',
      delete: 'Are you sure you want to delete this 401K account?',
      add: 'Are you sure you want to add this 401K account?'
    },
    setConfirm
  });

  useEffect(() => {
    fetchUsers();
    fetch401Ks();
    fetchSymbolSettingsMap().then(setSymbolValueMap);
  }, []);

  useEffect(() => {
    setFilteredFourOhOneKs(createSearchFilter(fourOhOneKs, searchText));
  }, [searchText, fourOhOneKs]);

  const handleEdit = idx => {
    setEditIdx(idx);
    setEditRow({ ...filteredFourOhOneKs[idx] });
  };

  const handleCancel = () => {
    setEditIdx(null);
    setEditRow({});
  };

  const handleSave = async idx => {
    await handleRowSave(filteredFourOhOneKs[idx].id, editRow);
    setEditIdx(null);
    setEditRow({});
  };

  // Add common helper functions
  const columnFonts = createColumnFonts(colKeys.length);
  const allRows = createAllRows(addRow, filteredFourOhOneKs, editRow);

  function getTextWidth(text, font = '16px Arial') {
    if (typeof document === 'undefined') return 200;
    const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement('canvas'));
    const context = canvas.getContext('2d');
    context.font = font;
    return context.measureText(text).width;
  }

  // Calculate column widths based on content
  function getColWidth(key, header, index) {
    const headerWidth = getTextWidth(header, '16px Arial');
    const cellWidths = allRows.map(row => getTextWidth((row && row[key]) ? String(row[key]) : '', '16px Arial'));
    return Math.max(headerWidth, ...cellWidths, 120) + 40;
  }

  // Create user options for dropdowns
  const userOptions = users.map(u => ({ value: u.shortName, label: u.shortName }));

  return (
    <div style={{ padding: 0, paddingTop: 0 }}>
      <ConfirmModal 
        open={confirm.open} 
        message={confirm.message || "Are you sure you want to delete this record?"} 
        onConfirm={confirm.onConfirm} 
        onCancel={() => setConfirm({ open: false, idx: null })} 
      />
      <GridBanner
        icon={FourOhOneKIcon}
        title="401K Accounts"
        searchText={searchText}
        setSearchText={setSearchText}
        placeholder="Search 401K accounts..."
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', textAlign: 'left', width: '100%' }}
        titleStyle={{ fontSize: 28, fontWeight: 600, marginLeft: 12, textAlign: 'left', display: 'inline-block' }}
        iconStyle={{ height: 40, display: 'inline-block' }}
      />
      <div style={{ height: 16 }} />
      <div style={{ width: 'fit-content', margin: '0 auto'}}>
        <div style={{ ...gridTheme.scrollContainer, maxHeight: 800, overflowY: 'auto' }}>
          <table style={gridTheme.table}>
            <thead>
              <tr>
                {colHeaders.map((header, i) => (
                  <th key={header} style={{ ...gridTheme.th, whiteSpace: 'normal', maxWidth: getColWidth(colKeys[i], header, i), width: getColWidth(colKeys[i], header, i), textAlign: 'left', fontWeight: 600, fontSize: 16 }}>{header}</th>
                ))}
                <th style={{ ...gridTheme.th, whiteSpace: 'nowrap' }}></th>
              </tr>
            </thead>
            <tbody>
              {/* Add row */}
              <tr>
                {colKeys.map((key, i) => (
                  key === 'userShortName' ? (
                    <td key={key} style={{ ...gridTheme.td }}>
                      <RoundedDropdown
                        value={addRow.userShortName}
                        onChange={e => setAddRow({ ...addRow, userShortName: e.target.value })}
                        options={userOptions}
                        placeholder="User"
                        colFonts={columnFonts}
                        colHeaders={colHeaders}
                        allRows={allRows}
                        colKey={key}
                        i={i}
                      />
                    </td>
                  ) : key === 'currency' ? (
                    <td key={key} style={{ ...gridTheme.td }}>
                      <RoundedDropdown
                        value={addRow.currency}
                        onChange={e => setAddRow({ ...addRow, currency: e.target.value })}
                        options={currencyOptions}
                        placeholder="Currency"
                        colFonts={columnFonts}
                        colHeaders={colHeaders}
                        allRows={allRows}
                        colKey={key}
                        i={i}
                      />
                    </td>
                  ) : key === 'startDate' ? (
                    <td key={key} style={{ ...gridTheme.td }}>
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
                    <td key={key} style={{ ...gridTheme.td }}>
                      <RoundedInput 
                        value={addRow[key]} 
                        onChange={e => setAddRow({ ...addRow, [key]: e.target.value })} 
                        placeholder={colHeaders[i]} 
                        type={key === 'qty' || key === 'currentValue' ? 'number' : 'text'}
                        colFonts={columnFonts}
                        colHeaders={colHeaders}
                        allRows={allRows}
                        colKey={key}
                        i={i}
                      />
                    </td>
                  )
                ))}
                <td style={{ ...gridTheme.td }}>
                  <div style={ACTION_BUTTON_CONTAINER_STYLE}>
                    <ActionButton type="save" onClick={() => handleAdd(addRow)} title="Add 401K Account" />
                    <ActionButton type="reset" onClick={() => setAddRow({ userShortName: '', accountNo: '', symbol: '', qty: '', currency: '', currentValue: '', startDate: '', financialnstitution: '', description: '' })} title="Reset" />
                  </div>
                </td>
              </tr>
              
              {/* Data rows */}
              {filteredFourOhOneKs.map((account, idx) => (
                editIdx === idx ? (
                  <tr key={account.id}>
                    {colKeys.map((key, i) => (
                      key === 'userShortName' ? (
                        <td key={key} style={{ ...gridTheme.td }}>
                          <RoundedDropdown
                            value={editRow.userShortName}
                            onChange={e => setEditRow({ ...editRow, userShortName: e.target.value })}
                            options={userOptions}
                            placeholder="User"
                            style={{ border: '1px solid #1976d2' }}
                            colFonts={columnFonts}
                            colHeaders={colHeaders}
                            allRows={allRows}
                            colKey={key}
                            i={i}
                          />
                        </td>
                      ) : key === 'currency' ? (
                        <td key={key} style={{ ...gridTheme.td }}>
                          <RoundedDropdown
                            value={editRow.currency}
                            onChange={e => setEditRow({ ...editRow, currency: e.target.value })}
                            options={currencyOptions}
                            placeholder="Currency"
                            style={{ border: '1px solid #1976d2' }}
                            colFonts={columnFonts}
                            colHeaders={colHeaders}
                            allRows={allRows}
                            colKey={key}
                            i={i}
                          />
                        </td>
                      ) : key === 'startDate' ? (
                        <td key={key} style={{ ...gridTheme.td }}>
                          <RoundedInput
                            type="date"
                            value={editRow.startDate || ''}
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
                      ) : (
                        <td key={key} style={{ ...gridTheme.td }}>
                          <RoundedInput 
                            value={editRow[key] || ''} 
                            onChange={e => setEditRow({ ...editRow, [key]: e.target.value })} 
                            style={{ border: '1px solid #1976d2' }}
                            type={key === 'qty' || key === 'currentValue' ? 'number' : 'text'}
                            colFonts={columnFonts}
                            colHeaders={colHeaders}
                            allRows={allRows}
                            colKey={key}
                            i={i}
                          />
                        </td>
                      )
                    ))}
                    <td style={{ ...gridTheme.td }}>
                      <div style={ACTION_BUTTON_CONTAINER_STYLE}>
                        <ActionButton type="save" onClick={() => handleSave(idx)} title="Save" />
                        <ActionButton type="cancel" onClick={handleCancel} title="Cancel" />
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={account.id}>
                    {colKeys.map((key, i) => (
                      <td key={key} style={{ ...gridTheme.td }}>
                        {key === 'currentValue' ? (
                          formatCurrencyValue(account[key], account.currency)
                        ) : key === 'startDate' ? (
                          account[key] ? formatMonthDayYear(account[key]) : ''
                        ) : key === 'currency' ? (
                          getCurrencyDisplayLabel(account[key])
                        ) : (
                          account[key] || ''
                        )}
                      </td>
                    ))}
                    <td style={{ ...gridTheme.td }}>
                      <div style={ACTION_BUTTON_CONTAINER_STYLE}>
                        <ActionButton type="edit" onClick={() => handleEdit(idx)} title="Edit" />
                        <ActionButton type="delete" onClick={() => handleDelete(account.id)} title="Delete" />
                      </div>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default FourOhOneKPage;
