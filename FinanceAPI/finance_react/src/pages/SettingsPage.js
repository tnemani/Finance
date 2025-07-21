import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ActionButton } from '../components/ActionButton';
import ConfirmModal from '../components/ConfirmModal';
import GridBanner from '../components/GridBanner';
import RoundedInput from '../components/RoundedInput';
import RoundedDropdown from '../components/RoundedDropdown';
import paymentIcon from '../components/icons/settings_banner.png';
import { gridTheme } from '../components/gridTheme';
import { inputTheme } from '../components/inputTheme';
import { ACTION_BUTTON_CONTAINER_STYLE } from '../constants/common';
import { getUnitOptions } from '../constants/Fixedlist';
import { formatValueWithUnit } from '../helpers/Helper';

const API_URL = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:5226/api') + '/settings';

// Column definitions for consistent use
const SETTINGS_COLUMNS = {
  keys: ['key', 'value', 'description'],
  headers: ['Key', 'Value & Units', 'Description'],
  types: ['text', 'text', 'text'],
  placeholders: ['Setting Key', 'Setting Value', 'Description']
};

// Predefined unit options to avoid hardcoding


function SettingsPage() {
  const [settings, setSettings] = useState([]);
  const [editRowId, setEditRowId] = useState(null);
  const [editRowData, setEditRowData] = useState({});
  const [newRow, setNewRow] = useState({});
  const [confirm, setConfirm] = useState({ open: false, message: '', onConfirm: null });
  const [searchText, setSearchText] = useState('');
  const [filteredSettings, setFilteredSettings] = useState([]);

  // Column definitions for consistent styling
  const allRows = [newRow, ...filteredSettings, editRowData];
  const colFonts = Array(SETTINGS_COLUMNS.keys.length).fill('16px Arial');

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
        try {
          await axios.put(`${API_URL}/${id}`, editRowData);
          setEditRowId(null);
          setEditRowData({});
          await fetchSettings();
        } catch (err) {
          alert('Failed to update setting. Please check your input and try again.');
        }
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
        try {
          await axios.delete(`${API_URL}/${id}`);
          await fetchSettings();
        } catch (err) {
          alert('Failed to delete setting. Please try again.');
        }
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
        try {
          await axios.post(API_URL, newRow);
          setNewRow({});
          await fetchSettings();
        } catch (err) {
          alert('Failed to add setting. Please check your input and try again.');
        }
      }
    });
  };

  const handleReset = () => {
    setNewRow({});
    setSearchText('');
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

  const unitOptions = getUnitOptions();

  return (
    <div style={{ padding: 0, paddingTop: 0 }}>
      <ConfirmModal 
        open={confirm.open} 
        message={confirm.message} 
        onConfirm={confirm.onConfirm} 
        onCancel={() => setConfirm({ open: false })} 
      />
      <GridBanner
        icon={paymentIcon}
        title="Settings"
        searchText={searchText}
        setSearchText={setSearchText}
        placeholder="Search settings..."
      />
      <div style={{ height: 16 }} />
      <div style={{ width: 'fit-content', minWidth: 0, margin: '0 auto', maxWidth: '100%' }}>
        <div style={{
          ...gridTheme.scrollContainer,
          maxHeight: 600,
          minHeight: 0,
          overflowY: 'auto',
        }}>
          <table style={{ ...gridTheme.table, tableLayout: 'auto', minWidth: 800 }}>
            <thead>
              <tr>
                {SETTINGS_COLUMNS.headers.map((header, i) => (
                  <th key={header} style={{ ...gridTheme.th, whiteSpace: 'normal' }}>{header}</th>
                ))}
                <th style={{ ...gridTheme.th, whiteSpace: 'nowrap' }}></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                {SETTINGS_COLUMNS.keys.map((key, i) => (
                  <td key={key} style={{
                    ...gridTheme.td,
                    ...(key === 'value' ? { position: 'relative', zIndex: 10, overflow: 'visible' } : {})
                  }}>
                    {key === 'value' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <RoundedInput
                          value={newRow[key] || ''}
                          onChange={e => setNewRow({ ...newRow, [key]: e.target.value })}
                          placeholder="Value"
                          type="text"
                          colFonts={colFonts}
                          colHeaders={SETTINGS_COLUMNS.headers}
                          allRows={allRows}
                          colKey={key}
                          i={i}
                          style={{ ...inputTheme }}
                          disabled={editRowId !== null}
                        />
                        <RoundedDropdown
                          options={unitOptions}
                          value={newRow['units'] || ''}
                          onChange={e => setNewRow({ ...newRow, units: e.target.value })}
                          placeholder="Units"
                          style={{ ...inputTheme }}
                          disabled={editRowId !== null}
                        />
                      </div>
                    ) : (
                      <RoundedInput
                        value={newRow[key] || ''}
                        onChange={e => setNewRow({ ...newRow, [key]: e.target.value })}
                        placeholder={SETTINGS_COLUMNS.placeholders[i]}
                        type={SETTINGS_COLUMNS.types[i]}
                        colFonts={colFonts}
                        colHeaders={SETTINGS_COLUMNS.headers}
                        allRows={allRows}
                        colKey={key}
                        i={i}
                        style={{ ...inputTheme }}
                        disabled={editRowId !== null}
                      />
                    )}
                  </td>
                ))}
                <td style={{ ...gridTheme.td }}>
                  <div style={ACTION_BUTTON_CONTAINER_STYLE}>
                    <ActionButton type="save" onClick={handleAdd} title="Save" disabled={editRowId !== null} />
                    <ActionButton type="reset" onClick={handleReset} title="Reset" disabled={editRowId !== null} />
                  </div>
                </td>
              </tr>
              {filteredSettings.map((setting, idx) =>
                editRowId === setting.id ? (
                  <tr key={setting.id}>
                    {SETTINGS_COLUMNS.keys.map((key, i) => (
                      <td key={key} style={{
                        ...gridTheme.td,
                        ...(key === 'value' ? { position: 'relative', zIndex: 10, overflow: 'visible' } : {})
                      }}>
                        {key === 'value' ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <RoundedInput
                              value={editRowData[key] || ''}
                              onChange={e => handleRowChange(e, key)}
                              placeholder="Value"
                              type="text"
                              colFonts={colFonts}
                              colHeaders={SETTINGS_COLUMNS.headers}
                              allRows={allRows}
                              colKey={key}
                              i={i}
                              style={{ ...inputTheme }}
                            />
                            <RoundedDropdown
                              options={unitOptions}
                              value={editRowData['units'] || ''}
                              onChange={e => setEditRowData({ ...editRowData, units: e.target.value })}
                              placeholder="Units"
                              style={{ ...inputTheme }}
                            />
                          </div>
                        ) : (
                          <RoundedInput
                            value={editRowData[key] || ''}
                            onChange={e => handleRowChange(e, key)}
                            placeholder={SETTINGS_COLUMNS.placeholders[i]}
                            type={SETTINGS_COLUMNS.types[i]}
                            colFonts={colFonts}
                            colHeaders={SETTINGS_COLUMNS.headers}
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
                        <ActionButton type="save" onClick={() => handleRowSave(setting.id)} title="Save" />
                        <ActionButton type="cancel" onClick={handleRowCancel} title="Cancel" />
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={setting.id}>
                    {SETTINGS_COLUMNS.keys.map((key, i) => (
                      <td key={key} style={{ ...gridTheme.td }}>
                        {key === 'value'
                          ? formatValueWithUnit(setting[key], setting.units)
                          : String(setting[key] || '')
                        }
                      </td>
                    ))}
                    <td style={{ ...gridTheme.td }}>
                      <div style={ACTION_BUTTON_CONTAINER_STYLE}>
                        <ActionButton type="edit" onClick={() => handleRowEdit(setting)} title="Edit" />
                        <ActionButton type="delete" onClick={() => handleDelete(setting.id)} title="Delete" />
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

export default SettingsPage;
