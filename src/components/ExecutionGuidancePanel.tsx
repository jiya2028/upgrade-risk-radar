import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ExecutionRecommendation {
  action: "buy" | "sell" | "hold" | "hedge";
  confidence: number;
  timing: string;
  reasoning: string;
  impact: "high" | "medium" | "low";
}

interface AssetRecommendation {
  symbol: string;
  action: ExecutionRecommendation;
  currentPrice: number;
  targetPrice: number;
  allocation: number;
}

interface RiskMitigation {
  strategy: string;
  description: string;
  effectiveness: number;
  cost: string;
}

const assetRecommendations: AssetRecommendation[] = [
  {
    symbol: "UNI",
    action: {
      action: "sell",
      confidence: 85,
      timing: "Before upgrade (24-48h)",
      reasoning: "High volatility expected from governance proposal",
      impact: "high"
    },
    currentPrice: 6.45,
    targetPrice: 5.20,
    allocation: 15
  },
  {
    symbol: "COMP",
    action: {
      action: "hold",
      confidence: 72,
      timing: "Monitor closely",
      reasoning: "Upgrade likely to improve protocol efficiency",
      impact: "medium"
    },
    currentPrice: 52.30,
    targetPrice: 58.00,
    allocation: 25
  },
  {
    symbol: "AAVE",
    action: {
      action: "buy",
      confidence: 68,
      timing: "Post-upgrade confirmation",
      reasoning: "Parameter changes should improve yields",
      impact: "low"
    },
    currentPrice: 78.90,
    targetPrice: 85.40,
    allocation: 30
  }
];

const riskMitigations: RiskMitigation[] = [
  {
    strategy: "Delta Hedging",
    description: "Hedge exposure using options on major DeFi tokens",
    effectiveness: 85,
    cost: "0.5-1.2% premium"
  },
  {
    strategy: "Liquidity Diversification",
    description: "Spread positions across multiple DEXs and protocols",
    effectiveness: 72,
    cost: "Minor gas costs"
  },
  {
    strategy: "Stablecoin Buffer",
    description: "Maintain 20% allocation in stablecoins for opportunities",
    effectiveness: 60,
    cost: "Opportunity cost"
  }
];

const getActionColor = (action: string) => {
  switch (action) {
    case "buy": return "text-upgrade-success bg-upgrade-success/10 border-upgrade-success/50";
    case "sell": return "text-upgrade-critical bg-upgrade-critical/10 border-upgrade-critical/50";
    case "hold": return "text-upgrade-warning bg-upgrade-warning/10 border-upgrade-warning/50";
    case "hedge": return "text-blue-400 bg-blue-500/10 border-blue-500/50";
    default: return "text-muted-foreground";
  }
};

const getImpactColor = (impact: string) => {
  switch (impact) {
    case "high": return "text-upgrade-critical";
    case "medium": return "text-upgrade-warning";
    case "low": return "text-upgrade-success";
    default: return "text-muted-foreground";
  }
};

export const ExecutionGuidancePanel = () => {
  return (
    <Card className="h-full bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl text-primary flex items-center justify-between">
          Execution Guidance
          <Badge variant="outline" className="text-xs">AI-Powered</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Asset Pairs Selection */}
        <div className="space-y-2">
          <Label>Asset Pairs</Label>
          <Select defaultValue="defi-basket">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="defi-basket">DeFi Basket (UNI, COMP, AAVE)</SelectItem>
              <SelectItem value="governance-tokens">Governance Tokens</SelectItem>
              <SelectItem value="lending-protocols">Lending Protocols</SelectItem>
              <SelectItem value="custom">Custom Selection</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="execution" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="execution" className="text-xs">Execution</TabsTrigger>
            <TabsTrigger value="portfolio" className="text-xs">Portfolio</TabsTrigger>
            <TabsTrigger value="risk" className="text-xs">Risk</TabsTrigger>
          </TabsList>

          {/* Execution Timing */}
          <TabsContent value="execution" className="mt-4 space-y-3">
            <Card className="p-3 bg-card/20 border-border/30">
              <div className="space-y-2">
                <div className="text-sm font-medium">Optimal Execution Windows</div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">UNI Sell Window:</span>
                    <span className="font-medium">Next 24-48h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">COMP Hold Period:</span>
                    <span className="font-medium">Until upgrade</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">AAVE Buy Window:</span>
                    <span className="font-medium">Post-upgrade</span>
                  </div>
                </div>
              </div>
            </Card>

            {assetRecommendations.map((asset, index) => (
              <Card key={index} className="p-4 bg-card/30 border-border/30">
                <div className="space-y-3">
                  {/* Asset Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">{asset.symbol}</span>
                      <Badge variant="outline" className={getActionColor(asset.action.action)}>
                        {asset.action.action.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">$</span>
                      <span className="font-medium">{asset.currentPrice}</span>
                    </div>
                  </div>

                  {/* Confidence and Impact */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Confidence</div>
                      <div className="flex items-center space-x-2">
                        <Progress value={asset.action.confidence} className="h-2 flex-1" />
                        <span className="text-xs">{asset.action.confidence}%</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Impact</div>
                      <Badge variant="outline" className={getImpactColor(asset.action.impact)}>
                        {asset.action.impact}
                      </Badge>
                    </div>
                  </div>

                  {/* Timing and Reasoning */}
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Timing: {asset.action.timing}</div>
                    <div className="text-xs">{asset.action.reasoning}</div>
                  </div>

                  {/* Target Price */}
                  <div className="flex justify-between text-xs pt-2 border-t border-border/30">
                    <span className="text-muted-foreground">Target Price:</span>
                    <span className="font-medium">${asset.targetPrice}</span>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          {/* Portfolio Rebalancing */}
          <TabsContent value="portfolio" className="mt-4 space-y-3">
            <Card className="p-3 bg-card/20 border-border/30">
              <div className="space-y-2">
                <div className="text-sm font-medium">Recommended Allocation</div>
                <div className="space-y-2">
                  {assetRecommendations.map((asset, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <span>{asset.symbol}</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={asset.allocation} className="h-2 w-16" />
                        <span className="w-8 text-right">{asset.allocation}%</span>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-border/30">
                    <span className="text-muted-foreground">Cash/Stable</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={30} className="h-2 w-16" />
                      <span className="w-8 text-right">30%</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <div className="space-y-2">
              <Button className="w-full" variant="default">
                Execute Rebalancing
              </Button>
              <Button className="w-full" variant="outline">
                Simulate Impact
              </Button>
            </div>
          </TabsContent>

          {/* Risk Mitigation */}
          <TabsContent value="risk" className="mt-4 space-y-3">
            {riskMitigations.map((strategy, index) => (
              <Card key={index} className="p-4 bg-card/30 border-border/30">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{strategy.strategy}</span>
                    <Badge variant="outline">
                      {strategy.effectiveness}% effective
                    </Badge>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    {strategy.description}
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t border-border/30">
                    <span className="text-xs text-muted-foreground">Cost: {strategy.cost}</span>
                    <Progress value={strategy.effectiveness} className="h-2 w-20" />
                  </div>
                </div>
              </Card>
            ))}

            <Button className="w-full" variant="outline">
              Implement Risk Strategy
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};