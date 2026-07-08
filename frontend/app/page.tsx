'use client';

import { useState, useCallback } from 'react';
import StepIndicator from '@/components/StepIndicator';
import UploadZone    from '@/components/UploadZone';
import PreviewTable  from '@/components/PreviewTable';
import LoadingState  from '@/components/LoadingState';
import ResultTable   from '@/components/ResultTable';
import { AppStep, PreviewResponse, ProcessResponse } from '@/types';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export default function Home() {
  const [step,        setStep]        = useState<AppStep>('upload');
  const [file,        setFile]        = useState<File | null>(null);
  const [preview,     setPreview]     = useState<PreviewResponse | null>(null);
  const [result,      setResult]      = useState<ProcessResponse | null>(null);
  const [isLoading,   setIsLoading]   = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  /* ── Step 1: user picks a file → call /preview ── */
  const handleFileSelect = useCallback(async (f: File) => {
    setFile(f);
    setError(null);
    setIsLoading(true);

    try {
      const form = new FormData();
      form.append('file', f);

      const res  = await fetch(`${API}/api/import/preview`, { method: 'POST', body: form });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error ?? 'Preview failed');

      setPreview(json);
      setStep('preview');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong during preview.');
      setFile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /* ── Step 2: user clicks Confirm → call /process ── */
  const handleConfirm = useCallback(async () => {
    if (!file) return;
    setError(null);
    setIsLoading(true);
    setStep('processing');

    try {
      const form = new FormData();
      form.append('file', file);

      const res  = await fetch(`${API}/api/import/process`, { method: 'POST', body: form });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error ?? 'Processing failed');

      setResult(json);
      setStep('results');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'AI extraction failed. Please try again.');
      setStep('preview'); // Go back so they can retry
    } finally {
      setIsLoading(false);
    }
  }, [file]);

  /* ── Reset everything ── */
  const handleReset = useCallback(() => {
    setStep('upload');
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return (
    <div className="page-wrapper">
      {/* ── Header ── */}
      <header className="site-header">
        <div className="logo">
          <div className="logo-icon">VS</div>
          <span className="logo-text">VedSync AI</span>
        </div>
        <div className="header-badge">by Vedant</div>
      </header>

      {/* ── Hero ── */}
      <section className="hero">
        <h1>Import Any CSV. Extract Every Lead.</h1>
        <p>
          Powered by Google Gemini AI — maps any column format to your CRM fields automatically.
          Built by Vedant for GrowEasy.
        </p>
      </section>

      {/* ── Step Indicator ── */}
      <StepIndicator currentStep={step} />

      {/* ── Error Banner ── */}
      {error && (
        <div className="error-banner">
          <span>⚠️</span>
          <div>
            <strong>Error: </strong>{error}
          </div>
        </div>
      )}

      {/* ── Step Content ── */}
      <main id="main-content">
        {step === 'upload' && (
          <UploadZone
            onFileSelect={handleFileSelect}
            isLoading={isLoading}
            selectedFile={file}
            onClear={handleReset}
          />
        )}

        {step === 'preview' && preview && (
          <div className="card">
            <PreviewTable
              data={preview}
              onConfirm={handleConfirm}
              onBack={handleReset}
              isLoading={isLoading}
            />
          </div>
        )}

        {step === 'processing' && (
          <div className="card">
            <LoadingState />
          </div>
        )}

        {step === 'results' && result && (
          <div className="card">
            <ResultTable data={result} onReset={handleReset} />
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer style={{
        textAlign: 'center',
        marginTop: 64,
        paddingTop: 24,
        borderTop: '1px solid var(--border-subtle)',
        color: 'var(--text-muted)',
        fontSize: 13,
        position: 'relative',
        zIndex: 2,
      }}>
        Designed &amp; Built by{' '}
        <a href="https://github.com/vedds" target="_blank" rel="noopener noreferrer">
          Vedant
        </a>
        {' '}· Powered by Gemini AI
      </footer>
    </div>
  );
}
