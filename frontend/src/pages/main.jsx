import { useState } from 'react';

export default function TerminalPage() {
  const [output, setOutput] = useState([
    '> System initialized...',
    '> Welcome to Murder At Midnight Interview System',
    '> Ready for input...'
  ]);

  const handleAddInterview = () => {
    setOutput([...output, '> add_interview', '> Opening interview form...']);
  };

  const handleSeeReviews = () => {
    setOutput([...output, '> see_reviews', '> Loading reviews...']);
  };

  const handleReviewSummary = () => {
    setOutput([...output, '> review_summary', '> Generating review summary...']);
  };

  return (
    <div className="min-h-screen bg-black p-8 flex items-center justify-center">
      {/* Terminal */}
      <div className="w-full max-w-4xl bg-gray-900 rounded-lg shadow-2xl border border-green-500">
        {/* Terminal Header */}
        <div className="bg-gray-800 rounded-t-lg p-3 flex items-center gap-2 border-b border-green-500">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="ml-4 text-gray-400 font-mono text-sm">terminal@murder-at-midnight</span>
        </div>
        
        {/* Terminal Content */}
        <div className="p-6 font-mono text-green-400">
          <div className="space-y-2 mb-8">
            {output.map((line, index) => (
              <div key={index} className="text-sm">
                {line}
              </div>
            ))}
            <div className="flex items-center">
              <span className="mr-2">{'>'}</span>
              <span className="animate-pulse">_</span>
            </div>
          </div>

          {/* Text-based buttons */}
          <div className="border-t border-green-500/30 pt-6 space-y-2">
            <div className="text-sm text-gray-500 mb-3">Available commands:</div>
            
            <button
              onClick={handleAddInterview}
              className="block w-full text-left hover:bg-green-900/30 hover:text-green-300 py-1 px-2 rounded transition-colors"
            >
              <span className="text-gray-500">{'>'}</span> add_interview
            </button>
            
            <button
              onClick={handleSeeReviews}
              className="block w-full text-left hover:bg-green-900/30 hover:text-green-300 py-1 px-2 rounded transition-colors"
            >
              <span className="text-gray-500">{'>'}</span> see_reviews
            </button>
            
            <button
              onClick={handleReviewSummary}
              className="block w-full text-left hover:bg-green-900/30 hover:text-green-300 py-1 px-2 rounded transition-colors"
            >
              <span className="text-gray-500">{'>'}</span> review_summary
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}