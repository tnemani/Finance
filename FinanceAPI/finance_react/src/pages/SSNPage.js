import React, { useEffect, useState } from 'react';
import axios from 'axios';
import GridBanner from '../components/GridBanner';
import { gridTheme } from '../components/gridTheme';
import { ActionButton } from '../components/ActionButton';
import ConfirmModal from '../components/ConfirmModal';
import RoundedInput from '../components/RoundedInput';
import RoundedDropdown from '../components/RoundedDropdown';
import { currencyOptions } from '../constants/Fixedlist';
import { formatCurrencyValue, getCurrencyDisplayLabel, formatMonthDayYear } from '../helpers/Helper';
import SSNIcon from '../components/icons/ssn.png';

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

const API_URL = 'http://localhost:5226/api/investment/ssn';
const SSN_TYPE = 'SSN';

// Column definitions for dynamic width calculation
const SSN_COLUMNS = [
  { key: 'userShortName', label: 'User', type: 'dropdown' },
  { key: 'ssnNumber', label: 'SSN Number', type: 'text' },
  { key: 'benefitType', label: 'Benefit Type', type: 'text' },
  { key: 'monthlyBenefit', label: 'Monthly Benefit', type: 'number' },
  { key: 'currency', label: 'Currency', type: 'dropdown' },
  { key: 'startDate', label: 'Start Date', type: 'date' },
  { key: 'endDate', label: 'End Date', type: 'date' },
  { key: 'status', label: 'Status', type: 'text' },
  { key: 'description', label: 'Description', type: 'text' }
];

// Helper function to parse SSN row data for API
const parseSSNRow = (row) => ({
  ...row,
  monthlyBenefit: row.monthlyBenefit !== undefined && row.monthlyBenefit !== '' ? Number(row.monthlyBenefit) : null,
  userId: row.userId !== undefined ? Number(row.userId) : null
});

function SSNPage() {
  const [ssnAccounts, setSsnAccounts] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filteredSsnAccounts, setFilteredSsnAccounts] = useState([]);
  const [editIdx, setEditIdx] = useState(null);
  const [editRow, setEditRow] = useState({});
  const [addRow, setAddRow] = useState({ userShortName: '', ssnNumber: '', benefitType: '', monthlyBenefit: '', currency: '', startDate: '', endDate: '', status: '', description: '' });
  const [confirm, setConfirm] = useState({ open: false, idx: null });
  const [undoRow, setUndoRow] = useState(null);
  const [undoIdx, setUndoIdx] = useState(null);

  // Define column structure
  const colKeys = ['userShortName', 'ssnNumber', 'benefitType', 'monthlyBenefit', 'currency', 'startDate', 'endDate', 'status', 'description'];
  const colHeaders = ['User', 'SSN Number', 'Benefit Type', 'Monthly Benefit', 'Currency', 'Start Date', 'End Date', 'Status', 'Description'];

  // Declare fetch functions first to avoid temporal dead zone
  const fetchSSNAccounts = async () => {
    const res = await axios.get(API_URL);
    // Only keep records with type === 'SSN'
    setSsnAccounts(res.data.filter(p => p.type === 'SSN'));
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
    fetchData: fetchSSNAccounts,
    parseRow: parseSSNRow,
    modalConfig: {
      update: 'Are you sure you want to update this SSN benefit?',
      delete: 'Are you sure you want to delete this SSN benefit?',
      add: 'Are you sure you want to add this SSN benefit?'
    },
    setConfirm
  });

  useEffect(() => {
    fetchUsers();
    fetchSSNAccounts();
  }, []);

  useEffect(() => {
    setFilteredSsnAccounts(createSearchFilter(ssnAccounts, searchText));
  }, [searchText, ssnAccounts]);

  const handleEdit = idx => {
    setEditIdx(idx);
    setEditRow({ ...filteredSsnAccounts[idx] });
  };

  const handleCancel = () => {
    setEditIdx(null);
    setEditRow({});
  };

  const handleSave = async idx => {
    await handleRowSave(filteredSsnAccounts[idx].id, editRow);
    setEditIdx(null);
    setEditRow({});
  };

  // Add common helper functions
  const columnFonts = createColumnFonts(colKeys.length);
  const allRows = createAllRows(addRow, filteredSsnAccounts, editRow);

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

  // Status options for dropdown
  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Inactive', label: 'Inactive' },
    { value: 'Suspended', label: 'Suspended' }
  ];

  return (
    <div style={{ padding: 0, paddingTop: 0 }}>
      <ConfirmModal 
        open={confirm.open} 
        message={confirm.message || "Are you sure you want to delete this record?"} 
        onConfirm={confirm.onConfirm} 
        onCancel={() => setConfirm({ open: false, idx: null })} 
      />
      <GridBanner
        icon={SSNIcon}
        title="SSN Benefits"
        searchText={searchText}
        setSearchText={setSearchText}
        placeholder="Search SSN benefits..."
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
                  ) : key === 'status' ? (
                    <td key={key} style={{ ...gridTheme.td }}>
                      <RoundedDropdown
                        value={addRow.status}
                        onChange={e => setAddRow({ ...addRow, status: e.target.value })}
                        options={statusOptions}
                        placeholder="Status"
                        colFonts={columnFonts}
                        colHeaders={colHeaders}
                        allRows={allRows}
                        colKey={key}
                        i={i}
                      />
                    </td>
                  ) : key === 'startDate' || key === 'endDate' ? (
                    <td key={key} style={{ ...gridTheme.td }}>
                      <RoundedInput
                        type="date"
                        value={addRow[key]}
                        onChange={e => setAddRow({ ...addRow, [key]: e.target.value })}
                        placeholder={colHeaders[i]}
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
                        type={key === 'monthlyBenefit' ? 'number' : 'text'}
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
                    <ActionButton type="save" onClick={() => handleAdd(addRow)} title="Add SSN Benefit" />
                    <ActionButton type="reset" onClick={() => setAddRow({ userShortName: '', ssnNumber: '', benefitType: '', monthlyBenefit: '', currency: '', startDate: '', endDate: '', status: '', description: '' })} title="Reset" />
                  </div>
                </td>
              </tr>
              
              {/* Data rows */}
              {filteredSsnAccounts.map((account, idx) => (
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
                      ) : key === 'status' ? (
                        <td key={key} style={{ ...gridTheme.td }}>
                          <RoundedDropdown
                            value={editRow.status}
                            onChange={e => setEditRow({ ...editRow, status: e.target.value })}
                            options={statusOptions}
                            placeholder="Status"
                            style={{ border: '1px solid #1976d2' }}
                            colFonts={columnFonts}
                            colHeaders={colHeaders}
                            allRows={allRows}
                            colKey={key}
                            i={i}
                          />
                        </td>
                      ) : key === 'startDate' || key === 'endDate' ? (
                        <td key={key} style={{ ...gridTheme.td }}>
                          <RoundedInput
                            type="date"
                            value={editRow[key] || ''}
                            onChange={e => setEditRow({ ...editRow, [key]: e.target.value })}
                            placeholder={colHeaders[i]}
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
                            type={key === 'monthlyBenefit' ? 'number' : 'text'}
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
                        {key === 'monthlyBenefit' ? (
                          formatCurrencyValue(account[key], account.currency)
                        ) : key === 'startDate' || key === 'endDate' ? (
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

export default SSNPage;
