import React from 'react';

const ConfirmModal = ({ open, message, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.25)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'auto'
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: 32, minWidth: 320, boxShadow: '0 4px 24px rgba(25, 118, 210, 0.18)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24
      }}>
        <div style={{ fontSize: 20, fontWeight: 600, color: '#1976d2', marginBottom: 12, textAlign: 'center' }}>{message}</div>
        <div style={{ display: 'flex', gap: 24, marginTop: 8 }}>
          <button onClick={onConfirm} style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 24px', fontSize: 16, fontWeight: 700, cursor: 'pointer', boxShadow: '0 1px 4px rgba(25, 118, 210, 0.08)' }}>Yes</button>
          <button onClick={onCancel} style={{ background: '#fff', color: '#1976d2', border: '1px solid #1976d2', borderRadius: 8, padding: '8px 24px', fontSize: 16, fontWeight: 700, cursor: 'pointer', boxShadow: '0 1px 4px rgba(25, 118, 210, 0.08)' }}>No</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
