import "./Table.css";

export default function Table({ columns, rows, renderActions }) {
  return (
    <div className="table-wrap">
      <table className="table-ui">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
            {renderActions ? <th>Actions</th> : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row._id || row.id}>
              {columns.map((column) => (
                <td key={`${row._id || row.id}-${column.key}`}>
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
              {renderActions ? <td>{renderActions(row)}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}