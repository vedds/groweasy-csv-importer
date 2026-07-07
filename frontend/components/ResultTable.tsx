'use client';

import { CRMRecord, ProcessResponse } from '@/types';

interface ResultTableProps {
  data: ProcessResponse;
  onReset: () => void;
}

const STATUS_LABEL: Record<string, string> = {
  GOOD_LEAD_FOLLOW_UP: 'Follow Up',
  DID_NOT_CONNECT:     'No Connect',
  BAD_LEAD:            'Bad Lead',
  SALE_DONE:           'Sale Done',
};

const CRM_HEADERS: { key: keyof CRMRecord; label: string }[] = [
  { key: 'name',                        label: 'Name' },
  { key: 'email',                       label: 'Email' },
  { key: 'country_code',                label: 'Code' },
  { key: 'mobile_without_country_code', label: 'Mobile' },
  { key: 'company',                     label: 'Company' },
  { key: 'city',                        label: 'City' },
  { key: 'state',                       label: 'State' },
  { key: 'country',                     label: 'Country' },
  { key: 'crm_status',                  label: 'Status' },
  { key: 'data_source',                 label: 'Source' },
  { key: 'lead_owner',                  label: 'Owner' },
  { key: 'crm_note',                    label: 'Note' },
  { key: 'created_at',                  label: 'Created At' },
  { key: 'possession_time',             label: 'Possession' },
  { key: 'description',                 label: 'Description' },
];

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`status-badge ${status}`}>
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

function CellValue({ col, value }: { col: keyof CRMRecord; value: string }) {
  if (!value) return <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>—</span>;
  if (col === 'crm_status') return <StatusBadge status={value} />;
  return <span title={value}>{value}</span>;
}

export default function ResultTable({ data, onReset }: ResultTableProps) {
  const { records, skipped, errors, totalProcessed, totalImported, totalSkipped, fileName } = data;

  return (
    <div className="animate-in">
      {/* ── Stats ── */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-value">{totalProcessed.toLocaleString()}</div>
          <div className="stat-label">Total Processed</div>
        </div>
        <div className="stat-card success">
          <div className="stat-value">{totalImported.toLocaleString()}</div>
          <div className="stat-label">Successfully Imported</div>
        </div>
        <div className="stat-card skipped">
          <div className="stat-value">{totalSkipped.toLocaleString()}</div>
          <div className="stat-label">Skipped Records</div>
        </div>
        {errors.length > 0 && (
          <div className="stat-card error">
            <div className="stat-value">{errors.length}</div>
            <div className="stat-label">Batch Errors</div>
          </div>
        )}
      </div>

      {/* ── Batch errors (if any) ── */}
      {errors.length > 0 && (
        <div className="error-banner" style={{ marginBottom: 24 }}>
          <span>⚠️</span>
          <div>
            <strong>{errors.length} batch(es) failed.</strong>
            {' '}Some records may not have been extracted. This is usually due to a temporary AI error.
            {errors.map((e, i) => (
              <div key={i} style={{ marginTop: 4, fontSize: 12, opacity: 0.8 }}>
                Batch {e.batch}: {e.error} ({e.affectedRecords} records affected)
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Imported records table ── */}
      <div className="section">
        <div className="section-title">
          <span>✅</span> Imported Records
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)' }}>
            ({records.length})
          </span>
        </div>

        {records.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <p>No records were successfully extracted. Check your CSV file and try again.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    {CRM_HEADERS.map((h) => (
                      <th key={h.key}>{h.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.map((row, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      {CRM_HEADERS.map((h) => (
                        <td key={h.key}>
                          <CellValue col={h.key} value={row[h.key]} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── Skipped records ── */}
      {skipped.length > 0 && (
        <div className="section">
          <div className="section-title">
            <span>⏭️</span> Skipped Records
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)' }}>
              ({skipped.length})
            </span>
          </div>
          <div className="table-wrapper">
            <div className="table-scroll" style={{ maxHeight: 260 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {skipped.map((s, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td style={{ color: 'var(--status-miss)' }}>{s.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Action bar ── */}
      <div className="action-bar">
        <p style={{ fontSize: 14, margin: 0 }}>
          ✨ Extracted from <strong style={{ color: 'var(--text-primary)' }}>{fileName}</strong>
        </p>
        <button className="btn btn-primary" onClick={onReset} id="import-another-btn">
          ↩ Import Another File
        </button>
      </div>
    </div>
  );
}
