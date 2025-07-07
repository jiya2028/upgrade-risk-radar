import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface NetworkStatus {
  id: string;
  name: string;
  status: "active" | "warning" | "critical";
  current_block_height: number;
  gas_price: number;
  tvl_usd: number;
  chain_id: number;
}

interface Protocol {
  address: string;
  name: string;
  risk: number;
}

export const NetworkMonitorPanel = () => {
  const [networks, setNetworks] = useState<NetworkStatus[]>([]);
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<string>("ethereum");
  const [protocolAddress, setProtocolAddress] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-upgrade-success border-upgrade-success/50 bg-upgrade-success/10";
      case "warning": return "text-upgrade-warning border-upgrade-warning/50 bg-upgrade-warning/10";
      case "critical": return "text-upgrade-critical border-upgrade-critical/50 bg-upgrade-critical/10";
      default: return "text-muted-foreground";
    }
  };

  const formatTVL = (tvl: number) => {
    if (tvl >= 1e9) return `$${(tvl / 1e9).toFixed(1)}B`;
    if (tvl >= 1e6) return `$${(tvl / 1e6).toFixed(1)}M`;
    if (tvl >= 1e3) return `$${(tvl / 1e3).toFixed(1)}K`;
    return `$${tvl.toFixed(0)}`;
  };

  const fetchNetworkData = async () => {
    try {
      setLoading(true);
      
      // Fetch networks from database
      const { data: networkData, error: networkError } = await supabase
        .from('networks')
        .select('*')
        .order('name');

      if (networkError) throw networkError;
      setNetworks((networkData || []) as NetworkStatus[]);

      // Call blockchain monitor service to update network data
      const { data: monitorData, error: monitorError } = await supabase.functions.invoke('blockchain-monitor', {
        body: { action: 'monitor_networks' }
      });

      if (monitorError) {
        console.error('Monitor service error:', monitorError);
      } else {
        console.log('Network monitoring updated:', monitorData);
        // Refresh network data after update
        const { data: updatedNetworks } = await supabase
          .from('networks')
          .select('*')
          .order('name');
        setNetworks((updatedNetworks || []) as NetworkStatus[]);
      }

    } catch (error) {
      console.error('Error fetching network data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch network data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addProtocol = async () => {
    if (!protocolAddress.trim()) {
      toast({
        title: "Error", 
        description: "Please enter a protocol address",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      // Call risk assessment service
      const { data: riskData, error } = await supabase.functions.invoke('blockchain-monitor', {
        body: { 
          action: 'assess_risk', 
          address: protocolAddress.trim() 
        }
      });

      if (error) throw error;

      if (riskData.success) {
        const newProtocol: Protocol = {
          address: protocolAddress.trim(),
          name: riskData.protocol,
          risk: riskData.riskScore
        };
        
        setProtocols(prev => [...prev, newProtocol]);
        setProtocolAddress("");
        
        toast({
          title: "Protocol Added",
          description: `${riskData.protocol} added with risk score: ${riskData.riskScore}`,
        });
      } else {
        throw new Error('Protocol not found');
      }
    } catch (error) {
      console.error('Error adding protocol:', error);
      toast({
        title: "Error",
        description: "Failed to add protocol. Please check the address.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNetworkData();
    // Set up periodic updates every 30 seconds
    const interval = setInterval(fetchNetworkData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="h-full bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl text-primary flex items-center justify-between">
          Network Monitoring
          <Badge variant="outline" className="text-xs">Live</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Network Selection */}
        <div className="space-y-2">
          <Label htmlFor="network-select">Network Selection</Label>
          <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
            <SelectTrigger id="network-select">
              <SelectValue placeholder="Select network" />
            </SelectTrigger>
            <SelectContent>
              {networks.map((network) => (
                <SelectItem key={network.id} value={network.name.toLowerCase()}>
                  {network.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Protocol Addresses */}
        <div className="space-y-2">
          <Label htmlFor="protocol-address">Protocol Address</Label>
          <Input 
            id="protocol-address"
            placeholder="0x..."
            className="font-mono text-sm"
            value={protocolAddress}
            onChange={(e) => setProtocolAddress(e.target.value)}
          />
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={addProtocol}
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Protocol"}
          </Button>
        </div>

        {/* Network Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Network Status</Label>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={fetchNetworkData}
              disabled={loading}
            >
              {loading ? "Updating..." : "Refresh"}
            </Button>
          </div>
          {networks.map((network) => (
            <Card key={network.id} className="p-3 bg-card/30">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{network.name}</span>
                <Badge variant="outline" className={getStatusColor(network.status)}>
                  {network.status}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>Block: {network.current_block_height.toLocaleString()}</div>
                <div>Gas: {network.gas_price} gwei</div>
                <div>TVL: {formatTVL(network.tvl_usd)}</div>
                <div>Chain: {network.chain_id || 'N/A'}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Risk Thresholds */}
        <div className="space-y-3">
          <Label>Risk Thresholds</Label>
          <div className="space-y-2">
            <div>
              <Label className="text-xs text-muted-foreground">Volatility Tolerance</Label>
              <Progress value={75} className="h-2" />
              <span className="text-xs text-muted-foreground">75%</span>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Liquidity Requirements</Label>
              <Progress value={60} className="h-2" />
              <span className="text-xs text-muted-foreground">$50M minimum</span>
            </div>
          </div>
        </div>

        {/* Monitored Protocols */}
        <div className="space-y-3">
          <Label>Monitored Protocols</Label>
          {protocols.map((protocol, index) => (
            <Card key={index} className="p-3 bg-card/30">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{protocol.name}</span>
                <Badge variant={protocol.risk > 70 ? "destructive" : protocol.risk > 40 ? "secondary" : "outline"}>
                  Risk: {protocol.risk}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                {protocol.address}
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};