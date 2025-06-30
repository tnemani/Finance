import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ActionButton } from '../components/ActionButton';
import ConfirmModal from '../components/ConfirmModal';
import GridBanner from '../components/GridBanner';
import paymentIcon from '../components/icons/settings_banner.png';
import { gridTheme } from '../components/gridTheme';

const API_URL = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:5226/api') + '/settings';

function SettingsPage() {
  const [settings, setSettings] = useState([]);
  const [editRowId, setEditRowId] = useState(null);
  const [editRowData, setEditRowData] = useState({});
  const [newRow, setNewRow] = useState({});
  const [confirm, setConfirm] = useState({ open: false, message: '', onConfirm: null });
  const [searchText, setSearchText] = useState('');
  const [filteredSettings, setFilteredSettings] = useState([]);

  useEffect(() => { fetchSettings(); }, []);

  useEffect(() => {
    if (!searchText) setFilteredSettings(settings);
    else {
      const lower = searchText.toLowerCase();
      setFilteredSettings(settings.filter(s =>
        Object.values(s).some(val => val && typeof val === 'string' && val.toLowerCase().includes(lower))
      ));
    }
  }, [searchText, settings]);

  const fetchSettings = async () => {
    const res = await axios.get(API_URL);
    setSettings(res.data);
  };

  const handleRowEdit = (setting) => {
    setEditRowId(setting.id);
    setEditRowData(setting);
  };

  const handleRowChange = (e, col) => {
    setEditRowData({ ...editRowData, [col]: e.target.value });
  };

  const handleRowSave = async (id) => {
    setConfirm({
      open: true,
      message: 'Are you sure you want to update this setting?',
      onConfirm: async () => {
        setConfirm({ open: false });
        await axios.put(`${API_URL}/${id}`, editRowData);
        setEditRowId(null);
        setEditRowData({});
        fetchSettings();
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
      message: 'Are you sure you want to delete this setting?',
      onConfirm: async () => {
        setConfirm({ open: false });
        await axios.delete(`${API_URL}/${id}`);
        fetchSettings();
      }
    });
  };

  const handleAdd = async () => {
    if (!newRow || Object.values(newRow).every(v => !v)) return;
    setConfirm({
      open: true,
      message: 'Are you sure you want to add this setting?',
      onConfirm: async () => {
        setConfirm({ open: false });
        await axios.post(API_URL, newRow);
        setNewRow({});
        fetchSettings();
      }
    });
  };

  // Helper to format value in UK format
  const formatValueUK = (value) => {
    if (value == null || value === '') return '';
    const num = Number(value);
    if (isNaN(num)) return value;
    return num.toLocaleString('en-GB', { maximumFractionDigits: 2 });
  };

  // Helper to format value in Indian (lakh/crore) format and truncate .00
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

  // Get unique units from settings
  const unitOptions = Array.from(new Set(settings.map(s => s.units).filter(Boolean)));
  const unitOptionsList = [
    '',
    '$',
    'Rs',
    '%',
    'gms',
    'kg',
    'litre',
    'piece',
    'hour',
    'day',
    'month',
    'year'
  ];

  return (
    <div style={{ padding: 20, paddingTop: 0 }}>
      <GridBanner
        icon={paymentIcon}
        title="Settings"
        searchText={searchText}
        setSearchText={setSearchText}
        placeholder="Search settings..."
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
                <th style={gridTheme.th}>Key</th>
                <th style={gridTheme.th}>Value</th>
                <th style={gridTheme.th}>Units</th>
                <th style={gridTheme.th}>Description</th>
                <th style={gridTheme.th}></th>
              </tr>
            </thead>
            <tbody>
              {/* Add row for new setting */}
              <tr>
                <td style={gridTheme.td}>
                  <input type="text" value={newRow.key || ''} onChange={e => setNewRow({ ...newRow, key: e.target.value })} placeholder="Key" style={{ border: 'none', borderRadius: 0, padding: '4px 8px', outline: 'none', fontSize: '1em', background: 'transparent', minHeight: 28, margin: 0, boxSizing: 'border-box', width: '100%', appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none' }} disabled={editRowId !== null} />
                </td>
                <td style={gridTheme.td}>
                  <input type="text" value={newRow.value || ''} onChange={e => setNewRow({ ...newRow, value: e.target.value })} placeholder="Value" style={{ border: 'none', borderRadius: 0, padding: '4px 8px', outline: 'none', fontSize: '1em', background: 'transparent', minHeight: 28, margin: 0, boxSizing: 'border-box', width: '100%', appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none' }} disabled={editRowId !== null} />
                </td>
                <td style={gridTheme.td}>
                  <select
                    value={newRow.units || ''}
                    onChange={e => setNewRow({ ...newRow, units: e.target.value })}
                    style={{ border: 'none', borderRadius: 0, padding: '4px 8px', outline: 'none', fontSize: '1em', background: 'transparent', minHeight: 28, margin: 0, boxSizing: 'border-box', width: '100%' }}
                    disabled={editRowId !== null}
                  >
                    {unitOptionsList.map(opt => (
                      <option key={opt} value={opt}>{opt ? opt : 'Select'}</option>
                    ))}
                  </select>
                </td>
                <td style={gridTheme.td}>
                  <input type="text" value={newRow.description || ''} onChange={e => setNewRow({ ...newRow, description: e.target.value })} placeholder="Description" style={{ border: 'none', borderRadius: 0, padding: '4px 8px', outline: 'none', fontSize: '1em', background: 'transparent', minHeight: 28, margin: 0, boxSizing: 'border-box', width: '100%', appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none' }} disabled={editRowId !== null} />
                </td>
                <td style={gridTheme.td}>
                  <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4, minWidth: 90 }}>
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
              {filteredSettings.map(setting => (
                <tr key={setting.id}>
                  <td style={gridTheme.td}>
                    {editRowId === setting.id ? (
                      <input type="text" value={editRowData.key ?? ''} onChange={e => handleRowChange(e, 'key')} style={{ border: '1px solid #1976d2', borderRadius: '8px', padding: '4px 8px', outline: 'none', fontSize: '1em', boxShadow: '0 1px 4px rgba(25, 118, 210, 0.08)', transition: 'border 0.2s', width: '100%', background: '#f9fbfd', minHeight: 28, margin: 0, boxSizing: 'border-box', appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none' }} />
                    ) : (
                      String(setting.key ?? '')
                    )}
                  </td>
                  <td style={gridTheme.td} colSpan={editRowId === setting.id ? 1 : 2}>
                    {editRowId === setting.id ? (
                      <input type="text" value={editRowData.value ?? ''} onChange={e => handleRowChange(e, 'value')} style={{ border: '1px solid #1976d2', borderRadius: '8px', padding: '4px 8px', outline: 'none', fontSize: '1em', boxShadow: '0 1px 4px rgba(25, 118, 210, 0.08)', transition: 'border 0.2s', width: '100%', background: '#f9fbfd', minHeight: 28, margin: 0, boxSizing: 'border-box', appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none' }} />
                    ) : (
                      `${formatValueIN(setting.value)}${setting.units ? ' ' + setting.units : ''}`
                    )}
                  </td>
                  {editRowId === setting.id && (
                    <td style={gridTheme.td}>
                      <input
                        type="text"
                        value={editRowData.units ?? ''}
                        onChange={e => handleRowChange(e, 'units')}
                        list="unitOptionsList"
                        style={{ border: '1px solid #1976d2', borderRadius: '8px', padding: '4px 8px', outline: 'none', fontSize: '1em', background: '#f9fbfd', minHeight: 28, margin: 0, boxSizing: 'border-box', width: '100%' }}
                      />
                      <datalist id="unitOptionsList">
                        {unitOptionsList.map(opt => (
                          <option key={opt} value={opt}>{opt ? opt : 'Select'}</option>
                        ))}
                      </datalist>
                    </td>
                  )}
                  <td style={gridTheme.td}>
                    {editRowId === setting.id ? (
                      <input type="text" value={editRowData.description ?? ''} onChange={e => handleRowChange(e, 'description')} style={{ border: '1px solid #1976d2', borderRadius: '8px', padding: '4px 8px', outline: 'none', fontSize: '1em', boxShadow: '0 1px 4px rgba(25, 118, 210, 0.08)', transition: 'border 0.2s', width: '100%', background: '#f9fbfd', minHeight: 28, margin: 0, boxSizing: 'border-box', appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none' }} />
                    ) : (
                      String(setting.description ?? '')
                    )}
                  </td>
                  <td style={{ minWidth: 90 }}>
                    {editRowId === setting.id ? (
                      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4, minWidth: 90 }}>
                        <ActionButton
                          onClick={() => handleRowSave(setting.id)}
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
                      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4, minWidth: 90 }}>
                        <ActionButton
                          onClick={() => handleRowEdit(setting)}
                          type="edit"
                          title="Edit"
                        />
                        <ActionButton
                          onClick={() => handleDelete(setting.id)}
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

export default SettingsPage;
