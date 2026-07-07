'use client';

import { useEffect, useState } from 'react';

const STEPS = [
  { label: 'Parsing CSV rows',                   delay: 0 },
  { label: 'Sending records to Gemini AI',        delay: 1200 },
  { label: 'Intelligently mapping CRM fields',    delay: 2800 },
  { label: 'Validating extracted records',        delay: 5000 },
  { label: 'Finalising import results',           delay: 8000 },
];

export default function LoadingState() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timers = STEPS.map((step, i) =>
      setTimeout(() => setActiveStep(i), step.delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="loading-wrapper animate-in">
      <div className="loading-spinner" aria-label="Processing" />

      <h2 className="loading-title">AI is extracting your leads…</h2>
      <p className="loading-sub">
        Gemini is analysing your CSV and mapping fields to GrowEasy CRM format.
        <br />
        This may take a moment for large files.
      </p>

      <div className="loading-steps" role="status" aria-live="polite">
        {STEPS.map((step, i) => {
          const isDone   = i < activeStep;
          const isActive = i === activeStep;
          return (
            <div
              key={i}
              className={`loading-step ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}
            >
              <div className="step-dot" />
              <span>
                {isDone ? '✓ ' : ''}
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
