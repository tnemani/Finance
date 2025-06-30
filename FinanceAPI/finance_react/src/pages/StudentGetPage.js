import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PoliciesStocksIcon from '../components/icons/graduate.png';
import GridBanner from '../components/GridBanner';
import { gridTheme, currencyOptions, roundedInputTheme, roundedSelectTheme, editableDropdownTheme } from '../components/gridTheme';
import { ActionButton } from '../components/ActionButton';
import ConfirmModal from '../components/ConfirmModal';

const API_URL = 'http://localhost:5226/api/investment/studentget';

function StudentGetPage() {
  const [gets, setGets] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filteredGets, setFilteredGets] = useState([]);
  const [editIdx, setEditIdx] = useState(null);
  const [editRow, setEditRow] = useState({});
  const [addRow, setAddRow] = useState({ userShortName: '', type: '', symbol: '', qty: '', currency: '', currentValue: '', startDate: '', description: '' });
  const [confirm, setConfirm] = useState({ open: false, idx: null });

  useEffect(() => { fetchGets(); }, []);

  useEffect(() => {
    if (!searchText) setFilteredGets(gets);
    else {
      const lower = searchText.toLowerCase();
      setFilteredGets(
        gets.filter(s =>
          Object.values(s).some(val =>
            (typeof val === 'string' && val.toLowerCase().includes(lower)) ||
            (typeof val === 'number' && String(val).includes(lower))
          )
        )
      );
    }
  }, [searchText, gets]);

  const fetchGets = async () => {
    const res = await axios.get(API_URL);
    setGets(res.data);
  };

  const handleEdit = idx => {
    setEditIdx(idx);
    setEditRow({ ...filteredGets[idx] });
  };
  const handleCancel = () => {
    setEditIdx(null);
    setEditRow({});
  };
  const handleSave = async idx => {
    const row = editRow;
    await axios.put(`${API_URL}/${row.id}`, row);
    setEditIdx(null);
    setEditRow({});
    fetchGets();
  };
  const handleDelete = idx => {
    setConfirm({ open: true, idx });
  };
  const handleConfirmDelete = async () => {
    const row = filteredGets[confirm.idx];
    await axios.delete(`${API_URL}/${row.id}`);
    setConfirm({ open: false, idx: null });
    fetchGets();
  };
  const handleAdd = async () => {
    if (!addRow.type || !addRow.symbol) return;
    await axios.post(API_URL, addRow);
    setAddRow({ userShortName: '', type: '', symbol: '', qty: '', currency: '', currentValue: '', startDate: '', description: '' });
    fetchGets();
  };

  return (
    <div style={{ padding: 20, paddingTop: 0 }}>
      <ConfirmModal open={confirm.open} message="Are you sure you want to delete this record?" onConfirm={handleConfirmDelete} onCancel={() => setConfirm({ open: false, idx: null })} />
      <GridBanner
        icon={PoliciesStocksIcon}
        title="Student Investments"
        searchText={searchText}
        setSearchText={setSearchText}
        placeholder="Search student investments..."
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', textAlign: 'left', width: '100%' }}
        titleStyle={{ fontSize: 28, fontWeight: 600, marginLeft: 12, textAlign: 'left', display: 'inline-block' }}
        iconStyle={{ height: 40, display: 'inline-block' }}
      />
      <div style={{ height: 12 }} />
      <div style={{ width: 1000, minWidth: 0, margin: '0 auto', maxWidth: '100%' }}>
        <div style={{ ...gridTheme.scrollContainer, maxHeight: 600, overflowY: 'auto' }}>
          <table style={gridTheme.table}>
            <thead>
              <tr>
                <th style={{ ...gridTheme.th, whiteSpace: 'nowrap' }}>User</th>
                <th style={{ ...gridTheme.th, whiteSpace: 'nowrap' }}>Type</th>
                <th style={{ ...gridTheme.th, whiteSpace: 'nowrap' }}>Symbol</th>
                <th style={{ ...gridTheme.th, whiteSpace: 'nowrap' }}>Qty</th>
                <th style={{ ...gridTheme.th, whiteSpace: 'nowrap' }}>Currency</th>
                <th style={{ ...gridTheme.th, whiteSpace: 'nowrap' }}>Current Value</th>
                <th style={{ ...gridTheme.th, whiteSpace: 'nowrap' }}>Start Date</th>
                <th style={{ ...gridTheme.th, whiteSpace: 'nowrap' }}>Description</th>
                <th style={{ ...gridTheme.th, whiteSpace: 'nowrap' }}></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={gridTheme.td}><input value={addRow.userShortName} onChange={e => setAddRow({ ...addRow, userShortName: e.target.value })} placeholder="User" {...gridTheme.roundedInputTheme} /></td>
                <td style={gridTheme.td}><input value={addRow.type} onChange={e => setAddRow({ ...addRow, type: e.target.value })} placeholder="Type" {...gridTheme.roundedInputTheme} /></td>
                <td style={gridTheme.td}><input value={addRow.symbol} onChange={e => setAddRow({ ...addRow, symbol: e.target.value })} placeholder="Symbol" {...gridTheme.roundedInputTheme} /></td>
                <td style={gridTheme.td}><input value={addRow.qty} onChange={e => setAddRow({ ...addRow, qty: e.target.value })} placeholder="Qty" {...gridTheme.roundedInputTheme} /></td>
                <td style={gridTheme.td}>
                  <select value={addRow.currency} onChange={e => setAddRow({ ...addRow, currency: e.target.value })} {...gridTheme.roundedSelectTheme}>
                    <option value="">Select</option>
                    {currencyOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </td>
                <td style={{ ...gridTheme.td, whiteSpace: 'nowrap' }}><input value={addRow.currentValue} onChange={e => setAddRow({ ...addRow, currentValue: e.target.value })} placeholder="Current Value" {...gridTheme.roundedInputTheme} style={{...gridTheme.roundedInputTheme.style, whiteSpace: 'nowrap'}} /></td>
                <td style={gridTheme.td}><input type="date" value={addRow.startDate} onChange={e => setAddRow({ ...addRow, startDate: e.target.value })} placeholder="Start Date" {...gridTheme.roundedInputTheme} /></td>
                <td style={gridTheme.td}><input value={addRow.description} onChange={e => setAddRow({ ...addRow, description: e.target.value })} placeholder="Description" {...gridTheme.roundedInputTheme} /></td>
                <td style={gridTheme.td}><ActionButton onClick={handleAdd} type="save" title="Add" /></td>
              </tr>
              {filteredGets.map((s, idx) => (
                <tr key={idx}>
                  {editIdx === idx ? (
                    <>
                      <td style={gridTheme.td}>{s.userShortName}</td>
                      <td style={gridTheme.td}><input value={editRow.type} onChange={e => setEditRow({ ...editRow, type: e.target.value })} {...gridTheme.roundedInputTheme} style={{...gridTheme.roundedInputTheme.style, border: editIdx === idx ? '1px solid #1976d2' : 'none'}} /></td>
                      <td style={gridTheme.td}><input value={editRow.symbol} onChange={e => setEditRow({ ...editRow, symbol: e.target.value })} {...gridTheme.roundedInputTheme} style={{...gridTheme.roundedInputTheme.style, border: editIdx === idx ? '1px solid #1976d2' : 'none'}} /></td>
                      <td style={gridTheme.td}><input value={editRow.qty} onChange={e => setEditRow({ ...editRow, qty: e.target.value })} {...gridTheme.roundedInputTheme} style={{...gridTheme.roundedInputTheme.style, border: editIdx === idx ? '1px solid #1976d2' : 'none'}} /></td>
                      <td style={gridTheme.td}>
                        <select value={editRow.currency} onChange={e => setEditRow({ ...editRow, currency: e.target.value })} {...gridTheme.roundedSelectTheme} style={{...gridTheme.roundedSelectTheme.style, border: editIdx === idx ? '1px solid #1976d2' : 'none'}}>
                          <option value="">Select</option>
                          {currencyOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                      </td>
                      <td style={{ ...gridTheme.td, whiteSpace: 'nowrap' }}><input value={editRow.currentValue} onChange={e => setEditRow({ ...editRow, currentValue: e.target.value })} {...gridTheme.roundedInputTheme} style={{...gridTheme.roundedInputTheme.style, border: editIdx === idx ? '1px solid #1976d2' : 'none', whiteSpace: 'nowrap'}} /></td>
                      <td style={gridTheme.td}><input type="date" value={editRow.startDate} onChange={e => setEditRow({ ...editRow, startDate: e.target.value })} {...gridTheme.roundedInputTheme} style={{...gridTheme.roundedInputTheme.style, border: editIdx === idx ? '1px solid #1976d2' : 'none'}} /></td>
                      <td style={gridTheme.td}><input value={editRow.description} onChange={e => setEditRow({ ...editRow, description: e.target.value })} {...gridTheme.roundedInputTheme} style={{...gridTheme.roundedInputTheme.style, border: editIdx === idx ? '1px solid #1976d2' : 'none'}} /></td>
                      <td style={gridTheme.td}>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <ActionButton onClick={() => handleSave(idx)} type="save" title="Save" />
                          <ActionButton onClick={handleCancel} type="cancel" title="Cancel" />
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={gridTheme.td}>{s.userShortName}</td>
                      <td style={gridTheme.td}>{s.type}</td>
                      <td style={gridTheme.td}>{s.symbol}</td>
                      <td style={gridTheme.td}>{s.qty}</td>
                      <td style={gridTheme.td}>{s.currency}</td>
                      <td style={{ ...gridTheme.td, whiteSpace: 'nowrap' }}>{s.currentValue}</td>
                      <td style={gridTheme.td}>{s.startDate ? new Date(s.startDate).toLocaleDateString() : ''}</td>
                      <td style={gridTheme.td}>{s.description}</td>
                      <td style={gridTheme.td}>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <ActionButton onClick={() => handleEdit(idx)} type="edit" title="Edit" />
                          <ActionButton onClick={() => handleDelete(idx)} type="delete" title="Delete" />
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default StudentGetPage;
