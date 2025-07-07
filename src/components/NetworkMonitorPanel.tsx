import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

interface NetworkStatus {
  name: string;
  status: "active" | "warning" | "critical";
  blockHeight: number;
  gasPrice: number;
  tvl: string;
  upgrades: number;
}

const networks: NetworkStatus[] = [
  { name: "Ethereum", status: "warning", blockHeight: 18842156, gasPrice: 25, tvl: "$24.8B", upgrades: 2 },
  { name: "Polygon", status: "active", blockHeight: 50123789, gasPrice: 30, tvl: "$1.2B", upgrades: 0 },
  { name: "Arbitrum", status: "critical", blockHeight: 156789123, gasPrice: 0.1, tvl: "$2.1B", upgrades: 1 },
  { name: "Bitcoin", status: "active", blockHeight: 819456, gasPrice: 15, tvl: "$45.2B", upgrades: 0 },
];

const protocols = [
  { address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", name: "Uniswap V3", risk: 85 },
  { address: "0xA0b86a33E6441d8A2F4F5C87094A16E8b03F85E9", name: "Compound", risk: 62 },
  { address: "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9", name: "Aave V2", risk: 45 },
];

export const NetworkMonitorPanel = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-upgrade-success border-upgrade-success/50 bg-upgrade-success/10";
      case "warning": return "text-upgrade-warning border-upgrade-warning/50 bg-upgrade-warning/10";
      case "critical": return "text-upgrade-critical border-upgrade-critical/50 bg-upgrade-critical/10";
      default: return "text-muted-foreground";
    }
  };

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
          <Select defaultValue="ethereum">
            <SelectTrigger id="network-select">
              <SelectValue placeholder="Select network" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ethereum">Ethereum</SelectItem>
              <SelectItem value="polygon">Polygon</SelectItem>
              <SelectItem value="arbitrum">Arbitrum</SelectItem>
              <SelectItem value="bitcoin">Bitcoin</SelectItem>
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
          />
          <Button variant="outline" size="sm" className="w-full">
            Add Protocol
          </Button>
        </div>

        {/* Network Status */}
        <div className="space-y-3">
          <Label>Network Status</Label>
          {networks.map((network) => (
            <Card key={network.name} className="p-3 bg-card/30">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{network.name}</span>
                <Badge variant="outline" className={getStatusColor(network.status)}>
                  {network.status}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>Block: {network.blockHeight.toLocaleString()}</div>
                <div>Gas: {network.gasPrice} gwei</div>
                <div>TVL: {network.tvl}</div>
                <div>Upgrades: {network.upgrades}</div>
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