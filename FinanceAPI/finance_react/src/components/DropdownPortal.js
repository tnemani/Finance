import React from 'react';
import ReactDOM from 'react-dom';

export function DropdownPortal({ children, anchorRef, width }) {
  const [style, setStyle] = React.useState({});

  React.useLayoutEffect(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setStyle({
        position: 'absolute',
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY + rect.height,
        width: width ?? rect.width,
        zIndex: 9999,
        boxSizing: 'border-box'
      });
    }
  }, [anchorRef, children, width]);

  return ReactDOM.createPortal(
    <div style={style}>{children}</div>,
    document.body
  );
}

