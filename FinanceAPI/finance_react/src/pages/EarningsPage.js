import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ConfirmModal from '../components/ConfirmModal';
import { ActionButton } from '../components/ActionButton';
import GridBanner from '../components/GridBanner';
import { gridTheme, currencyOptions } from '../components/gridTheme';
import RoundedInput from '../components/RoundedInput';

const API_URL = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:5226/api') + '/earnings';
const USERS_API_URL = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:5226/api') + '/users';

export default function EarningsPage(props) {
  const [earnings, setEarnings] = useState([]);
  const [editRowId, setEditRowId] = useState(null);
  const [editRowData, setEditRowData] = useState({});
  const [newRow, setNewRow] = useState({});
  const [confirm, setConfirm] = useState({ open: false, message: '', onConfirm: null });
  const [searchText, setSearchText] = useState('');
  const [filteredEarnings, setFilteredEarnings] = useState([]);
  const [frequencyOptions, setFrequencyOptions] = useState([
    "Daily", "Weekly", "Bi-Weekly", "Semi Monthly", "Quarterly", "Yearly"
  ]);
  const [users, setUsers] = useState([]);

  useEffect(() => { fetchEarnings(); fetchFrequencyOptions(); fetchUsers(); }, []);

  useEffect(() => {
    if (!searchText) setFilteredEarnings(earnings);
    else {
      const lower = searchText.toLowerCase();
      setFilteredEarnings(earnings.filter(e =>
        Object.values(e).some(val => val && typeof val === 'string' && val.toLowerCase().includes(lower))
      ));
    }
  }, [searchText, earnings]);

  const fetchEarnings = async () => {
    const res = await axios.get(API_URL);
    setEarnings(res.data);
  };

  const fetchFrequencyOptions = async () => {
    try {
      const res = await axios.get(API_URL + '/frequency-options');
      setFrequencyOptions(res.data);
    } catch {
      // fallback to default
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(USERS_API_URL);
      setUsers(res.data);
    } catch {}
  };

  const handleRowEdit = (earning) => {
    setEditRowId(earning.id);
    setEditRowData(earning);
  };

  const handleRowChange = (e, col) => {
    setEditRowData({ ...editRowData, [col]: e.target.value });
  };

  const handleRowSave = async (id) => {
    setConfirm({
      open: true,
      message: 'Are you sure you want to update this earning?',
      onConfirm: async () => {
        setConfirm({ open: false });
        await axios.put(`${API_URL}/${id}`, editRowData);
        setEditRowId(null);
        setEditRowData({});
        fetchEarnings();
      }
    });
  };

  const handleRowCancel = () => {
    setEditRowId(null);
    setEditRowData({});
  };

  const handleDelete = async id => {
    setConfirm({
      open: true,
      message: 'Are you sure you want to delete this earning?',
      onConfirm: async () => {
        setConfirm({ open: false });
        await axios.delete(`${API_URL}/${id}`);
        fetchEarnings();
      }
    });
  };

  const handleAdd = async () => {
    if (!newRow || Object.values(newRow).every(v => !v)) return;
    setConfirm({
      open: true,
      message: 'Are you sure you want to add this earning?',
      onConfirm: async () => {
        setConfirm({ open: false });
        await axios.post(API_URL, newRow);
        setNewRow({});
        fetchEarnings();
      }
    });
  };

  // Format amount in Indian style
  const formatValueIN = (value) => {
    if (value == null || value === '') return '';
    const num = Number(value);
    if (isNaN(num)) return value;
    const [intPart, decPart] = num.toFixed(2).split('.');
    let lastThree = intPart.slice(-3);
    let otherNumbers = intPart.slice(0, -3);
    if (otherNumbers !== '')
      lastThree = ',' + lastThree;
    const formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
    if (decPart === '00') return formatted;
    return formatted + '.' + decPart;
  };

  // Format value for display: USD (no cents, commas), INR (Indian format), else as is
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

  // Format date as 'Month Date, yyyy'
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // User dropdown options
  const userOptions = users.map(u => ({ value: u.id, label: u.shortName || `${u.firstName || ''} ${u.lastName || ''}`.trim() }));
  const getUserLabel = (id) => userOptions.find(u => u.value === id)?.label || id || '';

  return (
    <div style={{ padding: 20, paddingTop: 0 }}>
      <GridBanner
        icon={require('../components/icons/earnings_banner.png')}
        title="Earnings"
        searchText={searchText}
        setSearchText={setSearchText}
        placeholder="Search earnings..."
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', textAlign: 'left', width: '100%' }}
        titleStyle={{ fontSize: 28, fontWeight: 600, marginLeft: 12, textAlign: 'left', display: 'inline-block' }}
        iconStyle={{ height: 40, display: 'inline-block' }}
      />
      <div style={{ height: 12 }} />
      <div style={{ width: 'fit-content', minWidth: 0, margin: '0 auto', maxWidth: '100%' }}>
        {/* Set maxHeight to show 20 rows (20 * 40px = 800px) */}
        <div style={{ ...gridTheme.scrollContainer, maxHeight: 800, overflowY: 'auto' }}>
          <table style={gridTheme.table}>
            <thead>
              <tr>
                <th style={gridTheme.th}>Type</th>
                <th style={gridTheme.th}>Frequency</th>
                <th style={gridTheme.th}>Start Date</th>
                <th style={gridTheme.th}>Sender</th>
                <th style={gridTheme.th}>Receiver</th>
                <th style={gridTheme.th}>Item</th>
                <th style={gridTheme.th} colSpan={2}>Amount / Qty & Unit</th>
                <th style={gridTheme.th}>End Date</th>
                <th style={gridTheme.th}>Owner</th>
                <th style={gridTheme.th}>Last Updated</th>
                <th style={gridTheme.th}>Description</th>
                <th style={gridTheme.th}></th>
              </tr>
            </thead>
            <tbody>
              {/* Add row for new earning */}
              <tr>
                <td style={gridTheme.td}>
                  <RoundedInput value={newRow.type || ''} onChange={e => setNewRow({ ...newRow, type: e.target.value })} placeholder="Type" disabled={editRowId !== null} />
                </td>
                <td style={gridTheme.td}>
                  <select value={newRow.frequency || ''} onChange={e => setNewRow({ ...newRow, frequency: e.target.value })} style={gridTheme.roundedSelectTheme} disabled={editRowId !== null}>
                    <option value="">Select</option>
                    {frequencyOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </td>
                <td style={gridTheme.td}>
                  <RoundedInput type="date" value={newRow.startDate || ''} onChange={e => setNewRow({ ...newRow, startDate: e.target.value })} placeholder="Start Date" disabled={editRowId !== null} />
                </td>
                <td style={gridTheme.td}>
                  <select value={newRow.sender || ''} onChange={e => setNewRow({ ...newRow, sender: e.target.value })} style={gridTheme.roundedSelectTheme} disabled={editRowId !== null}>
                    <option value="">Select</option>
                    {userOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </td>
                <td style={gridTheme.td}>
                  <select value={newRow.receiver || ''} onChange={e => setNewRow({ ...newRow, receiver: e.target.value })} style={gridTheme.roundedSelectTheme} disabled={editRowId !== null}>
                    <option value="">Select</option>
                    {userOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </td>
                <td style={gridTheme.td}>
                  <RoundedInput value={newRow.item || ''} onChange={e => setNewRow({ ...newRow, item: e.target.value })} placeholder="Item" disabled={editRowId !== null} />
                </td>
                <td style={gridTheme.td} colSpan={2}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <RoundedInput value={newRow.amount || ''} onChange={e => setNewRow({ ...newRow, amount: e.target.value })} placeholder="Amount / Qty" style={{ width: '60%' }} disabled={editRowId !== null} />
                    <select value={newRow.currency || ''} onChange={e => setNewRow({ ...newRow, currency: e.target.value })} placeholder="Unit" style={{ ...gridTheme.roundedSelectTheme, width: '40%' }} disabled={editRowId !== null}>
                      <option value="">Select</option>
                      {currencyOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </td>
                <td style={gridTheme.td}>
                  <RoundedInput type="date" value={newRow.endDate || ''} onChange={e => setNewRow({ ...newRow, endDate: e.target.value })} placeholder="End Date" disabled={editRowId !== null} />
                </td>
                <td style={gridTheme.td}>
                  <select value={newRow.ownerId || ''} onChange={e => setNewRow({ ...newRow, ownerId: e.target.value })} style={gridTheme.roundedSelectTheme} disabled={editRowId !== null}>
                    <option value="">Select</option>
                    {userOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </td>
                <td style={gridTheme.td}>
                  <RoundedInput type="date" value={newRow.lastUpdatedDate || ''} onChange={e => setNewRow({ ...newRow, lastUpdatedDate: e.target.value })} placeholder="Last Updated" disabled={editRowId !== null} />
                </td>
                <td style={gridTheme.td}>
                  <RoundedInput value={newRow.description || ''} onChange={e => setNewRow({ ...newRow, description: e.target.value })} placeholder="Description" disabled={editRowId !== null} />
                </td>
                <td style={{ border: '1px solid #ccc', padding: 4, verticalAlign: 'middle' }}>
                  <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <ActionButton
                      onClick={handleAdd}
                      disabled={editRowId !== null}
                      type="save"
                      title="Save"
                    />
                    <ActionButton
                      onClick={() => setNewRow({})}
                      disabled={editRowId !== null}
                      type="reset"
                      title="Reset"
                    />
                  </div>
                </td>
              </tr>
              {filteredEarnings.map(earning => (
                <tr key={earning.id}>
                  <td style={gridTheme.td}>
                    {editRowId === earning.id ? (
                      <RoundedInput value={editRowData.type || ''} onChange={e => handleRowChange(e, 'type')} placeholder="Type" style={{ border: '1px solid #1976d2' }} />
                    ) : (
                      earning.type
                    )}
                  </td>
                  <td style={gridTheme.td}>
                    {editRowId === earning.id ? (
                      <select value={editRowData.frequency || ''} onChange={e => handleRowChange(e, 'frequency')} style={{ ...gridTheme.roundedSelectTheme, border: '1px solid #1976d2' }}>
                        <option value="">Select</option>
                        {frequencyOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    ) : (
                      earning.frequency
                    )}
                  </td>
                  <td style={gridTheme.td}>
                    {editRowId === earning.id ? (
                      <RoundedInput type="date" value={editRowData.startDate || ''} onChange={e => handleRowChange(e, 'startDate')} placeholder="Start Date" style={{ border: '1px solid #1976d2' }} />
                    ) : (
                      formatDisplayDate(earning.startDate)
                    )}
                  </td>
                  <td style={gridTheme.td}>
                    {editRowId === earning.id ? (
                      <select value={editRowData.sender || ''} onChange={e => handleRowChange(e, 'sender')} style={{ ...gridTheme.roundedSelectTheme, border: '1px solid #1976d2' }}>
                        <option value="">Select</option>
                        {userOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    ) : (
                      getUserLabel(earning.sender)
                    )}
                  </td>
                  <td style={gridTheme.td}>
                    {editRowId === earning.id ? (
                      <select value={editRowData.receiver || ''} onChange={e => handleRowChange(e, 'receiver')} style={{ ...gridTheme.roundedSelectTheme, border: '1px solid #1976d2' }}>
                        <option value="">Select</option>
                        {userOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    ) : (
                      getUserLabel(earning.receiver)
                    )}
                  </td>
                  <td style={gridTheme.td}>
                    {editRowId === earning.id ? (
                      <RoundedInput value={editRowData.item || ''} onChange={e => handleRowChange(e, 'item')} placeholder="Item" style={{ border: '1px solid #1976d2' }} />
                    ) : (
                      earning.item
                    )}
                  </td>
                  <td style={editRowId === earning.id ? { ...gridTheme.td, border: '1px solid #1976d2' } : gridTheme.td} colSpan={2}>
                    {editRowId === earning.id ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <RoundedInput value={editRowData.amount || ''} onChange={e => handleRowChange(e, 'amount')} placeholder="Amount / Qty" style={{ border: '1px solid #1976d2', width: '60%' }} />
                        <select value={editRowData.currency || ''} onChange={e => handleRowChange(e, 'currency')} style={{ ...gridTheme.roundedSelectTheme, border: '1px solid #1976d2', width: '40%' }} placeholder="Unit">
                          <option value="">Select</option>
                          {currencyOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <>{formatCurrencyValue(earning.amount, earning.currency)}{earning.currency ? ` ${earning.currency}` : ''}</>
                    )}
                  </td>
                  <td style={gridTheme.td}>
                    {editRowId === earning.id ? (
                      <RoundedInput type="date" value={editRowData.endDate || ''} onChange={e => handleRowChange(e, 'endDate')} placeholder="End Date" style={{ border: '1px solid #1976d2' }} />
                    ) : (
                      formatDisplayDate(earning.endDate)
                    )}
                  </td>
                  <td style={gridTheme.td}>
                    {editRowId === earning.id ? (
                      <select value={editRowData.ownerId || ''} onChange={e => handleRowChange(e, 'ownerId')} style={{ ...gridTheme.roundedSelectTheme, border: '1px solid #1976d2' }}>
                        <option value="">Select</option>
                        {userOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    ) : (
                      getUserLabel(earning.ownerId)
                    )}
                  </td>
                  <td style={gridTheme.td}>
                    {editRowId === earning.id ? (
                      <RoundedInput type="date" value={editRowData.lastUpdatedDate || ''} onChange={e => handleRowChange(e, 'lastUpdatedDate')} placeholder="Last Updated" style={{ border: '1px solid #1976d2' }} />
                    ) : (
                      formatDisplayDate(earning.lastUpdatedDate)
                    )}
                  </td>
                  <td style={gridTheme.td}>
                    {editRowId === earning.id ? (
                      <RoundedInput value={editRowData.description || ''} onChange={e => handleRowChange(e, 'description')} placeholder="Description" style={{ border: '1px solid #1976d2' }} />
                    ) : (
                      earning.description
                    )}
                  </td>
                  <td style={gridTheme.td}>
                    {editRowId === earning.id ? (
                      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <ActionButton
                          onClick={() => handleRowSave(earning.id)}
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
                      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <ActionButton
                          onClick={() => handleRowEdit(earning)}
                          type="edit"
                          title="Edit"
                        />
                        <ActionButton
                          onClick={() => handleDelete(earning.id)}
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
