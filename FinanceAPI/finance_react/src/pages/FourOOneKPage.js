import React, { useEffect, useState } from 'react';
import axios from 'axios';
import GridBanner from '../components/GridBanner';
import { gridTheme } from '../components/gridTheme';
import { ActionButton } from '../components/ActionButton';
import ConfirmModal from '../components/ConfirmModal';
import RoundedInput from '../components/RoundedInput';
import RoundedDropdown from '../components/RoundedDropdown';
import fourOOneKIcon from '../components/icons/401k.png';
import { inputTheme } from '../components/inputTheme';
import { currencyOptions } from '../constants/Fixedlist';
import { formatMonthDayYear, formatCurrencyValue, formatDateForInput } from '../helpers/Helper';
import { ACTION_BUTTON_CONTAINER_STYLE } from '../constants/common';

const API_URL = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:5226/api') + '/investment/401k';
const USERS_API_URL = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:5226/api') + '/users';

export default function FourOOneKPage() {
  const [fourOOneKs, setFourOOneKs] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filteredFourOOneKs, setFilteredFourOOneKs] = useState([]);
  const [editIdx, setEditIdx] = useState(null);
  const [editRow, setEditRow] = useState({});
  const [addRow, setAddRow] = useState({});
  const [confirm, setConfirm] = useState({ open: false, idx: null });
  const [users, setUsers] = useState([]);

  useEffect(() => { fetchFourOOneKs(); fetchUsers(); }, []);

  useEffect(() => {
    if (!searchText) setFilteredFourOOneKs(fourOOneKs);
    else {
      const lower = searchText.toLowerCase();
      setFilteredFourOOneKs(
        fourOOneKs.filter(s =>
          Object.values(s).some(val =>
            (typeof val === 'string' && val.toLowerCase().includes(lower)) ||
            (typeof val === 'number' && String(val).includes(lower))
          )
        )
      );
    }
  }, [searchText, fourOOneKs]);

  const fetchFourOOneKs = async () => {
    const res = await axios.get(API_URL);
    setFourOOneKs(res.data);
  };

  const fetchUsers = async () => {
    const res = await axios.get(USERS_API_URL);
    setUsers(res.data);
  };

  // Build owner dropdown options from users (family users only)
  const ownerOptions = users
    .filter(u => u.shortName && u.group && u.group.toLowerCase() === 'family')
    .map(u => ({ label: u.shortName, value: u.id }));

  const assetClassOptions = [
    { value: 'Stocks', label: 'Stocks' },
    { value: 'Bonds', label: 'Bonds' },
    { value: 'Mixed', label: 'Mixed' },
    { value: 'Target Date', label: 'Target Date' }
  ];

  // Helper to get shortName from userId
  const getShortNameById = (userId) => {
    if (userId === undefined || userId === null || userId === '') {
      return '';
    }
    const user = users.find(u => String(u.id) === String(userId));
    return user && user.shortName ? user.shortName : '';
  };

  const handleEdit = idx => {
    setEditIdx(idx);
    setEditRow({ ...filteredFourOOneKs[idx] });
  };

  const handleCancel = () => {
    setEditIdx(null);
    setEditRow({});
  };

  const handleSave = async (idx) => {
    setConfirm({
      open: true,
      idx,
      message: 'Are you sure you want to update this 401k record?',
      onConfirm: async () => {
        setConfirm({ open: false, idx: null });
        try {
          const row = editRow;
          let payload = { ...row };
          delete payload.userShortName;
          // Don't delete the ID for updates - the API needs it
          Object.keys(payload).forEach(key => { if (payload[key] === '') delete payload[key]; });
          
          if (row.id) {
            await axios.put(`${API_URL}/${row.id}`, payload);
          } else {
            delete payload.id; // Only delete ID for new records
            await axios.post(API_URL, payload);
          }
          setEditIdx(null);
          setEditRow({});
          await fetchFourOOneKs();
        } catch (err) {
          console.error('401k Update Error:', err.response?.data || err.message);
          alert(`Failed to update 401k record: ${err.response?.data?.message || err.message}`);
        }
      }
    });
  };

  const handleReset = () => {
    setAddRow({});
    setSearchText('');
  };

  const handleDelete = idx => {
    setConfirm({ open: true, idx });
  };

  const handleConfirmDelete = async () => {
    const row = filteredFourOOneKs[confirm.idx];
    await axios.delete(`${API_URL}/${row.id}`);
    setConfirm({ open: false, idx: null });
    fetchFourOOneKs();
  };

  const handleAdd = async () => {
    setConfirm({
      open: true,
      idx: null,
      message: 'Are you sure you want to add this 401k record?',
      onConfirm: async () => {
        setConfirm({ open: false, idx: null });
        try {
          let payload = { ...addRow };
          delete payload.userShortName;
          delete payload.id;
          Object.keys(payload).forEach(key => { if (payload[key] === '') delete payload[key]; });
          await axios.post(API_URL, payload);
          setAddRow({});
          await fetchFourOOneKs();
        } catch (err) {
          alert('Failed to add 401k record. Please check your input and try again.');
        }
      }
    });
  };

  const allRows = [addRow, ...filteredFourOOneKs, editRow];
  const colKeys = [
    'userId', 'assetClass', 'policyNo', 'term', 'currency', 'startDate', 'maturityDate', 'investmentAmount', 'currentAmount', 'description'
  ];
  const colHeaders = [
    'Owner', 'Asset Class', 'Policy No', 'Term', 'Currency', 'Start Date', 'Maturity Date', 'Investment Amount', 'Current Amount', 'Description'
  ];
  const colFonts = Array(colKeys.length).fill('16px Arial');

  return (
    <div style={{ padding: 0, paddingTop: 0 }}>
      <ConfirmModal 
        open={confirm.open} 
        message={confirm.message || "Are you sure you want to delete this record?"} 
        onConfirm={confirm.onConfirm || handleConfirmDelete} 
        onCancel={() => setConfirm({ open: false, idx: null })} 
      />
      <GridBanner
        icon={fourOOneKIcon}
        title="401k Accounts"
        searchText={searchText}
        setSearchText={setSearchText}
        placeholder="Search 401k accounts..."
      />
      <div style={{ height: 16 }} />
      <div style={{ width: 'fit-content', minWidth: 0, margin: '0 auto', maxWidth: '100%' }}>
        <div style={{
          ...gridTheme.scrollContainer,
          maxHeight: 400,
          minHeight: 0,
          overflowY: 'auto',
        }}>
          <table style={{ ...gridTheme.table, tableLayout: 'auto', minWidth: 1200 }}>
            <thead>
              <tr>
                {colHeaders.map((header, i) => (
                  <th key={header} style={{ ...gridTheme.th, whiteSpace: 'normal' }}>{header}</th>
                ))}
                <th style={{ ...gridTheme.th, whiteSpace: 'nowrap' }}></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                {colKeys.map((key, i) => (
                  <td key={key} style={{ ...gridTheme.td }}>
                    {key === 'userId' ? (
                      <RoundedDropdown
                        options={ownerOptions}
                        value={addRow['userId'] || ''}
                        onChange={e => setAddRow({ ...addRow, userId: e.target.value })}
                        placeholder="Owner"
                        style={{ ...inputTheme }}
                      />
                    ) : key === 'assetClass' ? (
                      <RoundedDropdown
                        options={assetClassOptions}
                        value={addRow['assetClass'] || ''}
                        onChange={e => setAddRow({ ...addRow, assetClass: e.target.value })}
                        placeholder="Asset Class"
                        style={{ ...inputTheme }}
                      />
                    ) : key === 'currency' ? (
                      <RoundedDropdown
                        options={currencyOptions}
                        value={addRow['currency'] || ''}
                        onChange={e => setAddRow({ ...addRow, currency: e.target.value })}
                        placeholder="Currency"
                        style={{ ...inputTheme }}
                      />
                    ) : (
                      <RoundedInput
                        value={addRow[key] || ''}
                        onChange={e => setAddRow({ ...addRow, [key]: e.target.value })}
                        placeholder={colHeaders[i]}
                        type={key === 'investmentAmount' || key === 'currentAmount' ? 'number' : key === 'startDate' || key === 'maturityDate' ? 'date' : 'text'}
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
                <td style={{ ...gridTheme.td }}>
                  <div style={ACTION_BUTTON_CONTAINER_STYLE}>
                    <ActionButton type="save" onClick={handleAdd} title="Save" />
                    <ActionButton type="reset" onClick={handleReset} title="Reset" />
                  </div>
                </td>
              </tr>
              {filteredFourOOneKs.map((row, idx) =>
                editIdx === idx ? (
                  <tr key={row.id}>
                    {colKeys.map((key, i) => (
                      <td key={key} style={{ ...gridTheme.td }}>
                        {key === 'userId' ? (
                          <RoundedDropdown
                            options={ownerOptions}
                            value={editRow['userId'] || ''}
                            onChange={e => setEditRow({ ...editRow, userId: e.target.value })}
                            placeholder="Owner"
                            style={{ ...inputTheme }}
                            getLabel={val => getShortNameById(val)}
                          />
                        ) : key === 'assetClass' ? (
                          <RoundedDropdown
                            options={assetClassOptions}
                            value={editRow['assetClass'] || ''}
                            onChange={e => setEditRow({ ...editRow, assetClass: e.target.value })}
                            placeholder="Asset Class"
                            style={{ ...inputTheme }}
                          />
                        ) : key === 'currency' ? (
                          <RoundedDropdown
                            options={currencyOptions}
                            value={editRow['currency'] || ''}
                            onChange={e => setEditRow({ ...editRow, currency: e.target.value })}
                            placeholder="Currency"
                            style={{ ...inputTheme }}
                          />
                        ) : (
                          <RoundedInput
                            value={key === 'startDate' || key === 'maturityDate' ? formatDateForInput(editRow[key]) : editRow[key] || ''}
                            onChange={e => setEditRow({ ...editRow, [key]: e.target.value })}
                            placeholder={colHeaders[i]}
                            type={key === 'investmentAmount' || key === 'currentAmount' ? 'number' : key === 'startDate' || key === 'maturityDate' ? 'date' : 'text'}
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
                    <td style={{ ...gridTheme.td }}>
                      <div style={ACTION_BUTTON_CONTAINER_STYLE}>
                        <ActionButton type="save" onClick={() => handleSave(idx)} title="Save" />
                        <ActionButton type="cancel" onClick={handleCancel} title="Cancel" />
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={row.id}>
                    {colKeys.map((key, i) => (
                      <td key={key} style={{ ...gridTheme.td }}>
                        {
                          key === 'startDate' || key === 'maturityDate'
                            ? formatMonthDayYear(row[key])
                            : key === 'userId'
                              ? getShortNameById(row['userId'])
                              : key === 'investmentAmount' || key === 'currentAmount'
                                ? formatCurrencyValue(row[key], row['currency'])
                                : row[key]
                        }
                      </td>
                    ))}
                    <td style={{ ...gridTheme.td }}>
                      <div style={ACTION_BUTTON_CONTAINER_STYLE}>
                        <ActionButton type="edit" onClick={() => handleEdit(idx)} title="Edit" />
                        <ActionButton type="delete" onClick={() => handleDelete(idx)} title="Delete" />
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}