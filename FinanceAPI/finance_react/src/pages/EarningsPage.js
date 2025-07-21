import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ConfirmModal from '../components/ConfirmModal';
import { ActionButton } from '../components/ActionButton';
import GridBanner from '../components/GridBanner';
import { gridTheme } from '../components/gridTheme';
import { currencyOptions, getEarningsTypeOptions, getFrequencyTypeOptions } from '../constants/Fixedlist';
import RoundedInput from '../components/RoundedInput';
import RoundedDropdown from '../components/RoundedDropdown';
import {formatCurrencyValue, formatMonthDayYear} from '../helpers/Helper';

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


const API_URL = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:5226/api') + '/earnings';
const USERS_API_URL = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:5226/api') + '/users';

// Column definitions for dynamic width calculation
const EARNINGS_COLUMNS = [
  { key: 'fullName', label: 'User', type: 'text' },
  { key: 'sourceName', label: 'Source', type: 'text' },
  { key: 'amount', label: 'Amount', type: 'number' },
  { key: 'frequency', label: 'Frequency', type: 'dropdown' },
  { key: 'description', label: 'Description', type: 'text' }
];

// Helper function to parse earning row data for API
const parseEarningRow = (row) => ({
  ...row,
  amount: row.amount !== undefined && row.amount !== '' ? Number(row.amount) : null,
  userId: row.userId !== undefined ? Number(row.userId) : null
});

export default function EarningsPage(props) {
  const [earnings, setEarnings] = useState([]);
  const [editRowId, setEditRowId] = useState(null);
  const [editRowData, setEditRowData] = useState({});
  const [newRow, setNewRow] = useState({});
  const [confirm, setConfirm] = useState({ open: false, message: '', onConfirm: null });
  const [searchText, setSearchText] = useState('');
  const [filteredEarnings, setFilteredEarnings] = useState([]);
  const [users, setUsers] = useState([]);

  // Define column structure similar to DiamondPage
  const colKeys = ['type', 'frequency', 'startDate', 'sender', 'receiver', 'item', 'amount', 'endDate', 'ownerId', 'lastUpdatedDate', 'description'];
  const colHeaders = ['Type', 'Frequency', 'Start Date', 'Sender', 'Receiver', 'Item', 'Volume/Unit', 'End Date', 'Owner', 'Last Updated', 'Description'];

  // Declare fetch functions first to avoid temporal dead zone
  const fetchEarnings = async () => {
    const res = await axios.get(API_URL);
    setEarnings(res.data);
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(USERS_API_URL);
      setUsers(res.data);
    } catch {}
  };

  // Use common generic handlers
  const {
    handleRowSave,
    handleRowCancel,
    handleDelete,
    handleAdd
  } = createGenericHandlers({
    apiUrl: API_URL,
    editRowData,
    setEditRowId,
    setEditRowData,
    newRow,
    setNewRow,
    fetchData: fetchEarnings,
    parseRow: parseEarningRow,
    modalConfig: {
      update: 'Are you sure you want to update this earning?',
      delete: 'Are you sure you want to delete this earning?',
      add: 'Are you sure you want to add this earning?'
    },
    setConfirm
  });

  useEffect(() => { fetchEarnings(); fetchUsers(); }, []);

  useEffect(() => {
    setFilteredEarnings(createSearchFilter(earnings, searchText));
  }, [searchText, earnings]);

  const handleRowEdit = (earning) => {
    setEditRowId(earning.id);
    setEditRowData(earning);
  };

  const handleRowChange = (e, col) => {
    setEditRowData({ ...editRowData, [col]: e.target.value });
  };

  const handleCancel = () => {
    setEditRowId(null);
    setEditRowData({});
  };

  const handleSave = async (earningId) => {
    setConfirm({
      open: true,
      message: 'Are you sure you want to update this earning?',
      onConfirm: async () => {
        setConfirm({ open: false });
        try {
          const parsedData = parseEarningRow(editRowData);
          await axios.put(`${API_URL}/${earningId}`, parsedData);
          setEditRowId(null);
          setEditRowData({});
          await fetchEarnings();
        } catch (err) {
          alert('Failed to update earning. Please check your input and try again.');
        }
      }
    });
  };



  // Add common helper functions
  const columnFonts = createColumnFonts(colKeys.length);
  const allRows = createAllRows(newRow, filteredEarnings, editRowData);



  // User dropdown options
  const userOptions = users.map(u => ({ value: u.id, label: u.shortName || `${u.firstName || ''} ${u.lastName || ''}`.trim() }));
  const getUserLabel = (id) => userOptions.find(u => u.value === id)?.label || id || '';

  // Get frequency options from constants
  const frequencyComboOptions = getFrequencyTypeOptions();
  
  // Get type options from constants
  const typeComboOptions = getEarningsTypeOptions();

  return (
    <div className="page-container">
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
      <div style={{ width: 'fit-content', margin: '0 auto'}}>
        {/* Set maxHeight to show 20 rows (20 * 40px = 800px) */}
        <div style={{ ...gridTheme.scrollContainer, maxHeight: 800, overflowY: 'auto' }}>
          <table style={gridTheme.table}>
            <thead>
              <tr>
                {colHeaders.map((header, i) => (
                  <th key={header} style={gridTheme.th} colSpan={header === 'Volume/Unit' ? 2 : 1}>
                    {header === 'Volume/Unit' ? 'Volume\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Unit' : header}
                  </th>
                ))}
                <th style={gridTheme.th}></th>
              </tr>
            </thead>
            <tbody>
              {/* Add row for new earning */}
              <tr>
                {colKeys.map((key, i) => (
                  <td key={key} style={gridTheme.td} colSpan={key === 'amount' ? 2 : 1}>
                    {key === 'type' ? (
                      <RoundedDropdown
                        value={newRow.type || ''}
                        onChange={e => setNewRow({ ...newRow, type: e.target.value })}
                        options={typeComboOptions}
                        placeholder="Type"
                        disabled={editRowId !== null}
                        colFonts={columnFonts}
                        colHeaders={colHeaders}
                        allRows={allRows}
                        colKey={key}
                        i={i}
                      />
                    ) : key === 'frequency' ? (
                      <RoundedDropdown
                        value={newRow.frequency || ''}
                        onChange={e => setNewRow({ ...newRow, frequency: e.target.value })}
                        options={frequencyComboOptions}
                        placeholder="Frequency"
                        disabled={editRowId !== null}
                        colFonts={columnFonts}
                        colHeaders={colHeaders}
                        allRows={allRows}
                        colKey={key}
                        i={i}
                      />
                    ) : key === 'sender' ? (
                      <RoundedDropdown
                        value={newRow.sender || ''}
                        onChange={e => setNewRow({ ...newRow, sender: e.target.value })}
                        options={userOptions}
                        placeholder="Sender"
                        disabled={editRowId !== null}
                        colFonts={columnFonts}
                        colHeaders={colHeaders}
                        allRows={allRows}
                        colKey={key}
                        i={i}
                      />
                    ) : key === 'receiver' ? (
                      <RoundedDropdown
                        value={newRow.receiver || ''}
                        onChange={e => setNewRow({ ...newRow, receiver: e.target.value })}
                        options={userOptions}
                        placeholder="Receiver"
                        disabled={editRowId !== null}
                        colFonts={columnFonts}
                        colHeaders={colHeaders}
                        allRows={allRows}
                        colKey={key}
                        i={i}
                      />
                    ) : key === 'ownerId' ? (
                      <RoundedDropdown
                        value={newRow.ownerId || ''}
                        onChange={e => setNewRow({ ...newRow, ownerId: e.target.value })}
                        options={userOptions}
                        placeholder="Owner"
                        disabled={editRowId !== null}
                        colFonts={columnFonts}
                        colHeaders={colHeaders}
                        allRows={allRows}
                        colKey={key}
                        i={i}
                      />
                    ) : key === 'amount' ? (
                      <div style={FLEX_ROW_CENTER}>
                        <RoundedInput 
                          value={newRow.amount || ''} 
                          onChange={e => setNewRow({ ...newRow, amount: e.target.value })} 
                          placeholder="Amount" 
                          style={{ width: '60%' }} 
                          disabled={editRowId !== null}
                          colFonts={columnFonts}
                          colHeaders={colHeaders}
                          allRows={allRows}
                          colKey={key}
                          i={i}
                        />
                        <RoundedDropdown
                          value={newRow.currency || ''}
                          onChange={e => setNewRow({ ...newRow, currency: e.target.value })}
                          options={currencyOptions}
                          placeholder="Currency"
                          disabled={editRowId !== null}
                        />
                      </div>
                    ) : key === 'startDate' || key === 'endDate' || key === 'lastUpdatedDate' ? (
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
              {filteredEarnings.map(earning => (
                <tr key={earning.id}>
                  {colKeys.map((key, i) => (
                    <td key={key} style={gridTheme.td} colSpan={key === 'amount' ? 2 : 1}>
                      {editRowId === earning.id ? (
                        key === 'type' ? (
                          <RoundedDropdown
                            value={editRowData.type || ''}
                            onChange={e => handleRowChange(e, 'type')}
                            options={typeComboOptions}
                            placeholder="Type"
                            style={{ border: '1px solid #1976d2' }}
                            colFonts={columnFonts}
                            colHeaders={colHeaders}
                            allRows={allRows}
                            colKey={key}
                            i={i}
                          />
                        ) : key === 'frequency' ? (
                          <RoundedDropdown
                            value={editRowData.frequency || ''}
                            onChange={e => handleRowChange(e, 'frequency')}
                            options={frequencyComboOptions}
                            placeholder="Frequency"
                            style={{ border: '1px solid #1976d2' }}
                            colFonts={columnFonts}
                            colHeaders={colHeaders}
                            allRows={allRows}
                            colKey={key}
                            i={i}
                          />
                        ) : key === 'sender' ? (
                          <RoundedDropdown
                            value={editRowData.sender || ''}
                            onChange={e => handleRowChange(e, 'sender')}
                            options={userOptions}
                            placeholder="Sender"
                            style={{ border: '1px solid #1976d2' }}
                            colFonts={columnFonts}
                            colHeaders={colHeaders}
                            allRows={allRows}
                            colKey={key}
                            i={i}
                          />
                        ) : key === 'receiver' ? (
                          <RoundedDropdown
                            value={editRowData.receiver || ''}
                            onChange={e => handleRowChange(e, 'receiver')}
                            options={userOptions}
                            placeholder="Receiver"
                            style={{ border: '1px solid #1976d2' }}
                            colFonts={columnFonts}
                            colHeaders={colHeaders}
                            allRows={allRows}
                            colKey={key}
                            i={i}
                          />
                        ) : key === 'ownerId' ? (
                          <RoundedDropdown
                            value={editRowData.ownerId || ''}
                            onChange={e => handleRowChange(e, 'ownerId')}
                            options={userOptions}
                            placeholder="Owner"
                            style={{ border: '1px solid #1976d2' }}
                            colFonts={columnFonts}
                            colHeaders={colHeaders}
                            allRows={allRows}
                            colKey={key}
                            i={i}
                          />
                        ) : key === 'amount' ? (
                          <div style={FLEX_ROW_CENTER}>
                            <RoundedInput 
                              value={editRowData.amount || ''} 
                              onChange={e => handleRowChange(e, 'amount')} 
                              placeholder="Amount / Qty" 
                              style={{ border: '1px solid #1976d2', width: '60%' }}
                              colFonts={columnFonts}
                              colHeaders={colHeaders}
                              allRows={allRows}
                              colKey={key}
                              i={i}
                            />
                            <RoundedDropdown
                              value={editRowData.currency || ''}
                              onChange={e => handleRowChange(e, 'currency')}
                              options={currencyOptions}
                              style={{ border: '1px solid #1976d2', width: '40%' }}
                              placeholder="Currency"
                            />
                          </div>
                        ) : key === 'startDate' || key === 'endDate' || key === 'lastUpdatedDate' ? (
                          <RoundedInput 
                            type="date" 
                            value={editRowData[key] || ''} 
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
                            style={{ border: '1px solid #1976d2' }}
                            colFonts={columnFonts}
                            colHeaders={colHeaders}
                            allRows={allRows}
                            colKey={key}
                            i={i}
                          />
                        )
                      ) : (
                        key === 'type' ? (
                          earning.type
                        ) : key === 'frequency' ? (
                          earning.frequency
                        ) : key === 'startDate' || key === 'endDate' || key === 'lastUpdatedDate' ? (
                          formatMonthDayYear(earning[key])
                        ) : key === 'sender' ? (
                          getUserLabel(earning.sender)
                        ) : key === 'receiver' ? (
                          getUserLabel(earning.receiver)
                        ) : key === 'ownerId' ? (
                          getUserLabel(earning.ownerId)
                        ) : key === 'amount' ? (
                          <>{formatCurrencyValue(earning.amount, earning.currency)}</>
                        ) : (
                          earning[key]
                        )
                      )}
                    </td>
                  ))}
                  <td style={gridTheme.td}>
                    {editRowId === earning.id ? (
                      <div style={ACTION_BUTTON_CONTAINER_STYLE}>
                        <ActionButton
                          onClick={() => handleSave(earning.id)}
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
