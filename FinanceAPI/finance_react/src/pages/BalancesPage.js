import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ActionButton } from '../components/ActionButton';
import GridBanner from '../components/GridBanner';
import { gridTheme } from '../components/gridTheme';
import { currencyOptions } from '../constants/Fixedlist';
import RoundedInput from '../components/RoundedInput';
import RoundedDropdown from '../components/RoundedDropdown';
import ConfirmModal from '../components/ConfirmModal';
import { inputTheme } from '../components/inputTheme';
import {formatCurrencyValue, getCurrencyDisplayLabel} from '../helpers/Helper';
import paymentIcon from '../components/icons/earnings_banner.png';
import {
  SPACING,
  FLEX_ROW_CENTER,
  PAGE_CONTAINER_STYLE,
  TABLE_CONTAINER_STYLE,
  SCROLL_CONTAINER_STYLE,
  ACTION_BUTTON_CONTAINER_STYLE,
  createGenericHandlers,
  createSearchFilter,
  createColumnFonts,
  createAllRows
} from '../constants/common';
import '../constants/common.css';

// Helper to measure text width in px for a given font
function getTextWidth(text, font = '16px Arial') {
  if (typeof document === 'undefined') return 120; // fallback for SSR
  const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement('canvas'));
  const context = canvas.getContext('2d');
  context.font = font;
  return context.measureText(text).width;
}

const API_URL = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:5226/api') + '/balances';

// Column definitions for consistent use
const BALANCE_COLUMNS = {
  keys: ['balanceType', 'totalBalance', 'currency', 'remarks'],
  headers: ['Balance Type', 'Total Balance', 'Currency', 'Remarks'],
  types: ['text', 'number', 'text', 'text'],
  placeholders: ['Account type', 'Amount', 'Currency', 'Additional notes']
};

function BalancesPage() {
  const [balances, setBalances] = useState([]);
  const [editRowId, setEditRowId] = useState(null);
  const [editRowData, setEditRowData] = useState({});
  const [newRow, setNewRow] = useState({});
  const [searchText, setSearchText] = useState('');
  const [filteredBalances, setFilteredBalances] = useState([]);
  const [remarksList, setRemarksList] = useState(filteredBalances.map(b => b.remarks || ''));
  const [confirm, setConfirm] = useState({ open: false, message: '', onConfirm: null });

  // Define column structure similar to DiamondPage
  const colKeys = ['bankName', 'requiredAmount', 'inProgressAmount', 'balanceAmount', 'remarks'];
  const colHeaders = ['Bank Name', 'Required', 'In Progress', 'Balance', 'Remarks'];
  const allRows = createAllRows(newRow, filteredBalances, editRowData);
  const colFonts = createColumnFonts(colKeys.length);

  const fetchBalances = async () => {
    const res = await axios.get(API_URL);
    setBalances(res.data);
  };

  // Common handlers
  const {
    handleAdd: baseHandleAdd,
    handleDelete,
    handleRowEdit,
    handleRowSave: baseHandleRowSave,
    handleRowCancel,
    handleRowChange
  } = createGenericHandlers(
    API_URL,
    setBalances,
    setEditRowId,
    setEditRowData,
    setNewRow,
    setConfirm,
    fetchBalances
  );

  // Custom handlers that use the base ones
  const handleAdd = () => baseHandleAdd(parseBalanceRow(newRow));
  const handleRowSave = (id) => baseHandleRowSave(id, parseBalanceRow(editRowData));

  useEffect(() => { fetchBalances(); }, []);
  useEffect(() => {
    let sorted = [...balances];
    sorted.sort((a, b) => {
      // $ first, then Rs, then others alphabetically
      const currencyOrder = c => c === '$' ? 0 : c === 'Rs' ? 1 : 2;
      const aOrder = currencyOrder(a.currency);
      const bOrder = currencyOrder(b.currency);
      if (aOrder !== bOrder) return aOrder - bOrder;
      // If same order, sort by currency alphabetically
      if (a.currency !== b.currency) return (a.currency || '').localeCompare(b.currency || '');
      // Otherwise, keep original order
      return 0;
    });
    setFilteredBalances(createSearchFilter(sorted, searchText));
  }, [searchText, balances]);
  
  useEffect(() => {
    setRemarksList(filteredBalances.map(b => b.remarks || ''));
  }, [filteredBalances]);

  // Convert string inputs to numbers for numeric fields before sending to backend
  const parseBalanceRow = (row) => ({
    ...row,
    maxLimitAmount: row.maxLimitAmount !== undefined && row.maxLimitAmount !== '' ? Number(row.maxLimitAmount) : null,
    requiredAmount: row.requiredAmount !== undefined && row.requiredAmount !== '' ? Number(row.requiredAmount) : null,
    inProgressAmount: row.inProgressAmount !== undefined && row.inProgressAmount !== '' ? Number(row.inProgressAmount) : null,
    balanceAmount: row.balanceAmount !== undefined && row.balanceAmount !== '' ? Number(row.balanceAmount) : null,
    // If bankDetails is a string, keep as is; if number, convert
    bankDetails: row.bankDetails !== undefined && row.bankDetails !== '' ? row.bankDetails : null,
  });


  const bankNameFont = '16px Arial'; // match your input font
  const allBankNames = [
    (newRow.bankName || '').trim(),
    ...filteredBalances.map(b => (b.bankName || '').trim()),
    (editRowData.bankName || '').trim()
  ];
  const maxBankNameWidth = Math.max(120, ...allBankNames.map(name => getTextWidth(name, bankNameFont))) + 24; // 24px buffer for padding/border

  const inputFont = '16px Arial'; // match your input font
  const getMaxWidth = (values, min = 90, buffer = 16) => Math.max(min, ...values.map(v => getTextWidth(String(v ?? '').trim(), inputFont))) + buffer;

  const allRequired = [newRow.requiredAmount, ...filteredBalances.map(b => b.requiredAmount), editRowData.requiredAmount];
  const allInProgress = [newRow.inProgressAmount, ...filteredBalances.map(b => b.inProgressAmount), editRowData.inProgressAmount];
  const allBalance = [newRow.balanceAmount, ...filteredBalances.map(b => b.balanceAmount), editRowData.balanceAmount];
  const allRemarks = [newRow.remarks, ...filteredBalances.map(b => b.remarks), editRowData.remarks];

  const maxRequiredWidth = getMaxWidth(allRequired);
  const maxInProgressWidth = getMaxWidth(allInProgress);
  const maxBalanceWidth = getMaxWidth(allBalance);
  const maxRemarksWidth = getMaxWidth(allRemarks, 120);

  const totalGridMinWidth = maxBankNameWidth + maxRequiredWidth + maxInProgressWidth + maxBalanceWidth + maxRemarksWidth + 140; // reduced buffer for action buttons and padding

  // Example: Show a rounded list of all unique currencies in the balances table
  const uniqueCurrencies = Array.from(new Set(filteredBalances.map(b => b.currency).filter(Boolean)));

  return (
    <div className="page-container">
      <GridBanner
        icon={require('../components/icons/balances_banner.png')}
        title="Balances"
        searchText={searchText}
        setSearchText={setSearchText}
        placeholder="Search balances..."
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', textAlign: 'left', width: '100%' }}
        titleStyle={{ fontSize: 28, fontWeight: 600, marginLeft: 12, textAlign: 'left', display: 'inline-block' }}
        iconStyle={{ height: 40, display: 'inline-block' }}
      />
      <div style={{ height: 12 }} />
      <div style={{ minWidth: totalGridMinWidth, margin: '0 auto', display: 'flex', justifyContent: 'center' }}>
        {/* Set maxHeight to show 10 rows (10 * 40px = 400px) */}
        <div style={{ ...gridTheme.scrollContainer, maxHeight: 400, overflowY: 'auto', overflowX: 'hidden', display: 'flex', justifyContent: 'center' }}>
          <table style={{ ...gridTheme.table, minWidth: totalGridMinWidth, width: 'min-content', margin: '0 auto' }}>
            <thead>
              <tr>
                {colHeaders.map((header, i) => (
                  <th key={header} style={gridTheme.th}>{header}</th>
                ))}
                <th style={gridTheme.th}></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                {colKeys.map((key, i) => (
                  <td key={key} style={gridTheme.td}>
                    {key === 'bankName' ? (
                      <div style={FLEX_ROW_CENTER}>
                        <RoundedInput
                          value={newRow.bankName || ''}
                          onChange={e => setNewRow({ ...newRow, bankName: e.target.value })}
                          placeholder="Bank Name"
                          disabled={editRowId !== null}
                          colFonts={colFonts}
                          colHeaders={colHeaders}
                          allRows={allRows}
                          colKey={key}
                          i={i}
                          style={{ ...inputTheme }}
                        />
                        <RoundedDropdown
                          value={newRow.currency || ''}
                          onChange={e => setNewRow({ ...newRow, currency: e.target.value })}
                          options={currencyOptions}
                          placeholder="Currency"
                          style={{ ...inputTheme }}
                        />
                      </div>
                    ) : key === 'requiredAmount' || key === 'inProgressAmount' || key === 'balanceAmount' ? (
                      <div style={FLEX_ROW_CENTER}>
                        <RoundedInput
                          type="number"
                          value={newRow[key] || ''}
                          onChange={e => setNewRow({ ...newRow, [key]: e.target.value })}
                          placeholder={colHeaders[i]}
                          disabled={editRowId !== null}
                          colFonts={colFonts}
                          colHeaders={colHeaders}
                          allRows={allRows}
                          colKey={key}
                          i={i}
                          style={{ ...inputTheme }}
                        />
                        {newRow.currency ? <span style={{ marginLeft: 4 }}>{newRow.currency}</span> : null}
                      </div>
                    ) : (
                      <RoundedInput
                        value={newRow[key] || ''}
                        onChange={e => setNewRow({ ...newRow, [key]: e.target.value })}
                        placeholder={colHeaders[i]}
                        disabled={editRowId !== null}
                        colFonts={colFonts}
                        colHeaders={colHeaders}
                        allRows={allRows}
                        colKey={key}
                        i={i}
                        style={{ ...inputTheme }}
                      />
                    )}
                  </td>
                ))}
                <td style={gridTheme.td}>
                  <div style={ACTION_BUTTON_CONTAINER_STYLE}>
                    <ActionButton
                      onClick={handleAdd}
                      disabled={editRowId !== null}
                      type="save"
                      title="Save"
                    />
                    <ActionButton
                      onClick={() => { setNewRow({}); setSearchText(''); }}
                      disabled={editRowId !== null}
                      type="reset"
                      title="Reset"
                    />
                  </div>
                </td>
              </tr>
              {filteredBalances.map((balance, idx) => (
                <tr key={balance.id}>
                  {colKeys.map((key, i) => (
                    <td key={key} style={gridTheme.td}>
                      {editRowId === balance.id ? (
                        key === 'bankName' ? (
                          <div style={FLEX_ROW_CENTER}>
                            <RoundedInput
                              value={editRowData.bankName || ''}
                              onChange={e => handleRowChange(e, 'bankName')}
                              colFonts={colFonts}
                              colHeaders={colHeaders}
                              allRows={allRows}
                              colKey={key}
                              i={i}
                              style={{ border: '1px solid #1976d2', ...inputTheme }}
                            />
                            <RoundedDropdown
                              value={editRowData.currency || ''}
                              onChange={e => handleRowChange(e, 'currency')}
                              options={currencyOptions}
                              placeholder="Currency"
                              style={{ minWidth: 110, maxWidth: 120, height: 40, border: '1px solid #1976d2' }}
                            />
                          </div>
                        ) : key === 'requiredAmount' || key === 'inProgressAmount' || key === 'balanceAmount' ? (
                          <div style={FLEX_ROW_CENTER}>
                            <RoundedInput
                              type="number"
                              value={editRowData[key] || ''}
                              onChange={e => handleRowChange(e, key)}
                              colFonts={colFonts}
                              colHeaders={colHeaders}
                              allRows={allRows}
                              colKey={key}
                              i={i}
                              style={{ border: '1px solid #1976d2', ...inputTheme }}
                            />
                            {editRowData.currency ? <span style={{ marginLeft: 4 }}>{editRowData.currency}</span> : null}
                          </div>
                        ) : (
                          <RoundedInput
                            value={editRowData[key] || ''}
                            onChange={e => handleRowChange(e, key)}
                            colFonts={colFonts}
                            colHeaders={colHeaders}
                            allRows={allRows}
                            colKey={key}
                            i={i}
                            style={{ border: '1px solid #1976d2', ...inputTheme }}
                          />
                        )
                      ) : (
                        key === 'bankName' ? (
                          <span>{balance.bankName}</span>
                        ) : key === 'requiredAmount' || key === 'inProgressAmount' || key === 'balanceAmount' ? (
                          <span>
                            {formatCurrencyValue(balance[key], balance.currency)} 
                          </span>
                        ) : key === 'currency' ? (
                          <span>{getCurrencyDisplayLabel(balance.currency)}</span>
                        ) : (
                          <span>{balance[key]}</span>
                        )
                      )}
                    </td>
                  ))}
                  <td style={gridTheme.td}>
                    {editRowId === balance.id ? (
                      <div style={ACTION_BUTTON_CONTAINER_STYLE}>
                        <ActionButton
                          onClick={() => handleRowSave(balance.id)}
                          type="save"
                          title="Save"
                        />
                        <ActionButton
                          onClick={handleRowCancel}
                          type="cancel"
                          title="Cancel"
                        />
                      </div>
                    ) : (
                      <div style={ACTION_BUTTON_CONTAINER_STYLE}>
                        <ActionButton
                          onClick={() => handleRowEdit(balance)}
                          type="edit"
                          title="Edit"
                        />
                        <ActionButton
                          onClick={() => handleDelete(balance.id)}
                          type="delete"
                          title="Delete"
                        />
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <ConfirmModal
        open={confirm.open}
        message={confirm.message}
        onConfirm={confirm.onConfirm}
        onCancel={() => setConfirm({ open: false })}
      />
    </div>
  );
}

export default BalancesPage;
