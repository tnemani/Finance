import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ActionButton } from '../components/ActionButton';
import paymentIcon from '../components/icons/location_banner.png';
import apartmentIcon from '../components/icons/Apartment (Flat).png';
import gardenIcon from '../components/icons/garden.png';
import homeIcon from '../components/icons/home.png';
import plotIcon from '../components/icons/Plot (Site).png';
import workIcon from '../components/icons/Work (Office).png';
import GridBanner from '../components/GridBanner';
import { gridTheme } from '../components/gridTheme';

const API_URL = 'http://localhost:5226/api/addresses';

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

// Minimal custom dropdown for Address Type with icons
function AddressTypeDropdown({ value, onChange, options, iconMap, disabled }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef();

  React.useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleSelect = (opt) => {
    onChange(opt);
    setOpen(false);
  };
  const selectedIcon = value && iconMap[value];
  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          border: 'none',
          background: 'transparent',
          padding: '4px 8px',
          minHeight: 28,
          fontSize: '1em',
          borderRadius: 0,
          cursor: disabled ? 'not-allowed' : 'pointer',
          boxSizing: 'border-box',
        }}
      >
        {selectedIcon && <img src={selectedIcon} alt="icon" style={{ width: 22, height: 22, marginRight: 8 }} />}
        <span style={{ flex: 1, textAlign: 'left', color: value ? '#222' : '#888' }}>
          {value || 'Select Address Type'}
        </span>
        <span style={{ marginLeft: 8, fontSize: 14, color: '#888' }}>▼</span>
      </button>
      {open && !disabled && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          zIndex: 10,
          background: '#fff',
          border: '1px solid #ccc',
          borderRadius: 6,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          minWidth: '100%',
          marginTop: 2,
        }}>
          {options.map(opt => (
            <div
              key={opt}
              onClick={() => handleSelect(opt)}
              style={{
                display: 'flex', alignItems: 'center', padding: '6px 12px', cursor: 'pointer',
                background: value === opt ? '#e3f0fc' : '#fff',
                fontWeight: value === opt ? 600 : 400
              }}
              onMouseDown={e => e.preventDefault()}
            >
              {iconMap[opt] && <img src={iconMap[opt]} alt="icon" style={{ width: 22, height: 22, marginRight: 8 }} />}
              <span>{opt}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AddressesPage() {
  const [addresses, setAddresses] = useState([]);
  const [editRowId, setEditRowId] = useState(null);
  const [editRowData, setEditRowData] = useState({});
  const [newRow, setNewRow] = useState({});
  const [confirm, setConfirm] = useState({ open: false, message: '', onConfirm: null });
  const [searchText, setSearchText] = useState('');
  const [filteredAddresses, setFilteredAddresses] = useState([]);

  useEffect(() => {
    fetchAddresses();
  }, []);

  useEffect(() => {
    if (!searchText) {
      setFilteredAddresses(addresses);
    } else {
      const lower = searchText.toLowerCase();
      setFilteredAddresses(addresses.filter(addr =>
        Object.values(addr).some(val =>
          val && typeof val === 'string' && val.toLowerCase().includes(lower)
        )
      ));
    }
  }, [searchText, addresses]);

  const fetchAddresses = async () => {
    const res = await axios.get(API_URL);
    setAddresses(res.data);
  };

  const handleRowEdit = (address) => {
    setEditRowId(address.id);
    setEditRowData(address);
  };

  const handleRowChange = (e, col) => {
    setEditRowData({ ...editRowData, [col]: e.target.value });
  };

  const handleRowSave = async (id) => {
    setConfirm({
      open: true,
      message: 'Are you sure you want to update this address?',
      onConfirm: async () => {
        setConfirm({ open: false });
        await axios.put(`${API_URL}/${id}`, editRowData);
        setEditRowId(null);
        setEditRowData({});
        fetchAddresses();
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
      message: 'Are you sure you want to delete this address?',
      onConfirm: async () => {
        setConfirm({ open: false });
        await axios.delete(`${API_URL}/${id}`);
        fetchAddresses();
      }
    });
  };

  const handleAdd = async () => {
    if (!newRow || Object.values(newRow).every(v => !v)) return;
    setConfirm({
      open: true,
      message: 'Are you sure you want to add this address?',
      onConfirm: async () => {
        setConfirm({ open: false });
        await axios.post(API_URL, newRow);
        setNewRow({});
        fetchAddresses();
      }
    });
  };

  // Define columns with user-friendly labels and input types
  const addressColumns = [
    { key: 'addressType', label: 'Address Type', type: 'text', placeholder: 'e.g. Home, Office' },
    { key: 'houseNo', label: 'House No', type: 'text', placeholder: 'House/Flat No' },
    { key: 'line1', label: 'Line 1', type: 'text', placeholder: 'Street/Area' },
    { key: 'line2', label: 'Line 2', type: 'text', placeholder: 'Landmark/Locality' },
    { key: 'city', label: 'City', type: 'text', placeholder: 'City' },
    { key: 'state', label: 'State', type: 'text', placeholder: 'State' },
    { key: 'country', label: 'Country', type: 'text', placeholder: 'Country' },
    { key: 'zip', label: 'Zip', type: 'text', placeholder: 'Postal Code' },
    { key: 'description', label: 'Description', type: 'text', placeholder: 'Description (optional)' },
  ];

  const addressTypeOptions = [
    'Apartment (Flat)',
    'Garden',
    'Home',
    'Plot (Site)',
    'Work (Office)'
  ];

  const addressTypeIconMap = {
    'Apartment (Flat)': apartmentIcon,
    'Garden': gardenIcon,
    'Home': homeIcon,
    'Plot (Site)': plotIcon,
    'Work (Office)': workIcon
  };

  return (
    <div style={{ padding: 20, paddingTop: 0 }}>
      <GridBanner
        icon={paymentIcon}
        title="Addresses"
        searchText={searchText}
        setSearchText={setSearchText}
        placeholder="Search addresses..."
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
                {addressColumns.map(col => (
                  <th key={col.key} style={gridTheme.th}>{col.label}</th>
                ))}
                <th style={gridTheme.th}></th>
              </tr>
            </thead>
            <tbody>
              {/* Add row for new address */}
              <tr>
                {addressColumns.map(col => (
                  <td key={col.key} style={gridTheme.td}>
                    {col.key === 'addressType' ? (
                      <AddressTypeDropdown
                        value={newRow[col.key] || ''}
                        onChange={opt => setNewRow({ ...newRow, [col.key]: opt })}
                        options={addressTypeOptions}
                        iconMap={addressTypeIconMap}
                        disabled={editRowId !== null}
                      />
                    ) : (
                      <input
                        type={col.type}
                        value={newRow[col.key] || ''}
                        onChange={e => setNewRow({ ...newRow, [col.key]: e.target.value })}
                        placeholder={col.placeholder}
                        style={{ border: 'none', borderRadius: 0, padding: '4px 8px', outline: 'none', fontSize: '1em', background: 'transparent', minHeight: 28, margin: 0, boxSizing: 'border-box', width: '100%' }}
                        disabled={editRowId !== null}
                      />
                    )}
                  </td>
                ))}
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
              {filteredAddresses.map(address => (
                <tr key={address.id}>
                  {addressColumns.map(col => (
                    <td key={col.key} style={gridTheme.td}>
                      {editRowId === address.id ? (
                        col.key === 'addressType' ? (
                          <AddressTypeDropdown
                            value={editRowData[col.key] || ''}
                            onChange={opt => setEditRowData({ ...editRowData, [col.key]: opt })}
                            options={addressTypeOptions}
                            iconMap={addressTypeIconMap}
                            disabled={false}
                          />
                        ) : (
                          <input
                            type={col.type}
                            value={editRowData[col.key] ?? ''}
                            onChange={e => handleRowChange(e, col.key)}
                            placeholder={col.placeholder}
                            style={{
                              border: '1px solid #1976d2',
                              borderRadius: '8px',
                              padding: '4px 8px',
                              outline: 'none',
                              fontSize: '1em',
                              boxShadow: '0 1px 4px rgba(25, 118, 210, 0.08)',
                              transition: 'border 0.2s',
                              width: '100%',
                              background: '#f9fbfd',
                              minHeight: 28,
                              margin: 0,
                              boxSizing: 'border-box',
                              appearance: 'none',
                              WebkitAppearance: 'none',
                              MozAppearance: 'none',
                            }}
                          />
                        )
                      ) : (
                        col.key === 'addressType' && addressTypeIconMap[address[col.key]] ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <img src={addressTypeIconMap[address[col.key]]} alt="icon" style={{ width: 22, height: 22, marginRight: 6 }} />
                            {address[col.key]}
                          </span>
                        ) : (
                          String(address[col.key] ?? '')
                        )
                      )}
                    </td>
                  ))}
                  <td style={{ minWidth: 90 }}>
                    {editRowId === address.id ? (
                      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4, minWidth: 90 }}>
                        <ActionButton
                          onClick={() => handleRowSave(address.id)}
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
                          onClick={() => handleRowEdit(address)}
                          type="edit"
                          title="Edit"
                        />
                        <ActionButton
                          onClick={() => handleDelete(address.id)}
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

export default AddressesPage;
