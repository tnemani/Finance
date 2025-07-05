import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ActionButton } from '../components/ActionButton';
import JsonGridView from '../components/JsonGridView';
import paymentIcon from '../components/icons/users_banner.png';
import saveIcon from '../components/icons/save.png';
import GridBanner from '../components/GridBanner';
import { gridTheme } from '../components/gridTheme';
import RoundedInput from '../components/RoundedInput';

const API_URL = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:5226/api') + '/users';
const ADDRESSES_API_URL = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:5226/api') + '/addresses';

function toPascalCase(str) {
  return str.replace(/(^|_)([a-z])/g, (match, p1, p2) => p2.toUpperCase());
}

// Helper to convert PascalCase or camelCase to 'Pascal Case'
function toSpacedCase(str) {
  // Replace underscores with spaces first
  let spaced = str.replace(/_/g, ' ');
  // Insert space before any uppercase letter that follows a lowercase letter or digit
  spaced = spaced.replace(/([a-z\d])([A-Z])/g, '$1 $2');
  // Insert space between two uppercase letters followed by a lowercase letter (e.g., XMLParser -> XML Parser)
  spaced = spaced.replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');
  // Capitalize the first letter and lowercase the rest for each word
  return spaced.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1));
}

// Helper to format date as 'Aug 31st 1989'
function formatDateDisplay(dateStr) {
  if (!dateStr) return '';
  // Always parse as local date (avoid UTC offset issues)
  const date = new Date(dateStr + 'T00:00:00');
  if (isNaN(date)) return dateStr;
  const month = date.toLocaleString('en-US', { month: 'short' });
  const day = date.getDate();
  const year = date.getFullYear();
  // Add ordinal suffix
  const j = day % 10, k = day % 100;
  let suffix = 'th';
  if (j === 1 && k !== 11) suffix = 'st';
  else if (j === 2 && k !== 12) suffix = 'nd';
  else if (j === 3 && k !== 13) suffix = 'rd';
  return `${month} ${day}${suffix} ${year}`;
}

// Helper to format date as 'Month Day Year'
function formatMonthDayYear(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  if (isNaN(date)) return dateStr;
  const month = date.toLocaleString('en-US', { month: 'short' });
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day} ${year}`;
}

// Helper to format phone numbers
function formatPhoneNumber(number) {
  if (!number) return '';
  // Remove non-digits except leading country code
  const digits = number.replace(/[^\d]/g, '');
  if (digits.startsWith('001')) {
    // US: (001) 425-123-4567
    if (digits.length >= 13) {
      return `(001) ${digits.slice(3,6)}-${digits.slice(6,9)}-${digits.slice(9,13)}`;
    }
    if (digits.length === 11) {
      return `(001) ${digits.slice(3,6)}-${digits.slice(6,8)}-${digits.slice(8,11)}`;
    }
    if (digits.length === 10) {
      return `(001) ${digits.slice(0,3)}-${digits.slice(3,6)}-${digits.slice(6)}`;
    }
    return number;
  }
  if (digits.startsWith('011')) {
    // India: (011) 91-9440543132
    if (digits.length >= 14) {
      return `(011) 91-${digits.slice(5,15)}`;
    }
    if (digits.length >= 12) {
      return `(011) 91-${digits.slice(5,12)}`;
    }
    return `(011) 91-${digits.slice(5)}`;
  }
  return number;
}

// Helper to generate random SSN, Aadhar, PAN
function randomSSN() {
  const s = () => Math.floor(100 + Math.random()*900);
  const m = () => Math.floor(10 + Math.random()*90);
  const l = () => Math.floor(1000 + Math.random()*9000);
  return `${s()}-${m()}-${l()}`;
}
function randomAadhar() {
  return `${Math.floor(1000+Math.random()*9000)} ${Math.floor(1000+Math.random()*9000)} ${Math.floor(1000+Math.random()*9000)}`;
}
function randomPAN() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return `${chars[Math.floor(Math.random()*26)]}${chars[Math.floor(Math.random()*26)]}${chars[Math.floor(Math.random()*26)]}${chars[Math.floor(Math.random()*26)]}${chars[Math.floor(Math.random()*26)]}${Math.floor(1000+Math.random()*9000)}${chars[Math.floor(Math.random()*26)]}`;
}

// Simple centered confirmation modal
function ConfirmModal({ open, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.25)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
        padding: '32px 32px 24px 32px',
        minWidth: 320,
        maxWidth: '90vw',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 18, marginBottom: 24 }}>{message}</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
          <button onClick={onConfirm} style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 24px', fontWeight: 600, cursor: 'pointer' }}>Yes</button>
          <button onClick={onCancel} style={{ background: '#eee', color: '#333', border: 'none', borderRadius: 6, padding: '8px 24px', fontWeight: 600, cursor: 'pointer' }}>No</button>
        </div>
      </div>
    </div>
  );
}

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [editRowId, setEditRowId] = useState(null);
  const [editRowData, setEditRowData] = useState({});
  const [expandedRows, setExpandedRows] = useState([]);
  const [newRow, setNewRow] = useState({});
  const [addRowExpanded, setAddRowExpanded] = useState(false); // default collapsed
  const [confirm, setConfirm] = useState({ open: false, message: '', onConfirm: null });
  const [searchText, setSearchText] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [allExpanded, setAllExpanded] = useState(false); // default collapsed
  // Set visibleRowCount to 20
  const [visibleRowCount, setVisibleRowCount] = useState(20);

  useEffect(() => {
    fetchUsers();
    fetchAddresses();
  }, []);

  useEffect(() => {
    // Expand all rows if allExpanded is true, else collapse all
    if (allExpanded) {
      setExpandedRows(users.map(u => u.id));
    } else {
      setExpandedRows([]);
    }
  }, [allExpanded, users]);

  useEffect(() => {
    if (!searchText) {
      setFilteredUsers(users);
    } else {
      const lower = searchText.toLowerCase();
      setFilteredUsers(users.filter(u =>
        Object.values(u).some(val =>
          val && typeof val === 'string' && val.toLowerCase().includes(lower)
        )
      ));
    }
  }, [searchText, users]);

  const fetchUsers = async () => {
    const res = await axios.get(API_URL);
    setUsers(res.data);
  };

  const fetchAddresses = async () => {
    const res = await axios.get(ADDRESSES_API_URL);
    setAddresses(res.data);
  };

  const handleRowEdit = (user) => {
    // Always initialize userAddresses from the user's address links, normalizing property names
    const links = getUserAddressLinks(user).map(link => ({
      addressId: link.addressId || link.addressID,
      startDate: link.startDate || '',
      endDate: link.endDate || ''
    }));
    setEditRowId(user.id);
    setEditRowData({ ...user, userAddresses: links });
  };

  const handleRowChange = (e, col) => {
    setEditRowData({ ...editRowData, [col]: e.target.value });
  };

  const handleRowSave = async (id) => {
    // Immediately perform the update, do not use confirmation modal
    const user = users.find(u => u.id === id) || {};
    let data = { ...user, ...editRowData };
    if (Array.isArray(data.userAddresses)) {
      data.userAddresses = data.userAddresses
        .filter(ua => addresses.some(addr => addr.id === ua.addressId))
        .map(ua => ({
          addressId: ua.addressId,
          startDate: ua.startDate ? ua.startDate : null,
          endDate: ua.endDate ? ua.endDate : null
        }));
    } else {
      data.userAddresses = [];
    }
    if ('addressIds' in data) delete data.addressIds;
    try {
      await axios.put(`${API_URL}/${id}`, data);
      setEditRowId(null);
      setEditRowData({});
      await fetchUsers();
    } catch (err) {
      alert('Failed to update user. Please try again.');
    }
  };

  const handleDelete = async id => {
    setConfirm({
      open: true,
      message: 'Are you sure you want to delete this user?',
      onConfirm: async () => {
        setConfirm({ open: false });
        try {
          await axios.delete(`${API_URL}/${id}`);
          await fetchUsers();
        } catch (err) {
          alert('Failed to delete user. Please try again.');
        }
      },
      onCancel: () => setConfirm({ open: false })
    });
  };

  const handleAdd = async () => {
    if (!newRow || Object.values(newRow).every(v => !v)) return;
    let data = { ...newRow };
    // Remove empty SSN, Aadhar, PAN before sending
    ['ssn', 'aadhar', 'pan'].forEach(field => {
      if (data[field] === '' || data[field] == null) delete data[field];
    });
    if (Array.isArray(data.userAddresses)) {
      data.userAddresses = data.userAddresses.map(ua => ({
        addressId: ua.addressId,
        startDate: ua.startDate || null,
        endDate: ua.endDate || null
      }));
    } else {
      data.userAddresses = [];
    }
    if ('addressIds' in data) delete data.addressIds;
    try {
      await axios.post(API_URL, data);
      setNewRow({});
      await fetchUsers();
    } catch (err) {
      alert('Failed to add user. Please check your input and try again.');
    }
  };

  const handleResetAddRow = () => {
    setNewRow({});
  };

  const toggleExpand = (id) => {
    setExpandedRows(rows =>
      rows.includes(id) ? rows.filter(r => r !== id) : [...rows, id]
    );
  };

  // Cancel editing a row
  const handleRowCancel = () => {
    setEditRowId(null);
    setEditRowData({});
  };

  // Expand/collapse all rows
  const handleExpandCollapseAll = () => {
    setAllExpanded(exp => !exp);
  };

  // Helper to get address label
  const getAddressLabel = addr => {
    if (!addr) return '';
    const parts = [
      addr.line1,
      addr.line2,
      addr.houseNo && addr.houseNo.trim() ? `House No: ${addr.houseNo}` : null,
      addr.city,
      addr.state,
      addr.country
    ];
    return parts.filter(Boolean).join(', ');
  };

  // Helper to get address objects from IDs
  const getAddressesByIds = ids => {
    if (!Array.isArray(ids)) return [];
    return addresses.filter(a => ids.includes(a.id));
  };

  // Helper to get user-address link data (start/end dates) for a user
  const getUserAddressLinks = (user) => {
    // Try both user.userAddresses and user.addresses for compatibility
    if (Array.isArray(user.userAddresses) && user.userAddresses.length > 0) return user.userAddresses;
    if (Array.isArray(user.addresses) && user.addresses.length > 0) return user.addresses;
    return [];
  };

  // Helper for grid cell style
  const gridCellStyle = {
    border: '1px solid #ccc',
    padding: '4px 6px',
    textAlign: 'left',
    verticalAlign: 'middle',
    whiteSpace: 'nowrap',
    width: 'auto', // Let content determine width
    maxWidth: 'none', // Remove any max width
  };
  const gridHeaderStyle = {
    ...gridCellStyle,
    fontWeight: 600,
    background: '#f7fafd',
    textAlign: 'left',
  };

  // Define columns just before return so it's always available
  const columns = filteredUsers.length > 0 ? Object.keys(filteredUsers[0])
    .filter(k =>
      k !== 'addresses' &&
      k.toLowerCase() !== 'id' &&
      k.toLowerCase() !== 'useraddresses' &&
      k.toLowerCase() !== 'notes' &&
      k.toLowerCase() !== 'dateofbirth' &&
      k.toLowerCase() !== 'ssn' &&
      k.toLowerCase() !== 'aadhar' &&
      k.toLowerCase() !== 'pan'
    ) : [];
  // Ensure ShortName is present and in a logical position (after LastName if exists)
  let columnsWithShortName = [...columns];
  if (!columnsWithShortName.includes('shortName') && filteredUsers.length > 0 && 'shortName' in filteredUsers[0]) {
    const lastNameIdx = columnsWithShortName.findIndex(c => c.toLowerCase() === 'lastname');
    if (lastNameIdx !== -1) {
      columnsWithShortName.splice(lastNameIdx + 1, 0, 'shortName');
    } else {
      columnsWithShortName.push('shortName');
    }
  }

  // Custom grid to show addresses as internal grid, PascalCase headings, hide id
  const renderUsersTable = (expandedRowsOverride) => {
    const rowsToExpand = Array.isArray(expandedRowsOverride) ? expandedRowsOverride : expandedRows;
    if (!Array.isArray(filteredUsers) || filteredUsers.length === 0) return <div>No users</div>;

    return (
      <table style={gridTheme.table}>
        <thead>
          <tr>
            {/* Restore expand/collapse all button before the second column (typically Last Name) */}
            {columnsWithShortName.map((col, idx) => (
              idx === 1 ? (
                <th key="expand-collapse" style={{ ...gridTheme.th, width: 36, textAlign: 'center' }}>
                  <button
                    onClick={handleExpandCollapseAll}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: 28,
                      width: 28,
                      backgroundColor: 'transparent',
                      zIndex: 2
                    }}
                    title={allExpanded ? 'Collapse All' : 'Expand All'}
                  >
                    {allExpanded ? (
                      // Arrow down (collapse)
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <polyline points="6 9 12 15 18 9" stroke="#1976d2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                      </svg>
                    ) : (
                      // Arrow right (expand)
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <polyline points="9 6 15 12 9 18" stroke="#1976d2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                      </svg>
                    )}
                  </button>
                </th>
              ) : null
            ))}
            {columnsWithShortName.map((col, idx) => (
              <th key={col} style={gridTheme.th}>
                {toSpacedCase(col)}
              </th>
            ))}
            <th style={gridTheme.th}></th>
          </tr>
        </thead>
        <tbody>
          {/* Add row for new user */}
          <tr style={gridTheme.tr}>
            <td>
              {/* Expand/collapse button for add row */}
              <button
                onClick={() => setAddRowExpanded(exp => !exp)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
                tabIndex={-1}
                aria-label={addRowExpanded ? 'Collapse address grid' : 'Expand address grid'}
                disabled={editRowId !== null}
              >
                {addRowExpanded ? (
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M6 8l4 4 4-4" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M8 6l4 4-4 4" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                )}
              </button>
            </td>
            {columnsWithShortName.map(col => (
              <td key={col} style={gridTheme.td}>
                {col.toLowerCase() === 'dateofbirth' ? (
                  <RoundedInput
                    type="date"
                    value={newRow[col] ? newRow[col].slice(0, 10) : ''}
                    onChange={e => setNewRow({ ...newRow, [col]: e.target.value })}
                    style={{ width: '100%' }}
                    disabled={editRowId !== null}
                  />
                ) : (
                  <RoundedInput
                    type="text"
                    value={newRow[col] || ''}
                    onChange={e => setNewRow({ ...newRow, [col]: e.target.value })}
                    style={{ width: '100%' }}
                    disabled={editRowId !== null}
                  />
                )}
              </td>
            ))}
            <td style={gridTheme.td}>
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <ActionButton
                  onClick={handleAdd}
                  disabled={editRowId !== null}
                  type="save"
                />
                <ActionButton
                  onClick={handleResetAddRow}
                  disabled={editRowId !== null}
                  type="reset"
                />
              </div>
            </td>
          </tr>
          {/* Child row for user details in add mode, one per line, only if expanded */}
          {editRowId === null && addRowExpanded && (
            <tr style={gridTheme.tr}>
              <td></td>
              <td colSpan={columnsWithShortName.length + 4} style={{ background: '#f4f8fd', padding: 8 }}>
                <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', width: '100%' }}>
                  {/* Address checkboxes */}
                  <div style={{ minWidth: 320, width: 'max-content' }}>
                    <table style={{ width: 'auto', borderCollapse: 'collapse', background: '#fff' }}>
                      <thead>
                        <tr>
                          <th style={gridTheme.th}>Address</th>
                          <th style={gridTheme.th}>Start Date</th>
                          <th style={gridTheme.th}>End Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {addresses.map(addr => {
                          const checked = Array.isArray(newRow.addressIds) ? newRow.addressIds.includes(addr.id) : false;
                          const link = (newRow.userAddresses || []).find(ua => ua.addressId === addr.id) || {};
                          return (
                            <tr key={addr.id}>
                              <td style={gridTheme.td}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={e => {
                                      const prev = Array.isArray(newRow.addressIds) ? newRow.addressIds : [];
                                      let updatedUserAddresses = Array.isArray(newRow.userAddresses) ? [...newRow.userAddresses] : [];
                                      if (e.target.checked) {
                                        // Only add if not already present
                                        if (!updatedUserAddresses.some(ua => ua.addressId === addr.id)) {
                                          updatedUserAddresses = [...updatedUserAddresses, { addressId: addr.id, startDate: '', endDate: '' }];
                                        }
                                        setNewRow({
                                          ...newRow,
                                          addressIds: [...prev, addr.id],
                                          userAddresses: updatedUserAddresses
                                        });
                                      } else {
                                        setNewRow({
                                          ...newRow,
                                          addressIds: prev.filter(id => id !== addr.id),
                                          userAddresses: updatedUserAddresses.filter(ua => ua.addressId !== addr.id)
                                        });
                                      }
                                    }}
                                  />
                                  {getAddressLabel(addr)}
                                </label>
                              </td>
                              <td style={gridTheme.td}>
                                {checked && (
                                  <RoundedInput
                                    type="date"
                                    value={link.startDate || ''}
                                    onChange={e => {
                                      const updated = (newRow.userAddresses || []).map(ua =>
                                        ua.addressId === addr.id ? { ...ua, startDate: e.target.value } : ua
                                      );
                                      setNewRow({ ...newRow, userAddresses: updated });
                                    }}
                                    style={{ marginLeft: 8, width: '100%' }}
                                    placeholder="Start Date"
                                    disabled={editRowId !== null}
                                  />
                                )}
                              </td>
                              <td style={gridTheme.td}>
                                {checked && (
                                  <RoundedInput
                                    type="date"
                                    value={link.endDate || ''}
                                    onChange={e => {
                                      const updated = (newRow.userAddresses || []).map(ua =>
                                        ua.addressId === addr.id ? { ...ua, endDate: e.target.value } : ua
                                      );
                                      setNewRow({ ...newRow, userAddresses: updated });
                                    }}
                                    style={{ marginLeft: 8, width: '100%' }}
                                    placeholder="End Date"
                                    disabled={editRowId !== null}
                                  />
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {/* User Details Section (add mode) */}
                  <div style={{ flex: 1, minWidth: 260, maxWidth: 600 }}>
                    <table style={gridTheme.table}>
                      <thead>
                        <tr style={gridTheme.tr}>
                          <th style={gridTheme.th}>Date of Birth</th>
                          <th style={gridTheme.th}>SSN</th>
                          <th style={gridTheme.th}>PAN</th>
                          <th style={gridTheme.th}>Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={gridTheme.tr}>
                          <td style={gridTheme.td}>
                            <RoundedInput
                              type="date"
                              value={newRow.dateOfBirth ? newRow.dateOfBirth.slice(0, 10) : ''}
                              onChange={e => setNewRow({ ...newRow, dateOfBirth: e.target.value })}
                              style={{ width: '100%' }}
                              disabled={editRowId !== null}
                            />
                          </td>
                          <td style={gridTheme.td}>
                            <RoundedInput
                              type="text"
                              value={newRow.ssn || ''}
                              onChange={e => setNewRow({ ...newRow, ssn: e.target.value })}
                              style={{ width: '100%' }}
                              maxLength={16}
                              disabled={editRowId !== null}
                            />
                          </td>
                          <td style={gridTheme.td}>
                            <RoundedInput
                              type="text"
                              value={newRow.pan || ''}
                              onChange={e => setNewRow({ ...newRow, pan: e.target.value })}
                              style={{ width: '100%' }}
                              maxLength={16}
                              disabled={editRowId !== null}
                            />
                          </td>
                          <td style={gridTheme.td}>
                            <RoundedInput
                              type="text"
                              value={newRow.notes || ''}
                              onChange={e => setNewRow({ ...newRow, notes: e.target.value })}
                              style={{ width: '100%' }}
                              maxLength={256}
                              placeholder="No notes"
                              disabled={editRowId !== null}
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </td>
            </tr>
          )}
          {filteredUsers.slice(0, visibleRowCount).map(user => (
            <React.Fragment key={user.id}>
              <tr style={gridTheme.tr}>
                <td>
                  <button onClick={() => toggleExpand(user.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                    {expandedRows.includes(user.id) ? (
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M6 8l4 4 4-4" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M8 6l4 4-4 4" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    )}
                  </button>
                </td>
                {columnsWithShortName.map(col => (
                  <td key={col} style={gridTheme.td}>
                    {editRowId === user.id ? (
                      col.toLowerCase() === 'dateofbirth' ? (
                        <RoundedInput
                          type="date"
                          value={editRowData[col] ? editRowData[col].slice(0, 10) : ''}
                          onChange={e => handleRowChange({ target: { value: e.target.value } }, col)}
                          style={{ border: '1px solid #1976d2', width: '100%' }}
                          disabled={false}
                        />
                      ) : (
                        <RoundedInput
                          value={editRowData[col] ?? ''}
                          onChange={e => handleRowChange(e, col)}
                          style={{ border: '1px solid #1976d2', width: '100%' }}
                          disabled={false}
                        />
                      )
                    ) : (
                      col.toLowerCase() === 'dateofbirth' ? (
                        user[col] && typeof user[col] === 'string' && !user[col].toLowerCase().includes('date of birth')
                          ? formatMonthDayYear((user[col] || '').split('T')[0])
                          : ''
                      ) : (
                        String(user[col] ?? '')
                      )
                    )}
                  </td>
                ))}
                {/* Address columns in main table */}
                {/* Removed Address, Start Date, End Date columns from main table body */}
                <td>
                  {editRowId === user.id ? (
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <ActionButton
                        onClick={() => handleRowSave(user.id)}
                        type="save"
                      />
                      <ActionButton
                        onClick={handleRowCancel}
                        type="cancel"
                      />
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <ActionButton
                        onClick={() => handleRowEdit(user)}
                        type="edit"
                      />
                      <ActionButton
                        onClick={() => handleDelete(user.id)}
                        type="delete"
                      />
                    </div>
                  )}
                </td>
              </tr>
              {/* Child row for address checkboxes in edit mode, one per line */}
              {editRowId === user.id && (
                <tr style={gridTheme.tr}>
                  <td></td>
                  <td colSpan={columnsWithShortName.length + 3} style={{ background: '#f4f8fd', padding: 8 }}>
                    <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', width: '100%' }}>
                      {/* Address Table */}
                      <table style={{ width: 'auto', borderCollapse: 'collapse', background: '#fff', minWidth: 320, width: 'max-content' }}>
                        <thead>
                          <tr>
                            <th style={gridTheme.th}>Address</th>
                            <th style={gridTheme.th}>Start Date</th>
                            <th style={gridTheme.th}>End Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {addresses.map(addr => {
                            const link = (editRowData.userAddresses || []).find(ua => ua.addressId === addr.id) || null;
                            const checked = !!link;
                            return (
                              <tr key={addr.id}>
                                <td style={gridTheme.td}>
                                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 400 }}>
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={e => {
                                        let updatedUserAddresses = Array.isArray(editRowData.userAddresses) ? [...editRowData.userAddresses] : [];
                                        if (e.target.checked) {
                                          if (!updatedUserAddresses.some(ua => ua.addressId === addr.id)) {
                                            updatedUserAddresses = [...updatedUserAddresses, { addressId: addr.id, startDate: null, endDate: null }];
                                          }
                                          setEditRowData({
                                            ...editRowData,
                                            userAddresses: updatedUserAddresses
                                          });
                                        } else {
                                          setEditRowData({
                                            ...editRowData,
                                            userAddresses: updatedUserAddresses.filter(ua => ua.addressId !== addr.id)
                                          });
                                        }
                                      }}
                                    />
                                    {getAddressLabel(addr)}
                                  </label>
                                </td>
                                <td style={gridTheme.td}>
                                  {checked && (
                                    <RoundedInput
                                      type="date"
                                      value={link.startDate || ''}
                                      onChange={e => {
                                        const updated = (editRowData.userAddresses || []).map(ua =>
                                          ua.addressId === addr.id ? { ...ua, startDate: e.target.value || null } : ua
                                        );
                                        setEditRowData({ ...editRowData, userAddresses: updated });
                                      }}
                                      style={{ width: '100%' }}
                                      placeholder="Start Date"
                                      disabled={false}
                                    />
                                  )}
                                </td>
                                <td style={gridTheme.td}>
                                  {checked && (
                                    <RoundedInput
                                      type="date"
                                      value={link.endDate || ''}
                                      onChange={e => {
                                        const updated = (editRowData.userAddresses || []).map(ua =>
                                          ua.addressId === addr.id ? { ...ua, endDate: e.target.value || null } : ua
                                        );
                                        setEditRowData({ ...editRowData, userAddresses: updated });
                                      }}
                                      style={{ width: '100%' }}
                                      placeholder="End Date"
                                      disabled={false}
                                    />
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      {/* User Details Section (edit mode) */}
                      <div style={{ flex: 1, minWidth: 260, maxWidth: 600 }}>
                        <table style={gridTheme.table}>
                          <thead>
                            <tr style={gridTheme.tr}>
                              <th style={gridTheme.th}>Date of Birth</th>
                              <th style={gridTheme.th}>SSN</th>
                              <th style={gridTheme.th}>PAN</th>
                              <th style={gridTheme.th}>Notes</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr style={gridTheme.tr}>
                              <td style={gridTheme.td}>
                                <RoundedInput
                                  type="date"
                                  value={editRowData.dateOfBirth ? editRowData.dateOfBirth.slice(0, 10) : ''}
                                  onChange={e => setEditRowData({ ...editRowData, dateOfBirth: e.target.value })}
                                  style={{ border: '1px solid #1976d2', width: '100%' }}
                                  disabled={false}
                                />
                              </td>
                              <td style={gridTheme.td}>
                                <RoundedInput
                                  type="text"
                                  value={editRowData.ssn || ''}
                                  onChange={e => setEditRowData({ ...editRowData, ssn: e.target.value })}
                                  style={{ border: '1px solid #1976d2', width: '100%' }}
                                  maxLength={16}
                                  disabled={false}
                                />
                              </td>
                              <td style={gridTheme.td}>
                                <RoundedInput
                                  type="text"
                                  value={editRowData.pan || ''}
                                  onChange={e => setEditRowData({ ...editRowData, pan: e.target.value })}
                                  style={{ border: '1px solid #1976d2', width: '100%' }}
                                  maxLength={16}
                                  disabled={false}
                                />
                              </td>
                              <td style={gridTheme.td}>
                                <RoundedInput
                                  type="text"
                                  value={editRowData.notes || ''}
                                  onChange={e => setEditRowData({ ...editRowData, notes: e.target.value })}
                                  style={{ border: '1px solid #1976d2', width: '100%' }}
                                  maxLength={256}
                                  placeholder="No notes"
                                  disabled={false}
                                />
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
              {/* Child row for address view mode, one per line */}
              {editRowId !== user.id && expandedRows.includes(user.id) && (
                <tr style={gridTheme.tr}>
                  <td></td>
                  <td colSpan={columnsWithShortName.length + 3} style={{ background: '#f4f8fd', padding: 8 }}>
                    <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', width: '100%' }}>
                      {/* Address Table (view mode, plain text) */}
                      <table style={{ width: 'auto', borderCollapse: 'collapse', background: '#fff', minWidth: 320, width: 'max-content' }}>
                        <thead>
                          <tr>
                            <th style={gridTheme.th}>Address</th>
                            <th style={gridTheme.th}>Start Date</th>
                            <th style={gridTheme.th}>End Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Sort addresses by StartDate descending */}
                          {(() => {
                            const links = getUserAddressLinks(user).slice().sort((a, b) => {
                              if (!a.startDate && !b.startDate) return 0;
                              if (!a.startDate) return 1;
                              if (!b.startDate) return -1;
                              return new Date(b.startDate) - new Date(a.startDate);
                            });
                            return links.map(link => {
                              const addr = addresses.find(a => a.id === (link.addressId || link.addressID));
                              if (!addr) return null;
                              return (
                                <tr key={link.addressId || link.addressID}>
                                  <td style={gridTheme.td}>{getAddressLabel(addr)}</td>
                                  <td style={gridTheme.td}>{formatMonthDayYear(link.startDate)}</td>
                                  <td style={gridTheme.td}>{formatMonthDayYear(link.endDate)}</td>
                                </tr>
                              );
                            });
                          })()}
                        </tbody>
                      </table>
                      {/* User Details Section (view mode, plain text) */}
                      <div style={{ flex: 1, minWidth: 260, maxWidth: 600 }}>
                        <table style={gridTheme.table}>
                          <thead>
                            <tr style={gridTheme.tr}>
                              <th style={gridTheme.th}>Date of Birth</th>
                              <th style={gridTheme.th}>SSN</th>
                              <th style={gridTheme.th}>PAN</th>
                              <th style={gridTheme.th}>Notes</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr style={gridTheme.tr}>
                              <td style={gridTheme.td}>{user.dateOfBirth ? formatMonthDayYear(user.dateOfBirth) : ''}</td>
                              <td style={gridTheme.td}>{user.ssn || ''}</td>
                              <td style={gridTheme.td}>{user.pan || ''}</td>
                              <td style={{ ...gridTheme.td, whiteSpace: 'pre-wrap', overflowX: 'auto', fontFamily: 'inherit' }}>{user.notes || ''}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    );
  };

  // Render the confirmation modal at the root of the component
  return (
    <div style={{ padding: 20, paddingTop: 0 }}>
      <ConfirmModal
        open={confirm.open}
        message={confirm.message}
        onConfirm={confirm.onConfirm}
        onCancel={confirm.onCancel}
      />
      <GridBanner
        icon={paymentIcon}
        title="Users"
        searchText={searchText}
        setSearchText={setSearchText}
        placeholder="Search users..."
      />
      <div style={{ height: 12 }} />
      <div style={{ width: 'fit-content', minWidth: 0, margin: '0 auto', maxWidth: '100%' }}>
        {/* Fix: Ensure parent div has position: relative and minWidth, and scroll container fills parent for borderRadius to apply on all corners */}
        <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 12px rgba(25, 118, 210, 0.07)', border: '1px solid #dde6f7', background: '#f9fbfd', minWidth: 600 }}>
          <div style={{ ...gridTheme.scrollContainer, maxHeight: 56 + 48 * visibleRowCount, overflowY: 'auto', borderRadius: 0, boxShadow: 'none', border: 'none', background: 'transparent', width: '100%', minWidth: 0 }}>
            {renderUsersTable()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UsersPage;
