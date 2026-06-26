import React from 'react';

export default function AdminFooter() {
  return (
    <footer 
      className="w-100 py-3 mt-auto text-center" 
      style={{ 
        borderTop: '1px solid rgba(0, 0, 0, 0.08)', 
        backgroundColor: '#ffffff',
        color: '#718096',
        fontSize: '0.75rem',
        fontFamily: "'Hanken Grotesk', 'Inter', sans-serif"
      }}
    >
      <div className="container-fluid px-4">
        <span>© {new Date().getFullYear()} EquineElite Pro Admin Control Panel. All Rights Reserved.</span>
      </div>
    </footer>
  );
}
