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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Seeding initial data...');

    // First, get network IDs
    const { data: networks, error: networksError } = await supabase
      .from('networks')
      .select('id, name');

    if (networksError) throw networksError;

    const ethereumNetwork = networks?.find(n => n.name === 'Ethereum');
    const polygonNetwork = networks?.find(n => n.name === 'Polygon');
    const arbitrumNetwork = networks?.find(n => n.name === 'Arbitrum');

    if (!ethereumNetwork || !polygonNetwork || !arbitrumNetwork) {
      throw new Error('Networks not found');
    }

    // Insert sample protocols
    const protocols = [
      {
        network_id: ethereumNetwork.id,
        name: 'Uniswap V3',
        contract_address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
        protocol_type: 'dex',
        tvl_usd: 4200000000,
        risk_score: 25
      },
      {
        network_id: ethereumNetwork.id,
        name: 'Compound',
        contract_address: '0xA0b86a33E6441d8A2F4F5C87094A16E8b03F85E9',
        protocol_type: 'lending',
        tvl_usd: 3100000000,
        risk_score: 35
      },
      {
        network_id: ethereumNetwork.id,
        name: 'Aave V2',
        contract_address: '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9',
        protocol_type: 'lending',
        tvl_usd: 5800000000,
        risk_score: 20
      },
      {
        network_id: polygonNetwork.id,
        name: 'QuickSwap',
        contract_address: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff',
        protocol_type: 'dex',
        tvl_usd: 120000000,
        risk_score: 45
      },
      {
        network_id: arbitrumNetwork.id,
        name: 'GMX',
        contract_address: '0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a',
        protocol_type: 'perpetuals',
        tvl_usd: 450000000,
        risk_score: 55
      }
    ];

    const { data: insertedProtocols, error: protocolsError } = await supabase
      .from('protocols')
      .upsert(protocols, { onConflict: 'contract_address' })
      .select();

    if (protocolsError) throw protocolsError;

    // Insert sample protocol upgrades
    const upgrades = [
      {
        protocol_id: insertedProtocols?.find(p => p.name === 'Uniswap V3')?.id,
        proposal_id: 'UNI-042',
        title: 'Fee tier adjustment for stablecoin pairs',
        description: 'Proposal to adjust fee tiers for major stablecoin trading pairs to improve capital efficiency',
        upgrade_type: 'governance',
        status: 'active',
        voting_starts_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        voting_ends_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        execution_eta: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        risk_score: 85,
        volatility_impact: 12.5,
        liquidity_shift: -8.2,
        voting_progress: 67
      },
      {
        protocol_id: insertedProtocols?.find(p => p.name === 'Compound')?.id,
        proposal_id: 'COMP-156',
        title: 'Interest rate model upgrade',
        description: 'Implementation of new interest rate model to optimize borrowing costs and lending yields',
        upgrade_type: 'implementation',
        status: 'upcoming',
        voting_starts_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        voting_ends_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        execution_eta: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        risk_score: 72,
        volatility_impact: 18.3,
        liquidity_shift: 15.6,
        voting_progress: 23
      },
      {
        protocol_id: insertedProtocols?.find(p => p.name === 'Aave V2')?.id,
        proposal_id: 'AIP-89',
        title: 'Collateral factor adjustments',
        description: 'Adjustment of collateral factors for various assets to manage protocol risk',
        upgrade_type: 'parameter',
        status: 'active',
        voting_starts_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        voting_ends_at: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        execution_eta: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        risk_score: 45,
        volatility_impact: 6.8,
        liquidity_shift: 3.2,
        voting_progress: 89
      },
      {
        protocol_id: insertedProtocols?.find(p => p.name === 'GMX')?.id,
        proposal_id: 'GMX-23',
        title: 'Trading fee structure update',
        description: 'Updating trading fees to enhance competitiveness and improve trader experience',
        upgrade_type: 'parameter',
        status: 'upcoming',
        voting_starts_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        voting_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        execution_eta: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        risk_score: 58,
        volatility_impact: 9.4,
        liquidity_shift: 5.7,
        voting_progress: 0
      }
    ];

    const { data: insertedUpgrades, error: upgradesError } = await supabase
      .from('protocol_upgrades')
      .upsert(upgrades, { onConflict: 'proposal_id' })
      .select();

    if (upgradesError) throw upgradesError;

    // Insert sample risk assessments
    const riskAssessments = insertedUpgrades?.map(upgrade => ({
      upgrade_id: upgrade.id,
      technical_risk: Math.floor(Math.random() * 40) + 30,
      governance_risk: Math.floor(Math.random() * 30) + 20,
      market_risk: Math.floor(Math.random() * 50) + 25,
      liquidity_risk: Math.floor(Math.random() * 35) + 15,
      overall_risk: upgrade.risk_score,
      confidence_score: Math.random() * 0.3 + 0.7
    })) || [];

    const { error: riskError } = await supabase
      .from('risk_assessments')
      .upsert(riskAssessments, { onConflict: 'upgrade_id' });

    if (riskError) throw riskError;

    // Insert sample market data
    const marketData = insertedProtocols?.map(protocol => ({
      protocol_id: protocol.id,
      price_usd: Math.random() * 1000 + 10,
      volume_24h: Math.random() * 10000000 + 100000,
      market_cap: Math.random() * 1000000000 + 10000000,
      volatility: Math.random() * 0.5 + 0.1
    })) || [];

    const { error: marketError } = await supabase
      .from('market_data')
      .insert(marketData);

    if (marketError) throw marketError;

    console.log('Data seeding completed successfully');

    return new Response(JSON.stringify({
      success: true,
      message: 'Initial data seeded successfully',
      data: {
        protocols: insertedProtocols?.length || 0,
        upgrades: insertedUpgrades?.length || 0,
        riskAssessments: riskAssessments.length,
        marketData: marketData.length
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error seeding data:', error);
    return new Response(JSON.stringify({
      error: 'Failed to seed data',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});