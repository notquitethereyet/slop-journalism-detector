// Enhanced function to evaluate content quality and type
function evaluateContentQuality(content, summary) {
  // Base clickbait detection
  const clickbaitScore = detectClickbait(content, summary);
  
  // Content quality metrics
  const contentQualityMetrics = {
    // Shopping/product listicle detection
    isProductList: detectProductList(content, summary),
    
    // Substantive journalism metrics
    hasJournalisticValue: detectJournalisticValue(content),
    
    // Affiliate/sponsored content detection
    isAffiliateHeavy: detectAffiliateContent(content),
    
    // Depth analysis
    contentDepth: analyzeContentDepth(content),
    
    // Overall quality score (0-100)
    qualityScore: calculateQualityScore(content, summary)
  };
  
  return {
    isClickbait: clickbaitScore >= 3,
    contentType: determineContentType(contentQualityMetrics),
    metrics: contentQualityMetrics,
    recommendedAction: recommendAction(contentQualityMetrics)
  };
}

// Detect if content is primarily a product list/shopping article
function detectProductList(content, summary) {
  const productListIndicators = [
    'products', 'items', 'things', 'buy', 'purchase', 'shop',
    'amazon', 'best-seller', 'bestseller', 'top-rated',
    'sale', 'deal', 'discount', 'price', 'affordable',
    'you need', 'must-have', 'essential', 'check out',
    'perfect for', 'solution for'
  ];
  
  const productContentRegex = /\$\d+(\.\d{2})?/g; // Price pattern
  const amazonLinkRegex = /amzn\.to|amazon\.com/gi;
  const listIndicators = /^\d+[\.\)]\s|\b\d+\s(?:products|things|items|buys|gifts|essentials)\b/gmi;
  
  // Check for product-focused title patterns
  const title = content.split('\n')[0].toLowerCase();
  const titleProductFocus = productListIndicators.some(indicator => 
    title.includes(indicator.toLowerCase())
  );
  
  // Count product indicators in content
  let productIndicatorCount = 0;
  productListIndicators.forEach(indicator => {
    const regex = new RegExp(`\\b${indicator}\\b`, 'gi');
    const matches = content.match(regex);
    if (matches) productIndicatorCount += matches.length;
  });
  
  // Check for price patterns
  const priceMatches = content.match(productContentRegex) || [];
  
  // Check for Amazon affiliate links
  const amazonMatches = content.match(amazonLinkRegex) || [];
  
  // Check for list format
  const listMatches = content.match(listIndicators) || [];
  
  // Calculate score based on indicators
  let score = 0;
  
  if (titleProductFocus) score += 3;
  score += Math.min(productIndicatorCount / 5, 3); // Cap at 3 points
  score += Math.min(priceMatches.length, 3);
  score += Math.min(amazonMatches.length * 2, 4);
  score += Math.min(listMatches.length / 2, 2);
  
  // Normalize to 0-10 scale
  const normalizedScore = Math.min(Math.round(score), 10);
  
  return {
    score: normalizedScore,
    isProductList: normalizedScore >= 6
  };
}

// Detect if content has journalistic value
function detectJournalisticValue(content) {
  const journalisticIndicators = [
    'according to', 'research', 'study', 'report', 'analysis',
    'expert', 'professor', 'scientist', 'source', 'evidence',
    'investigation', 'interview', 'survey', 'data', 'statistics',
    'findings', 'concluded', 'discovered', 'revealed', 'confirmed',
    'published in', 'journal', 'university', 'institute'
  ];
  
  const quoteRegex = /"([^"]+)"|'([^']+)'/g;
  const dateRegex = /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}\b/g;
  const sourceRegex = /\b(?:according to|said|says|reported by|stated by|confirmed by)\b/gi;
  
  // Count journalistic indicators
  let journalisticCount = 0;
  journalisticIndicators.forEach(indicator => {
    const regex = new RegExp(`\\b${indicator}\\b`, 'gi');
    const matches = content.match(regex);
    if (matches) journalisticCount += matches.length;
  });
  
  // Count quotes, dates, and source attributions
  const quoteMatches = content.match(quoteRegex) || [];
  const dateMatches = content.match(dateRegex) || [];
  const sourceMatches = content.match(sourceRegex) || [];
  
  // Calculate score based on indicators
  let score = 0;
  
  score += Math.min(journalisticCount / 3, 3);
  score += Math.min(quoteMatches.length, 2);
  score += Math.min(dateMatches.length, 1);
  score += Math.min(sourceMatches.length, 2);
  
  // Check for balanced perspective
  const perspectiveIndicators = ['however', 'on the other hand', 'critics', 'proponents', 'debate', 'controversy'];
  let balancedPerspective = 0;
  perspectiveIndicators.forEach(indicator => {
    if (content.toLowerCase().includes(indicator)) balancedPerspective++;
  });
  
  score += Math.min(balancedPerspective, 2);
  
  // Normalize to 0-10 scale
  const normalizedScore = Math.min(Math.round(score), 10);
  
  return {
    score: normalizedScore,
    hasJournalisticValue: normalizedScore >= 5
  };
}

// Detect if content is affiliate-heavy
function detectAffiliateContent(content) {
  const affiliateIndicators = [
    'affiliate', 'commission', 'sponsored', 'partner', 'partnership',
    'we may earn', 'we earn', 'compensation', 'paid for',
    'click here to buy', 'shop now', 'get it now', 'check price',
    'best price', 'discount', 'deal', 'coupon', 'promo code'
  ];
  
  const affiliateDisclosureRegex = /(?:affiliate|commission|compensation|may earn|we earn|paid|sponsored)/gi;
  const buyButtonRegex = /(?:buy now|shop now|get it now|check price|best price|purchase)/gi;
  const productLinkDensity = (content.match(/href/g) || []).length / (content.length / 1000);
  
  // Count affiliate indicators
  let affiliateCount = 0;
  affiliateIndicators.forEach(indicator => {
    const regex = new RegExp(`\\b${indicator}\\b`, 'gi');
    const matches = content.match(regex);
    if (matches) affiliateCount += matches.length;
  });
  
  // Check for affiliate disclosures
  const disclosureMatches = content.match(affiliateDisclosureRegex) || [];
  
  // Check for buy buttons
  const buyButtonMatches = content.match(buyButtonRegex) || [];
  
  // Calculate score based on indicators
  let score = 0;
  
  score += Math.min(affiliateCount / 2, 3);
  score += Math.min(disclosureMatches.length, 2);
  score += Math.min(buyButtonMatches.length, 3);
  score += Math.min(productLinkDensity * 2, 2);
  
  // Normalize to 0-10 scale
  const normalizedScore = Math.min(Math.round(score), 10);
  
  return {
    score: normalizedScore,
    isAffiliateHeavy: normalizedScore >= 5
  };
}

// Analyze content depth
function analyzeContentDepth(content) {
  // Calculate average sentence length
  const sentences = content.split(/[.!?]+/);
  const validSentences = sentences.filter(s => s.trim().length > 0);
  const avgSentenceLength = validSentences.reduce((sum, s) => sum + s.trim().length, 0) / validSentences.length;
  
  // Calculate word count
  const words = content.split(/\s+/).filter(w => w.trim().length > 0);
  const wordCount = words.length;
  
  // Calculate unique word ratio
  const uniqueWords = new Set(words.map(w => w.toLowerCase()));
  const uniqueWordRatio = uniqueWords.size / wordCount;
  
  // Check for complex vocabulary
  const complexWords = words.filter(w => w.length > 8);
  const complexWordRatio = complexWords.length / wordCount;
  
  // Check for structured content (headings, sections)
  const headingMatches = content.match(/\n[A-Z][^.!?]+\n/g) || [];
  
  // Calculate score based on indicators
  let score = 0;
  
  // Longer average sentence length (up to a point) indicates more depth
  score += Math.min(avgSentenceLength / 15, 2);
  
  // More words generally means more depth
  score += Math.min(wordCount / 500, 2);
  
  // Higher unique word ratio indicates more sophisticated content
  score += uniqueWordRatio * 3;
  
  // More complex words indicates more sophisticated content
  score += complexWordRatio * 3;
  
  // Structured content with headings indicates more depth
  score += Math.min(headingMatches.length, 2);
  
  // Normalize to 0-10 scale
  const normalizedScore = Math.min(Math.round(score), 10);
  
  return {
    score: normalizedScore,
    hasDepth: normalizedScore >= 5
  };
}

// Calculate overall quality score
function calculateQualityScore(content, summary) {
  // Ensure summary is a string
  const safeSummary = summary && typeof summary === 'string' ? summary : '';
  
  // Get individual metric scores
  const productListMetrics = detectProductList(content, safeSummary);
  const journalisticValueMetrics = detectJournalisticValue(content);
  const affiliateContentMetrics = detectAffiliateContent(content);
  const contentDepthMetrics = analyzeContentDepth(content);
  const clickbaitScore = detectClickbait(content, safeSummary);
  
  // Base score starts at 50
  let qualityScore = 50;
  
  // Add points for journalistic value and content depth
  qualityScore += journalisticValueMetrics.score * 3;
  qualityScore += contentDepthMetrics.score * 2;
  
  // Subtract points for product list focus, affiliate content, and clickbait
  qualityScore -= productListMetrics.score * 2;
  qualityScore -= affiliateContentMetrics.score * 2;
  qualityScore -= clickbaitScore * 5;
  
  // Ensure score is within 0-100 range
  return Math.max(0, Math.min(100, Math.round(qualityScore)));
}

// Determine content type
function determineContentType(metrics) {
  if (metrics.isProductList.score >= 7 && metrics.isAffiliateHeavy.score >= 6) {
    return 'affiliate-product-list';
  } else if (metrics.isProductList.score >= 6) {
    return 'product-list';
  } else if (metrics.hasJournalisticValue.score >= 7 && metrics.contentDepth.score >= 7) {
    return 'in-depth-journalism';
  } else if (metrics.hasJournalisticValue.score >= 5) {
    return 'standard-reporting';
  } else if (metrics.qualityScore < 40) {
    return 'low-value-content';
  } else {
    return 'general-content';
  }
}

// Recommend action based on content analysis
function recommendAction(metrics) {
  const qualityScore = metrics.qualityScore;
  
  if (qualityScore >= 75) {
    return {
      action: 'read',
      reason: 'This content appears to have substantial informational or journalistic value.',
      icon: 'check'
    };
  } else if (qualityScore >= 60) {
    return {
      action: 'read-selectively',
      reason: 'This content has some value but may contain unnecessary information.',
      icon: 'info'
    };
  } else if (qualityScore >= 40) {
    return {
      action: 'skim',
      reason: 'This content has limited value and may not be worth reading in full.',
      icon: 'info'
    };
  } else {
    return {
      action: 'skip',
      reason: 'This content appears to have minimal informational value.',
      icon: 'warning'
    };
  }
}

// Original clickbait detection function
function detectClickbait(content, summary) {
  const clickbaitIndicators = [
    'you won\'t believe',
    'shocking',
    'mind-blowing',
    'this will blow your mind',
    'jaw-dropping',
    'secret',
    'trick',
    'hack',
    'they don\'t want you to know',
    'doctors hate',
    'one weird trick',
    'this simple',
    'just discovered',
    'unbelievable',
    'incredible',
    'amazing',
    'surprising',
    'never seen before',
    'you need to see',
    'changed forever'
  ];
  
  // Check if the summary contains phrases like "doesn't deliver on promise"
  const undeliveredPromiseIndicators = [
    'doesn\'t deliver',
    'fails to deliver',
    'misleading',
    'exaggerated',
    'overpromised',
    'underwhelming',
    'disappointing',
    'clickbait'
  ];
  
  // Calculate score based on presence of clickbait indicators in content
  let clickbaitScore = 0;
  
  // Check title for clickbait phrases
  const title = content.split('\n')[0].toLowerCase();
  clickbaitIndicators.forEach(indicator => {
    if (title.includes(indicator.toLowerCase())) {
      clickbaitScore += 3; // Higher weight for title indicators
    }
  });
  
  // Check content for clickbait phrases
  clickbaitIndicators.forEach(indicator => {
    if (content.toLowerCase().includes(indicator.toLowerCase())) {
      clickbaitScore += 1;
    }
  });
  
  // Check summary for indicators that the content doesn't deliver
  if (summary && typeof summary === 'string') {
    undeliveredPromiseIndicators.forEach(indicator => {
      if (summary.toLowerCase().includes(indicator.toLowerCase())) {
        clickbaitScore += 2;
      }
    });
  }
  
  // Calculate content-to-title ratio (lower ratio often indicates clickbait)
  const titleLength = title.length;
  const contentLength = content.length;
  const contentTitleRatio = contentLength / titleLength;
  
  if (contentTitleRatio < 10) {
    clickbaitScore += 2; // Very little content compared to title
  }
  
  return clickbaitScore;
}

module.exports = {
  evaluateContentQuality
};