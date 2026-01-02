
import React, { useState, useCallback } from 'react';
import { firecrawl } from './lib/firecrawlClient';
import { gemini } from './services/geminiService';
import { AppStatus, ScrapedData, AnalysisResult } from './types';
import { 
  GlobeAltIcon, 
  ArrowPathIcon, 
  SparklesIcon, 
  ExclamationCircleIcon,
  CheckBadgeIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const App: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleResearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setError(null);
    setAnalysis(null);
    setScrapedData(null);
    
    try {
      // Step 1: Crawl
      setStatus(AppStatus.CRAWLING);
      const data = await firecrawl.scrapeUrl(url);
      setScrapedData(data);

      // Step 2: Analyze
      setStatus(AppStatus.ANALYZING);
      const result = await gemini.analyzeContent(data.content);
      setAnalysis(result);
      
      setStatus(AppStatus.COMPLETED);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during research.");
      setStatus(AppStatus.ERROR);
    }
  }, [url]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">FireGemini</h1>
          </div>
          <div className="hidden md:flex items-center space-x-4 text-sm font-medium text-slate-500">
            <span>Powered by Firecrawl & Gemini 3</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-3xl mx-auto mb-12 text-center">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-4 sm:text-5xl">
            Smart Content Research
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            Enter any URL to extract structured insights, summaries, and key entities 
            using advanced web crawling and LLM analysis.
          </p>
        </div>

        {/* Input Form */}
        <div className="max-w-2xl mx-auto mb-12">
          <form onSubmit={handleResearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <GlobeAltIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="url"
                required
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="block w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm transition-all"
                disabled={status === AppStatus.CRAWLING || status === AppStatus.ANALYZING}
              />
            </div>
            <button
              type="submit"
              disabled={status === AppStatus.CRAWLING || status === AppStatus.ANALYZING}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-semibold py-3 px-8 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 whitespace-nowrap"
            >
              {(status === AppStatus.CRAWLING || status === AppStatus.ANALYZING) ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <SparklesIcon className="w-5 h-5" />
                  <span>Analyze</span>
                </>
              )}
            </button>
          </form>
          
          {status === AppStatus.CRAWLING && (
            <p className="mt-4 text-center text-sm text-indigo-600 font-medium animate-pulse">
              Firecrawl is exploring the website...
            </p>
          )}
          {status === AppStatus.ANALYZING && (
            <p className="mt-4 text-center text-sm text-amber-600 font-medium animate-pulse">
              Gemini is synthesizing the content...
            </p>
          )}
        </div>

        {/* Results Section */}
        {error && (
          <div className="max-w-2xl mx-auto bg-red-50 border border-red-100 p-4 rounded-xl flex items-start space-x-3">
            <ExclamationCircleIcon className="w-6 h-6 text-red-500 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-red-800">Research Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {analysis && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center space-x-2 mb-4">
                  <DocumentTextIcon className="w-6 h-6 text-indigo-600" />
                  <h3 className="text-xl font-bold text-slate-900">Executive Summary</h3>
                </div>
                <p className="text-slate-700 leading-relaxed text-lg">
                  {analysis.summary}
                </p>
              </section>

              <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center space-x-2">
                  <CheckBadgeIcon className="w-6 h-6 text-green-500" />
                  <span>Key Takeaways</span>
                </h3>
                <ul className="space-y-4">
                  {analysis.keyPoints.map((point, idx) => (
                    <li key={idx} className="flex items-start space-x-3">
                      <div className="mt-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full flex-shrink-0" />
                      <span className="text-slate-700 leading-snug">{point}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-6">
              <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl">
                <h4 className="text-xs font-uppercase font-bold tracking-widest text-slate-400 mb-4 uppercase">
                  Detected Sentiment
                </h4>
                <div className="flex items-center space-x-3">
                  <span className={`text-2xl font-bold capitalize ${
                    analysis.sentiment === 'positive' ? 'text-green-400' : 
                    analysis.sentiment === 'negative' ? 'text-red-400' : 'text-amber-400'
                  }`}>
                    {analysis.sentiment}
                  </span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h4 className="text-xs font-uppercase font-bold tracking-widest text-slate-400 mb-4 uppercase">
                  Key Entities
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.entities.map((entity, idx) => (
                    <span 
                      key={idx} 
                      className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium border border-slate-200"
                    >
                      {entity}
                    </span>
                  ))}
                </div>
              </div>

              {scrapedData?.metadata && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h4 className="text-xs font-uppercase font-bold tracking-widest text-slate-400 mb-4 uppercase">
                    Metadata
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <span className="block text-[10px] text-slate-400 font-bold uppercase">Source Title</span>
                      <span className="text-sm text-slate-800 line-clamp-2">{scrapedData.metadata.title}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 font-bold uppercase">Lang</span>
                      <span className="text-sm text-slate-800 uppercase">{scrapedData.metadata.language}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm">
            © 2025 FireGemini Researcher. Experimental AI Tool.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
