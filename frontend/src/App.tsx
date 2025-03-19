import React from 'react';
import Header from './components/Header';
import ClickbaitDetector from './components/ClickbaitDetector';

function App() {
  return (
    <div className="min-h-screen bg-tokyo-bg text-tokyo-fg">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Header />
        <main className="mt-8">
          <ClickbaitDetector />
        </main>
        <footer className="mt-12 py-6 text-tokyo-fg-dark text-center text-sm">
          <p>© {new Date().getFullYear()} Clickbait Detector • Powered by DeepSeek API</p>
        </footer>
      </div>
    </div>
  );
}

export default App;