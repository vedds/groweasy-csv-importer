'use client';

import { AppStep } from '@/types';

interface StepIndicatorProps {
  currentStep: AppStep;
}

const STEPS: { id: AppStep; label: string; icon: string }[] = [
  { id: 'upload',     label: 'Upload',   icon: '1' },
  { id: 'preview',   label: 'Preview',  icon: '2' },
  { id: 'processing',label: 'AI Extract',icon: '3' },
  { id: 'results',   label: 'Results',  icon: '4' },
];

const ORDER: AppStep[] = ['upload', 'preview', 'processing', 'results'];

function getStatus(stepId: AppStep, currentStep: AppStep): 'completed' | 'active' | 'pending' {
  const stepIdx    = ORDER.indexOf(stepId);
  const currentIdx = ORDER.indexOf(currentStep);
  if (stepIdx < currentIdx)  return 'completed';
  if (stepIdx === currentIdx) return 'active';
  return 'pending';
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="steps-wrapper">
      <div className="steps">
        {STEPS.map((step, i) => {
          const status = getStatus(step.id, currentStep);
          return (
            <div key={step.id} className="step-item">
              <div className={`step-circle ${status}`}>
                {status === 'completed' ? '✓' : step.icon}
              </div>
              <span className={`step-label ${status}`}>{step.label}</span>
              {i < STEPS.length - 1 && (
                <div
                  className={`step-connector ${
                    getStatus(STEPS[i + 1].id, currentStep) !== 'pending' ? 'completed' : ''
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
