import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PoliciesStocksIcon from '../components/icons/stocks.png';
import GridBanner from '../components/GridBanner';
import { gridTheme } from '../components/gridTheme';
import { ActionButton } from '../components/ActionButton';
import ConfirmModal from '../components/ConfirmModal';
import RoundedInput from '../components/RoundedInput';

const API_URL = 'http://localhost:5226/api/investment/stock';

function StockPage() {
  const [stocks, setStocks] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [editIdx, setEditIdx] = useState(null);
  const [editRow, setEditRow] = useState({});
  const [addRow, setAddRow] = useState({ type: '', symbol: '', qty: '', currency: '', currentValue: '', startDate: '', description: '' });
  const [confirm, setConfirm] = useState({ open: false, idx: null });

  useEffect(() => {
    fetchStocks();
  }, []);

  useEffect(() => {
    if (!searchText) setFilteredStocks(stocks);
    else {
      const lower = searchText.toLowerCase();
      setFilteredStocks(
        stocks.filter(s =>
          Object.values(s).some(val =>
            (typeof val === 'string' && val.toLowerCase().includes(lower)) ||
            (typeof val === 'number' && String(val).includes(lower))
          )
        )
      );
    }
  }, [searchText, stocks]);

  const fetchStocks = async () => {
    const res = await axios.get(API_URL);
    setStocks(res.data);
  };

  const handleEdit = idx => {
    setEditIdx(idx);
    setEditRow({ ...filteredStocks[idx] });
  };
  const handleCancel = () => {
    setEditIdx(null);
    setEditRow({});
  };
  const handleSave = async idx => {
    // TODO: implement save logic (PUT)
    setEditIdx(null);
  };
  const handleDelete = idx => {
    setConfirm({ open: true, idx });
  };
  const handleConfirmDelete = async () => {
    // TODO: implement delete logic (DELETE)
    setConfirm({ open: false, idx: null });
  };
  const handleAdd = async () => {
    // TODO: implement add logic (POST)
    setAddRow({ type: '', symbol: '', qty: '', currency: '', currentValue: '', startDate: '', description: '' });
  };

  return (
    <div style={{ padding: 20, paddingTop: 0 }}>
      <ConfirmModal open={confirm.open} message="Are you sure you want to delete this record?" onConfirm={handleConfirmDelete} onCancel={() => setConfirm({ open: false, idx: null })} />
      <GridBanner
        icon={PoliciesStocksIcon}
        title="Stocks & Mutual Funds"
        searchText={searchText}
        setSearchText={setSearchText}
        placeholder="Search stocks & MF..."
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', textAlign: 'left', width: '100%' }}
        titleStyle={{ fontSize: 28, fontWeight: 600, marginLeft: 12, textAlign: 'left', display: 'inline-block' }}
        iconStyle={{ height: 40, display: 'inline-block' }}
      />
      <div style={{ height: 12 }} />
      <div style={{ width: 1000, minWidth: 0, margin: '0 auto', maxWidth: '100%' }}>
        <div style={{ ...gridTheme.scrollContainer, maxHeight: 600, overflowY: 'auto' }}>
          <table style={{ ...gridTheme.table, textAlign: 'left' }}>
            <thead>
              <tr>
                <th style={{ ...gridTheme.th, maxWidth: 80, padding: 8 }}>User</th>
                <th style={{ ...gridTheme.th, maxWidth: 80, padding: 8 }}>Type</th>
                <th style={{ ...gridTheme.th, maxWidth: 90, padding: 8 }}>Symbol</th>
                <th style={{ ...gridTheme.th, maxWidth: 60, padding: 8 }}>Qty</th>
                <th style={{ ...gridTheme.th, maxWidth: 80, padding: 8 }}>Currency</th>
                <th style={{ ...gridTheme.th, maxWidth: 110, padding: 8 }}>Current Value</th>
                <th style={{ ...gridTheme.th, maxWidth: 100, padding: 8 }}>Start Date</th>
                <th style={{ ...gridTheme.th, maxWidth: 120, padding: 8 }}>Description</th>
                <th style={{ ...gridTheme.th, maxWidth: 80, padding: 8 }}></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={gridTheme.td}></td>
                <td style={gridTheme.td}><RoundedInput value={addRow.type} onChange={e => setAddRow({ ...addRow, type: e.target.value })} placeholder="Type" disabled={editIdx !== null} /></td>
                <td style={gridTheme.td}><input value={addRow.symbol} onChange={e => setAddRow({ ...addRow, symbol: e.target.value })} placeholder="Symbol" style={gridTheme.roundedInputTheme} /></td>
                <td style={gridTheme.td}><input value={addRow.qty} onChange={e => setAddRow({ ...addRow, qty: e.target.value })} placeholder="Qty" style={gridTheme.roundedInputTheme} /></td>
                <td style={gridTheme.td}><input value={addRow.currency} onChange={e => setAddRow({ ...addRow, currency: e.target.value })} placeholder="Currency" style={gridTheme.roundedInputTheme} /></td>
                <td style={gridTheme.td}><input value={addRow.currentValue} onChange={e => setAddRow({ ...addRow, currentValue: e.target.value })} placeholder="Current Value" style={gridTheme.roundedInputTheme} /></td>
                <td style={gridTheme.td}><input value={addRow.startDate} onChange={e => setAddRow({ ...addRow, startDate: e.target.value })} placeholder="Start Date" style={gridTheme.roundedInputTheme} /></td>
                <td style={gridTheme.td}><input value={addRow.description} onChange={e => setAddRow({ ...addRow, description: e.target.value })} placeholder="Description" style={gridTheme.roundedInputTheme} /></td>
                <td style={gridTheme.td}><ActionButton onClick={handleAdd} type="save" title="Add" /></td>
              </tr>
              {filteredStocks.map((s, idx) => (
                <tr key={idx}>
                  {editIdx === idx ? (
                    <>
                      <td style={gridTheme.td}>{s.userShortName}</td>
                      <td style={gridTheme.td}><input value={editRow.type} onChange={e => setEditRow({ ...editRow, type: e.target.value })} style={gridTheme.editableDropdownTheme} /></td>
                      <td style={gridTheme.td}><input value={editRow.symbol} onChange={e => setEditRow({ ...editRow, symbol: e.target.value })} style={gridTheme.editableDropdownTheme} /></td>
                      <td style={gridTheme.td}><input value={editRow.qty} onChange={e => setEditRow({ ...editRow, qty: e.target.value })} style={gridTheme.editableDropdownTheme} /></td>
                      <td style={gridTheme.td}><input value={editRow.currency} onChange={e => setEditRow({ ...editRow, currency: e.target.value })} style={gridTheme.editableDropdownTheme} /></td>
                      <td style={gridTheme.td}><input value={editRow.currentValue} onChange={e => setEditRow({ ...editRow, currentValue: e.target.value })} style={gridTheme.editableDropdownTheme} /></td>
                      <td style={gridTheme.td}><input value={editRow.startDate} onChange={e => setEditRow({ ...editRow, startDate: e.target.value })} style={gridTheme.editableDropdownTheme} /></td>
                      <td style={gridTheme.td}><input value={editRow.description} onChange={e => setEditRow({ ...editRow, description: e.target.value })} style={gridTheme.editableDropdownTheme} /></td>
                      <td style={gridTheme.td}>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <ActionButton onClick={() => handleSave(idx)} type="save" title="Save" />
                          <ActionButton onClick={handleCancel} type="cancel" title="Cancel" />
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={{ ...gridTheme.td, maxWidth: 80, padding: 8 }}>{s.userShortName}</td>
                      <td style={{ ...gridTheme.td, maxWidth: 80, padding: 8 }}>{s.type}</td>
                      <td style={{ ...gridTheme.td, maxWidth: 90, padding: 8 }}>{s.symbol}</td>
                      <td style={{ ...gridTheme.td, maxWidth: 60, padding: 8 }}>{s.qty}</td>
                      <td style={{ ...gridTheme.td, maxWidth: 80, padding: 8 }}>{s.currency}</td>
                      <td style={{ ...gridTheme.td, maxWidth: 110, padding: 8 }}>{s.currentValue}</td>
                      <td style={{ ...gridTheme.td, maxWidth: 100, padding: 8 }}>{s.startDate ? new Date(s.startDate).toLocaleDateString() : ''}</td>
                      <td style={{ ...gridTheme.td, maxWidth: 120, padding: 8 }}>{s.description}</td>
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

export default StockPage;
