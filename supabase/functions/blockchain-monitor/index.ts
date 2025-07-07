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

interface BlockchainData {
  networkName: string;
  blockHeight: number;
  gasPrice: number;
  status: 'active' | 'warning' | 'critical';
}

interface ProtocolData {
  address: string;
  name: string;
  tvl: number;
  riskScore: number;
}

// Risk assessment algorithm using multiple factors
function calculateRiskScore(
  volatility: number,
  liquidityRatio: number,
  governanceParticipation: number,
  technicalComplexity: number
): number {
  const weights = {
    volatility: 0.3,
    liquidity: 0.25,
    governance: 0.25,
    technical: 0.2
  };

  const normalizedVolatility = Math.min(volatility * 10, 100);
  const liquidityScore = (1 - liquidityRatio) * 100;
  const governanceScore = (1 - governanceParticipation) * 100;
  const technicalScore = technicalComplexity;

  const riskScore = 
    (normalizedVolatility * weights.volatility) +
    (liquidityScore * weights.liquidity) +
    (governanceScore * weights.governance) +
    (technicalScore * weights.technical);

  return Math.round(Math.min(Math.max(riskScore, 0), 100));
}

// Fetch blockchain data from multiple APIs
async function fetchBlockchainData(network: string): Promise<BlockchainData | null> {
  try {
    let apiUrl = '';
    let networkName = '';

    switch (network.toLowerCase()) {
      case 'ethereum':
        apiUrl = 'https://api.etherscan.io/api?module=proxy&action=eth_blockNumber&apikey=YourApiKeyToken';
        networkName = 'Ethereum';
        break;
      case 'polygon':
        apiUrl = 'https://api.polygonscan.com/api?module=proxy&action=eth_blockNumber&apikey=YourApiKeyToken';
        networkName = 'Polygon';
        break;
      case 'arbitrum':
        apiUrl = 'https://api.arbiscan.io/api?module=proxy&action=eth_blockNumber&apikey=YourApiKeyToken';
        networkName = 'Arbitrum';
        break;
      default:
        return null;
    }

    // For demo purposes, simulate real blockchain data
    const mockData: BlockchainData = {
      networkName,
      blockHeight: Math.floor(Math.random() * 1000000) + 18000000,
      gasPrice: Math.floor(Math.random() * 50) + 10,
      status: Math.random() > 0.7 ? 'warning' : Math.random() > 0.9 ? 'critical' : 'active'
    };

    return mockData;
  } catch (error) {
    console.error(`Error fetching ${network} data:`, error);
    return null;
  }
}

// Fetch DeFi protocol data
async function fetchProtocolData(address: string): Promise<ProtocolData | null> {
  try {
    // Simulate DeFi Llama API call
    const mockProtocols: ProtocolData[] = [
      { address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', name: 'Uniswap V3', tvl: 4200000000, riskScore: 85 },
      { address: '0xA0b86a33E6441d8A2F4F5C87094A16E8b03F85E9', name: 'Compound', tvl: 3100000000, riskScore: 62 },
      { address: '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9', name: 'Aave V2', tvl: 5800000000, riskScore: 45 }
    ];

    return mockProtocols.find(p => p.address.toLowerCase() === address.toLowerCase()) || null;
  } catch (error) {
    console.error('Error fetching protocol data:', error);
    return null;
  }
}

// GARCH-inspired volatility calculation
function calculateVolatility(prices: number[]): number {
  if (prices.length < 2) return 0;

  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push(Math.log(prices[i] / prices[i - 1]));
  }

  const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
  const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
  
  return Math.sqrt(variance * 252); // Annualized volatility
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, network, address } = await req.json();

    switch (action) {
      case 'monitor_networks':
        console.log('Monitoring networks...');
        
        const networks = ['ethereum', 'polygon', 'arbitrum'];
        const networkUpdates = await Promise.all(
          networks.map(async (net) => {
            const data = await fetchBlockchainData(net);
            if (data) {
              const { error } = await supabase
                .from('networks')
                .update({
                  current_block_height: data.blockHeight,
                  gas_price: data.gasPrice,
                  status: data.status,
                  updated_at: new Date().toISOString()
                })
                .eq('name', data.networkName);

              if (error) {
                console.error(`Error updating ${net}:`, error);
              }
            }
            return data;
          })
        );

        return new Response(JSON.stringify({ 
          success: true, 
          networks: networkUpdates.filter(Boolean) 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      case 'assess_risk':
        console.log('Assessing protocol risk...');
        
        const protocolData = await fetchProtocolData(address);
        if (!protocolData) {
          return new Response(JSON.stringify({ error: 'Protocol not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Simulate historical price data for volatility calculation
        const historicalPrices = Array.from({ length: 30 }, (_, i) => 
          100 + Math.sin(i * 0.1) * 10 + Math.random() * 5
        );
        
        const volatility = calculateVolatility(historicalPrices);
        const liquidityRatio = Math.random() * 0.5 + 0.3; // 30-80%
        const governanceParticipation = Math.random() * 0.4 + 0.4; // 40-80%
        const technicalComplexity = Math.random() * 40 + 30; // 30-70

        const riskScore = calculateRiskScore(
          volatility,
          liquidityRatio,
          governanceParticipation,
          technicalComplexity
        );

        return new Response(JSON.stringify({
          success: true,
          protocol: protocolData.name,
          riskScore,
          factors: {
            volatility: Math.round(volatility * 100) / 100,
            liquidityRatio: Math.round(liquidityRatio * 100) / 100,
            governanceParticipation: Math.round(governanceParticipation * 100) / 100,
            technicalComplexity: Math.round(technicalComplexity)
          },
          recommendation: riskScore > 80 ? 'HIGH RISK - Consider reducing exposure' :
                          riskScore > 60 ? 'MEDIUM RISK - Monitor closely' :
                          'LOW RISK - Safe for current allocation'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      case 'fetch_governance':
        console.log('Fetching governance proposals...');
        
        // Simulate governance data from Snapshot/Tally APIs
        const proposals = [
          {
            id: 'UNI-042',
            title: 'Fee tier adjustment for stablecoin pairs',
            protocol: 'Uniswap V3',
            type: 'governance',
            status: 'active',
            votingProgress: 67,
            timeRemaining: '2d 14h',
            riskScore: 85,
            volatilityImpact: 12.5,
            liquidityShift: -8.2
          },
          {
            id: 'COMP-156',
            title: 'Interest rate model upgrade',
            protocol: 'Compound',
            type: 'implementation',
            status: 'upcoming',
            votingProgress: 23,
            timeRemaining: '5d 8h',
            riskScore: 72,
            volatilityImpact: 18.3,
            liquidityShift: 15.6
          }
        ];

        return new Response(JSON.stringify({
          success: true,
          proposals
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
    console.error('Error in blockchain-monitor:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});