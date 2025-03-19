import React from 'react';
import {
    HiOutlineExternalLink,
    HiOutlineLink,
    HiOutlineDocumentText,
    HiOutlineClock,
    HiOutlineExclamation,
    HiOutlineEmojiSad,
    HiOutlineEmojiHappy,
    HiOutlineStar,
    HiOutlineShoppingCart,
    HiOutlineNewspaper,
    HiOutlineChartBar
} from 'react-icons/hi';

interface EnhancedSummaryProps {
    result: {
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
    };
}

// Helper function to format summary for display
const formatSummaryForDisplay = (summary: string) => {
    // Clean up any trailing numbers that might be formatting artifacts
    let cleanedSummary = summary.replace(/\s+\d+\s+\d+\s+\d+\s*$/, '');
    
    // Check if the summary contains bullet points with dashes
    const hasBulletPoints = /\s+-\s+/.test(cleanedSummary);
    
    // Check if the summary has numbered points
    const hasNumberedPoints = /\d+[\.\)]\s/.test(cleanedSummary);
    
    if (hasBulletPoints) {
      // Split by bullet points and preserve the dash
      const points = cleanedSummary.split(/(?=\s+-\s+)/);
      return points.map(point => point.trim()).filter(p => p.length > 0);
    }
    
    if (hasNumberedPoints) {
      // Split by numbered points
      const points = cleanedSummary.split(/(?=\d+[\.\)]\s)/);
      return points.map(point => point.trim()).filter(p => p.length > 0);
    }
    
    // Handle bold text sections by preserving them
    const containsBoldText = /\*\*.*?\*\*/.test(cleanedSummary);
    
    // If not bullet points or numbered, proceed with paragraph splitting
    const paragraphs = cleanedSummary
      .split(/\n+/)
      .filter(p => p.trim().length > 0)
      .map(p => p.trim());
  
    if (paragraphs.length <= 1 && !containsBoldText) {
      // If it's a single paragraph without formatting, split by sentences
      const sentences = cleanedSummary.split(/\.(?:\s+|\s*$)/).filter(s => s.trim().length > 0);
      
      if (sentences.length >= 3) {
        // Group sentences into paragraphs of 2-3 sentences each
        const formattedParagraphs = [];
        let currentParagraph = '';
        
        sentences.forEach((sentence, index) => {
          if (!sentence.trim()) return;
          
          // Add period back if needed
          const formattedSentence = `${sentence.trim()}.`;
          
          currentParagraph += ` ${formattedSentence}`;
          
          // Create a new paragraph after every 2-3 sentences
          if ((index + 1) % 3 === 0 && index < sentences.length - 1) {
            formattedParagraphs.push(currentParagraph.trim());
            currentParagraph = '';
          }
        });
        
        // Add the last paragraph if not empty
        if (currentParagraph.trim()) {
          formattedParagraphs.push(currentParagraph.trim());
        }
        
        return formattedParagraphs;
      }
    }
    
    return paragraphs.length > 0 ? paragraphs : [cleanedSummary];
  };

const EnhancedSummary: React.FC<EnhancedSummaryProps> = ({ result }) => {
    const {
        url,
        summary,
        isClickbait,
        contentType,
        qualityScore,
        recommendedAction,
        contentWarning,
        contentLength,
        metrics
    } = result;

    const hostname = new URL(url).hostname;

    // Format reading time (approx 200 words per minute, with avg word length of 5 chars)
    const readingTimeMinutes = Math.max(1, Math.ceil(contentLength / (200 * 5)));

    // Helper function to get content type icon
    const getContentTypeIcon = () => {
        switch (contentType) {
            case 'product-list':
            case 'affiliate-product-list':
                return <HiOutlineShoppingCart className="w-5 h-5" />;
            case 'in-depth-journalism':
            case 'standard-reporting':
                return <HiOutlineNewspaper className="w-5 h-5" />;
            case 'low-value-content':
                return <HiOutlineEmojiSad className="w-5 h-5" />;
            default:
                return <HiOutlineDocumentText className="w-5 h-5" />;
        }
    };

    // Helper to get content type label
    const getContentTypeLabel = () => {
        switch (contentType) {
            case 'product-list':
                return 'Product List';
            case 'affiliate-product-list':
                return 'Affiliate Product List';
            case 'in-depth-journalism':
                return 'In-Depth Journalism';
            case 'standard-reporting':
                return 'Standard Reporting';
            case 'low-value-content':
                return 'Low-Value Content';
            default:
                return 'General Content';
        }
    };

    // Get quality score color
    const getQualityScoreColor = () => {
        if (qualityScore >= 70) return 'text-tokyo-terminal-green';
        if (qualityScore >= 50) return 'text-tokyo-terminal-yellow';
        if (qualityScore >= 30) return 'text-tokyo-terminal-magenta';
        return 'text-tokyo-terminal-red';
    };

    // Get action icon
    const getActionIcon = () => {
        switch (recommendedAction.icon) {
            case 'warning':
                return <HiOutlineExclamation className="w-5 h-5" />;
            case 'info':
                return <HiOutlineDocumentText className="w-5 h-5" />;
            case 'check':
                return <HiOutlineEmojiHappy className="w-5 h-5" />;
            case 'star':
                return <HiOutlineStar className="w-5 h-5" />;
            default:
                return <HiOutlineDocumentText className="w-5 h-5" />;
        }
    };

    return (
        <div className="bg-tokyo-bg-lighter rounded-lg shadow-tokyo overflow-hidden transition-all">
            <div className="border-b border-tokyo-border p-4 flex justify-between items-center">
                <div className="flex items-center">
                    <HiOutlineLink className="w-5 h-5 mr-2 text-tokyo-fg-dark" />
                    <span className="text-tokyo-fg-light font-medium">{hostname}</span>
                </div>
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-tokyo-terminal-blue hover:text-tokyo-terminal-cyan flex items-center text-sm"
                >
                    Visit Source
                    <HiOutlineExternalLink className="ml-1 w-4 h-4" />
                </a>
            </div>

            <div className="p-6">
                {/* Content Type and Quality Indicators */}
                <div className="flex flex-wrap gap-2 mb-4">
                    <div className={`
                        px-3 py-1 rounded-full text-sm font-medium inline-flex items-center
                        ${isClickbait
                            ? 'bg-tokyo-terminal-red/20 text-tokyo-terminal-red'
                            : 'bg-tokyo-terminal-green/20 text-tokyo-terminal-green'}
                    `}>
                        {isClickbait ? 'Likely Clickbait' : 'Not Clickbait'}
                    </div>

                    <div className="px-3 py-1 rounded-full text-sm font-medium inline-flex items-center bg-tokyo-bg/50 text-tokyo-fg-light">
                        {getContentTypeIcon()}
                        <span className="ml-1">{getContentTypeLabel()}</span>
                    </div>
                </div>

                {/* Content Warning if applicable */}
                {contentWarning && (
                    <div className={`
                        mb-4 p-3 rounded-md flex items-start
                        ${contentWarning.severity === 'high'
                            ? 'bg-tokyo-terminal-red/10 border border-tokyo-terminal-red/30'
                            : 'bg-tokyo-terminal-yellow/10 border border-tokyo-terminal-yellow/30'}
                    `}>
                        <HiOutlineExclamation className={`
                            w-5 h-5 mr-2 flex-shrink-0 mt-0.5
                            ${contentWarning.severity === 'high'
                                ? 'text-tokyo-terminal-red'
                                : 'text-tokyo-terminal-yellow'}
                        `} />
                        <p className="text-sm">{contentWarning.message}</p>
                    </div>
                )}

                {/* Quality Score */}
                <div className="mb-6">
                    <h3 className="text-sm uppercase text-tokyo-fg-dark mb-2">Quality Score</h3>
                    <div className="flex items-center">
                        <div className="w-full bg-tokyo-bg rounded-full h-2.5 mr-2">
                            <div
                                className={`h-2.5 rounded-full ${qualityScore >= 70 ? 'bg-tokyo-terminal-green' :
                                    qualityScore >= 50 ? 'bg-tokyo-terminal-yellow' :
                                        qualityScore >= 30 ? 'bg-tokyo-terminal-magenta' :
                                            'bg-tokyo-terminal-red'
                                    }`}
                                style={{ width: `${qualityScore}%` }}
                            ></div>
                        </div>
                        <span className={`text-lg font-bold ${getQualityScoreColor()}`}>
                            {qualityScore}
                        </span>
                    </div>
                </div>

                {/* Recommendation */}
                <div className="mb-6 p-3 rounded-md bg-tokyo-bg/50 flex items-start">
                    {getActionIcon()}
                    <div className="ml-2">
                        <h3 className="font-medium text-tokyo-fg-light">
                            Recommendation: <span className="capitalize">{recommendedAction.action}</span>
                        </h3>
                        <p className="text-sm text-tokyo-fg-dark">{recommendedAction.reason}</p>
                    </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex flex-col">
                        <span className="text-sm text-tokyo-fg-dark">Journalistic Value</span>
                        <div className="flex items-center mt-1">
  <div className="w-full bg-tokyo-bg rounded-full h-1.5 mr-2">
    <div 
      className="h-1.5 rounded-full bg-tokyo-terminal-blue"
      style={{ width: `${Math.min(metrics.journalisticValue * 3, 100)}%` }}
    ></div>
  </div>
  <span className="text-xs text-tokyo-fg">{metrics.journalisticValue}</span>
</div>
                    </div>

                    <div className="flex flex-col">
                        <span className="text-sm text-tokyo-fg-dark">Content Depth</span>
                        <div className="flex items-center mt-1">
                            <div className="w-full bg-tokyo-bg rounded-full h-1.5 mr-2">
                                <div
                                    className="h-1.5 rounded-full bg-tokyo-terminal-magenta"
                                    style={{ width: `${metrics.contentDepth * 10}%` }}
                                ></div>
                            </div>
                            <span className="text-xs text-tokyo-fg min-w-[20px] text-right">{metrics.contentDepth}</span>
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <span className="text-sm text-tokyo-fg-dark">Product Focus</span>
                        <div className="flex items-center mt-1">
                            <div className="w-full bg-tokyo-bg rounded-full h-1.5 mr-2">
                                <div
                                    className="h-1.5 rounded-full bg-tokyo-terminal-yellow"
                                    style={{ width: `${Math.min(metrics.productListScore * 10, 100)}%` }}
                                ></div>
                            </div>
                            <span className="text-xs text-tokyo-fg min-w-[20px] text-right">{metrics.productListScore}</span>
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <span className="text-sm text-tokyo-fg-dark">Affiliate Content</span>
                        <div className="flex items-center mt-1">
                            <div className="w-full bg-tokyo-bg rounded-full h-1.5 mr-2">
                                <div
                                    className="h-1.5 rounded-full bg-tokyo-terminal-red"
                                    style={{ width: `${Math.min(metrics.affiliateScore * 10, 100)}%` }}
                                ></div>
                            </div>
                            <span className="text-xs text-tokyo-fg min-w-[20px] text-right">{metrics.affiliateScore}</span>
                        </div>
                    </div>
                </div>

                {/* Enhanced Summary Section */}
                <div className="mt-6">
                    <h2 className="text-xl font-medium text-tokyo-fg-light mb-4 flex items-center">
                        <HiOutlineDocumentText className="w-5 h-5 mr-2 text-tokyo-terminal-blue" />
                        Summary
                    </h2>
                    
                    <div className="bg-tokyo-bg p-4 rounded-md">
                        <div className="prose prose-invert prose-sm max-w-none">
                            {formatSummaryForDisplay(summary).map((paragraph, index) => (
                                <p key={index} className="text-tokyo-fg leading-relaxed mb-3 last:mb-0">
                                    {paragraph}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-tokyo-border grid grid-cols-2 gap-4">
                    <div className="flex items-center text-tokyo-fg-dark text-sm">
                        <HiOutlineDocumentText className="w-4 h-4 mr-2" />
                        <span>{contentLength.toLocaleString()} characters</span>
                    </div>
                    <div className="flex items-center text-tokyo-fg-dark text-sm">
                        <HiOutlineClock className="w-4 h-4 mr-2" />
                        <span>~{readingTimeMinutes} min read</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnhancedSummary;