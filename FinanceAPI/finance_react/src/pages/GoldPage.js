import React, { useEffect, useState } from 'react';
import axios from 'axios';
import GridBanner from '../components/GridBanner';
import { gridTheme } from '../components/gridTheme';
import { ActionButton } from '../components/ActionButton';
import ConfirmModal from '../components/ConfirmModal';
import RoundedInput from '../components/RoundedInput';
import goldIcon from '../components/icons/gold.png';
import { inputTheme } from '../components/inputTheme';
import RoundedDropdown from '../components/RoundedDropdown';

const API_URL = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:5226/api') + '/jewlery';

export default function GoldPage() {
  const [gold, setGold] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filteredGold, setFilteredGold] = useState([]);
  const [editIdx, setEditIdx] = useState(null);
  const [editRow, setEditRow] = useState({});
  const [addRow, setAddRow] = useState({ type: 'Gold' });
  const [confirm, setConfirm] = useState({ open: false, idx: null });
  const [addUnitsDropdownOpen, setAddUnitsDropdownOpen] = useState(false);
  const [editUnitsDropdownOpen, setEditUnitsDropdownOpen] = useState(false);

  useEffect(() => { fetchGold(); }, []);

  useEffect(() => {
    if (!searchText) setFilteredGold(gold);
    else {
      const lower = searchText.toLowerCase();
      setFilteredGold(
        gold.filter(s =>
          Object.values(s).some(val =>
            (typeof val === 'string' && val.toLowerCase().includes(lower)) ||
            (typeof val === 'number' && String(val).includes(lower))
          )
        )
      );
    }
  }, [searchText, gold]);

  const fetchGold = async () => {
    const res = await axios.get(API_URL);
    setGold(res.data.filter(j => j.type && j.type.toLowerCase() === 'gold'));
  };

  const handleEdit = idx => {
    setEditIdx(idx);
    setEditRow({ ...filteredGold[idx] });
  };
  const handleCancel = () => {
    setEditIdx(null);
    setEditRow({});
  };
  const handleSave = async idx => {
    const row = editRow;
    let payload = { ...row, type: 'Gold' };
    delete payload.id;
    Object.keys(payload).forEach(key => { if (payload[key] === '') delete payload[key]; });
    if (row.id) {
      await axios.put(`${API_URL}/${row.id}`, payload);
    } else {
      await axios.post(API_URL, payload);
    }
    setEditIdx(null);
    setEditRow({});
    setAddRow({ type: 'Gold' });
    fetchGold();
  };
  const handleDelete = idx => {
    setConfirm({ open: true, idx });
  };
  const handleConfirmDelete = async () => {
    const row = filteredGold[confirm.idx];
    await axios.delete(`${API_URL}/${row.id}`);
    setConfirm({ open: false, idx: null });
    fetchGold();
  };
  const handleAdd = async () => {
    let payload = { ...addRow, type: 'Gold' };
    delete payload.id;
    Object.keys(payload).forEach(key => { if (payload[key] === '') delete payload[key]; });
    await axios.post(API_URL, payload);
    setAddRow({ type: 'Gold' });
    fetchGold();
  };

  // Helper to format date as 'Month, Date yyyy'
  function formatDateMDY(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  }

  function getTextWidth(text, font = '16px Arial') {
    if (typeof document === 'undefined') return 200;
    const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement('canvas'));
    const context = canvas.getContext('2d');
    context.font = font;
    return context.measureText(text).width;
  }
  const allRows = [addRow, ...filteredGold, editRow];
  const colKeys = [
    'name', 'weight', 'units', 'purchasedPrice', 'currency', 'purchasedDate', 'purchasedFrom', 'description'
  ];
  const colHeaders = [
    'Name', 'Weight', 'Units', 'Purchased Price', 'Currency', 'Purchased Date', 'Purchased From', 'Description'
  ];
  const colFonts = Array(colKeys.length).fill('16px Arial');
  const colWidths = colKeys.map((key, i) => {
    const headerWidth = getTextWidth(colHeaders[i], colFonts[i]);
    const cellWidths = allRows.map(row => getTextWidth((row && row[key]) ? String(row[key]) : '', colFonts[i]));
    return Math.max(headerWidth, ...cellWidths, 80) + 40;
  });

  const weightUnitOptions = [
    { value: '', label: 'Select' },
    { value: 'g', label: 'g' },
    { value: 'kg', label: 'kg' },
    { value: 'oz', label: 'oz' },
    { value: 'tola', label: 'tola' },
    { value: 'carat', label: 'carat' },
    { value: 'mg', label: 'mg' },
    { value: 'lb', label: 'lb' },
  ];

  return (
    <div style={{ padding: 20, paddingTop: 0 }}>
      <ConfirmModal open={confirm.open} message="Are you sure you want to delete this record?" onConfirm={handleConfirmDelete} onCancel={() => setConfirm({ open: false, idx: null })} />
      <GridBanner
        icon={goldIcon}
        title="Gold Jewlery"
        searchText={searchText}
        setSearchText={setSearchText}
        placeholder="Search gold..."
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', textAlign: 'left', width: '100%' }}
        titleStyle={{ fontSize: 28, fontWeight: 600, marginLeft: 12, textAlign: 'left', display: 'inline-block' }}
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
                  <th key={header} style={{ ...gridTheme.th, whiteSpace: 'normal', maxWidth: colWidths[i], minWidth: 80, width: colWidths[i], textAlign: 'left', fontWeight: 600, fontSize: 16 }}>{header}</th>
                ))}
                <th style={{ ...gridTheme.th, whiteSpace: 'nowrap' }}></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                {colKeys.map((key, i) => (
                  <td key={key} style={{
                    ...gridTheme.td,
                    maxWidth: colWidths[i],
                    minWidth: 80,
                    width: colWidths[i],
                    ...(key === 'units' ? { position: 'relative', zIndex: 10, overflow: 'visible', minHeight: addUnitsDropdownOpen ? 200 : undefined } : {})
                  }}>
                    {key === 'units' ? (
                      <RoundedDropdown
                        options={weightUnitOptions}
                        value={addRow['weightUnits'] || ''}
                        onChange={e => setAddRow({ ...addRow, weightUnits: e.target.value })}
                        placeholder="Units"
                        style={{ width: '100%', zIndex: 10, position: 'relative' }}
                        onDropdownOpenChange={setAddUnitsDropdownOpen}
                      />
                    ) : (
                      // <RoundedInput
                      //   value={addRow[key] || ''}
                      //   onChange={e => setAddRow({ ...addRow, [key]: e.target.value })}
                      //   placeholder={colHeaders[i]}
                      //   type={key === 'weight' || key === 'purchasedPrice' ? 'number' : key === 'purchasedDate' ? 'date' : 'text'}
                      //   style={{ width: '100%' }}
                      // />
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
              {filteredGold.map((row, idx) =>
                editIdx === idx ? (
                  <tr key={row.id}>
                    {colKeys.map((key, i) => (
                      <td key={key} style={{
                        ...gridTheme.td,
                        maxWidth: colWidths[i],
                        minWidth: 80,
                        width: colWidths[i],
                        ...(key === 'units' ? { position: 'relative', zIndex: 10, overflow: 'visible', minHeight: editUnitsDropdownOpen ? 200 : undefined } : {})
                      }}>
                        {key === 'units' ? (
                          <RoundedDropdown
                            options={weightUnitOptions}
                            value={editRow['weightUnits'] || ''}
                            onChange={e => setEditRow({ ...editRow, weightUnits: e.target.value })}
                            placeholder="Units"
                            style={{ width: '100%', zIndex: 10, position: 'relative' }}
                            onDropdownOpenChange={setEditUnitsDropdownOpen}
                          />
                        ) : (
                          <RoundedInput
                            value={editRow[key] || ''}
                            onChange={e => setEditRow({ ...editRow, [key]: e.target.value })}
                            placeholder={colHeaders[i]}
                            type={key === 'weight' || key === 'purchasedPrice' ? 'number' : key === 'purchasedDate' ? 'date' : 'text'}
                            style={{ width: '100%' }}
                          />
                        )}
                      </td>
                    ))}
                    <td style={{ ...gridTheme.td }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <ActionButton type="save" onClick={() => handleSave(idx)} />
                        <ActionButton type="cancel" onClick={handleCancel} />
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={row.id}>
                    {colKeys.map((key, i) => (
                      <td key={key} style={{ ...gridTheme.td, maxWidth: colWidths[i], minWidth: 80, width: colWidths[i] }}>
                        {
                          key === 'purchasedDate' ? formatDateMDY(row[key]) : row[key]
                        }
                      </td>
                    ))}
                    <td style={{ ...gridTheme.td }}>
                      <div style={{ display: 'flex', gap: 4 }}>
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
