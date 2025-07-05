import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PoliciesStocksIcon from '../components/icons/policies.png';
import GridBanner from '../components/GridBanner';
import { gridTheme, currencyOptions } from '../components/gridTheme';
import { ActionButton } from '../components/ActionButton';
import ConfirmModal from '../components/ConfirmModal';
import RoundedInput from '../components/RoundedInput';
import RoundedDropdown from '../components/RoundedDropdown';
import RoundedComboBox from '../components/RoundedComboBox';
import { fetchSymbolSettingsMap } from '../utils/settingsUtils';

const API_URL = 'http://localhost:5226/api/investment/policy';
const POLICY_TYPE = 'Policy';

function PolicyPage() {
  const [policies, setPolicies] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filteredPolicies, setFilteredPolicies] = useState([]);
  const [editIdx, setEditIdx] = useState(null);
  const [editRow, setEditRow] = useState({});
  const [addRow, setAddRow] = useState({ userShortName: '', policyNo: '', symbol: '', qty: '', currency: '', currentValue: '', startDate: '', financialnstitution: '', description: '' });
  const [confirm, setConfirm] = useState({ open: false, idx: null });
  const [undoRow, setUndoRow] = useState(null);
  const [undoIdx, setUndoIdx] = useState(null);
  const [symbolValueMap, setSymbolValueMap] = useState({});

  useEffect(() => { fetchPolicies(); fetchUsers(); fetchSymbolSettingsMap().then(setSymbolValueMap); }, []);

  useEffect(() => {
    if (!searchText) setFilteredPolicies(policies);
    else {
      const lower = searchText.toLowerCase();
      setFilteredPolicies(
        policies.filter(s =>
          Object.values(s).some(val =>
            (typeof val === 'string' && val.toLowerCase().includes(lower)) ||
            (typeof val === 'number' && String(val).includes(lower))
          )
        )
      );
    }
  }, [searchText, policies]);

  const fetchPolicies = async () => {
    const res = await axios.get(API_URL);
    // Only keep records with type === 'Policy'
    setPolicies(res.data.filter(p => p.type === 'Policy'));
  };

  const fetchUsers = async () => {
    const res = await axios.get('http://localhost:5226/api/users');
    setUsers(res.data);
  };

  const handleEdit = idx => {
    setEditIdx(idx);
    setEditRow({ ...filteredPolicies[idx] });
  };
  const handleCancel = () => {
    setEditIdx(null);
    setEditRow({});
  };
  const handleSave = async idx => {
    const row = editRow;
    // Map userShortName to userId
    const user = users.find(u => u.shortName === row.userShortName);
    const payload = {
      ...row,
      userId: user ? user.id : undefined,
      type: 'Policy'
    };
    delete payload.userShortName;
    await axios.put(`${API_URL}/${row.id}`, payload);
    setEditIdx(null);
    setEditRow({});
    fetchPolicies();
  };
  const handleDelete = idx => {
    setUndoRow(filteredPolicies[idx]);
    setUndoIdx(idx);
    setConfirm({ open: true, idx });
  };
  const handleConfirmDelete = async () => {
    const row = filteredPolicies[confirm.idx];
    await axios.delete(`${API_URL}/${row.id}`);
    setConfirm({ open: false, idx: null });
    fetchPolicies();
  };
  const handleUndo = () => {
    if (undoRow) {
      axios.post(API_URL, undoRow).then(() => {
        setUndoRow(null);
        setUndoIdx(null);
        fetchPolicies();
      });
    }
  };
  const handleAdd = async () => {
    if (!addRow.symbol) return;
    // Map userShortName to userId
    const user = users.find(u => u.shortName === addRow.userShortName);
    let payload = {
      ...addRow,
      userId: user ? user.id : undefined,
      type: 'Policy'
    };
    delete payload.userShortName;
    delete payload.currentValue;
    delete payload.id;
    // Remove empty string fields
    Object.keys(payload).forEach(key => {
      if (payload[key] === '') delete payload[key];
    });
    await axios.post(API_URL, payload);
    setAddRow({ userShortName: '', policyNo: '', symbol: '', qty: '', currency: '', currentValue: '', startDate: '', financialnstitution: '', description: '' });
    fetchPolicies();
  };

  function getTextWidth(text, font = '16px Arial') {
    if (typeof document === 'undefined') return 200;
    const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement('canvas'));
    const context = canvas.getContext('2d');
    context.font = font;
    return context.measureText(text).width;
  }

  // Calculate max width for each column
  const allRows = [addRow, ...filteredPolicies, editRow];
  // Calculate widths for Quantity and Currency separately
  const qtyHeader = 'Quantity';
  const currencyHeader = 'Currency';
  const qtyFont = '16px Arial';
  const currencyFont = '16px Arial';
  const qtyWidth = Math.max(
    getTextWidth(qtyHeader, qtyFont),
    ...allRows.map(row => getTextWidth((row && row.qty) ? String(row.qty) : '', qtyFont)),
    120 // increased from 100 to 120
  ) + 48; // increased padding from 40 to 48
  const currencyWidth = Math.max(
    getTextWidth(currencyHeader, currencyFont),
    ...allRows.map(row => getTextWidth((row && row.currency) ? String(row.currency) : '', currencyFont)),
    getTextWidth('Select', currencyFont) + 40, // ensure 'Select' fits
    90 // set a larger minimum
  ) + 40; // increased padding for arrow and text
  const colKeys = [
    'userShortName', 'policyNo', 'symbol', 'qtyCurrency', 'currentValue', 'startDate', 'financialnstitution', 'description'
  ];
  const colHeaders = [
    'User', 'Policy No', 'Symbol', 'Quantity', 'Current Value', 'Start Date', 'Financial Institution', 'Description'
  ];
  const colFonts = Array(colKeys.length).fill('16px Arial');
  // Calculate max width for Type column based on widest option/value
  // Only use 'Policy' as the type for this page
  const typeOptions = [{ value: 'Policy', label: 'Policy' }];
  const typeComboOptions = [{ value: '', label: 'Select' }, ...typeOptions];
  const typeOptionWidths = typeComboOptions.map(opt => getTextWidth(opt.label, colFonts[colKeys.indexOf('type')]));
  const typeCellWidths = allRows.map(row => getTextWidth('Policy', colFonts[colKeys.indexOf('type')]));
  const typeColWidth = Math.max(getTextWidth('Type', colFonts[colKeys.indexOf('type')]), ...typeOptionWidths, ...typeCellWidths, 80) + 80;
  const colWidths = colKeys.map((key, i) => {
    if (key === 'qtyCurrency') {
      // Only use qty for width calculation
      const headerWidth = getTextWidth('Quantity', colFonts[i]);
      const cellWidths = allRows.map(row => getTextWidth((row && row.qty) ? String(row.qty) : '', colFonts[i]));
      return Math.max(headerWidth, ...cellWidths, 120) + 40;
    } else if (key === 'userShortName') {
      // Expand user cell to fit dropdown comfortably
      const headerWidth = getTextWidth(colHeaders[i], colFonts[i]);
      const cellWidths = allRows.map(row => getTextWidth((row && row[key]) ? String(row[key]) : '', colFonts[i]));
      // Add extra width for dropdown arrow and padding
      return Math.max(headerWidth, ...cellWidths, 120) + 80;
    } else if (key === 'type') {
      return typeColWidth;
    } else {
      const headerWidth = getTextWidth(colHeaders[i], colFonts[i]);
      const cellWidths = allRows.map(row => getTextWidth((row && row[key]) ? String(row[key]) : '', colFonts[i]));
      return Math.max(headerWidth, ...cellWidths, 80) + 40;
    }
  });

  return (
    <div style={{ padding: 20, paddingTop: 0 }}>
      <ConfirmModal open={confirm.open} message="Are you sure you want to delete this record?" onConfirm={handleConfirmDelete} onCancel={() => setConfirm({ open: false, idx: null })} />
      <GridBanner
        icon={PoliciesStocksIcon}
        title="Policies"
        searchText={searchText}
        setSearchText={setSearchText}
        placeholder="Search policies..."
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', textAlign: 'left', width: '100%' }}
        titleStyle={{ fontSize: 28, fontWeight: 600, marginLeft: 12, textAlign: 'left', display: 'inline-block' }}
        iconStyle={{ height: 40, display: 'inline-block' }}
      />
      <div style={{ height: 16 }} />
      <div style={{ width: 'fit-content', minWidth: 0, margin: '0 auto', maxWidth: '100%' }}>
        <div style={{
          ...gridTheme.scrollContainer,
          maxHeight: 260, // 4 rows (48px each) + header (48px) + some padding
          minHeight: 0,
          overflowY: 'auto',
        }}>
          <table style={{ ...gridTheme.table, tableLayout: 'auto', minWidth: 900 }}>
            <thead>
              <tr>
                {colHeaders.map((header, i) => (
                  <th key={header} style={{ ...gridTheme.th, whiteSpace: 'normal', maxWidth: colWidths[i], minWidth: 80, width: colWidths[i], textAlign: 'left', fontWeight: 600, fontSize: 16 }}>{header}</th>
                ))}
                <th style={{ ...gridTheme.th, whiteSpace: 'nowrap' }}></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                {colKeys.map((key, i) => (
                  key === 'qtyCurrency' ? (
                    <td key={key} style={{ ...gridTheme.td, maxWidth: colWidths[i], minWidth: 110, width: colWidths[i], paddingRight: 8 }}>
                      <RoundedInput
                        value={addRow.qty}
                        onChange={e => setAddRow({ ...addRow, qty: e.target.value })}
                        placeholder="Quantity"
                        style={{ width: '100%', minWidth: 90, maxWidth: colWidths[i], textAlign: 'left' }}
                      />
                    </td>
                  ) : key === 'userShortName' ? (
                    <td key={key} style={{ ...gridTheme.td, maxWidth: colWidths[i], minWidth: 140, width: colWidths[i] }}>
                      <RoundedDropdown
                        value={addRow.userShortName}
                        onChange={e => setAddRow({ ...addRow, userShortName: e.target.value })}
                        options={[{ value: '', label: 'Select' }, ...users.map(u => ({ value: u.shortName, label: u.shortName }))]}
                        placeholder="User"
                        style={{ width: '100%', minWidth: 130, maxWidth: colWidths[i] }}
                      />
                    </td>
                  ) : key === 'currentValue' ? (
                    <td key={key} style={{ ...gridTheme.td, maxWidth: colWidths[i], minWidth: 80, width: colWidths[i] }}></td>
                  ) : key === 'startDate' ? (
                    <td key={key} style={{ ...gridTheme.td, maxWidth: colWidths[i], minWidth: 80, width: colWidths[i] }}>
                      <RoundedInput
                        type="date"
                        value={addRow.startDate}
                        onChange={e => setAddRow({ ...addRow, startDate: e.target.value })}
                        placeholder={colHeaders[i]}
                        style={{ maxWidth: colWidths[i], minWidth: 80, width: colWidths[i], borderRadius: 12 }}
                      />
                    </td>
                  ) : (
                    <td key={key} style={{ ...gridTheme.td, maxWidth: colWidths[i], minWidth: 80, width: colWidths[i] }}>
                      <RoundedInput value={addRow[key]} onChange={e => setAddRow({ ...addRow, [key]: e.target.value })} placeholder={colHeaders[i]} style={{ maxWidth: colWidths[i], minWidth: 80, width: colWidths[i] }} />
                    </td>
                  )
                ))}
                <td style={gridTheme.td}>
                  <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <ActionButton onClick={handleAdd} type="save" title="Add" />
                    <ActionButton onClick={() => setAddRow({ userShortName: '', policyNo: '', symbol: '', qty: '', currency: '', currentValue: '', startDate: '', financialnstitution: '', description: '' })} type="undo" title="Undo" />
                  </div>
                </td>
              </tr>
              {filteredPolicies.map((s, idx) => {
                let cells = colKeys.map((key, i) => {
                  if (editIdx === idx) {
                    if (key === 'qtyCurrency') {
                      return (
                        <td key={key} style={{ ...gridTheme.td, maxWidth: colWidths[i], minWidth: 110, width: colWidths[i], paddingRight: 8 }}>
                          <RoundedInput
                            value={editRow.qty}
                            onChange={e => setEditRow({ ...editRow, qty: e.target.value })}
                            placeholder="Quantity"
                            style={{ width: '100%', minWidth: 90, maxWidth: colWidths[i], textAlign: 'left' }}
                          />
                        </td>
                      );
                    } else if (key === 'userShortName') {
                      return (
                        <td key={key} style={{ ...gridTheme.td, maxWidth: colWidths[i], minWidth: 140, width: colWidths[i] }}>
                          <RoundedDropdown
                            value={editRow.userShortName}
                            onChange={e => setEditRow({ ...editRow, userShortName: e.target.value })}
                            options={[{ value: '', label: 'Select' }, ...users.map(u => ({ value: u.shortName, label: u.shortName }))]}
                            placeholder="User"
                            style={{ width: '100%', minWidth: 130, maxWidth: colWidths[i] }}
                          />
                        </td>
                      );
                    } else if (key === 'type') {
                      return (
                        <td key={key} style={{ display: 'none' }}></td>
                      );
                    } else if (key === 'currentValue') {
                      return (
                        <td key={key} style={{ ...gridTheme.td, maxWidth: colWidths[i], minWidth: 80, width: colWidths[i] }}></td>
                      );
                    } else if (key === 'startDate') {
                      return (
                        <td key={key} style={{ ...gridTheme.td, maxWidth: colWidths[i], minWidth: 80, width: colWidths[i] }}>
                          <RoundedInput
                            type="date"
                            value={editRow.startDate}
                            onChange={e => setEditRow({ ...editRow, startDate: e.target.value })}
                            style={{ border: '1px solid #1976d2', maxWidth: colWidths[i], minWidth: 80, width: colWidths[i], borderRadius: 12 }}
                          />
                        </td>
                      );
                    } else {
                      return (
                        <td key={key} style={{ ...gridTheme.td, maxWidth: colWidths[i], minWidth: 80, width: colWidths[i] }}>
                          <RoundedInput value={editRow[key]} onChange={e => setEditRow({ ...editRow, [key]: e.target.value })} style={{ border: '1px solid #1976d2', maxWidth: colWidths[i], minWidth: 80, width: colWidths[i] }} />
                        </td>
                      );
                    }
                  } else {
                    if (key === 'qtyCurrency') {
                      return (
                        <td key={key} style={{ ...gridTheme.td, maxWidth: colWidths[i], minWidth: 100, width: colWidths[i], overflow: 'hidden', whiteSpace: 'nowrap', paddingRight: 8 }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', width: '100%', overflow: 'hidden', whiteSpace: 'nowrap', justifyContent: 'flex-start' }}>
                            <span style={{ minWidth: 60, textAlign: 'left', font: colFonts[i] }}>{s.qty}</span>
                          </span>
                        </td>
                      );
                    } else if (key === 'userShortName') {
                      return (
                        <td key={key} style={{ ...gridTheme.td, maxWidth: colWidths[i], minWidth: 140, width: colWidths[i] }}>
                          {s.userShortName}
                        </td>
                      );
                    } else if (key === 'currentValue') {
                      // Show qty * random number (simulate price) and currency, no decimals, formatted by currency
                      const price = 10 + (s.id ? (s.id % 10) : Math.floor(Math.random() * 10));
                      const value = (parseFloat(s.qty) || 0) * price;
                      let valueStr = value > 0 ? Math.round(value).toString() : '';
                      let currency = s.currency || '$';
                      let formattedValue = valueStr;
                      if (valueStr) {
                        if (currency === 'Rs' || currency === 'INR') {
                          formattedValue = Number(valueStr).toLocaleString('en-IN');
                        } else {
                          formattedValue = Number(valueStr).toLocaleString('en-US');
                        }
                      }
                      return (
                        <td key={key} style={{ ...gridTheme.td, maxWidth: colWidths[i], minWidth: 80, width: colWidths[i], textAlign: 'right' }}>
                          {valueStr ? `${formattedValue} ${currency}` : ''}
                        </td>
                      );
                    } else if (key === 'startDate') {
                      // Format date as 'Month Date, yyyy'
                      let formatted = '';
                      if (s[key]) {
                        const d = new Date(s[key]);
                        if (!isNaN(d)) {
                          const options = { year: 'numeric', month: 'short', day: 'numeric' };
                          formatted = d.toLocaleDateString('en-US', options);
                        } else {
                          formatted = s[key];
                        }
                      }
                      return (
                        <td key={key} style={{ ...gridTheme.td, maxWidth: colWidths[i], minWidth: 80, width: colWidths[i] }}>{formatted}</td>
                      );
                    } else {
                      return (
                        <td key={key} style={{ ...gridTheme.td, maxWidth: colWidths[i], minWidth: 80, width: colWidths[i] }}>{s[key]}</td>
                      );
                    }
                  }
                });
                // Add actions cell
                if (editIdx === idx) {
                  cells.push(
                    <td key="actions" style={gridTheme.td}>
                      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <ActionButton onClick={() => handleSave(idx)} type="save" title="Save" />
                        <ActionButton onClick={handleCancel} type="cancel" title="Cancel" />
                      </div>
                    </td>
                  );
                } else {
                  cells.push(
                    <td key="actions" style={gridTheme.td}>
                      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <ActionButton onClick={() => handleEdit(idx)} type="edit" title="Edit" />
                        <ActionButton onClick={() => handleDelete(idx)} type="delete" title="Delete" />
                      </div>
                    </td>
                  );
                }
                return (
                  <tr key={idx}>
                    {cells}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default PolicyPage;
