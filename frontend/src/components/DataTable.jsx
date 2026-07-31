// TICKET-ADV114 — Compound <DataTable> with Header / Body / Pagination subcomponents.
import React, { createContext, useContext } from 'react';

const DataTableContext = createContext({ sort: null, page: 0, size: 20, onSortChange:undefined });

export default function DataTable({ children, sort, page = 0, size = 20, onSortChange }) {
  // TODO(TICKET-ADV114): wrap `children` in DataTableContext.Provider so the
 
  return (
    <DataTableContext.Provider value={{ sort, page, size, onSortChange }}>
      <div className="data-table">{children}</div>
    </DataTableContext.Provider>
  );
}

DataTable.Header = function Header({ columns }) {
  // TODO(TICKET-ADV114): pull `sort` + `onSortChange` from DataTableContext and
  //                     render a clickable <button> per column. Active column
  //                     should get a different className.
  const { sort, onSortChange } = useContext(DataTableContext);
  return (
    <div className="data-table__header" role="row">
      {/* TODO(TICKET-ADV114): map columns -> <button>{c.label}</button> */}
      {columns.map((c) => (
        <button
          key={c.key}
          type="button"
          className={`data-table__th data-table__th--${sort === c.key ? 'active' : 'idle'}`}
          onClick={() => onSortChange && onSortChange(c.key)}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
};

DataTable.Body = function Body({ rows, render }) {
  // TODO(TICKET-ADV114): iterate `rows` and call `render(row)` for each,
  //                     wrapping in a div.data-table__row with a stable key.
  return (
    <div className="data-table__body">
      {/* TODO(TICKET-ADV114): rows.map(...) */}
      {rows.map((row, i) => (
        <div key={row.id ?? i} className="data-table__row" role="row">
          {render(row)}
        </div>
      ))}
    </div>
  );
};

DataTable.Pagination = function Pagination({ page, totalPages, onChange }) {
  // TODO(TICKET-ADV114): render prev / next buttons that call onChange(page±1).
  //                     Disable prev at page === 0, next at page === totalPages-1.
  return (
    <nav className="data-table__pagination" aria-label="Pagination">
      {/* TODO(TICKET-ADV114): ‹ {page+1} / {totalPages} › */}
      <button
        type="button"
        disabled={page === 0}
        onClick={() => onChange(page - 1)}
      >
        ‹
      </button>
      <span>{page + 1} / {totalPages}</span>
      <button
        type="button"
        disabled={page >= totalPages - 1}
        onClick={() => onChange(page + 1)}
      >
        ›
      </button>
    </nav>
  );
};
