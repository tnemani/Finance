import React, { useEffect, useState } from 'react';
import axios from 'axios';
import GridBanner from '../components/GridBanner';
import { gridTheme } from '../components/gridTheme';
import { ActionButton } from '../components/ActionButton';
import ConfirmModal from '../components/ConfirmModal';
import RoundedInput from '../components/RoundedInput';
import RoundedDropdown from '../components/RoundedDropdown';
import paymentIcon from '../components/icons/users_banner.png';
import { inputTheme } from '../components/inputTheme';
import { formatPhoneNumber, formatMonthDayYear } from '../helpers/Helper';
import { getUserGroupOptions } from '../constants/Fixedlist';
import {
  SPACING,
  BUTTON_STYLE,
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

const API_URL = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:5226/api') + '/users';
const ADDRESSES_API_URL = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:5226/api') + '/addresses';

// Column definitions for consistent use
const USER_COLUMNS = {
  keys: ['firstName', 'lastName', 'middleName', 'mobile1', 'mobile2', 'landLine', 'officeNo', 'email1', 'email2', 'workEmail', 'shortName', 'group'],
  headers: ['First Name', 'Last Name', 'Middle Name', 'Mobile1', 'Mobile2', 'Land Line', 'Office No', 'Email1', 'Email2', 'Work Email', 'Short Name', 'Group']
};

const DETAIL_COLUMNS = {
  keys: ['dateOfBirth', 'ssn', 'aadhar', 'pan', 'notes'],
  headers: ['Date of Birth', 'SSN', 'Aadhar', 'PAN', 'Notes']
};

export default function UsersPage() {
  const [addRow, setAddRow] = useState({});
  function toPascalCase(str) {
    return str.replace(/(^|_)([a-z])/g, (match, p1, p2) => p2.toUpperCase());
  }


  const [users, setUsers] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [editRowId, setEditRowId] = useState(null);
  const [editRowData, setEditRowData] = useState({});
  const [expandedRows, setExpandedRows] = useState([]);
  const [newRow, setNewRow] = useState({});
  const [addRowExpanded, setAddRowExpanded] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, message: '', onConfirm: null });
  const [searchText, setSearchText] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [allExpanded, setAllExpanded] = useState(false);
  const [visibleRowCount, setVisibleRowCount] = useState(10);

  // Column definitions for consistent styling
  const allRows = [newRow, ...filteredUsers, editRowData];
  const colFonts = Array(USER_COLUMNS.keys.length).fill('16px Arial');
  const detailColFonts = Array(DETAIL_COLUMNS.keys.length).fill('16px Arial');

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

    const handleDropdownChange = (e, col) => {
      const value = e.target ? e.target.value : e;
      setEditRowData({ ...editRowData, [col]: value });
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

    // Custom grid to show addresses as internal grid, using consistent column definitions
    const renderUsersTable = (expandedRowsOverride) => {
    if (!Array.isArray(filteredUsers) || filteredUsers.length === 0) return <tr><td colSpan={USER_COLUMNS.keys.length + 2}>No users</td></tr>;

      return (
        <>
          <thead>
            <tr>
              {/* Put expand/collapse all button at the first column position */}
              {USER_COLUMNS.keys.map((col, idx) => {
                if (idx === 0) {
                  return [
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
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <polyline points="6 9 12 15 18 9" stroke="#1976d2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                          </svg>
                        ) : (
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <polyline points="9 6 15 12 9 18" stroke="#1976d2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                          </svg>
                        )}
                      </button>
                    </th>,
                    <th key={col} style={gridTheme.th}>
                      {USER_COLUMNS.headers[idx]}
                    </th>
                  ];
                } else {
                  return (
                    <th key={col} style={gridTheme.th}>
                      {USER_COLUMNS.headers[idx]}
                    </th>
                  );
                }
              }).flat()}
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
                  style={BUTTON_STYLE}
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
              {USER_COLUMNS.keys.map((col, idx) => (
                <td key={col} style={gridTheme.td}>
                  {col === 'group' ? (
                    <RoundedDropdown
                      options={getUserGroupOptions()}
                      value={newRow[col] || ''}
                      onChange={e => setNewRow({ ...newRow, [col]: e.target ? e.target.value : e })}
                      placeholder={USER_COLUMNS.headers[idx]}
                      style={{ ...inputTheme }}
                      disabled={editRowId !== null}
                    />
                  ) : (
                    <RoundedInput
                      value={newRow[col] || ''}
                      onChange={e => setNewRow({ ...newRow, [col]: e.target.value })}
                      placeholder={USER_COLUMNS.headers[idx]}
                      type={col === 'dateOfBirth' ? 'date' : col.includes('mobile') || col.includes('phone') ? 'tel' : col.includes('email') ? 'email' : 'text'}
                      colFonts={colFonts}
                      colHeaders={USER_COLUMNS.headers}
                      allRows={allRows}
                      colKey={col}
                      i={idx}
                      style={{ ...inputTheme }}
                      disabled={editRowId !== null}
                    />
                  )}
                </td>
              ))}
              <td style={gridTheme.td}>
                <div style={{ ...FLEX_ROW_CENTER, gap: SPACING.small }}>
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
                <td colSpan={USER_COLUMNS.keys.length + 4} style={{ background: '#f4f8fd', padding: SPACING.medium }}>
                  <div style={{ display: 'flex', gap: SPACING.extraLarge, alignItems: 'flex-start', width: '100%' }}>
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
                                  <label style={{ display: 'flex', alignItems: 'center', gap: SPACING.medium }}>
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
                                      placeholder="Start Date"
                                      style={{ ...inputTheme, marginLeft: 8 }}
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
                                      placeholder="End Date"
                                      style={{ ...inputTheme, marginLeft: 8 }}
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
                            {DETAIL_COLUMNS.headers.map(header => (
                              <th key={header} style={gridTheme.th}>{header}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr style={gridTheme.tr}>
                            {DETAIL_COLUMNS.keys.map((key, idx) => (
                              <td key={key} style={gridTheme.td}>
                                <RoundedInput
                                  value={newRow[key] ? (key === 'dateOfBirth' ? newRow[key].slice(0, 10) : newRow[key]) : ''}
                                  onChange={e => setNewRow({ ...newRow, [key]: e.target.value })}
                                  placeholder={DETAIL_COLUMNS.headers[idx]}
                                  type={key === 'dateOfBirth' ? 'date' : 'text'}
                                  //maxLength={key === 'ssn' || key === 'pan' || key === 'aadhar' ? 16 : key === 'notes' ? 256 : undefined}
                                  colFonts={detailColFonts}
                                  colHeaders={DETAIL_COLUMNS.headers}
                                  allRows={allRows}
                                  colKey={key}
                                  i={idx}
                                  style={{ ...inputTheme }}
                                  disabled={editRowId !== null}
                                />
                              </td>
                            ))}
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
                    <button onClick={() => toggleExpand(user.id)} style={BUTTON_STYLE}>
                      {expandedRows.includes(user.id) ? (
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M6 8l4 4 4-4" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M8 6l4 4-4 4" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      )}
                    </button>
                  </td>
                  {USER_COLUMNS.keys.map((col, idx) => (
                    <td key={col} style={gridTheme.td}>
                      {editRowId === user.id ? (
                        col === 'group' ? (
                          <RoundedDropdown
                            options={getUserGroupOptions()}
                            value={editRowData[col] || ''}
                            onChange={e => handleDropdownChange(e, col)}
                            placeholder={USER_COLUMNS.headers[idx]}
                            style={{ ...inputTheme }}
                            disabled={false}
                          />
                        ) : (
                          <RoundedInput
                            value={editRowData[col] ? (col === 'dateOfBirth' ? editRowData[col].slice(0, 10) : editRowData[col]) : ''}
                            onChange={e => handleRowChange(e, col)}
                            placeholder={USER_COLUMNS.headers[idx]}
                            type={col === 'dateOfBirth' ? 'date' : col.includes('mobile') || col.includes('phone') ? 'tel' : col.includes('email') ? 'email' : 'text'}
                            colFonts={colFonts}
                            colHeaders={USER_COLUMNS.headers}
                            allRows={allRows}
                            colKey={col}
                            i={idx}
                            style={{ ...inputTheme }}
                            disabled={false}
                          />
                        )
                      ) : (
                        col === 'dateOfBirth' ? (
                          user[col] && typeof user[col] === 'string' && !user[col].toLowerCase().includes('date of birth')
                            ? formatMonthDayYear((user[col] || '').split('T')[0])
                            : ''
                        ) : col === 'mobile1' || col === 'mobile2' || col === 'landLine' || col === 'officeNo' ? (
                          formatPhoneNumber(user[col] || '')
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
                      <div style={{ ...FLEX_ROW_CENTER, gap: SPACING.small }}>
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
                      <div style={{ ...FLEX_ROW_CENTER, gap: SPACING.small }}>
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
                    <td colSpan={USER_COLUMNS.keys.length + 3} style={{ background: '#f4f8fd', padding: SPACING.medium }}>
                      <div style={{ display: 'flex', gap: SPACING.extraLarge, alignItems: 'flex-start', width: '100%' }}>
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
                                    <label style={{ display: 'flex', alignItems: 'center', gap: SPACING.medium, fontWeight: 400 }}>
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
                                        placeholder="Start Date"
                                        style={{ ...inputTheme }}
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
                                        placeholder="End Date"
                                        style={{ ...inputTheme }}
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
                    <td colSpan={USER_COLUMNS.keys.length + 3} style={{ background: '#f4f8fd', padding: SPACING.medium }}>
                      <div style={{ display: 'flex', gap: SPACING.extraLarge, alignItems: 'flex-start', width: '100%' }}>
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
        </>
      );
    };

    // Render the confirmation modal at the root of the component
    return (
      <div style={{ padding: 0, paddingTop: 0 }}>
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
        <div style={{ height: 16 }} />
        <div style={{ width: 'fit-content', minWidth: 0, margin: '0 auto', maxWidth: '100%' }}>
          <div style={{
            ...gridTheme.scrollContainer,
            maxHeight: '100%',
            minHeight: 0,
            overflowY: 'auto',
          }}>
            <table style={{ ...gridTheme.table, tableLayout: 'auto', minWidth: 1200 }}>
              {renderUsersTable()}
            </table>
          </div>
        </div>
      </div>
    );
}