import React from 'react';

function LoadingSpinner({ label = 'Loading' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 text-slate-600">
      <div className="h-8 w-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
      <p className="text-xs uppercase tracking-wide">{label}...</p>
    </div>
  );
}

export default LoadingSpinner;
