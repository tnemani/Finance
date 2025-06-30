import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ActionButton } from '../components/ActionButton';
import GridBanner from '../components/GridBanner';
import { gridTheme, currencyOptions } from '../components/gridTheme';

function BalancesPage() {
  const [balances, setBalances] = useState([]);
  const [editRowId, setEditRowId] = useState(null);
  const [editRowData, setEditRowData] = useState({});
  const [newRow, setNewRow] = useState({});
  const [searchText, setSearchText] = useState('');
  const [filteredBalances, setFilteredBalances] = useState([]);

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

  return (
    <div style={{ padding: 20, paddingTop: 0 }}>
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
      <div style={{ width: 1000, minWidth: 0, margin: '0 auto', maxWidth: '100%' }}>
        {/* Set maxHeight to show 10 rows (10 * 40px = 400px) */}
        <div style={{ ...gridTheme.scrollContainer, maxHeight: 400, overflowY: 'auto' }}>
          <table style={gridTheme.table}>
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
                    <input type="text" value={newRow.bankName || ''} onChange={e => setNewRow({ ...newRow, bankName: e.target.value })} placeholder="Bank Name" style={{ border: 'none', borderRadius: '8px', padding: '4px 8px', outline: 'none', fontSize: '1em', background: '#f9fbfd', minHeight: 28, margin: 0, boxSizing: 'border-box', flex: 1 }} disabled={editRowId !== null} />
                    <select value={newRow.currency || ''} onChange={e => setNewRow({ ...newRow, currency: e.target.value })} style={{ border: '1px solid #1976d2', borderRadius: 8, padding: '4px 8px', fontSize: 18, background: '#f9fbfd', minHeight: 28, width: 120, marginLeft: 8 }} disabled={editRowId !== null}>
                      <option value="">Currency</option>
                      {currencyOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </td>
                <td style={gridTheme.td}>
                  <input type="number" value={newRow.requiredAmount || ''} onChange={e => setNewRow({ ...newRow, requiredAmount: e.target.value })} placeholder="Required" style={{ border: 'none', borderRadius: '8px', padding: '4px 8px', outline: 'none', fontSize: '1em', background: '#f9fbfd', minHeight: 28, margin: 0, boxSizing: 'border-box', width: '100%' }} disabled={editRowId !== null} />
                  {newRow.currency ? <span style={{ marginLeft: 4 }}>{newRow.currency}</span> : null}
                </td>
                <td style={gridTheme.td}>
                  <input type="number" value={newRow.inProgressAmount || ''} onChange={e => setNewRow({ ...newRow, inProgressAmount: e.target.value })} placeholder="In Progress" style={{ border: 'none', borderRadius: '8px', padding: '4px 8px', outline: 'none', fontSize: '1em', background: '#f9fbfd', minHeight: 28, margin: 0, boxSizing: 'border-box', width: '100%' }} disabled={editRowId !== null} />
                  {newRow.currency ? <span style={{ marginLeft: 4 }}>{newRow.currency}</span> : null}
                </td>
                <td style={gridTheme.td}>
                  <input type="number" value={newRow.balanceAmount || ''} onChange={e => setNewRow({ ...newRow, balanceAmount: e.target.value })} placeholder="Balance" style={{ border: 'none', borderRadius: '8px', padding: '4px 8px', outline: 'none', fontSize: '1em', background: '#f9fbfd', minHeight: 28, margin: 0, boxSizing: 'border-box', width: '100%' }} disabled={editRowId !== null} />
                  {newRow.currency ? <span style={{ marginLeft: 4 }}>{newRow.currency}</span> : null}
                </td>
                <td style={gridTheme.td}>
                  <input type="text" value={newRow.remarks || ''} onChange={e => setNewRow({ ...newRow, remarks: e.target.value })} placeholder="Remarks" style={{ border: 'none', borderRadius: '8px', padding: '4px 8px', outline: 'none', fontSize: '1em', background: '#f9fbfd', minHeight: 28, margin: 0, boxSizing: 'border-box', width: '100%' }} disabled={editRowId !== null} />
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input type="text" value={editRowData.bankName || ''} onChange={e => handleRowChange(e, 'bankName')} style={{ border: '1px solid #1976d2', borderRadius: '8px', padding: '4px 8px', outline: 'none', fontSize: '1em', background: '#f9fbfd', minHeight: 28, margin: 0, boxSizing: 'border-box', flex: 1 }} />
                        <select value={editRowData.currency || ''} onChange={e => handleRowChange(e, 'currency')} style={{ border: '1px solid #1976d2', borderRadius: 8, padding: '4px 8px', fontSize: 18, background: '#f9fbfd', minHeight: 28, width: 120, marginLeft: 8 }}>
                          <option value="">Currency</option>
                          {currencyOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <span style={{ flex: 1 }}>{balance.bankName}</span>
                    )}
                  </td>
                  <td style={gridTheme.td}>
                    {editRowId === balance.id ? (
                      <>
                        <input type="number" value={editRowData.requiredAmount || ''} onChange={e => handleRowChange(e, 'requiredAmount')} style={{ border: '1px solid #1976d2', borderRadius: '8px', padding: '4px 8px', outline: 'none', fontSize: '1em', background: '#f9fbfd', minHeight: 28, margin: 0, boxSizing: 'border-box', width: '100%' }} />
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
                        <input type="number" value={editRowData.inProgressAmount || ''} onChange={e => handleRowChange(e, 'inProgressAmount')} style={{ border: '1px solid #1976d2', borderRadius: '8px', padding: '4px 8px', outline: 'none', fontSize: '1em', background: '#f9fbfd', minHeight: 28, margin: 0, boxSizing: 'border-box', width: '100%' }} />
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
                        <input type="number" value={editRowData.balanceAmount || ''} onChange={e => handleRowChange(e, 'balanceAmount')} style={{ border: '1px solid #1976d2', borderRadius: '8px', padding: '4px 8px', outline: 'none', fontSize: '1em', background: '#f9fbfd', minHeight: 28, margin: 0, boxSizing: 'border-box', width: '100%' }} />
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
                      <input type="text" value={editRowData.remarks || ''} onChange={e => handleRowChange(e, 'remarks')} style={{ border: '1px solid #1976d2', borderRadius: '8px', padding: '4px 8px', outline: 'none', fontSize: '1em', background: '#f9fbfd', minHeight: 28, margin: 0, boxSizing: 'border-box', width: '100%' }} />
                    ) : (
                      balance.remarks
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
