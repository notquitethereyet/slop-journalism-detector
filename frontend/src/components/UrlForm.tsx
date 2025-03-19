import React, { useState } from 'react';
import { HiOutlineSearch } from 'react-icons/hi';

interface UrlFormProps {
  onSubmit: (url: string) => void;
}

const UrlForm: React.FC<UrlFormProps> = ({ onSubmit }) => {
  const [url, setUrl] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="url-input" className="block text-tokyo-fg-light mb-2 font-medium">
        Enter an article URL to analyze
      </label>
      <div className="flex items-center">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <HiOutlineSearch className="h-5 w-5 text-tokyo-fg-dark" />
          </div>
          <input
            id="url-input"
            type="url"
            placeholder="https://example.com/article"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="bg-tokyo-bg border border-tokyo-border text-tokyo-fg rounded-l-lg w-full py-3 pl-10 focus:ring-2 focus:ring-tokyo-terminal-blue focus:border-tokyo-terminal-blue focus:outline-none transition-all"
            required
          />
        </div>
        <button 
          type="submit"
          className="bg-tokyo-terminal-blue hover:bg-tokyo-terminal-blue/90 text-white font-medium py-3 px-6 rounded-r-lg transition-colors"
        >
          Analyze
        </button>
      </div>
      <p className="mt-2 text-xs text-tokyo-fg-dark">
        Try an article from your favorite news site or blog
      </p>
    </form>
  );
};

export default UrlForm;