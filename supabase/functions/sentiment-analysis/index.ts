import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple sentiment analysis algorithm (in production, use BERT or similar)
function analyzeSentiment(text: string): { score: number; sentiment: string; confidence: number } {
  const positiveWords = [
    'good', 'great', 'excellent', 'amazing', 'fantastic', 'positive', 'bullish', 
    'optimistic', 'strong', 'solid', 'profitable', 'growth', 'innovation', 'upgrade'
  ];
  
  const negativeWords = [
    'bad', 'terrible', 'awful', 'negative', 'bearish', 'pessimistic', 'weak', 
    'poor', 'loss', 'decline', 'crash', 'dump', 'risk', 'warning', 'critical'
  ];

  const words = text.toLowerCase().split(/\s+/);
  let positiveCount = 0;
  let negativeCount = 0;

  words.forEach(word => {
    if (positiveWords.includes(word)) positiveCount++;
    if (negativeWords.includes(word)) negativeCount++;
  });

  const totalSentimentWords = positiveCount + negativeCount;
  if (totalSentimentWords === 0) {
    return { score: 0, sentiment: 'neutral', confidence: 0 };
  }

  const score = (positiveCount - negativeCount) / totalSentimentWords;
  const confidence = totalSentimentWords / words.length;

  let sentiment = 'neutral';
  if (score > 0.2) sentiment = 'positive';
  else if (score < -0.2) sentiment = 'negative';

  return { score, sentiment, confidence };
}

// Social media sentiment aggregation
function aggregateSocialSentiment(posts: any[]): {
  overallSentiment: number;
  trend: string;
  influenceScore: number;
  volumeScore: number;
} {
  if (posts.length === 0) {
    return { overallSentiment: 0, trend: 'neutral', influenceScore: 0, volumeScore: 0 };
  }

  const sentiments = posts.map(post => {
    const analysis = analyzeSentiment(post.text);
    return {
      score: analysis.score,
      engagement: post.likes + post.retweets + post.replies,
      timestamp: new Date(post.timestamp)
    };
  });

  // Weight by engagement
  const totalEngagement = sentiments.reduce((sum, s) => sum + s.engagement, 0);
  const weightedSentiment = sentiments.reduce((sum, s) => {
    const weight = totalEngagement > 0 ? s.engagement / totalEngagement : 1 / sentiments.length;
    return sum + (s.score * weight);
  }, 0);

  // Calculate trend (recent vs older posts)
  const now = new Date();
  const recentPosts = sentiments.filter(s => 
    (now.getTime() - s.timestamp.getTime()) < 24 * 60 * 60 * 1000 // Last 24 hours
  );
  
  const recentSentiment = recentPosts.length > 0 ? 
    recentPosts.reduce((sum, s) => sum + s.score, 0) / recentPosts.length : 0;

  let trend = 'stable';
  if (recentSentiment > weightedSentiment + 0.1) trend = 'improving';
  else if (recentSentiment < weightedSentiment - 0.1) trend = 'declining';

  return {
    overallSentiment: Math.round(weightedSentiment * 100) / 100,
    trend,
    influenceScore: Math.min(totalEngagement / 1000, 100), // Normalize influence
    volumeScore: Math.min(posts.length * 2, 100) // Volume score
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, protocol, query } = await req.json();

    switch (action) {
      case 'analyze_protocol_sentiment':
        console.log(`Analyzing sentiment for ${protocol}...`);
        
        // Simulate social media posts (in production, use Twitter API)
        const mockPosts = [
          {
            text: `${protocol} upgrade looks promising! Great innovation and strong community support.`,
            likes: 245,
            retweets: 87,
            replies: 34,
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
          },
          {
            text: `Concerned about the ${protocol} governance proposal. High risk of volatility.`,
            likes: 156,
            retweets: 45,
            replies: 78,
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() // 5 hours ago
          },
          {
            text: `${protocol} TVL growth is solid. Bullish on the long-term prospects.`,
            likes: 189,
            retweets: 62,
            replies: 23,
            timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() // 8 hours ago
          },
          {
            text: `${protocol} smart contract audit results look excellent. Very secure.`,
            likes: 298,
            retweets: 134,
            replies: 56,
            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() // 12 hours ago
          },
          {
            text: `Warning: ${protocol} proposal could negatively impact smaller LPs. Monitor closely.`,
            likes: 167,
            retweets: 89,
            replies: 95,
            timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString() // 18 hours ago
          }
        ];

        const sentimentAnalysis = aggregateSocialSentiment(mockPosts);

        return new Response(JSON.stringify({
          success: true,
          protocol,
          sentiment: sentimentAnalysis,
          posts: mockPosts.length,
          analysis: {
            marketMood: sentimentAnalysis.overallSentiment > 0.3 ? 'Optimistic' :
                       sentimentAnalysis.overallSentiment < -0.3 ? 'Pessimistic' : 'Neutral',
            riskIndicator: sentimentAnalysis.trend === 'declining' ? 'Increasing' :
                          sentimentAnalysis.trend === 'improving' ? 'Decreasing' : 'Stable',
            confidence: Math.min(sentimentAnalysis.influenceScore + sentimentAnalysis.volumeScore, 100)
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      case 'market_sentiment_overview':
        console.log('Fetching overall market sentiment...');
        
        const marketOverview = {
          defiSentiment: 0.25, // Slightly positive
          governanceSentiment: -0.15, // Slightly negative
          technicalSentiment: 0.4, // Positive
          overallMarket: 0.17, // Neutral-positive
          volatilityExpectation: 'Medium',
          riskAppetite: 'Moderate',
          keyThemes: [
            'Regulatory clarity improving',
            'DeFi innovation continuing',
            'Governance participation increasing',
            'Institutional adoption growing'
          ]
        };

        return new Response(JSON.stringify({
          success: true,
          market: marketOverview,
          timestamp: new Date().toISOString()
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      case 'analyze_text':
        if (!query) {
          return new Response(JSON.stringify({ error: 'Query text required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const textAnalysis = analyzeSentiment(query);
        
        return new Response(JSON.stringify({
          success: true,
          analysis: textAnalysis,
          text: query
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    console.error('Error in sentiment-analysis:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});