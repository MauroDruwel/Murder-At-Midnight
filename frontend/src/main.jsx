import React from 'react';
import ReactDOM from 'react-dom/client';
import ASCIIText from './components/ASCIIText';
import AnimatedContent from './components/AnimatedContent';
import StarBorder from './components/StarBorder';

function Home() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8">
      <StarBorder>
        <div className="p-8">
          <gli text="MURDER AT MIDNIGHT" />
          
          <AnimatedContent>
            <div className="mt-8 space-y-4">
              <p className="text-green-400 font-mono text-center">
                Welcome to the Investigation System
              </p>
              
              <div className="flex gap-4 justify-center">
                <button className="bg-green-600 hover:bg-green-700 text-white font-mono py-2 px-4 rounded transition-colors">
                  Start
                </button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-mono py-2 px-4 rounded transition-colors">
                  Info
                </button>
              </div>
            </div>
          </AnimatedContent>
        </div>
      </StarBorder>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Home />
  </React.StrictMode>
);