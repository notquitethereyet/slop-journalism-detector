import React, { useState, useMemo } from 'react';
import { HiOutlineLink, HiOutlineExclamation, HiOutlineCheckCircle, HiOutlineInformationCircle } from 'react-icons/hi';
import axios from 'axios';
import UrlForm from './UrlForm';
import Summary from './EnhancedSummary';
import LoadingIndicator from './LoadingIndicator';

interface AnalysisResult {
  url: string;
  summary: string;
  isClickbait: boolean;
  contentType: string;
  qualityScore: number;
  recommendedAction: {
    action: string;
    reason: string;
    icon: string;
  };
  contentWarning?: {
    type: string;
    message: string;
    severity: string;
  };
  contentLength: number;
  metrics: {
    journalisticValue: number;
    contentDepth: number;
    productListScore: number;
    affiliateScore: number;
  };
}

// Array of clickbait-style messages
const clickbaitMessages = [
"9/10 'journalists' hate this tool!",
    "You won't BELIEVE how dogshit this article is!",
    "Content creators SHOCKED that their jobs are useless!",
    "This article has more ads than actual content - what happens next will surprise you!",
    "Attention! You're about to waste 3 minutes of your life you'll never get back",
    "This article is 90% product links, 10% actual content",
    "Breaking News: This isn't actually news",
    "Top 10 reasons this article isn't worth reading (number 7 will save you time!)",
    "Warning: This content is 87% recycled from other articles",
    "Content nutritional value: Empty calories",
    "Affiliate link density has reached critical levels!",
    "WARNING: High levels of filler content detected",
    "This article contains 27 products nobody actually needs",
    "We analyzed this article so you don't have to - you're welcome",
    "Time-saving tip: Skip this entire article"
];

const ClickbaitDetector: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  
  // Select a random message when component mounts
  const randomMessage = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * clickbaitMessages.length);
    return clickbaitMessages[randomIndex];
  }, []);

  const analyzeUrl = async (url: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Validate URL
      try {
        new URL(url);
      } catch (err) {
        throw new Error('Please enter a valid URL including http:// or https://');
      }
      
      // Call the backend API
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.post(`${apiUrl}/api/analyze`, { url });
      setResult(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to analyze the URL';
      setError(errorMessage);
      console.error('Error analyzing URL:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="bg-tokyo-bg-lighter rounded-lg shadow-tokyo p-6 mb-8">
        <UrlForm onSubmit={analyzeUrl} />
        
        {error && (
          <div className="mt-4 p-4 bg-tokyo-bg border border-tokyo-terminal-red/30 rounded-md text-tokyo-terminal-red flex items-start">
            <HiOutlineExclamation className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}
        
        {isLoading && (
          <div className="mt-6 flex justify-center">
            <LoadingIndicator />
          </div>
        )}
      </div>
      
      {!isLoading && result && (
        <Summary result={result} />
      )}
      
      <div className="mt-8 p-4 bg-tokyo-bg-lighter rounded-lg border border-tokyo-border">
        <div className="flex items-start">
          <HiOutlineInformationCircle className="w-5 h-5 mr-2 text-tokyo-terminal-blue flex-shrink-0 mt-0.5" />
          <div className="text-sm text-tokyo-fg-dark">
            <p className="mb-2">
              {randomMessage}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClickbaitDetector;