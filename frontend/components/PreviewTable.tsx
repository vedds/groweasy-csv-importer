'use client';

import { PreviewResponse } from '@/types';

interface PreviewTableProps {
  data: PreviewResponse;
  onConfirm: () => void;
  onBack: () => void;
  isLoading: boolean;
}

export default function PreviewTable({
  data,
  onConfirm,
  onBack,
  isLoading,
}: PreviewTableProps) {
  const { headers, preview, totalRows, fileName } = data;

  return (
    <div className="animate-in">
      {/* Header */}
      <div className="table-header">
        <div>
          <div className="table-title">📋 CSV Preview</div>
          <div className="table-meta">
            <strong style={{ color: 'var(--text-primary)' }}>{fileName}</strong>
            {' · '}
            {totalRows.toLocaleString()} rows · {headers.length} columns
            {totalRows > preview.length && (
              <span style={{ color: 'var(--accent-primary)', marginLeft: 8 }}>
                (showing first {preview.length})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper" style={{ marginBottom: 0 }}>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                {headers.map((h) => (
                  <th key={h} title={h}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.map((row, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  {headers.map((h) => (
                    <td key={h} title={row[h] || ''}>
                      {row[h] || (
                        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action bar */}
      <div className="action-bar">
        <button className="btn btn-secondary" onClick={onBack} disabled={isLoading}>
          ← Upload Different File
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <p style={{ fontSize: 14, margin: 0 }}>
            Looks good? Confirm to start AI extraction.
          </p>
          <button
            className="btn btn-primary btn-lg"
            onClick={onConfirm}
            disabled={isLoading}
            id="confirm-import-btn"
          >
            {isLoading ? '⏳ Processing…' : '🤖 Confirm Import'}
          </button>
        </div>
      </div>
    </div>
  );
}
