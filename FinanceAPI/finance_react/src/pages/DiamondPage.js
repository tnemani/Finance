import React, { useEffect, useState } from 'react';
import axios from 'axios';
import GridBanner from '../components/GridBanner';
import { gridTheme } from '../components/gridTheme';
import { ActionButton } from '../components/ActionButton';
import ConfirmModal from '../components/ConfirmModal';
import RoundedInput from '../components/RoundedInput';
import RoundedDropdown from '../components/RoundedDropdown';
import diamondIcon from '../components/icons/diamond.png';
import { inputTheme } from '../components/inputTheme';
import { currencyOptions, getWeightOptions } from '../constants/Fixedlist';
import { formatDateMDY } from '../helpers/Helper';
import {formatCurrencyValue} from '../helpers/Helper';

const API_URL = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:5226/api') + '/jewlery';
const USERS_API_URL = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:5226/api') + '/users';
const ADDRESSES_API_URL = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:5226/api') + '/addresses';



export default function DiamondPage() {
  const [diamonds, setDiamonds] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filteredDiamonds, setFilteredDiamonds] = useState([]);
  const [editIdx, setEditIdx] = useState(null);
  const [editRow, setEditRow] = useState({});
  const [addRow, setAddRow] = useState({ type: 'Diamond' });
  const [confirm, setConfirm] = useState({ open: false, idx: null });
  const [users, setUsers] = useState([]);
  const [addresses, setAddresses] = useState([]);

  useEffect(() => { fetchDiamonds(); fetchUsers(); fetchAddresses(); }, []);

  useEffect(() => {
    if (!searchText) setFilteredDiamonds(diamonds);
    else {
      const lower = searchText.toLowerCase();
      setFilteredDiamonds(
        diamonds.filter(s =>
          Object.values(s).some(val =>
            (typeof val === 'string' && val.toLowerCase().includes(lower)) ||
            (typeof val === 'number' && String(val).includes(lower))
          )
        )
      );
    }
  }, [searchText, diamonds]);

  const fetchDiamonds = async () => {
    const res = await axios.get(API_URL);
    // Normalize each diamond to always have ownerId (fallback to owner if missing)
    const normalized = res.data
      .filter(j => j.type && j.type.toLowerCase() === 'diamond')
      .map(d => ({
        ...d,
        ownerId: d.ownerId !== undefined && d.ownerId !== null && d.ownerId !== '' ? d.ownerId : d.owner
      }));
    setDiamonds(normalized);
  };

  const fetchUsers = async () => {
    const res = await axios.get(USERS_API_URL);
    setUsers(res.data);
  };

  const fetchAddresses = async () => {
    const res = await axios.get(ADDRESSES_API_URL);
    setAddresses(res.data);
  };

  // Build owner dropdown options from users
  const ownerOptions = users
    .filter(u => u.shortName)
    .map(u => ({ label: u.shortName, value: u.id }));

  // Build address dropdown options from addresses
  const addressOptions = addresses
    .filter(a => a.shortName)
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
    setEditRow({ ...filteredDiamonds[idx] });
  };
  const handleCancel = () => {
    setEditIdx(null);
    setEditRow({});
  };
  const handleSave = async idx => {
    const row = editRow;
    let payload = { ...row, type: 'Diamond' };
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
    setAddRow({ type: 'Diamond' });
    fetchDiamonds();
  };
  const handleDelete = idx => {
    setConfirm({ open: true, idx });
  };
  const handleConfirmDelete = async () => {
    const row = filteredDiamonds[confirm.idx];
    await axios.delete(`${API_URL}/${row.id}`);
    setConfirm({ open: false, idx: null });
    fetchDiamonds();
  };
  const handleAdd = async () => {
    let payload = { ...addRow, type: 'Diamond' };
    // Ensure owner is set from ownerId for API
    if (payload.ownerId !== undefined) {
      payload.owner = payload.ownerId;
      delete payload.ownerId;
    }
    delete payload.id;
    Object.keys(payload).forEach(key => { if (payload[key] === '') delete payload[key]; });
    await axios.post(API_URL, payload);
    setAddRow({ type: 'Diamond' });
    fetchDiamonds();
  };

  const weightUnitOptions = getWeightOptions();

  const allRows = [addRow, ...filteredDiamonds, editRow];
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
      <ConfirmModal open={confirm.open} message="Are you sure you want to delete this record?" onConfirm={handleConfirmDelete} onCancel={() => setConfirm({ open: false, idx: null })} />
      <GridBanner
        icon={diamondIcon}
        title="Diamond Jewlery"
        searchText={searchText}
        setSearchText={setSearchText}
        placeholder="Search diamonds..."
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
                  <ActionButton type="add" onClick={handleAdd} />
                </td>
              </tr>
              {filteredDiamonds.map((row, idx) =>
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
                      <div style={{ display: 'flex' }}>
                        <ActionButton type="save" onClick={() => handleSave(idx)} />
                        <ActionButton type="cancel" onClick={handleCancel} />
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
                      <div style={{ display: 'flex' }}>
                        <ActionButton type="edit" onClick={() => handleEdit(idx)} />
                        <ActionButton type="delete" onClick={() => handleDelete(idx)} />
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
