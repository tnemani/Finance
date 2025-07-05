import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ActionButton } from '../components/ActionButton';
import GridBanner from '../components/GridBanner';
import { gridTheme, currencyOptions } from '../components/gridTheme';
import RoundedInput from '../components/RoundedInput';
import RoundedDropdown from '../components/RoundedDropdown';

// Helper to measure text width in px for a given font
function getTextWidth(text, font = '16px Arial') {
  if (typeof document === 'undefined') return 120; // fallback for SSR
  const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement('canvas'));
  const context = canvas.getContext('2d');
  context.font = font;
  return context.measureText(text).width;
}

function BalancesPage() {
  const [balances, setBalances] = useState([]);
  const [editRowId, setEditRowId] = useState(null);
  const [editRowData, setEditRowData] = useState({});
  const [newRow, setNewRow] = useState({});
  const [searchText, setSearchText] = useState('');
  const [filteredBalances, setFilteredBalances] = useState([]);
  const [remarksList, setRemarksList] = useState(filteredBalances.map(b => b.remarks || ''));

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
    if (!searchText) setFilteredBalances(sorted);
    else {
      const lower = searchText.toLowerCase();
      setFilteredBalances(sorted.filter(b =>
        Object.values(b).some(val => val && typeof val === 'string' && val.toLowerCase().includes(lower))
      ));
    }
  }, [searchText, balances]);
  useEffect(() => {
    setRemarksList(filteredBalances.map(b => b.remarks || ''));
  }, [filteredBalances]);

  const fetchBalances = async () => {
    const res = await axios.get('/api/Balances');
    setBalances(res.data);
  };

  const handleRowEdit = (balance) => {
    setEditRowId(balance.id);
    setEditRowData(balance);
  };

  const handleRowChange = (e, col) => {
    setEditRowData({ ...editRowData, [col]: e.target.value });
  };

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

  const handleRowSave = async (id) => {
    try {
      // Convert numeric fields to numbers before sending
      const data = {
        ...editRowData,
        maxLimitAmount: editRowData.maxLimitAmount ? Number(editRowData.maxLimitAmount) : 0,
        requiredAmount: editRowData.requiredAmount ? Number(editRowData.requiredAmount) : 0,
        inProgressAmount: editRowData.inProgressAmount ? Number(editRowData.inProgressAmount) : 0,
        balanceAmount: editRowData.balanceAmount ? Number(editRowData.balanceAmount) : 0,
      };
      await axios.put(`/api/Balances/${id}`, data);
      setEditRowId(null);
      setEditRowData({});
      fetchBalances();
    } catch (err) {
      alert('Failed to save changes.');
    }
  };

  const handleRowCancel = () => {
    setEditRowId(null);
    setEditRowData({});
  };

  const handleDelete = async id => {
    try {
      await axios.delete(`/api/Balances/${id}`);
      fetchBalances();
    } catch (err) {
      alert('Failed to delete balance.');
    }
  };

  const handleAdd = async () => {
    // Prevent adding empty or whitespace-only rows
    if (!newRow || Object.values(newRow).every(v => !v || (typeof v === 'string' && v.trim() === ''))) return;
    try {
      // Convert numeric fields to numbers before sending
      const data = {
        ...newRow,
        maxLimitAmount: newRow.maxLimitAmount ? Number(newRow.maxLimitAmount) : 0,
        requiredAmount: newRow.requiredAmount ? Number(newRow.requiredAmount) : 0,
        inProgressAmount: newRow.inProgressAmount ? Number(newRow.inProgressAmount) : 0,
        balanceAmount: newRow.balanceAmount ? Number(newRow.balanceAmount) : 0,
      };
      await axios.post('/api/Balances', data);
      setNewRow({});
      setSearchText(''); // Reset search text when clearing add row
      fetchBalances();
    } catch (err) {
      alert('Failed to add balance.');
    }
  };

  // Format value for display: USD (no cents, commas), INR as Indian format (no decimals), else as is
  const formatCurrencyValue = (value, currency) => {
    if (value == null || value === '') return '';
    const num = Number(value);
    if (isNaN(num)) return value;
    if (currency === '$') {
      // US format, no cents
      return num.toLocaleString('en-US', { maximumFractionDigits: 0 });
    }
    if (currency === 'Rs') {
      // Indian format, no decimals
      const [intPart] = num.toFixed(0).split('.');
      let lastThree = intPart.slice(-3);
      let otherNumbers = intPart.slice(0, -3);
      if (otherNumbers !== '') lastThree = ',' + lastThree;
      return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
    }
    return num;
  };

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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 20, paddingTop: 0 }}>
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
      {/* Example usage of RoundedList: show all unique currencies in a rounded list */}
      {/* <div style={{ marginBottom: 16, width: '100%', maxWidth: 400 }}>
        <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Currencies in Balances:</label>
        <RoundedList
          items={uniqueCurrencies.length ? uniqueCurrencies : ['No currencies']}
          style={{
            border: gridTheme.roundedInputTheme.border,
            borderRadius: gridTheme.roundedInputTheme.borderRadius,
            background: gridTheme.roundedInputTheme.background,
            boxShadow: gridTheme.roundedInputTheme.boxShadow || '0 1px 4px rgba(0,0,0,0.06)'
          }}
          itemStyle={{ borderRadius: gridTheme.roundedInputTheme.borderRadius }}
        />
      </div> */}
      <div style={{ minWidth: totalGridMinWidth, margin: '0 auto', display: 'flex', justifyContent: 'center' }}>
        {/* Set maxHeight to show 10 rows (10 * 40px = 400px) */}
        <div style={{ ...gridTheme.scrollContainer, maxHeight: 400, overflowY: 'auto', overflowX: 'hidden', display: 'flex', justifyContent: 'center' }}>
          <table style={{ ...gridTheme.table, minWidth: totalGridMinWidth, width: 'min-content', margin: '0 auto' }}>
            <thead>
              <tr>
                <th style={gridTheme.th}>Bank Name</th>
                <th style={gridTheme.th}>Required</th>
                <th style={gridTheme.th}>In Progress</th>
                <th style={gridTheme.th}>Balance</th>
                <th style={gridTheme.th}>Remarks</th>
                <th style={gridTheme.th}></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={gridTheme.td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <RoundedInput
                      value={newRow.bankName || ''}
                      onChange={e => setNewRow({ ...newRow, bankName: e.target.value })}
                      placeholder="Bank Name"
                      disabled={editRowId !== null}
                      style={{ minWidth: maxBankNameWidth, maxWidth: maxBankNameWidth }}
                    />
                    <RoundedDropdown
                      value={newRow.currency || ''}
                      onChange={e => setNewRow({ ...newRow, currency: e.target.value })}
                      options={[{ value: '', label: 'Currency' }, ...currencyOptions]}
                      disabled={editRowId !== null}
                      style={{ minWidth: 110, maxWidth: 200, height: 40 }}
                    />
                  </div>
                </td>
                <td style={gridTheme.td}>
                  <RoundedInput
                    type="number"
                    value={newRow.requiredAmount || ''}
                    onChange={e => setNewRow({ ...newRow, requiredAmount: e.target.value })}
                    placeholder="Required"
                    disabled={editRowId !== null}
                    style={{ minWidth: maxRequiredWidth, maxWidth: maxRequiredWidth, width: 'auto' }}
                  />
                  {newRow.currency ? <span style={{ marginLeft: 4 }}>{newRow.currency}</span> : null}
                </td>
                <td style={gridTheme.td}>
                  <RoundedInput
                    type="number"
                    value={newRow.inProgressAmount || ''}
                    onChange={e => setNewRow({ ...newRow, inProgressAmount: e.target.value })}
                    placeholder="In Progress"
                    disabled={editRowId !== null}
                    style={{ minWidth: maxInProgressWidth, maxWidth: maxInProgressWidth, width: 'auto' }}
                  />
                  {newRow.currency ? <span style={{ marginLeft: 4 }}>{newRow.currency}</span> : null}
                </td>
                <td style={gridTheme.td}>
                  <RoundedInput
                    type="number"
                    value={newRow.balanceAmount || ''}
                    onChange={e => setNewRow({ ...newRow, balanceAmount: e.target.value })}
                    placeholder="Balance"
                    disabled={editRowId !== null}
                    style={{ minWidth: maxBalanceWidth, maxWidth: maxBalanceWidth, width: 'auto' }}
                  />
                  {newRow.currency ? <span style={{ marginLeft: 4 }}>{newRow.currency}</span> : null}
                </td>
                <td style={gridTheme.td}>
                  <RoundedInput
                    value={newRow.remarks || ''}
                    onChange={e => setNewRow({ ...newRow, remarks: e.target.value })}
                    placeholder="Remarks"
                    disabled={editRowId !== null}
                    style={{ minWidth: maxRemarksWidth, maxWidth: maxRemarksWidth }}
                  />
                </td>
                <td style={gridTheme.td}>
                  <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
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
                  <td style={gridTheme.td}>
                    {editRowId === balance.id ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          maxWidth: maxBankNameWidth,
                          overflow: 'hidden'
                        }}
                      >
                        <RoundedInput
                          value={editRowData.bankName || ''}
                          onChange={e => handleRowChange(e, 'bankName')}
                          style={{
                            border: '1px solid #1976d2',
                            flex: 1,
                            minWidth: maxBankNameWidth,
                            maxWidth: maxBankNameWidth,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        />
                        <RoundedDropdown
                          value={editRowData.currency || ''}
                          onChange={e => handleRowChange(e, 'currency')}
                          options={[{ value: '', label: 'Currency' }, ...currencyOptions]}
                          style={{ minWidth: 110, maxWidth: 120, height: 40, border: '1px solid #1976d2' }}
                        />
                      </div>
                    ) : (
                      <span style={{ flex: 1, maxWidth: maxBankNameWidth, overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline-block', whiteSpace: 'nowrap' }}>{balance.bankName}</span>
                    )}
                  </td>
                  <td style={gridTheme.td}>
                    {editRowId === balance.id ? (
                      <>
                        <RoundedInput
                          type="number"
                          value={editRowData.requiredAmount || ''}
                          onChange={e => handleRowChange(e, 'requiredAmount')}
                          style={{ border: '1px solid #1976d2', minWidth: maxRequiredWidth, maxWidth: maxRequiredWidth, width: 'auto' }}
                        />
                        {editRowData.currency ? <span style={{ marginLeft: 4 }}>{editRowData.currency}</span> : null}
                      </>
                    ) : (
                      <>
                        {formatCurrencyValue(balance.requiredAmount, balance.currency)} {balance.currency ? <span style={{ marginLeft: 4 }}>{balance.currency}</span> : null}
                      </>
                    )}
                  </td>
                  <td style={gridTheme.td}>
                    {editRowId === balance.id ? (
                      <>
                        <RoundedInput
                          type="number"
                          value={editRowData.inProgressAmount || ''}
                          onChange={e => handleRowChange(e, 'inProgressAmount')}
                          style={{ border: '1px solid #1976d2', minWidth: maxInProgressWidth, maxWidth: maxInProgressWidth, width: 'auto' }}
                        />
                        {editRowData.currency ? <span style={{ marginLeft: 4 }}>{editRowData.currency}</span> : null}
                      </>
                    ) : (
                      <>
                        {formatCurrencyValue(balance.inProgressAmount, balance.currency)} {balance.currency ? <span style={{ marginLeft: 4 }}>{balance.currency}</span> : null}
                      </>
                    )}
                  </td>
                  <td style={gridTheme.td}>
                    {editRowId === balance.id ? (
                      <>
                        <RoundedInput
                          type="number"
                          value={editRowData.balanceAmount || ''}
                          onChange={e => handleRowChange(e, 'balanceAmount')}
                          style={{ border: '1px solid #1976d2', minWidth: maxBalanceWidth, maxWidth: maxBalanceWidth, width: 'auto' }}
                        />
                        {editRowData.currency ? <span style={{ marginLeft: 4 }}>{editRowData.currency}</span> : null}
                      </>
                    ) : (
                      <>
                        {formatCurrencyValue(balance.balanceAmount, balance.currency)} {balance.currency ? <span style={{ marginLeft: 4 }}>{balance.currency}</span> : null}
                      </>
                    )}
                  </td>
                  <td style={gridTheme.td}>
                    {editRowId === balance.id ? (
                      <RoundedInput
                        value={editRowData.remarks || ''}
                        onChange={e => handleRowChange(e, 'remarks')}
                        style={{
                          border: '1px solid #1976d2',
                          minWidth: maxRemarksWidth,
                          maxWidth: maxRemarksWidth
                        }}
                      />
                    ) : (
                      <span>{balance.remarks}</span>
                    )}
                  </td>
                  <td style={gridTheme.td}>
                    {editRowId === balance.id ? (
                      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4, height: 32 }}>
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
                      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4, height: 32 }}>
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
    </div>
  );
}

export default BalancesPage;
