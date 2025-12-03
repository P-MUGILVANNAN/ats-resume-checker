import React, { useState, useRef } from 'react';
import { useTheme } from './hooks/useTheme';
import { analyzeResume } from './utils/atsLogic';
import { AnalysisResult } from './types';
import ResultsPanel from './components/ResultsPanel';

function App() {
  const { theme, toggleTheme } = useTheme();
  
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    const validTypes = ['application/pdf', 'text/plain'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a PDF or Text file.');
      return;
    }
    // Max size 5MB
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB.');
      return;
    }
    setError(null);
    setResumeFile(file);
    setResult(null); // Reset results on new file
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remove data url prefix (e.g., "data:application/pdf;base64,")
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleAnalyze = async () => {
    if (!resumeFile || !jdText.trim()) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const base64Data = await fileToBase64(resumeFile);
      const analysis = await analyzeResume(base64Data, resumeFile.type, jdText);
      setResult(analysis);
      
      // Smooth scroll to results
      setTimeout(() => {
        document.getElementById('results-anchor')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze resume. Please check your network connection or API key and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setResumeFile(null);
    setJdText('');
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDownload = () => {
    if (!result) return;
    
    const report = {
      date: new Date().toISOString(),
      score: result.score,
      breakdown: result.scoreBreakdown,
      found_keywords: result.matchedKeywords,
      missing_keywords: result.missingKeywords,
      sections: result.sections,
      suggestions: result.suggestions
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `ats-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold">
              ATS
            </div>
            <h1 className="text-xl font-bold bg-clip-text bg-gradient-to-r from-brand-600 to-brand-400 dark:from-brand-400 dark:to-brand-200">
              Resume Checker
            </h1>
          </div>
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition"
            aria-label="Toggle Dark Mode"
          >
            {theme === 'light' ? <i className="fas fa-moon"></i> : <i className="fas fa-sun"></i>}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        
        {/* Intro */}
        <section className="text-center max-w-2xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Is your resume <span className="text-brand-600 dark:text-brand-400">ATS ready?</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
            Upload your resume (PDF) and paste the job description. Our AI will analyze how well you match the role.
          </p>
        </section>

        {/* Input Section */}
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 ${result ? 'hidden' : 'block'}`}>
          {/* File Upload Input */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              1. Upload Resume (PDF or TXT)
            </label>
            <div 
              className={`
                relative h-80 rounded-2xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center p-6 text-center cursor-pointer
                ${resumeFile 
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/10' 
                  : 'border-gray-300 dark:border-gray-700 hover:border-brand-500 dark:hover:border-brand-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }
              `}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".pdf,.txt" 
                onChange={handleFileChange}
              />
              
              {resumeFile ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-2xl">
                    <i className="fas fa-check"></i>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 dark:text-white truncate max-w-xs">{resumeFile.name}</p>
                    <p className="text-sm text-gray-500">{(resumeFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <p className="text-xs text-brand-600 font-semibold uppercase tracking-wider">Click to change</p>
                </div>
              ) : (
                <div className="space-y-4">
                   <div className="w-16 h-16 bg-brand-50 dark:bg-brand-900/30 text-brand-500 rounded-full flex items-center justify-center mx-auto text-2xl mb-4">
                    <i className="fas fa-cloud-upload-alt"></i>
                  </div>
                  <p className="text-lg font-medium text-gray-700 dark:text-gray-200">
                    Click or Drag to Upload
                  </p>
                  <p className="text-sm text-gray-400">
                    Supported formats: PDF, TXT
                  </p>
                </div>
              )}
            </div>
            {error && (
              <p className="text-red-500 text-sm mt-2"><i className="fas fa-circle-exclamation mr-1"></i> {error}</p>
            )}
          </div>

          {/* JD Input */}
          <div className="space-y-3">
            <label htmlFor="jd" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              2. Paste Job Description
            </label>
            <div className="relative group">
              <textarea
                id="jd"
                className="w-full h-80 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none resize-none shadow-sm transition-all text-sm leading-relaxed custom-scrollbar"
                placeholder="Copy and paste the job description text here..."
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
              />
              <div className="absolute top-4 right-4 text-gray-300 dark:text-gray-600 pointer-events-none">
                <i className="fas fa-briefcase text-2xl opacity-20"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        {!result && (
          <div className="flex justify-center">
            <button
              onClick={handleAnalyze}
              disabled={!resumeFile || !jdText.trim() || isAnalyzing}
              className={`
                group relative px-8 py-4 rounded-xl text-lg font-bold shadow-xl transition-all duration-200 flex items-center
                ${!resumeFile || !jdText.trim() 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600 shadow-none' 
                  : 'bg-brand-600 text-white hover:bg-brand-700 hover:shadow-brand-500/40 hover:-translate-y-1 active:translate-y-0'}
              `}
            >
              {isAnalyzing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Running AI Analysis...
                </>
              ) : (
                <>
                  Analyze Resume <i className="fas fa-magic ml-3 group-hover:translate-x-1 transition-transform"></i>
                </>
              )}
            </button>
          </div>
        )}

        {/* Results Area */}
        <div id="results-anchor">
            <ResultsPanel 
              result={result} 
              onReset={handleReset} 
              onDownload={handleDownload} 
            />
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-8 bg-white dark:bg-gray-900 mt-auto">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} ATS Resume Checker. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}

export default App;