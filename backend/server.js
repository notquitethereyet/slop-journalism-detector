const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const { evaluateContentQuality } = require('./contentAnalysis');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Function to scrape webpage content
async function scrapeWebpage(url) {
  try {
    // More comprehensive browser-like headers
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Cache-Control': 'max-age=0',
      'TE': 'Trailers',
      'DNT': '1'
    };

    console.log(`Attempting to scrape: ${url}`);
    const response = await axios.get(url, { headers, timeout: 10000 });
    
    const $ = cheerio.load(response.data);
    
    // Remove script tags, style tags, and other non-content elements
    $('script, style, nav, footer, header, aside, .ads, .comments').remove();
    
    // Extract title, main content, and meta description
    const title = $('title').text().trim();
    const metaDescription = $('meta[name="description"]').attr('content') || '';
    
    // Try to find the main content (different sites use different structures)
    let mainContent = '';
    const possibleContentSelectors = [
      'article', '.article', '.post', '.content', 'main', 
      '#content', '#main', '.main-content', '[role="main"]',
      '.entry-content', '.post-content', '.article-content',
      '.story-content', '.page-content', '.entry'
    ];
    
    // Check each possible content selector
    for (const selector of possibleContentSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        mainContent = element.text().trim();
        break;
      }
    }
    
    // If no main content found with specific selectors, get all paragraph text
    if (!mainContent) {
      mainContent = $('p').text().trim();
    }
    
    // Combine all extracted content
    const combinedContent = `${title}\n\n${metaDescription}\n\n${mainContent}`;
    
    // Clean up the content (remove extra whitespace, etc.)
    return combinedContent
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim();
  } catch (error) {
    // Handle specific error cases
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.status === 403) {
        console.error(`Access forbidden (403) for URL: ${url}. The website is blocking scraping attempts.`);
        // Use a fallback method or return a specific message for 403 errors
        return `[Unable to access content: The website at ${url} is blocking access. This often happens with news sites that have anti-scraping measures.]`;
      } else if (error.response.status === 404) {
        console.error(`Page not found (404) for URL: ${url}`);
        return `[Page not found: The content at ${url} could not be located.]`;
      } else {
        console.error(`Error scraping webpage (${error.response.status}):`, error.message);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Error scraping webpage: No response received', error.message);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error scraping webpage:', error.message);
    }
    throw new Error('Failed to scrape the webpage');
  }
}

// Function to clean and format summary response
function cleanSummaryResponse(summaryText) {
  // Remove any "Summary:" section which is redundant
  let cleanedSummary = summaryText.replace(/\*\*Summary:\*\*.*$/s, '').trim();
  
  // Remove any "Clickbait Determination:" section which we handle separately
  cleanedSummary = cleanedSummary.replace(/\*\*Clickbait Determination:\*\*.*$/s, '').trim();
  
  // Remove any other redundant bold markers
  cleanedSummary = cleanedSummary.replace(/\*\*[\w\s]+:\*\*/g, '');
  
  // Fix any double spaces or extra line breaks
  cleanedSummary = cleanedSummary.replace(/\s+/g, ' ').trim();
  
  // Parse out just the clickbait determination for use in our algorithm
  const clickbaitMatch = summaryText.match(/\*\*Clickbait Determination:\*\*(.*?)(?:\.|$)/s);
  const clickbaitDetermination = clickbaitMatch ? clickbaitMatch[1].trim() : null;
  
  return {
    formattedSummary: cleanedSummary,
    clickbaitDetermination
  };
}

// Function to generate summary using DeepSeek API
async function generateSummary(content) {
  try {
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
    const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
    
    if (!DEEPSEEK_API_KEY) {
      throw new Error('DeepSeek API key is not configured');
    }
    
    // Truncate content if too long (DeepSeek may have token limits)
    const truncatedContent = content.slice(0, 8000);
    
    const response = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that creates concise summaries of web content. Focus on extracting the key points and determining if the content delivers on what the title promises. Your summary should be under 200 words.'
          },
          {
            role: 'user',
            content: `Please summarize the following web content and determine if it's clickbait:\n\n${truncatedContent}`
          }
        ],
        max_tokens: 500,
        temperature: 0.3
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        }
      }
    );
    
    const rawSummary = response.data.choices[0].message.content;
    const { formattedSummary, clickbaitDetermination } = cleanSummaryResponse(rawSummary);
    
    return {
      summary: formattedSummary || "No summary available",
      clickbaitDetermination
    };
  } catch (error) {
    console.error('Error generating summary:', error.message);
    // Return a default summary object instead of throwing an error
    return {
      summary: "Unable to generate summary due to an error",
      clickbaitDetermination: null
    };
  }
}

// Routes
app.post('/api/analyze', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    console.log(`Processing URL: ${url}`);
    
    // Scrape the webpage content
    const scrapedContent = await scrapeWebpage(url);
    console.log(`Content scraped successfully: ${scrapedContent.length} characters`);
    
    // Check if we got a blocked content message
    if (scrapedContent.startsWith('[Unable to access content:') || scrapedContent.startsWith('[Page not found:')) {
      // Return a special response for blocked content
      return res.json({
        url,
        summary: scrapedContent,
        isClickbait: false,
        contentType: 'access-blocked',
        qualityScore: 0,
        recommendedAction: {
          action: 'visit-directly',
          reason: 'This website blocks automated access. Try visiting it directly in your browser.',
          icon: 'warning'
        },
        contentWarning: {
          type: 'access_blocked',
          message: 'This website is blocking our access. This is common with news and shopping sites.',
          severity: 'medium'
        },
        contentLength: scrapedContent.length,
        metrics: {
          journalisticValue: 0,
          contentDepth: 0,
          productListScore: 0,
          affiliateScore: 0
        }
      });
    }
    
    // Generate summary using DeepSeek API
    const summaryResponse = await generateSummary(scrapedContent);
    const summary = summaryResponse.summary || "No summary available";
    console.log(`Summary generated successfully`);
    
    // Use the clickbaitDetermination as an additional signal for the algorithm
    const isDeepSeekClickbait = summaryResponse.clickbaitDetermination?.toLowerCase().includes('clickbait') || false;
    
    // Use enhanced content quality evaluation
    const contentAnalysis = evaluateContentQuality(scrapedContent, summary);
    console.log(`Content analyzed successfully`);
    
    // Add the DeepSeek clickbait signal to the evaluation
    contentAnalysis.isClickbait = contentAnalysis.isClickbait || isDeepSeekClickbait;
    
    // Enhance response with additional context
    let contentWarning = null;
    if (contentAnalysis.contentType === 'product-list' || contentAnalysis.contentType === 'affiliate-product-list') {
      contentWarning = {
        type: 'shopping_content',
        message: 'This appears to be a shopping/product list article that may not contain substantive information.',
        severity: contentAnalysis.metrics.qualityScore < 30 ? 'high' : 'medium'
      };
    } else if (contentAnalysis.contentType === 'low-value-content') {
      contentWarning = {
        type: 'low_value',
        message: 'This content appears to have minimal informational or journalistic value.',
        severity: 'high'
      };
    }
    
    res.json({
      url,
      summary,
      isClickbait: contentAnalysis.isClickbait,
      contentType: contentAnalysis.contentType,
      qualityScore: contentAnalysis.metrics.qualityScore,
      recommendedAction: contentAnalysis.recommendedAction,
      contentWarning,
      contentLength: scrapedContent.length,
      metrics: {
        journalisticValue: contentAnalysis.metrics.hasJournalisticValue.score,
        contentDepth: contentAnalysis.metrics.contentDepth.score,
        productListScore: contentAnalysis.metrics.isProductList.score,
        affiliateScore: contentAnalysis.metrics.isAffiliateHeavy.score
      }
    });
  } catch (error) {
    console.error('Error in /api/analyze:', error);
    res.status(500).json({ error: 'Failed to process the URL', details: error.message });
  }
});

// Add a mock endpoint for testing without API
app.post('/api/analyze-mock', (req, res) => {
  const { url } = req.body;
  
  // Generate a mock response
  setTimeout(() => {
    res.json({
      url,
      summary: "This is a mock summary of the content that would normally be generated by the DeepSeek API. It simulates what the real response would look like for testing purposes.",
      isClickbait: Math.random() > 0.7,
      contentType: ['product-list', 'standard-reporting', 'low-value-content'][Math.floor(Math.random() * 3)],
      qualityScore: Math.floor(Math.random() * 100),
      recommendedAction: {
        action: ['skip', 'skim', 'read-selectively', 'read'][Math.floor(Math.random() * 4)],
        reason: "This is a mock reason for the recommendation.",
        icon: ['warning', 'info', 'check', 'star'][Math.floor(Math.random() * 4)]
      },
      contentWarning: Math.random() > 0.7 ? {
        type: 'shopping_content',
        message: 'This appears to be a shopping/product list article that may not contain substantive information.',
        severity: Math.random() > 0.5 ? 'high' : 'medium'
      } : null,
      contentLength: Math.floor(Math.random() * 10000) + 1000,
      metrics: {
        journalisticValue: Math.floor(Math.random() * 10),
        contentDepth: Math.floor(Math.random() * 10),
        productListScore: Math.floor(Math.random() * 10),
        affiliateScore: Math.floor(Math.random() * 10)
      }
    });
  }, 1500); // Simulate loading time
});

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});