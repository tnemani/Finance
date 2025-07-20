import React, { useEffect, useState } from 'react';
import axios from 'axios';
import earningsBanner from '../components/icons/earnings_banner.png';
import GridBanner from '../components/GridBanner';
import { gridTheme } from '../components/gridTheme';
import { currencyOptions } from '../constants/Fixedlist';
import { ActionButton } from '../components/ActionButton';
import { fetchUsers } from '../utils/userApi';
import ConfirmModal from '../components/ConfirmModal';
import RoundedInput from '../components/RoundedInput';
import RoundedDropdown from '../components/RoundedDropdown';
import { inputTheme } from '../components/inputTheme';
import { formatCurrencyValue, getCurrencyDisplayLabel } from '../helpers/Helper';
import {
  SPACING,
  FLEX_ROW_CENTER,
  PAGE_CONTAINER_STYLE,
  TABLE_CONTAINER_STYLE,
  SCROLL_CONTAINER_STYLE,
  ACTION_BUTTON_CONTAINER_STYLE,
  createSearchFilter,
  createColumnFonts,
  createAllRows
} from '../constants/common';
import '../constants/common.css';

const SUMMARY_API_URL = 'http://localhost:5226/api/persontransactions';
const SUMMARY_API_SUMMARY_URL = 'http://localhost:5226/api/persontransactions/summary';

// Column definitions for consistent use
const SUMMARY_COLUMNS = {
  keys: ['sourceShortName', 'netAmount', 'currency', 'destinationShortName'],
  headers: ['Source', 'Total Amount', 'Currency', 'Destination']
};

const DETAIL_COLUMNS = {
  keys: ['purpose', 'amount', 'scheduleDate', 'status'],
  headers: ['Purpose', 'Amount', 'Schedule Date', 'Status'],
  types: ['text', 'number', 'date', 'text'],
  placeholders: ['Transaction purpose', 'Amount', 'Schedule date', 'Status']
};

function PersonTransactionsPage() {
  const [summary, setSummary] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filteredSummary, setFilteredSummary] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]);
  const [newRow, setNewRow] = useState({});
  const [editRowId, setEditRowId] = useState(null);
  const [editRowData, setEditRowData] = useState({});
  const [editDetail, setEditDetail] = useState({ idx: null, detailIdx: null, data: {} });
  const [users, setUsers] = useState([]);
  const [confirm, setConfirm] = useState({ open: false, type: '', idx: null, s: null, detailIdx: null });

  // Define column structure similar to DiamondPage
  const colKeys = ['sourceShortName', 'netAmount', 'destinationShortName'];
  const colHeaders = ['Source', 'Total Amount', 'Destination'];
  const detailColKeys = ['purpose', 'amount', 'scheduleDate', 'status'];
  const detailColHeaders = ['Purpose', 'Amount', 'Schedule Date', 'Status'];
  
  // Column helpers for consistent styling
  const allRows = createAllRows(newRow, filteredSummary, editRowData);
  const colFonts = createColumnFonts(colKeys.length);
  const detailColFonts = createColumnFonts(detailColKeys.length);

  useEffect(() => {
    fetchSummary();
    fetchUsers().then(setUsers);
  }, []);

  useEffect(() => {
    if (!searchText) setFilteredSummary(summary);
    else {
      const lower = searchText.toLowerCase();
        summary.filter(s =>
          Object.values(s).some(val =>
            (typeof val === 'string' && val.toLowerCase().includes(lower)) ||
            (typeof val === 'number' && String(val).includes(lower))
          )
      );
    }
  }, [searchText, summary]);

  const fetchSummary = async () => {
    const res = await axios.get(SUMMARY_API_SUMMARY_URL);
    setSummary(res.data);
  };

  const toggleRow = idx => {
    setExpandedRows(rows =>
      rows.includes(idx) ? rows.filter(i => i !== idx) : [...rows, idx]
    );
  };

  const handleAdd = async () => {
    if (summary.length >= 5) {
      alert('You can only have up to 5 person transactions.');
      return;
    }
    if (!newRow || Object.values(newRow).every(v => !v || (typeof v === 'string' && v.trim() === ''))) return;
    // Prepare payload with correct field names and required fields only
    const payload = {
      sourceShortName: newRow.sourceShortName,
      destinationShortName: newRow.destinationShortName,
      currency: newRow.currency,
      amount: newRow.netAmount // Map netAmount to amount
    };
    if (!payload.sourceShortName || !payload.destinationShortName || !payload.currency || !payload.amount) {
      alert('Please fill all fields to add a new transaction.');
      return;
    }
    try {
      await axios.post(SUMMARY_API_URL, payload);
      setNewRow({});
      fetchSummary();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to add summary record.');
    }
  };

  const handleRowEdit = (idx, s) => {
    setEditRowId(idx);
    setEditRowData(s);
  };

  const handleRowChange = (e, col) => {
    setEditRowData({ ...editRowData, [col]: e.target.value });
  };

  const handleRowSave = async (idx, s) => {
    try {
      await axios.put(`${SUMMARY_API_URL}/${s.id ?? s.sourceUserId + '-' + s.destinationUserId + '-' + s.currency}`, editRowData);
      setEditRowId(null);
      setEditRowData({});
      fetchSummary();
    } catch (err) {
      alert('Failed to save changes.');
    }
  };

  const handleRowCancel = () => {
    setEditRowId(null);
    setEditRowData({});
  };

  const handleDelete = (idx, s) => {
    setConfirm({ open: true, type: 'summary', idx, s });
  };

  const handleDetailEdit = (idx, detailIdx, d) => {
    // Get parent summary row
    const s = filteredSummary[idx] || summary[idx] || {};
    // Ensure numeric user IDs and short names in edit state, mapping independently
    let sourceUserId = d.sourceUserId ?? d.SourceUserId ?? s.sourceUserId ?? s.SourceUserId;
    let destinationUserId = d.destinationUserId ?? d.DestinationUserId ?? s.destinationUserId ?? s.DestinationUserId;
    let sourceShortName = d.sourceShortName ?? s.sourceShortName;
    let destinationShortName = d.destinationShortName ?? s.destinationShortName;
    // Map sourceUserId from sourceShortName only
    if (!Number.isInteger(sourceUserId) && sourceShortName) {
      const user = users.find(u => u.shortName === sourceShortName);
      if (user) sourceUserId = user.id;
    }
    // Map destinationUserId from destinationShortName only
    if (!Number.isInteger(destinationUserId) && destinationShortName) {
      const user = users.find(u => u.shortName === destinationShortName);
      if (user) destinationUserId = user.id;
    }
    // If shortName missing but ID present, map from ID (independently)
    if (!sourceShortName && Number.isInteger(sourceUserId)) {
      const user = users.find(u => u.id === sourceUserId);
      if (user) sourceShortName = user.shortName;
    }
    if (!destinationShortName && Number.isInteger(destinationUserId)) {
      const user = users.find(u => u.id === destinationUserId);
      if (user) destinationShortName = user.shortName;
    }
    setEditDetail({ idx, detailIdx, data: { ...d, sourceUserId, destinationUserId, sourceShortName, destinationShortName } });
  };

  const handleDetailChange = (e, col) => {
    setEditDetail(ed => ({ ...ed, data: { ...ed.data, [col]: e.target.value } }));
  };

  const handleDetailSave = async (idx, s, detailIdx) => {
    try {
      // Prepare the updated details array for the group
      const details = s.details.map((d, i) => {
        if (i === detailIdx) {
          // Merge edited values into the detail
          let sourceUserId = editDetail.data.sourceUserId ?? d.sourceUserId ?? d.SourceUserId ?? s.sourceUserId ?? s.SourceUserId;
          let destinationUserId = editDetail.data.destinationUserId ?? d.destinationUserId ?? d.DestinationUserId ?? s.destinationUserId ?? s.DestinationUserId;
          let currency = editDetail.data.currency ?? d.currency ?? d.Currency ?? s.currency ?? s.Currency;
          let amount = editDetail.data.amount ?? d.amount ?? d.Amount;
          let purpose = editDetail.data.purpose ?? d.purpose ?? d.Purpose;
          let scheduleDate = editDetail.data.scheduleDate ?? d.scheduleDate ?? d.ScheduleDate ?? d.startDate ?? d.StartDate;
          let status = editDetail.data.status ?? d.status ?? d.Status;
          return {
            sourceUserId,
            destinationUserId,
            currency,
            amount: Number(amount),
            purpose,
            startDate: scheduleDate,
            status
          };
        } else {
          // Map existing detail to DTO shape
          return {
            sourceUserId: d.sourceUserId ?? d.SourceUserId ?? s.sourceUserId ?? s.SourceUserId,
            destinationUserId: d.destinationUserId ?? d.DestinationUserId ?? s.destinationUserId ?? s.DestinationUserId,
            currency: d.currency ?? d.Currency ?? s.currency ?? s.Currency,
            amount: Number(d.amount ?? d.Amount),
            purpose: d.purpose ?? d.Purpose,
            startDate: d.scheduleDate ?? d.ScheduleDate ?? d.startDate ?? d.StartDate,
            status: d.status ?? d.Status
          };
        }
      });
      // Call the summary update endpoint
      await axios.put(
        `${SUMMARY_API_URL}/summary/${s.sourceUserId}/${s.destinationUserId}/${s.currency}`,
        details
      );
      setEditDetail({ idx: null, detailIdx: null, data: {} });
      fetchSummary();
    } catch (err) {
      console.error('Detail save error:', err, err?.response?.data, err?.response);
      alert('Failed to save detail changes.');
    }
  };

  const handleDetailCancel = () => {
    setEditDetail({ idx: null, detailIdx: null, data: {} });
  };

  const doDelete = async () => {
    if (confirm.type === 'summary') {
      try {
        await axios.delete(`${SUMMARY_API_URL}/${confirm.s.id ?? confirm.s.sourceUserId + '-' + confirm.s.destinationUserId + '-' + confirm.s.currency}`);
        fetchSummary();
      } catch (err) {
        alert('Failed to delete summary record.');
      }
    } else if (confirm.type === 'detail') {
      const detail = confirm.s.details[confirm.detailIdx];
      if (!detail || !detail.id) {
        alert('Transaction ID not found for this detail.');
        setConfirm({ open: false, type: '', idx: null, s: null, detailIdx: null });
        return;
      }
      try {
        await axios.delete(`${SUMMARY_API_URL}/${detail.id}`);
        fetchSummary();
      } catch (err) {
        alert('Failed to delete detail record.');
      }
    }
    setConfirm({ open: false, type: '', idx: null, s: null, detailIdx: null });
  };

  const cancelDelete = () => setConfirm({ open: false, type: '', idx: null, s: null, detailIdx: null });

  const userOptions = users.map(u => ({ value: u.shortName, label: u.shortName }));

  return (
    <div style={PAGE_CONTAINER_STYLE}>
      <ConfirmModal
        open={confirm.open}
        message={confirm.type === 'summary' ? 'Are you sure you want to delete this summary record?' : 'Are you sure you want to delete this detail record?'}
        onConfirm={doDelete}
        onCancel={cancelDelete}
      />
      <GridBanner
        icon={earningsBanner}
        title="Person Incomes"
        searchText={searchText}
        setSearchText={setSearchText}
        placeholder="Search summary..."
      />
      <div style={{ height: SPACING.large }} />
      <div style={TABLE_CONTAINER_STYLE}>
        <div style={{
          ...gridTheme.scrollContainer,
          ...SCROLL_CONTAINER_STYLE,
          maxHeight: 600
        }}>
          <table style={{ ...gridTheme.table, width: 'auto', tableLayout: 'auto', margin: '0 auto' }} className="table-auto-layout">
            <thead>
              <tr>
                <th style={gridTheme.th}></th>
                {colHeaders.map((header, i) => (
                  <th key={header} style={gridTheme.th}>{header}</th>
                ))}
                <th style={gridTheme.th}></th>
              </tr>
            </thead>
            <tbody>
              {/* Add row for new summary record */}
              <tr>
                <td style={gridTheme.td}></td>
                {colKeys.map((key, i) => (
                  <td key={key} style={gridTheme.td}>
                    {key === 'sourceShortName' ? (
                      <RoundedDropdown
                        value={newRow.sourceShortName || ''}
                        onChange={e => setNewRow({ ...newRow, sourceShortName: e.target.value })}
                        options={userOptions}
                        placeholder="Source"
                        colFonts={colFonts}
                        colHeaders={colHeaders}
                        allRows={allRows}
                        colKey={key}
                        i={i}
                        style={{ ...inputTheme }}
                      />
                    ) : key === 'netAmount' ? (
                      <div style={{ ...FLEX_ROW_CENTER, gap: SPACING.medium }}>
                        <RoundedInput 
                          type="number" 
                          value={newRow.netAmount || ''} 
                          onChange={e => setNewRow({ ...newRow, netAmount: e.target.value })} 
                          placeholder="Total Amount"
                          colFonts={colFonts}
                          colHeaders={colHeaders}
                          allRows={allRows}
                          colKey={key}
                          i={i}
                          style={{ ...inputTheme }}
                        />
                        <RoundedDropdown
                          value={newRow.currency || ''}
                          onChange={e => setNewRow({ ...newRow, currency: e.target.value })}
                          options={currencyOptions}
                          placeholder="Currency"
                          style={{ ...inputTheme }}
                        />
                      </div>
                    ) : key === 'destinationShortName' ? (
                      <RoundedDropdown
                        value={newRow.destinationShortName || ''}
                        onChange={e => setNewRow({ ...newRow, destinationShortName: e.target.value })}
                        options={userOptions}
                        placeholder="Destination"
                        colFonts={colFonts}
                        colHeaders={colHeaders}
                        allRows={allRows}
                        colKey={key}
                        i={i}
                        style={{ ...inputTheme }}
                      />
                    ) : (
                      <RoundedInput
                        value={newRow[key] || ''}
                        onChange={e => setNewRow({ ...newRow, [key]: e.target.value })}
                        placeholder={colHeaders[i]}
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
                <td style={gridTheme.td}>
                  <div style={{ ...FLEX_ROW_CENTER, ...ACTION_BUTTON_CONTAINER_STYLE }}>
                    <ActionButton
                      onClick={handleAdd}
                      type="save"
                      title="Save"
                    />
                    <ActionButton
                      onClick={() => setNewRow({})}
                      type="reset"
                      title="Reset"
                    />
                  </div>
                </td>
              </tr>
              {filteredSummary.map((s, idx) => (
                <React.Fragment key={idx}>
                  <tr>
                    <td style={gridTheme.td}>
                      <button 
                        onClick={() => toggleRow(idx)} 
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}
                        className="transparent-button"
                      >
                        {expandedRows.includes(idx) ? '▼' : '▶'}
                      </button>
                    </td>
                    {editRowId === idx ? (
                      <>
                        {colKeys.map((key, i) => (
                          <td key={key} style={gridTheme.td}>
                            {key === 'sourceShortName' ? (
                              <RoundedDropdown
                                value={editRowData.sourceShortName || ''}
                                onChange={e => handleRowChange(e, 'sourceShortName')}
                                options={userOptions}
                                placeholder="Source"
                                colFonts={colFonts}
                                colHeaders={colHeaders}
                                allRows={allRows}
                                colKey={key}
                                i={i}
                                style={{ ...inputTheme }}
                              />
                            ) : key === 'netAmount' ? (
                              <div style={{ ...FLEX_ROW_CENTER, gap: SPACING.medium }}>
                                <RoundedInput 
                                  type="number" 
                                  value={editRowData.netAmount || ''} 
                                  onChange={e => handleRowChange(e, 'netAmount')} 
                                  placeholder="Total Amount"
                                  colFonts={colFonts}
                                  colHeaders={colHeaders}
                                  allRows={allRows}
                                  colKey={key}
                                  i={i}
                                  style={{ ...inputTheme }}
                                />
                                <RoundedDropdown
                                  value={editRowData.currency || ''}
                                  onChange={e => handleRowChange(e, 'currency')}
                                  options={currencyOptions}
                                  placeholder="Currency"
                                  style={{ ...inputTheme }}
                                />
                              </div>
                            ) : key === 'destinationShortName' ? (
                              <RoundedDropdown
                                value={editRowData.destinationShortName || ''}
                                onChange={e => handleRowChange(e, 'destinationShortName')}
                                options={userOptions}
                                placeholder="Destination"
                                colFonts={colFonts}
                                colHeaders={colHeaders}
                                allRows={allRows}
                                colKey={key}
                                i={i}
                                style={{ ...inputTheme }}
                              />
                            ) : (
                              <RoundedInput
                                value={editRowData[key] || ''}
                                onChange={e => handleRowChange(e, key)}
                                placeholder={colHeaders[i]}
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
                        <td style={gridTheme.td}>
                          <div style={{ ...FLEX_ROW_CENTER, ...ACTION_BUTTON_CONTAINER_STYLE }}>
                            <ActionButton
                              onClick={() => handleRowSave(idx, s)}
                              type="save"
                              title="Save"
                            />
                            <ActionButton
                              onClick={handleRowCancel}
                              type="cancel"
                              title="Cancel"
                            />
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        {colKeys.map((key, i) => (
                          <td key={key} style={gridTheme.td}>
                            {key === 'sourceShortName' ? (
                              `${s.sourceShortName || s.sourceUserId} will get`
                            ) : key === 'netAmount' ? (
                              <span>
                                {formatCurrencyValue(s.netAmount, s.currency)} 
                              </span>
                            ) : key === 'destinationShortName' ? (
                              `From ${s.destinationShortName || s.destinationUserId}`
                            ) : (
                              s[key]
                            )}
                          </td>
                        ))}
                        <td style={gridTheme.td}>
                          <div style={{ ...FLEX_ROW_CENTER, ...ACTION_BUTTON_CONTAINER_STYLE }}>
                            <ActionButton
                              onClick={() => handleRowEdit(idx, s)}
                              type="edit"
                              title="Edit"
                            />
                            <ActionButton
                              onClick={() => handleDelete(idx, s)}
                              type="delete"
                              title="Delete"
                            />
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                  {expandedRows.includes(idx) && (
                    <tr>
                      <td style={{ ...gridTheme.td, background: '#f5faff' }} colSpan={5}>
                        <table style={{ width: '100%', background: 'none', border: 'none' }}>
                          <thead>
                            <tr>
                              {detailColHeaders.map((header, idx) => (
                                <th key={header} style={{ ...gridTheme.th, fontSize: 13 }}>{header}</th>
                              ))}
                              <th style={{ ...gridTheme.th, fontSize: 13 }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {s.details.map((d, i) => (
                              <tr key={i}>
                                {editDetail.idx === idx && editDetail.detailIdx === i ? (
                                  <>
                                    {detailColKeys.map((key, j) => (
                                      <td key={key} style={{ ...gridTheme.td, fontSize: 13 }}>
                                        {key === 'scheduleDate' ? (
                                          <RoundedInput 
                                            type="date" 
                                            value={editDetail.data.scheduleDate ? new Date(editDetail.data.scheduleDate).toISOString().slice(0, 10) : ''} 
                                            onChange={e => handleDetailChange(e, 'scheduleDate')} 
                                            placeholder={DETAIL_COLUMNS.placeholders[j]}
                                            colFonts={detailColFonts}
                                            colHeaders={detailColHeaders}
                                            allRows={[]}
                                            colKey={key}
                                            i={j}
                                            style={{ ...inputTheme, fontSize: 13 }} 
                                          />
                                        ) : key === 'amount' ? (
                                          <RoundedInput 
                                            type="number" 
                                            value={editDetail.data.amount || ''} 
                                            onChange={e => handleDetailChange(e, 'amount')} 
                                            placeholder={DETAIL_COLUMNS.placeholders[j]}
                                            colFonts={detailColFonts}
                                            colHeaders={detailColHeaders}
                                            allRows={[]}
                                            colKey={key}
                                            i={j}
                                            style={{ ...inputTheme, fontSize: 13 }} 
                                          />
                                        ) : (
                                          <RoundedInput 
                                            value={editDetail.data[key] || ''} 
                                            onChange={e => handleDetailChange(e, key)} 
                                            placeholder={DETAIL_COLUMNS.placeholders[j]}
                                            colFonts={detailColFonts}
                                            colHeaders={detailColHeaders}
                                            allRows={[]}
                                            colKey={key}
                                            i={j}
                                            style={{ ...inputTheme, fontSize: 13 }} 
                                          />
                                        )}
                                      </td>
                                    ))}
                                    <td style={{ ...gridTheme.td, fontSize: 13 }}>
                                      <div style={{ ...FLEX_ROW_CENTER, gap: SPACING.small }}>
                                        <ActionButton
                                          onClick={() => handleDetailSave(idx, s, i)}
                                          type="save"
                                          title="Save"
                                        />
                                        <ActionButton
                                          onClick={handleDetailCancel}
                                          type="cancel"
                                          title="Cancel"
                                        />
                                      </div>
                                    </td>
                                  </>
                                ) : (
                                  <>
                                    {detailColKeys.map((key, j) => (
                                      <td key={key} style={{ ...gridTheme.td, fontSize: 13 }}>
                                        {key === 'purpose' ? (
                                          d.purpose
                                        ) : key === 'amount' ? (
                                          formatCurrencyValue(d.amount, s.currency)
                                        ) : key === 'scheduleDate' ? (
                                          d.scheduleDate ? new Date(d.scheduleDate).toLocaleDateString() : ''
                                        ) : key === 'status' ? (
                                          d.status
                                        ) : (
                                          d[key]
                                        )}
                                      </td>
                                    ))}
                                    <td style={{ ...gridTheme.td, fontSize: 13 }}>
                                      <div style={{ ...FLEX_ROW_CENTER, gap: SPACING.small }}>
                                        <ActionButton
                                          onClick={() => handleDetailEdit(idx, i, d)}
                                          type="edit"
                                          title="Edit"
                                        />
                                        <ActionButton
                                          onClick={() => setConfirm({ open: true, type: 'detail', idx, s, detailIdx: i })}
                                          type="delete"
                                          title="Delete"
                                        />
                                      </div>
                                    </td>
                                  </>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default PersonTransactionsPage;
