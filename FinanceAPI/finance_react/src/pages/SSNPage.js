import React, { useEffect, useState } from 'react';
import axios from 'axios';
import GridBanner from '../components/GridBanner';
import { gridTheme } from '../components/gridTheme';
import { ActionButton } from '../components/ActionButton';
import ConfirmModal from '../components/ConfirmModal';
import RoundedInput from '../components/RoundedInput';
import RoundedDropdown from '../components/RoundedDropdown';
import ssnIcon from '../components/icons/ssn.png';
import { currencyOptions } from '../constants/Fixedlist';
import { formatMonthDayYear, formatCurrencyValue, formatDateForInput } from '../helpers/Helper';
import { ACTION_BUTTON_CONTAINER_STYLE } from '../constants/common';

const API_URL = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:5226/api') + '/investment/ssn';
const USERS_API_URL = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:5226/api') + '/users';

export default function SSNPage() {
  const [ssns, setSSNs] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filteredSSNs, setFilteredSSNs] = useState([]);
  const [editRowId, setEditRowId] = useState(null);
  const [editRowData, setEditRowData] = useState({});
  const [newRow, setNewRow] = useState({});
  const [confirm, setConfirm] = useState({ open: false });
  const [users, setUsers] = useState([]);

  useEffect(() => { fetchSSNs(); fetchUsers(); }, []);

  useEffect(() => {
    if (!searchText) setFilteredSSNs(ssns);
    else {
      const lower = searchText.toLowerCase();
      setFilteredSSNs(
        ssns.filter(s =>
          Object.values(s).some(val =>
            (typeof val === 'string' && val.toLowerCase().includes(lower)) ||
            (typeof val === 'number' && String(val).includes(lower))
          )
        )
      );
    }
  }, [searchText, ssns]);

  const fetchSSNs = async () => {
    const res = await axios.get(API_URL);
    console.log('=== SSN API Response ===');
    console.log('SSN data:', res.data);
    if (res.data.length > 0) {
      console.log('First SSN record dates:', {
        lastUpdatedDate: res.data[0].lastUpdatedDate,
        type: typeof res.data[0].lastUpdatedDate
      });
    }
    console.log('=======================');
    setSSNs(res.data);
  };

  const fetchUsers = async () => {
    const res = await axios.get(USERS_API_URL);
    setUsers(res.data);
  };

  // Build owner dropdown options from users (family users only)
  const userOptions = users
    .filter(u => u.shortName && u.group && u.group.toLowerCase() === 'family')
    .map(u => ({ label: u.shortName, value: u.id }));

  // Helper to get shortName from userId
  const getUserLabel = (userId) => {
    if (userId === undefined || userId === null || userId === '') {
      return '';
    }
    const user = users.find(u => String(u.id) === String(userId));
    return user && user.shortName ? user.shortName : '';
  };

  const handleRowEdit = (ssn) => {
    console.log('=== SSN Page Debug ===');
    console.log('Raw SSN object:', ssn);
    console.log('SSN lastUpdatedDate value:', ssn.lastUpdatedDate);
    console.log('SSN lastUpdatedDate type:', typeof ssn.lastUpdatedDate);
    console.log('Date object from SSN date:', new Date(ssn.lastUpdatedDate));
    console.log('=====================');
    setEditRowId(ssn.id);
    setEditRowData({ ...ssn });
  };

  const handleCancel = () => {
    setEditRowId(null);
    setEditRowData({});
  };

  const handleRowChange = (e, key) => {
    setEditRowData({ ...editRowData, [key]: e.target.value });
  };

  const handleSave = async (id) => {
    setConfirm({
      open: true,
      message: 'Are you sure you want to update this SSN record?',
      onConfirm: async () => {
        setConfirm({ open: false });
        try {
          let payload = { ...editRowData };
          delete payload.userShortName;
          Object.keys(payload).forEach(key => { if (payload[key] === '') delete payload[key]; });
          
          await axios.put(`${API_URL}/${id}`, payload);
          setEditRowId(null);
          setEditRowData({});
          await fetchSSNs();
        } catch (err) {
          console.error('SSN Update Error:', err.response?.data || err.message);
          alert(`Failed to update SSN record: ${err.response?.data?.message || err.message}`);
        }
      }
    });
  };

  const handleAdd = async () => {
    setConfirm({
      open: true,
      message: 'Are you sure you want to add this SSN record?',
      onConfirm: async () => {
        setConfirm({ open: false });
        try {
          let payload = { ...newRow };
          delete payload.userShortName;
          delete payload.id;
          Object.keys(payload).forEach(key => { if (payload[key] === '') delete payload[key]; });
          await axios.post(API_URL, payload);
          setNewRow({});
          await fetchSSNs();
        } catch (err) {
          alert('Failed to add SSN record. Please check your input and try again.');
        }
      }
    });
  };

  const handleDelete = (id) => {
    setConfirm({
      open: true,
      message: 'Are you sure you want to delete this SSN record?',
      onConfirm: async () => {
        setConfirm({ open: false });
        await axios.delete(`${API_URL}/${id}`);
        await fetchSSNs();
      }
    });
  };

  const allRows = [newRow, ...filteredSSNs, editRowData];
  const colKeys = [
    'userId', 'currency', 'monthlyAfter62', 'monthlyAfter67', 'monthlyAfter70', 'lastUpdatedDate', 'description'
  ];
  const colHeaders = [
    'Owner', 'Currency', 'Monthly After 62', 'Monthly After 67', 'Monthly After 70', 'Last Updated', 'Description'
  ];
  const columnFonts = Array(colKeys.length).fill('16px Arial');

  return (
    <div className="page-container">
      <GridBanner
        icon={ssnIcon}
        title="Social Security"
        searchText={searchText}
        setSearchText={setSearchText}
        placeholder="Search SSN records..."
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', textAlign: 'left', width: '100%' }}
        titleStyle={{ fontSize: 28, fontWeight: 600, marginLeft: 12, textAlign: 'left', display: 'inline-block' }}
        iconStyle={{ height: 40, display: 'inline-block' }}
      />
      <div style={{ height: 12 }} />
      <div style={{ width: 'fit-content', margin: '0 auto'}}>
        <div style={{ ...gridTheme.scrollContainer, maxHeight: 800, overflowY: 'auto' }}>
          <table style={gridTheme.table}>
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
                    {key === 'userId' ? (
                      <RoundedDropdown
                        value={newRow.userId || ''}
                        onChange={e => setNewRow({ ...newRow, userId: e.target.value })}
                        options={userOptions}
                        placeholder="Owner"
                        disabled={editRowId !== null}
                        colFonts={columnFonts}
                        colHeaders={colHeaders}
                        allRows={allRows}
                        colKey={key}
                        i={i}
                      />
                    ) : key === 'currency' ? (
                      <RoundedDropdown
                        value={newRow.currency || ''}
                        onChange={e => setNewRow({ ...newRow, currency: e.target.value })}
                        options={currencyOptions}
                        placeholder="Currency"
                        disabled={editRowId !== null}
                      />
                    ) : key === 'lastUpdatedDate' ? (
                      <RoundedInput 
                        type="date" 
                        value={newRow[key] || ''} 
                        onChange={e => setNewRow({ ...newRow, [key]: e.target.value })} 
                        placeholder={colHeaders[i]} 
                        disabled={editRowId !== null}
                        colFonts={columnFonts}
                        colHeaders={colHeaders}
                        allRows={allRows}
                        colKey={key}
                        i={i}
                      />
                    ) : (
                      <RoundedInput 
                        value={newRow[key] || ''} 
                        onChange={e => setNewRow({ ...newRow, [key]: e.target.value })} 
                        placeholder={colHeaders[i]} 
                        type={key === 'monthlyAfter62' || key === 'monthlyAfter67' || key === 'monthlyAfter70' ? 'number' : 'text'}
                        disabled={editRowId !== null}
                        colFonts={columnFonts}
                        colHeaders={colHeaders}
                        allRows={allRows}
                        colKey={key}
                        i={i}
                      />
                    )}
                  </td>
                ))}
                <td style={{ border: '1px solid #ccc', padding: 4, verticalAlign: 'middle' }}>
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
              {filteredSSNs.map(ssn => (
                <tr key={ssn.id}>
                  {colKeys.map((key, i) => (
                    <td key={key} style={gridTheme.td}>
                      {editRowId === ssn.id ? (
                        key === 'userId' ? (
                          <RoundedDropdown
                            value={editRowData.userId || ''}
                            onChange={e => handleRowChange(e, 'userId')}
                            options={userOptions}
                            placeholder="Owner"
                            style={{ border: '1px solid #1976d2' }}
                            colFonts={columnFonts}
                            colHeaders={colHeaders}
                            allRows={allRows}
                            colKey={key}
                            i={i}
                          />
                        ) : key === 'currency' ? (
                          <RoundedDropdown
                            value={editRowData.currency || ''}
                            onChange={e => handleRowChange(e, 'currency')}
                            options={currencyOptions}
                            placeholder="Currency"
                            style={{ border: '1px solid #1976d2' }}
                          />
                        ) : key === 'lastUpdatedDate' ? (
                          <RoundedInput 
                            type="date" 
                            value={formatDateForInput(editRowData[key]) || ''} 
                            onChange={e => handleRowChange(e, key)} 
                            placeholder={colHeaders[i]} 
                            style={{ border: '1px solid #1976d2' }}
                            colFonts={columnFonts}
                            colHeaders={colHeaders}
                            allRows={allRows}
                            colKey={key}
                            i={i}
                          />
                        ) : (
                          <RoundedInput 
                            value={editRowData[key] || ''} 
                            onChange={e => handleRowChange(e, key)} 
                            placeholder={colHeaders[i]} 
                            type={key === 'monthlyAfter62' || key === 'monthlyAfter67' || key === 'monthlyAfter70' ? 'number' : 'text'}
                            style={{ border: '1px solid #1976d2' }}
                            colFonts={columnFonts}
                            colHeaders={colHeaders}
                            allRows={allRows}
                            colKey={key}
                            i={i}
                          />
                        )
                      ) : (
                        key === 'lastUpdatedDate' ? (
                          formatMonthDayYear(ssn[key])
                        ) : key === 'userId' ? (
                          getUserLabel(ssn.userId)
                        ) : key === 'monthlyAfter62' || key === 'monthlyAfter67' || key === 'monthlyAfter70' ? (
                          formatCurrencyValue(ssn[key], ssn.currency)
                        ) : (
                          ssn[key]
                        )
                      )}
                    </td>
                  ))}
                  <td style={gridTheme.td}>
                    {editRowId === ssn.id ? (
                      <div style={ACTION_BUTTON_CONTAINER_STYLE}>
                        <ActionButton
                          onClick={() => handleSave(ssn.id)}
                          type="save"
                          title="Save"
                        />
                        <ActionButton
                          onClick={handleCancel}
                          type="cancel"
                          title="Cancel"
                        />
                      </div>
                    ) : (
                      <div style={ACTION_BUTTON_CONTAINER_STYLE}>
                        <ActionButton
                          onClick={() => handleRowEdit(ssn)}
                          type="edit"
                          title="Edit"
                        />
                        <ActionButton
                          onClick={() => handleDelete(ssn.id)}
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