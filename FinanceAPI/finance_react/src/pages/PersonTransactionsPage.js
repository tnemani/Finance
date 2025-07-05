import React, { useEffect, useState } from 'react';
import axios from 'axios';
import earningsBanner from '../components/icons/earnings_banner.png';
import GridBanner from '../components/GridBanner';
import { gridTheme, currencyOptions } from '../components/gridTheme';
import { ActionButton } from '../components/ActionButton';
import { fetchUsers } from '../utils/userApi';
import ConfirmModal from '../components/ConfirmModal';
import RoundedInput from '../components/RoundedInput';
import RoundedDropdown from '../components/RoundedDropdown';

const SUMMARY_API_URL = 'http://localhost:5226/api/persontransactions';
const SUMMARY_API_SUMMARY_URL = 'http://localhost:5226/api/persontransactions/summary';

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

  useEffect(() => {
    fetchSummary();
    fetchUsers().then(setUsers);
  }, []);

  useEffect(() => {
    if (!searchText) setFilteredSummary(sortSummaryRows(summary));
    else {
      const lower = searchText.toLowerCase();
      setFilteredSummary(sortSummaryRows(
        summary.filter(s =>
          Object.values(s).some(val =>
            (typeof val === 'string' && val.toLowerCase().includes(lower)) ||
            (typeof val === 'number' && String(val).includes(lower))
          )
        )
      ));
    }
  }, [searchText, summary]);

  // Set default values for new summary record
  useEffect(() => {
    if (summary.length > 0 && Object.keys(newRow).length === 0) {
      setNewRow({
        sourceShortName: summary[0].sourceShortName,
        destinationShortName: summary[0].destinationShortName,
        currency: summary[0].currency,
        netAmount: '',
      });
    }
  }, [summary]);

  const fetchSummary = async () => {
    const res = await axios.get(SUMMARY_API_SUMMARY_URL);
    setSummary(sortSummaryByCurrency(res.data));
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

  // Robust helper to format amount with commas as per currency, no decimals
  function formatAmount(value, currency) {
    if (value == null || value === '') return '';
    const num = Number(value);
    if (isNaN(num)) return value;
    const c = (currency || '').toString().trim().toLowerCase();
    if (c === 'rs' || c === 'inr' || c === '₹' || c === 'rupees') {
      return num.toLocaleString('en-IN', { maximumFractionDigits: 0 });
    }
    // US/other: 125,678,000
    return num.toLocaleString('en-US', { maximumFractionDigits: 0 });
  }

  // Helper to get currency sort order
  function getCurrencyOrder(currency) {
    if (!currency) return 999;
    const c = currency.toString().trim().toLowerCase();
    if (["usd", "$", "dollars", "dollar"].includes(c)) return 0;
    if (["inr", "rs", "₹", "rupees", "rupee"].includes(c)) return 1;
    return 2;
  }

  // Helper to sort summary rows by currency order, then alphabetically for others
  function sortSummaryByCurrency(arr) {
    return arr.slice().sort((a, b) => {
      const orderA = getCurrencyOrder(a.currency);
      const orderB = getCurrencyOrder(b.currency);
      if (orderA !== orderB) return orderA - orderB;
      if (orderA === 2 && orderB === 2) {
        // Both are "other" currencies, sort alphabetically
        const ca = (a.currency || '').toLowerCase();
        const cb = (b.currency || '').toLowerCase();
        if (ca < cb) return -1;
        if (ca > cb) return 1;
        return 0;
      }
      return 0;
    });
  }

  // Custom sort: USD first, INR/Rs/₹ next, then others alphabetically
  function sortSummaryRows(rows) {
    return [...rows].sort((a, b) => {
      const getCurrencyRank = c => {
        const cur = (c || '').toString().trim().toUpperCase();
        if (cur === 'USD' || cur === '$' || cur === 'DOLLARS') return 0;
        if (cur === 'INR' || cur === 'RS' || cur === '₹' || cur === 'RUPEES') return 1;
        return 2;
      };
      const rankA = getCurrencyRank(a.currency);
      const rankB = getCurrencyRank(b.currency);
      if (rankA !== rankB) return rankA - rankB;
      if (rankA === 2 && rankB === 2) {
        // Both are "other" currencies, sort alphabetically
        return (a.currency || '').localeCompare(b.currency || '');
      }
      // For USD/INR, keep original order
      return 0;
    });
  }

  return (
    <div style={{ padding: 20, paddingTop: 0 }}>
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
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', textAlign: 'left', width: '100%' }}
        titleStyle={{ fontSize: 28, fontWeight: 600, marginLeft: 12, textAlign: 'left', display: 'inline-block' }}
        iconStyle={{ height: 40, display: 'inline-block' }}
      />
      <div style={{ height: 12 }} />
      <div style={{ width: 'auto', minWidth: 0, margin: '0 auto', maxWidth: '100%', display: 'flex', justifyContent: 'center' }}>
        <div style={{ ...gridTheme.scrollContainer, maxHeight: 600, overflowY: 'auto' }}>
          <table style={{ ...gridTheme.table, width: 'auto', tableLayout: 'auto', margin: '0 auto' }}>
            <thead>
              <tr>
                <th style={gridTheme.th}></th>
                <th style={gridTheme.th}>Source</th>
                <th style={gridTheme.th}>Total Amount</th>
                <th style={gridTheme.th}>Destination</th>
                {/* Remove separate Currency column header */}
              </tr>
            </thead>
            <tbody>
              {/* Add row for new summary record */}
              <tr>
                <td style={gridTheme.td}></td>
                <td style={gridTheme.td}>
                  <RoundedDropdown
                    value={newRow.sourceShortName || ''}
                    onChange={e => setNewRow({ ...newRow, sourceShortName: e.target.value })}
                    options={[{ value: '', label: 'Select' }, ...userOptions]}
                  />
                </td>
                <td style={gridTheme.td}>
                  <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <RoundedInput type="number" value={newRow.netAmount || ''} onChange={e => setNewRow({ ...newRow, netAmount: e.target.value })} placeholder="Total Amount" />
                    <RoundedDropdown
                      value={newRow.currency || ''}
                      onChange={e => setNewRow({ ...newRow, currency: e.target.value })}
                      options={[{ value: '', label: 'Currency' }, ...currencyOptions]}
                    />
                  </div>
                </td>
                <td style={gridTheme.td}>
                  <RoundedDropdown
                    value={newRow.destinationShortName || ''}
                    onChange={e => setNewRow({ ...newRow, destinationShortName: e.target.value })}
                    options={[{ value: '', label: 'Select' }, ...userOptions]}
                  />
                </td>
                <td style={{ border: '1px solid #ccc', padding: 4, verticalAlign: 'middle', minWidth: 90 }}>
                  <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4, minWidth: 90 }}>
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
                      <button onClick={() => toggleRow(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>
                        {expandedRows.includes(idx) ? '▼' : '▶'}
                      </button>
                    </td>
                    {editRowId === idx ? (
                      <>
                        <td style={gridTheme.td}>
                          <RoundedDropdown
                            value={editRowData.sourceShortName || ''}
                            onChange={e => handleRowChange(e, 'sourceShortName')}
                            options={[{ value: '', label: 'Select' }, ...userOptions]}
                          />
                        </td>
                        <td style={gridTheme.td}>
                          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <RoundedInput type="number" value={editRowData.netAmount || ''} onChange={e => handleRowChange(e, 'netAmount')} style={{ border: '1.5px solid #1976d2' }} placeholder="Total Amount" />
                            <RoundedDropdown
                              value={editRowData.currency || ''}
                              onChange={e => handleRowChange(e, 'currency')}
                              options={[{ value: '', label: 'Currency' }, ...currencyOptions]}
                            />
                          </div>
                        </td>
                        <td style={gridTheme.td}>
                          <RoundedDropdown
                            value={editRowData.destinationShortName || ''}
                            onChange={e => handleRowChange(e, 'destinationShortName')}
                            options={[{ value: '', label: 'Select' }, ...userOptions]}
                          />
                        </td>
                        <td style={{ minWidth: 90 }}>
                          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4, minWidth: 90 }}>
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
                        <td style={gridTheme.td}>{(s.sourceShortName || s.sourceUserId) + ' will get'}</td>
                        <td style={gridTheme.td}>
                          {formatAmount(s.netAmount, s.currency)}{s.currency ? ` ${s.currency}` : ''}
                        </td>
                        <td style={gridTheme.td}>{'From ' + (s.destinationShortName || s.destinationUserId)}</td>
                        {/* Remove ActionButtons for summary row view mode */}
                      </>
                    )}
                  </tr>
                  {expandedRows.includes(idx) && (
                    <tr>
                      <td style={{ ...gridTheme.td, background: '#f5faff' }} colSpan={5}>
                        <table style={{ width: '100%', background: 'none', border: 'none' }}>
                          <thead>
                            <tr>
                              <th style={{ ...gridTheme.th, fontSize: 13 }}>Purpose</th>
                              <th style={{ ...gridTheme.th, fontSize: 13 }}>Amount</th>
                              <th style={{ ...gridTheme.th, fontSize: 13 }}>Schedule Date</th>
                              <th style={{ ...gridTheme.th, fontSize: 13 }}>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {s.details.map((d, i) => (
                              <tr key={i}>
                                {editDetail.idx === idx && editDetail.detailIdx === i ? (
                                  <>
                                    <td style={{ ...gridTheme.td, fontSize: 13 }}>
                                      <RoundedInput value={editDetail.data.purpose || ''} onChange={e => handleDetailChange(e, 'purpose')} placeholder="Purpose" style={{ border: '1.5px solid #1976d2', fontSize: 13 }} />
                                    </td>
                                    <td style={{ ...gridTheme.td, fontSize: 13 }}>
                                      <RoundedInput type="number" value={editDetail.data.amount || ''} onChange={e => handleDetailChange(e, 'amount')} placeholder="Amount" style={{ border: '1.5px solid #1976d2', fontSize: 13 }} />
                                    </td>
                                    <td style={{ ...gridTheme.td, fontSize: 13 }}>
                                      <RoundedInput type="date" value={editDetail.data.scheduleDate ? new Date(editDetail.data.scheduleDate).toISOString().slice(0, 10) : ''} onChange={e => handleDetailChange(e, 'scheduleDate')} placeholder="Schedule Date" style={{ border: '1.5px solid #1976d2', fontSize: 13 }} />
                                    </td>
                                    <td style={{ ...gridTheme.td, fontSize: 13 }}>
                                      <RoundedInput value={editDetail.data.status || ''} onChange={e => handleDetailChange(e, 'status')} placeholder="Status" style={{ border: '1.5px solid #1976d2', fontSize: 13 }} />
                                    </td>
                                    <td style={{ ...gridTheme.td, fontSize: 13, minWidth: 70 }}>
                                      <div style={{ display: 'flex', flexDirection: 'row', gap: 4 }}>
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
                                    <td style={{ ...gridTheme.td, fontSize: 13 }}>{d.purpose}</td>
                                    <td style={{ ...gridTheme.td, fontSize: 13 }}>{formatAmount(d.amount, s.currency)}</td>
                                    <td style={{ ...gridTheme.td, fontSize: 13 }}>{d.scheduleDate ? new Date(d.scheduleDate).toLocaleDateString() : ''}</td>
                                    <td style={{ ...gridTheme.td, fontSize: 13 }}>{d.status}</td>
                                    <td style={{ ...gridTheme.td, fontSize: 13, minWidth: 70 }}>
                                      <div style={{ display: 'flex', flexDirection: 'row', gap: 4 }}>
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
