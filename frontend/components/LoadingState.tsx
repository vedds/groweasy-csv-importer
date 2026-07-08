'use client';

import { useEffect, useState } from 'react';

const STEPS = [
  { label: 'Analysing your CSV structure...',   delay: 0 },
  { label: 'Mapping columns with Gemini AI...',  delay: 1200 },
  { label: 'Extracting lead data...',            delay: 2800 },
  { label: 'Validating CRM fields...',           delay: 5000 },
  { label: 'Finalising your import...',          delay: 8000 },
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

      <h2 className="loading-title">VedSync AI is working its magic…</h2>
      <p className="loading-sub">
        Gemini is mapping your CSV columns to CRM fields intelligently.
        <br />
        Sit tight — this takes just a moment.
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
