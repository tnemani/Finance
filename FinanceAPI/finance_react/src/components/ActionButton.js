import React from 'react';
import editIcon from './icons/edit.png';
import deleteIcon from './icons/delete.png';
import saveIcon from './icons/save.png';
import undoIcon from './icons/undo.png';
import cancelIcon from './icons/cancel.png';

export function ActionButton({ onClick, title, type, disabled, large }) {
  // type: 'edit' | 'delete' | 'save' | 'cancel'
  let isLarge = large || type === 'save' || type === 'cancel';
  let style = {
    borderRadius: 4,
    width: isLarge ? 40 : 32,
    height: isLarge ? 40 : 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 0,
    padding: 0,
    cursor: disabled ? 'not-allowed' : 'pointer',
    boxShadow: '0 1px 2px rgba(25,118,210,0.08)',
    border: '1.5px solid transparent',
    background: '#fff',
    color: '#1976d2',
    outline: 'none',
  };
  let iconSize = isLarge ? 24 : 24;
  let icon = null;
  if (type === 'edit') {
    icon = <img src={editIcon} alt="Edit" style={{ width: iconSize, height: iconSize }} />;
  } else if (type === 'delete') {
    icon = <img src={deleteIcon} alt="Delete" style={{ width: iconSize, height: iconSize }} />;
  } else if (type === 'save') {
    icon = <img src={saveIcon} alt="Save" style={{ width: iconSize, height: iconSize }} />;
  } else if (type === 'cancel') {
    icon = <img src={cancelIcon} alt="Cancel" style={{ width: iconSize, height: iconSize }} />;
  } else if (type === 'reset' || type === 'undo') {
    icon = <img src={undoIcon} alt="Undo" style={{ width: iconSize, height: iconSize }} />;
  } 
  return (
    <button onClick={onClick} title={title} style={style} disabled={disabled}>
      {icon}
    </button>
  );
}
