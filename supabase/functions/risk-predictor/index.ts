import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// GARCH(1,1) volatility forecasting model
class GARCHModel {
  private alpha: number = 0.1;
  private beta: number = 0.85;
  private omega: number = 0.000001;

  forecast(returns: number[], horizon: number = 1): number[] {
    if (returns.length < 2) return [0];

    const volatilities = [];
    let currentVariance = this.calculateInitialVariance(returns);

    for (let h = 0; h < horizon; h++) {
      const lastReturn = returns[returns.length - 1 - h] || 0;
      currentVariance = this.omega + 
                       this.alpha * Math.pow(lastReturn, 2) + 
                       this.beta * currentVariance;
      volatilities.push(Math.sqrt(currentVariance));
    }

    return volatilities;
  }

  private calculateInitialVariance(returns: number[]): number {
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    return returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
  }
}

// Liquidity prediction using time series analysis
class LiquidityPredictor {
  predictTVLShift(historicalTVL: number[], upgradeType: string, riskScore: number): {
    expectedShift: number;
    confidence: number;
    timeframe: string;
  } {
    if (historicalTVL.length === 0) {
      return { expectedShift: 0, confidence: 0, timeframe: '1-7 days' };
    }

    // Calculate recent trend
    const recentPeriod = Math.min(7, historicalTVL.length);
    const recent = historicalTVL.slice(-recentPeriod);
    const trend = (recent[recent.length - 1] - recent[0]) / recent[0];

    // Risk-based adjustment
    const riskMultiplier = upgradeType === 'implementation' ? 1.5 :
                          upgradeType === 'governance' ? 1.2 : 1.0;

    const volatilityFactor = riskScore / 100;
    
    // Base shift calculation
    let expectedShift = trend * riskMultiplier * (1 + volatilityFactor);
    
    // Add upgrade-specific factors
    if (upgradeType === 'implementation') {
      expectedShift += riskScore > 80 ? -0.15 : riskScore > 60 ? -0.05 : 0.02;
    } else if (upgradeType === 'governance') {
      expectedShift += riskScore > 70 ? -0.08 : 0.01;
    }

    // Confidence based on data quality and consistency
    const dataVariability = this.calculateVariability(recent);
    const confidence = Math.max(0.3, 1 - dataVariability);

    return {
      expectedShift: Math.round(expectedShift * 10000) / 100, // Percentage
      confidence: Math.round(confidence * 100),
      timeframe: riskScore > 70 ? '1-3 days' : '3-7 days'
    };
  }

  private calculateVariability(values: number[]): number {
    if (values.length < 2) return 1;
    
    const changes = [];
    for (let i = 1; i < values.length; i++) {
      changes.push(Math.abs((values[i] - values[i-1]) / values[i-1]));
    }
    
    const mean = changes.reduce((sum, c) => sum + c, 0) / changes.length;
    return mean;
  }
}

// Portfolio impact analysis
class PortfolioAnalyzer {
  analyzeImpact(upgradeData: any, portfolioData?: any[]): {
    correlationRisk: number;
    diversificationScore: number;
    recommendedActions: string[];
    hedgingStrategies: string[];
  } {
    // Simulate portfolio analysis
    const protocolWeight = portfolioData ? 
      portfolioData.find(p => p.protocol === upgradeData.protocol)?.weight || 0.1 : 0.1;

    const correlationRisk = upgradeData.riskScore * protocolWeight;
    
    const diversificationScore = portfolioData ? 
      Math.max(20, 100 - (portfolioData.length * 10)) : 70;

    const recommendedActions = [];
    const hedgingStrategies = [];

    if (correlationRisk > 15) {
      recommendedActions.push('Consider reducing exposure to ' + upgradeData.protocol);
      hedgingStrategies.push('Short-term put options on protocol token');
    }

    if (upgradeData.volatilityImpact > 15) {
      recommendedActions.push('Implement volatility-based stop losses');
      hedgingStrategies.push('VIX-based hedging strategies');
    }

    if (upgradeData.liquidityShift < -10) {
      recommendedActions.push('Monitor liquidity pools closely');
      hedgingStrategies.push('Diversify across multiple DEXs');
    }

    if (diversificationScore < 50) {
      recommendedActions.push('Increase portfolio diversification');
    }

    return {
      correlationRisk: Math.round(correlationRisk * 100) / 100,
      diversificationScore,
      recommendedActions,
      hedgingStrategies
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, protocol, upgradeData, portfolioData, timeHorizon } = await req.json();

    switch (action) {
      case 'predict_volatility':
        console.log(`Predicting volatility for ${protocol}...`);
        
        // Simulate historical price returns
        const returns = Array.from({ length: 30 }, () => 
          (Math.random() - 0.5) * 0.1 // ±5% daily returns
        );

        const garchModel = new GARCHModel();
        const horizonDays = timeHorizon === 'short-term' ? 7 : 
                           timeHorizon === 'medium-term' ? 30 : 90;
        
        const volatilityForecast = garchModel.forecast(returns, horizonDays);
        const avgVolatility = volatilityForecast.reduce((sum, v) => sum + v, 0) / volatilityForecast.length;

        return new Response(JSON.stringify({
          success: true,
          protocol,
          volatilityForecast: {
            annualizedVolatility: Math.round(avgVolatility * Math.sqrt(252) * 10000) / 100,
            dailyVolatility: Math.round(avgVolatility * 10000) / 100,
            confidence: 75,
            riskCategory: avgVolatility > 0.05 ? 'High' : avgVolatility > 0.03 ? 'Medium' : 'Low',
            forecast: volatilityForecast.slice(0, 7).map((v, i) => ({
              day: i + 1,
              volatility: Math.round(v * 10000) / 100
            }))
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      case 'predict_liquidity':
        console.log(`Predicting liquidity changes for ${protocol}...`);
        
        // Simulate historical TVL data
        const historicalTVL = Array.from({ length: 30 }, (_, i) => 
          1000000000 + Math.sin(i * 0.2) * 100000000 + Math.random() * 50000000
        );

        const liquidityPredictor = new LiquidityPredictor();
        const liquidityPrediction = liquidityPredictor.predictTVLShift(
          historicalTVL,
          upgradeData?.type || 'governance',
          upgradeData?.riskScore || 50
        );

        return new Response(JSON.stringify({
          success: true,
          protocol,
          liquidityPrediction,
          currentTVL: historicalTVL[historicalTVL.length - 1],
          projectedTVL: historicalTVL[historicalTVL.length - 1] * (1 + liquidityPrediction.expectedShift / 100)
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      case 'analyze_portfolio_impact':
        console.log('Analyzing portfolio impact...');
        
        if (!upgradeData) {
          return new Response(JSON.stringify({ error: 'Upgrade data required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const portfolioAnalyzer = new PortfolioAnalyzer();
        const impactAnalysis = portfolioAnalyzer.analyzeImpact(upgradeData, portfolioData);

        return new Response(JSON.stringify({
          success: true,
          impactAnalysis,
          upgradeData
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      case 'generate_recommendations':
        console.log('Generating execution recommendations...');
        
        const riskScore = upgradeData?.riskScore || 50;
        const volatilityImpact = upgradeData?.volatilityImpact || 0;
        const liquidityShift = upgradeData?.liquidityShift || 0;

        const recommendations = {
          executionTiming: {
            optimal: riskScore > 80 ? 'Pre-upgrade (24-48h before)' :
                    riskScore > 60 ? 'During voting period' : 'Post-upgrade stabilization',
            avoid: riskScore > 70 ? 'First 24h after upgrade' : 'High volatility periods',
            confidence: Math.max(60, 100 - riskScore / 2)
          },
          positionSizing: {
            recommended: riskScore > 80 ? 'Reduce by 30-50%' :
                        riskScore > 60 ? 'Reduce by 10-20%' : 'Maintain current',
            maxExposure: Math.max(5, 25 - riskScore / 4),
            reasoning: `Based on ${riskScore} risk score and ${Math.abs(volatilityImpact)}% volatility impact`
          },
          hedgingStrategies: [
            riskScore > 70 ? 'Consider protective puts' : null,
            Math.abs(liquidityShift) > 10 ? 'Diversify across DEXs' : null,
            volatilityImpact > 15 ? 'Implement trailing stops' : null
          ].filter(Boolean),
          alertThresholds: {
            priceChange: Math.max(5, riskScore / 5),
            volumeChange: Math.max(20, riskScore / 2),
            liquidityChange: Math.max(10, Math.abs(liquidityShift) * 2)
          }
        };

        return new Response(JSON.stringify({
          success: true,
          recommendations,
          metadata: {
            analysisTime: new Date().toISOString(),
            confidence: recommendations.executionTiming.confidence,
            riskLevel: riskScore > 80 ? 'Critical' : riskScore > 60 ? 'High' : 'Moderate'
          }
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
    console.error('Error in risk-predictor:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});