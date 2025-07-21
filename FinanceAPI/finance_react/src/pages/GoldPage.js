import React, { useEffect, useState } from 'react';
import axios from 'axios';
import GridBanner from '../components/GridBanner';
import { gridTheme } from '../components/gridTheme';
import { ActionButton } from '../components/ActionButton';
import ConfirmModal from '../components/ConfirmModal';
import RoundedInput from '../components/RoundedInput';
import RoundedDropdown from '../components/RoundedDropdown';
import goldIcon from '../components/icons/gold.png';
import { inputTheme } from '../components/inputTheme';
import { currencyOptions, getWeightOptions } from '../constants/Fixedlist';
import { formatDateMDY } from '../helpers/Helper';
import {formatCurrencyValue} from '../helpers/Helper';
import { ACTION_BUTTON_CONTAINER_STYLE } from '../constants/common';

const API_URL = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:5226/api') + '/jewlery';
const USERS_API_URL = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:5226/api') + '/users';
const ADDRESSES_API_URL = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:5226/api') + '/addresses';



export default function GoldPage() {
  const [goldItems, setGoldItems] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filteredGoldItems, setFilteredGoldItems] = useState([]);
  const [editIdx, setEditIdx] = useState(null);
  const [editRow, setEditRow] = useState({});
  const [addRow, setAddRow] = useState({ type: 'Gold' });
  const [confirm, setConfirm] = useState({ open: false, idx: null });
  const [users, setUsers] = useState([]);
  const [addresses, setAddresses] = useState([]);

  useEffect(() => { fetchGoldItems(); fetchUsers(); fetchAddresses(); }, []);

  useEffect(() => {
    if (!searchText) setFilteredGoldItems(goldItems);
    else {
      const lower = searchText.toLowerCase();
      setFilteredGoldItems(
        goldItems.filter(s =>
          Object.values(s).some(val =>
            (typeof val === 'string' && val.toLowerCase().includes(lower)) ||
            (typeof val === 'number' && String(val).includes(lower))
          )
        )
      );
    }
  }, [searchText, goldItems]);

  const fetchGoldItems = async () => {
    const res = await axios.get(API_URL);
    // Normalize each gold item to always have ownerId (fallback to owner if missing)
    const normalized = res.data
      .filter(j => j.type && j.type.toLowerCase() === 'gold')
      .map(d => ({
        ...d,
        ownerId: d.ownerId !== undefined && d.ownerId !== null && d.ownerId !== '' ? d.ownerId : d.owner
      }));
    setGoldItems(normalized);
  };

  const fetchUsers = async () => {
    const res = await axios.get(USERS_API_URL);
    setUsers(res.data);
  };

  const fetchAddresses = async () => {
    const res = await axios.get(ADDRESSES_API_URL);
    setAddresses(res.data);
  };

  // Build owner dropdown options from users (family users only)
  const ownerOptions = users
    .filter(u => u.shortName && u.group && u.group.toLowerCase().includes('family'))
    .map(u => ({ label: u.shortName, value: u.id }));

  // Build address dropdown options from addresses (business type only)
  const addressOptions = addresses
    .filter(a => a.shortName && a.addressType && a.addressType.toLowerCase() === 'business')
    .map(a => ({ label: a.shortName, value: a.id }));

  // Helper to get shortName from userId (handle string/number conversion)
  const getShortNameById = (ownerId) => {
    if (ownerId === undefined || ownerId === null || ownerId === '') {
      return '';
    }
    const user = users.find(u => String(u.id) === String(ownerId));
    return user && user.shortName ? user.shortName : '';
  };


  // Helper to get address short name by id
  const getAddressShortNameById = (id) => {
    const addr = addresses.find(a => String(a.id) === String(id));
    return addr && addr.shortName ? addr.shortName : '';
  };

  const handleEdit = idx => {
    setEditIdx(idx);
    setEditRow({ ...filteredGoldItems[idx] });
  };
  const handleCancel = () => {
    setEditIdx(null);
    setEditRow({});
  };

  const handleSave = async (idx) => {
    setConfirm({
      open: true,
      idx,
      message: 'Are you sure you want to update this gold record?',
      onConfirm: async () => {
        setConfirm({ open: false, idx: null });
        try {
          const row = editRow;
          let payload = { ...row, type: 'Gold' };
          // Ensure owner is set from ownerId for API
          if (payload.ownerId !== undefined) {
            payload.owner = payload.ownerId;
            delete payload.ownerId;
          }
          delete payload.id;
          Object.keys(payload).forEach(key => { if (payload[key] === '') delete payload[key]; });
          
          if (row.id) {
            await axios.put(`${API_URL}/${row.id}`, payload);
          } else {
            await axios.post(API_URL, payload);
          }
          setEditIdx(null);
          setEditRow({});
          await fetchGoldItems();
        } catch (err) {
          alert('Failed to update gold record. Please check your input and try again.');
        }
      }
    });
  };

  const handleReset = () => {
    setAddRow({ type: 'Gold' });
    setSearchText('');
  };
  const handleDelete = idx => {
    setConfirm({ open: true, idx });
  };
  const handleConfirmDelete = async () => {
    const row = filteredGoldItems[confirm.idx];
    await axios.delete(`${API_URL}/${row.id}`);
    setConfirm({ open: false, idx: null });
    fetchGoldItems();
  };
  const handleAdd = async () => {
    setConfirm({
      open: true,
      idx: null,
      message: 'Are you sure you want to add this gold record?',
      onConfirm: async () => {
        setConfirm({ open: false, idx: null });
        try {
          let payload = { ...addRow, type: 'Gold' };
          // Ensure owner is set from ownerId for API
          if (payload.ownerId !== undefined) {
            payload.owner = payload.ownerId;
            delete payload.ownerId;
          }
          delete payload.id;
          Object.keys(payload).forEach(key => { if (payload[key] === '') delete payload[key]; });
          await axios.post(API_URL, payload);
          setAddRow({ type: 'Gold' });
          await fetchGoldItems();
        } catch (err) {
          alert('Failed to add gold record. Please check your input and try again.');
        }
      }
    });
  };

  const weightUnitOptions = getWeightOptions();

  const allRows = [addRow, ...filteredGoldItems, editRow];
  // Remove 'currency' from colKeys and colHeaders, keep only 'purchasedPrice'
  const colKeys = [
    'owner', 'name', 'weight', 'units', 'purchasedPrice', 'purchasedDate', 'purchasedFrom', 'description'
  ];
  const colHeaders = [
    'Owner', 'Name', 'Weight', 'Units', 'Purchased Price', 'Purchased Date', 'Purchased From', 'Description'
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
        icon={goldIcon}
        title="Gold Jewlery"
        searchText={searchText}
        setSearchText={setSearchText}
        placeholder="Search gold items..."
      />
      <div style={{ height: 16 }} />
      <div style={{ width: 'fit-content', minWidth: 0, margin: '0 auto', maxWidth: '100%' }}>
        <div style={{
          ...gridTheme.scrollContainer,
          maxHeight: 260,
          minHeight: 0,
          overflowY: 'auto',
        }}>
          <table style={{ ...gridTheme.table, tableLayout: 'auto', minWidth: 900 }}>
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
                  <td key={key} style={{
                    ...gridTheme.td,
                    ...(key === 'units' ? { position: 'relative', zIndex: 10, overflow: 'visible' } : {})
                  }}>
                    {key === 'units' ? (
                      <RoundedDropdown
                        options={weightUnitOptions}
                        value={addRow['weightUnits'] || ''}
                        onChange={e => setAddRow({ ...addRow, weightUnits: e.target.value })}
                        placeholder="Units"
                        style={{ ...inputTheme }}
                        
                      />
                    ) : key === 'owner' ? (
                      <RoundedDropdown
                        options={ownerOptions}
                        value={addRow['ownerId'] || ''}
                        onChange={e => setAddRow({ ...addRow, ownerId: e.target.value })}
                        placeholder="Owner"
                        style={{ ...inputTheme }}
                        
                      />
                    ) : key === 'purchasedFrom' ? (
                      <RoundedDropdown
                        options={addressOptions}
                        value={addRow['purchasedFrom'] || ''}
                        onChange={e => setAddRow({ ...addRow, purchasedFrom: e.target.value })}
                        placeholder="Purchased From"
                        style={{ ...inputTheme }}
                      />
                    ) : key === 'purchasedPrice' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <RoundedInput
                          value={addRow['purchasedPrice'] || ''}
                          onChange={e => setAddRow({ ...addRow, purchasedPrice: e.target.value })}
                          placeholder="Price"
                          type="number"
                          colFonts={colFonts}
                          colHeaders={colHeaders}
                          allRows={allRows}
                          colKey={key}
                          i={i}
                          style={{ ...inputTheme }}
                        />
                        <RoundedDropdown
                          options={currencyOptions}
                          value={addRow['currency'] || ''}
                          onChange={e => setAddRow({ ...addRow, currency: e.target.value })}
                          placeholder="Currency"
                          style={{ ...inputTheme }}
                          
                        />
                      </div>
                    ) : (
                      <RoundedInput
                        value={addRow[key] || ''}
                        onChange={e => setAddRow({ ...addRow, [key]: e.target.value })}
                        placeholder={colHeaders[i]}
                        type={key === 'weight' || key === 'purchasedPrice' ? 'number' : key === 'purchasedDate' ? 'date' : 'text'}
                        colFonts={colFonts}
                        colHeaders={colHeaders}
                        allRows={allRows}
                        colKey={key}
                        i={i}
                        style={{ ...inputTheme}}
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
              {filteredGoldItems.map((row, idx) =>
                editIdx === idx ? (
                  <tr key={row.id}>
                    {colKeys.map((key, i) => (
                      <td key={key} style={{
                        ...gridTheme.td,
                        ...(key === 'units' ? { position: 'relative', zIndex: 10, overflow: 'visible' } : {})
                      }}>
                        {key === 'units' ? (
                          <RoundedDropdown
                            options={weightUnitOptions}
                            value={editRow['weightUnits'] || ''}
                            onChange={e => setEditRow({ ...editRow, weightUnits: e.target.value })}
                            placeholder="Units"
                          />
                        ) : key === 'owner' ? (
                          <RoundedDropdown
                            options={ownerOptions}
                            value={editRow['ownerId'] || ''}
                            onChange={e => setEditRow({ ...editRow, ownerId: e.target.value })}
                            placeholder="Owner"
                            style={{ ...inputTheme }}
                            getLabel={val => getShortNameById(val)}
                          />
                        ) : key === 'purchasedFrom' ? (
                          <RoundedDropdown
                            options={addressOptions}
                            value={editRow['purchasedFrom'] || ''}
                            onChange={e => setEditRow({ ...editRow, purchasedFrom: e.target.value })}
                            placeholder="Purchased From"
                            style={{ ...inputTheme }}
                            getLabel={val => {
                              const addr = addresses.find(a => String(a.id) === String(val));
                              return addr && addr.shortName ? addr.shortName : '';
                            }}
                          />
                        ) : key === 'purchasedPrice' ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <RoundedInput
                              value={editRow['purchasedPrice'] || ''}
                              onChange={e => setEditRow({ ...editRow, purchasedPrice: e.target.value })}
                              placeholder="Price"
                              type="number"
                              colFonts={colFonts}
                              colHeaders={colHeaders}
                              allRows={allRows}
                              colKey={key}
                              i={i}
                              style={{ ...inputTheme}}
                            />
                            <RoundedDropdown
                              options={currencyOptions}
                              value={editRow['currency'] || ''}
                              onChange={e => setEditRow({ ...editRow, currency: e.target.value })}
                              placeholder="Curr."
                              style={{ ...inputTheme}}
                            />
                          </div>
                        ) : (
                          <RoundedInput
                            value={editRow[key] || ''}
                            onChange={e => setEditRow({ ...editRow, [key]: e.target.value })}
                            placeholder={colHeaders[i]}
                            type={key === 'weight' || key === 'purchasedPrice' ? 'number' : key === 'purchasedDate' ? 'date' : 'text'}
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
                      <td key={key} style={{ ...gridTheme.td}}>
                        {
                          key === 'purchasedDate'
                            ? formatDateMDY(row[key])
                            : key === 'units'
                              ? row['weightUnits']
                              : key === 'owner'
                                ? getShortNameById(row['ownerId'])
                                : key === 'purchasedFrom'
                                  ? getAddressShortNameById(row['purchasedFrom'])
                                  : key === 'purchasedPrice'
                                    ? formatCurrencyValue(row['purchasedPrice'], row['currency'])
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
