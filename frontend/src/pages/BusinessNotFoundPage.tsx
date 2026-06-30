import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export const BusinessNotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 flex flex-col items-center justify-center font-sans p-6 text-center space-y-6">
      <div className="h-16 w-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-2">
        <AlertCircle className="h-8 w-8 text-zinc-450" />
      </div>
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">Business Profile Not Found</h1>
        <p className="text-zinc-500 text-sm max-w-sm mx-auto leading-relaxed">
          The booking link you followed resolves to an inactive, suspended, or nonexistent partner profile.
        </p>
      </div>
      <Link
        to="/"
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded font-bold text-xs text-white transition-all group"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        Return to Home
      </Link>
    </div>
  );
};

export default BusinessNotFoundPage;
