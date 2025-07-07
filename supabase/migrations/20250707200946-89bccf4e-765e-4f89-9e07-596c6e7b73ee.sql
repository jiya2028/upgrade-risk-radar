-- Create tables for protocol upgrade monitoring system

-- Networks table
CREATE TABLE public.networks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  chain_id INTEGER NOT NULL,
  rpc_url TEXT NOT NULL,
  block_explorer_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'warning', 'critical')),
  current_block_height BIGINT DEFAULT 0,
  gas_price DECIMAL DEFAULT 0,
  tvl_usd DECIMAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Protocols table
CREATE TABLE public.protocols (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  network_id UUID NOT NULL REFERENCES public.networks(id),
  name TEXT NOT NULL,
  contract_address TEXT NOT NULL,
  protocol_type TEXT NOT NULL,
  tvl_usd DECIMAL DEFAULT 0,
  risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Protocol upgrades table
CREATE TABLE public.protocol_upgrades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  protocol_id UUID NOT NULL REFERENCES public.protocols(id),
  proposal_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  upgrade_type TEXT NOT NULL CHECK (upgrade_type IN ('governance', 'implementation', 'parameter')),
  status TEXT NOT NULL CHECK (status IN ('upcoming', 'active', 'completed', 'failed')),
  voting_starts_at TIMESTAMP WITH TIME ZONE,
  voting_ends_at TIMESTAMP WITH TIME ZONE,
  execution_eta TIMESTAMP WITH TIME ZONE,
  risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  volatility_impact DECIMAL DEFAULT 0,
  liquidity_shift DECIMAL DEFAULT 0,
  voting_progress DECIMAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Risk assessments table
CREATE TABLE public.risk_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  upgrade_id UUID NOT NULL REFERENCES public.protocol_upgrades(id),
  technical_risk INTEGER DEFAULT 0 CHECK (technical_risk >= 0 AND technical_risk <= 100),
  governance_risk INTEGER DEFAULT 0 CHECK (governance_risk >= 0 AND governance_risk <= 100),
  market_risk INTEGER DEFAULT 0 CHECK (market_risk >= 0 AND market_risk <= 100),
  liquidity_risk INTEGER DEFAULT 0 CHECK (liquidity_risk >= 0 AND liquidity_risk <= 100),
  overall_risk INTEGER DEFAULT 0 CHECK (overall_risk >= 0 AND overall_risk <= 100),
  confidence_score DECIMAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Market data table
CREATE TABLE public.market_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  protocol_id UUID NOT NULL REFERENCES public.protocols(id),
  price_usd DECIMAL NOT NULL,
  volume_24h DECIMAL DEFAULT 0,
  market_cap DECIMAL DEFAULT 0,
  volatility DECIMAL DEFAULT 0,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.networks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protocol_upgrades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_data ENABLE ROW LEVEL SECURITY;

-- Create policies (public read access for now)
CREATE POLICY "Networks are publicly readable" ON public.networks FOR SELECT USING (true);
CREATE POLICY "Protocols are publicly readable" ON public.protocols FOR SELECT USING (true);
CREATE POLICY "Protocol upgrades are publicly readable" ON public.protocol_upgrades FOR SELECT USING (true);
CREATE POLICY "Risk assessments are publicly readable" ON public.risk_assessments FOR SELECT USING (true);
CREATE POLICY "Market data is publicly readable" ON public.market_data FOR SELECT USING (true);

-- Create indexes for performance
CREATE INDEX idx_protocols_network_id ON public.protocols(network_id);
CREATE INDEX idx_upgrades_protocol_id ON public.protocol_upgrades(protocol_id);
CREATE INDEX idx_upgrades_status ON public.protocol_upgrades(status);
CREATE INDEX idx_risk_assessments_upgrade_id ON public.risk_assessments(upgrade_id);
CREATE INDEX idx_market_data_protocol_timestamp ON public.market_data(protocol_id, timestamp DESC);

-- Insert initial network data
INSERT INTO public.networks (name, chain_id, rpc_url, block_explorer_url, status, current_block_height, gas_price, tvl_usd) VALUES
('Ethereum', 1, 'https://ethereum-rpc.publicnode.com', 'https://etherscan.io', 'warning', 18842156, 25, 24800000000),
('Polygon', 137, 'https://polygon-rpc.com', 'https://polygonscan.com', 'active', 50123789, 30, 1200000000),
('Arbitrum', 42161, 'https://arb1.arbitrum.io/rpc', 'https://arbiscan.io', 'critical', 156789123, 0.1, 2100000000),
('Bitcoin', 0, '', 'https://blockstream.info', 'active', 819456, 15, 45200000000);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_networks_updated_at BEFORE UPDATE ON public.networks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_protocols_updated_at BEFORE UPDATE ON public.protocols FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_upgrades_updated_at BEFORE UPDATE ON public.protocol_upgrades FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();