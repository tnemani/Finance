import React from 'react';
import ReactDOM from 'react-dom';

export function DropdownPortal({ children, anchorRef }) {
  const [style, setStyle] = React.useState({});
  React.useLayoutEffect(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setStyle({
        position: 'absolute',
        left: rect.left + window.scrollX,
        top: rect.bottom + window.scrollY,
        minWidth: rect.width,
        zIndex: 9999
      });
    }
  }, [anchorRef, children]);
  return ReactDOM.createPortal(
    <div style={style}>{children}</div>,
    document.body
  );
}
