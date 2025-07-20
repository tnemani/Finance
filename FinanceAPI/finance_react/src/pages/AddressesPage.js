import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ActionButton } from '../components/ActionButton';
import paymentIcon from '../components/icons/location_banner.png';
import GridBanner from '../components/GridBanner';
import { gridTheme } from '../components/gridTheme';
import RoundedInput from '../components/RoundedInput';
import RoundedDropdown from '../components/RoundedDropdown';
import ConfirmModal from '../components/ConfirmModal';
import { inputTheme } from '../components/inputTheme';
import { getAddressTypeOptions } from '../constants/Fixedlist';
import {
  SPACING,
  FLEX_ROW_CENTER,
  PAGE_CONTAINER_STYLE,
  TABLE_CONTAINER_STYLE,
  SCROLL_CONTAINER_STYLE,
  ACTION_BUTTON_CONTAINER_STYLE,
  createGenericHandlers,
  createSearchFilter,
  createColumnFonts,
  createAllRows
} from '../constants/common';
import '../constants/common.css';

const API_URL = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:5226/api') + '/addresses';

// Column definitions for consistent use
const ADDRESS_COLUMNS = {
  keys: ['addressType', 'houseNo', 'line1', 'line2', 'city', 'state', 'country', 'zip', 'description'],
  headers: ['Address Type', 'House No', 'Line 1', 'Line 2', 'City', 'State', 'Country', 'Zip', 'Description'],
  types: ['text', 'text', 'text', 'text', 'text', 'text', 'text', 'text', 'text'],
  placeholders: ['e.g. Home, Office', 'House/Flat No', 'Street/Area', 'Landmark/Locality', 'City', 'State', 'Country', 'Postal Code', 'Description (optional)']
};

function AddressesPage() {
  const [addresses, setAddresses] = useState([]);
  const [editRowId, setEditRowId] = useState(null);
  const [editRowData, setEditRowData] = useState({});
  const [newRow, setNewRow] = useState({});
  const [confirm, setConfirm] = useState({ open: false, message: '', onConfirm: null });
  const [searchText, setSearchText] = useState('');
  const [filteredAddresses, setFilteredAddresses] = useState([]);

  // Column definitions for consistent styling
  const allRows = createAllRows(newRow, filteredAddresses, editRowData);
  const colFonts = createColumnFonts(ADDRESS_COLUMNS.keys.length);

  const fetchAddresses = async () => {
    const res = await axios.get(API_URL);
    setAddresses(res.data);
  };

  // Common handlers
  const {
    handleAdd: baseHandleAdd,
    handleDelete,
    handleRowEdit,
    handleRowSave: baseHandleRowSave,
    handleRowCancel,
    handleRowChange
  } = createGenericHandlers(
    API_URL,
    setAddresses,
    setEditRowId,
    setEditRowData,
    setNewRow,
    setConfirm,
    fetchAddresses
  );

  // Custom handlers that use the base ones
  const handleAdd = () => baseHandleAdd(newRow);
  const handleRowSave = (id) => baseHandleRowSave(id, editRowData);

  useEffect(() => {
    fetchAddresses();
  }, []);

  useEffect(() => {
    setFilteredAddresses(createSearchFilter(addresses, searchText));
  }, [searchText, addresses]);

  // Get address type options from constants
  const addressTypeOptions = getAddressTypeOptions();

  return (
    <div style={PAGE_CONTAINER_STYLE}>
      <ConfirmModal
        open={confirm.open}
        message={confirm.message}
        onConfirm={confirm.onConfirm}
        onCancel={confirm.onCancel}
      />
      <GridBanner
        icon={paymentIcon}
        title="Addresses"
        searchText={searchText}
        setSearchText={setSearchText}
        placeholder="Search addresses..."
      />
      <div style={{ height: SPACING.large }} />
      <div style={TABLE_CONTAINER_STYLE}>
        <div style={{
          ...gridTheme.scrollContainer,
          ...SCROLL_CONTAINER_STYLE
        }}>
          <table style={{ ...gridTheme.table, tableLayout: 'auto', minWidth: 900 }} className="table-standard">
            <thead>
              <tr>
                {ADDRESS_COLUMNS.headers.map((header, idx) => (
                  <th key={header} style={gridTheme.th}>{header}</th>
                ))}
                <th style={gridTheme.th}></th>
              </tr>
            </thead>
            <tbody>
              {/* Add row for new address */}
              <tr style={gridTheme.tr}>
                {ADDRESS_COLUMNS.keys.map((col, idx) => (
                  <td key={col} style={gridTheme.td}>
                    {col === 'addressType' ? (
                      <RoundedDropdown
                        options={addressTypeOptions}
                        value={newRow[col] || ''}
                        onChange={e => setNewRow({ ...newRow, [col]: e.target.value })}
                        placeholder="Address Type"
                        style={{ ...inputTheme }}
                        disabled={editRowId !== null}
                      />
                    ) : (
                      <RoundedInput
                        value={newRow[col] || ''}
                        onChange={e => setNewRow({ ...newRow, [col]: e.target.value })}
                        placeholder={ADDRESS_COLUMNS.placeholders[idx]}
                        type={ADDRESS_COLUMNS.types[idx]}
                        colFonts={colFonts}
                        colHeaders={ADDRESS_COLUMNS.headers}
                        allRows={allRows}
                        colKey={col}
                        i={idx}
                        style={{ ...inputTheme }}
                        disabled={editRowId !== null}
                      />
                    )}
                  </td>
                ))}
                <td style={gridTheme.td}>
                  <div style={{ ...FLEX_ROW_CENTER, ...ACTION_BUTTON_CONTAINER_STYLE }}>
                    <ActionButton
                      onClick={handleAdd}
                      disabled={editRowId !== null}
                      type="save"
                    />
                    <ActionButton
                      onClick={() => setNewRow({})}
                      disabled={editRowId !== null}
                      type="reset"
                    />
                  </div>
                </td>
              </tr>
              {filteredAddresses.map(address => (
                <tr key={address.id} style={gridTheme.tr}>
                  {ADDRESS_COLUMNS.keys.map((col, idx) => (
                    <td key={col} style={gridTheme.td}>
                      {editRowId === address.id ? (
                        col === 'addressType' ? (
                          <RoundedDropdown
                            options={addressTypeOptions}
                            value={editRowData[col] || ''}
                            onChange={e => setEditRowData({ ...editRowData, [col]: e.target.value })}
                            placeholder="Address Type"
                            style={{ ...inputTheme }}
                            disabled={false}
                          />
                        ) : (
                          <RoundedInput
                            value={editRowData[col] ?? ''}
                            onChange={e => handleRowChange(e, col, setEditRowData, editRowData)}
                            placeholder={ADDRESS_COLUMNS.placeholders[idx]}
                            type={ADDRESS_COLUMNS.types[idx]}
                            colFonts={colFonts}
                            colHeaders={ADDRESS_COLUMNS.headers}
                            allRows={allRows}
                            colKey={col}
                            i={idx}
                            style={{ ...inputTheme }}
                            disabled={false}
                          />
                        )
                      ) : (
                        String(address[col] ?? '')
                      )}
                    </td>
                  ))}
                  <td style={gridTheme.td}>
                    {editRowId === address.id ? (
                      <div style={{ ...FLEX_ROW_CENTER, ...ACTION_BUTTON_CONTAINER_STYLE }}>
                        <ActionButton
                          onClick={() => handleRowSave(address.id)}
                          type="save"
                        />
                        <ActionButton
                          onClick={handleRowCancel}
                          type="cancel"
                        />
                      </div>
                    ) : (
                      <div style={{ ...FLEX_ROW_CENTER, ...ACTION_BUTTON_CONTAINER_STYLE }}>
                        <ActionButton
                          onClick={() => handleRowEdit(address)}
                          type="edit"
                        />
                        <ActionButton
                          onClick={() => handleDelete(address.id)}
                          type="delete"
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
    </div>
  );
}

export default AddressesPage;
