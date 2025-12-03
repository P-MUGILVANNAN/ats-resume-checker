import React from 'react';
import { AnalysisResult } from '../types';
import ScoreGauge from './ScoreGauge';

interface ResultsPanelProps {
  result: AnalysisResult | null;
  onReset: () => void;
  onDownload: () => void;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({ result, onReset, onDownload }) => {
  if (!result) return null;

  return (
    <div className="animate-fade-in space-y-8">
      {/* Top Card: Score and Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 md:p-8 flex flex-col md:flex-row items-center gap-8">
        <div className="flex-shrink-0">
          <ScoreGauge score={result.score} />
        </div>
        
        <div className="flex-grow space-y-4 w-full">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white border-b pb-2 dark:border-gray-700">Score Breakdown</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl text-center">
              <span className="block text-2xl font-bold text-brand-600 dark:text-brand-500">{result.scoreBreakdown.keywordScore}/50</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">Keywords</span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl text-center">
              <span className="block text-2xl font-bold text-brand-600 dark:text-brand-500">{result.scoreBreakdown.sectionScore}/30</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">Sections</span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl text-center">
              <span className="block text-2xl font-bold text-brand-600 dark:text-brand-500">{result.scoreBreakdown.lengthScore}/20</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">Length</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Keywords Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center">
            <i className="fas fa-key mr-2 text-brand-500"></i> Keyword Analysis
          </h3>
          
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-green-600 mb-2 uppercase tracking-wide">Matches Found ({result.matchedKeywords.length})</h4>
            <div className="flex flex-wrap gap-2">
              {result.matchedKeywords.length > 0 ? (
                result.matchedKeywords.map(k => (
                  <span key={k} className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm font-medium">
                    {k}
                  </span>
                ))
              ) : (
                <span className="text-gray-400 italic text-sm">No exact keyword matches found.</span>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-red-600 mb-2 uppercase tracking-wide">Missing Keywords ({result.missingKeywords.length})</h4>
            <div className="flex flex-wrap gap-2">
              {result.missingKeywords.length > 0 ? (
                result.missingKeywords.slice(0, 15).map(k => (
                  <span key={k} className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full text-sm font-medium">
                    {k}
                  </span>
                ))
              ) : (
                <span className="text-green-500 italic text-sm">Excellent! No missing keywords.</span>
              )}
              {result.missingKeywords.length > 15 && (
                <span className="px-3 py-1 text-gray-500 text-sm">+{result.missingKeywords.length - 15} more...</span>
              )}
            </div>
          </div>
        </div>

        {/* Sections & Suggestions Card */}
        <div className="space-y-6">
           {/* Section Checks */}
           <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center">
              <i className="fas fa-list-check mr-2 text-brand-500"></i> Structure Check
            </h3>
            <ul className="space-y-3">
              {result.sections.map((section) => (
                <li key={section.name} className="flex items-start">
                  <div className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full mr-3 ${section.found ? 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400'}`}>
                    <i className={`fas ${section.found ? 'fa-check' : 'fa-times'} text-xs`}></i>
                  </div>
                  <span className={`text-sm ${section.found ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
                    <strong className="block text-gray-900 dark:text-white">{section.name}</strong>
                    {section.message}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Suggestions */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center">
              <i className="fas fa-lightbulb mr-2 text-brand-500"></i> Suggestions
            </h3>
            {result.suggestions.length > 0 ? (
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
                {result.suggestions.map((suggestion, idx) => (
                  <li key={idx} className="leading-relaxed">{suggestion}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-green-600 dark:text-green-400">No major improvements detected. Good job!</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex justify-center gap-4 py-6">
        <button 
          onClick={onReset}
          className="px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium"
        >
          <i className="fas fa-rotate-left mr-2"></i> Start Over
        </button>
        <button 
          onClick={onDownload}
          className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-500/30 transition font-medium"
        >
          <i className="fas fa-download mr-2"></i> Download Report
        </button>
      </div>
    </div>
  );
};

export default ResultsPanel;