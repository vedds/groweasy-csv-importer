'use client';

import React, { useCallback, useRef, useState } from 'react';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
  selectedFile: File | null;
  onClear: () => void;
}

export default function UploadZone({
  onFileSelect,
  isLoading,
  selectedFile,
  onClear,
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.name.toLowerCase().endsWith('.csv')) {
        alert('Please upload a CSV file (.csv extension).');
        return;
      }
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  if (selectedFile) {
    return (
      <div className="upload-selected animate-in">
        <div className="upload-selected-info">
          <div className="file-icon">📄</div>
          <div>
            <div className="file-name">{selectedFile.name}</div>
            <div className="file-meta">{formatSize(selectedFile.size)} · CSV File</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn btn-danger"
            onClick={onClear}
            disabled={isLoading}
          >
            ✕ Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`upload-zone animate-in ${isDragging ? 'drag-over' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      aria-label="Upload CSV file"
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleInputChange}
        style={{ display: 'none' }}
        id="csv-file-input"
      />

      <div className="upload-icon">
        {isDragging ? '📥' : '☁️'}
      </div>

      <h2>{isDragging ? 'Drop it here!' : 'Upload your CSV file'}</h2>
      <p>
        Drag &amp; drop your CSV file here, or click to browse
      </p>

      <button
        className="btn btn-primary"
        onClick={(e) => {
          e.stopPropagation();
          inputRef.current?.click();
        }}
        style={{ position: 'relative', zIndex: 1 }}
      >
        📂 Choose File
      </button>

      <div className="upload-file-types">
        {['Facebook Ads', 'Google Ads', 'Excel Export', 'Real Estate CRM', 'Sales Report', 'Any CSV'].map(
          (t) => (
            <span key={t} className="file-type-badge">
              {t}
            </span>
          )
        )}
      </div>
    </div>
  );
}
