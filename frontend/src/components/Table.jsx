import './Table.css';

/**
 * Reusable table component.
 * columns: [{ key: 'username', label: 'Username', render?: (row) => JSX }]
 * data: array of row objects
 */
export default function Table({ columns, data, loading, emptyMessage }) {
  if (loading) {
    return (
      <div className="table-state">
        <div className="spinner" />
        <p>Loading data...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="table-state">
        <p className="empty-msg">{emptyMessage || 'No records found.'}</p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={row.id || idx}>
              {columns.map((col) => (
                <td key={col.key}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
