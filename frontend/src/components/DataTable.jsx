import React from 'react';

/**
 * Reusable DataTable component
 * @param {Array} columns - Array of column objects { key, label, render(item), align }
 * @param {Array} data - Array of data objects
 * @param {string} emptyMessage - Message to show when data is empty
 */
export default function DataTable({ columns, data, emptyMessage = 'No data available' }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-4 text-secondary fst-italic border rounded bg-light">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle mb-0" style={{ borderCollapse: 'collapse', border: 'none' }}>
        <thead style={{ borderBottom: '2px solid rgba(0,0,0,0.06)' }}>
          <tr>
            {columns.map((col, index) => (
              <th 
                key={index} 
                scope="col" 
                className={`py-3 fw-bold text-secondary text-uppercase ${col.align === 'right' ? 'text-end' : col.align === 'center' ? 'text-center' : 'text-start'}`}
                style={{ fontSize: '11px', letterSpacing: '0.05em' }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((col, colIndex) => (
                <td 
                  key={colIndex} 
                  className={`py-3 ${col.align === 'right' ? 'text-end' : col.align === 'center' ? 'text-center' : 'text-start'}`}
                  style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}
                >
                  {col.render ? col.render(item) : item[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
