import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface UpgradeEvent {
  protocol: string;
  type: "governance" | "implementation" | "parameter";
  status: "upcoming" | "active" | "completed";
  proposalId: string;
  description: string;
  timeRemaining: string;
  riskScore: number;
  volatilityImpact: number;
  liquidityShift: number;
  votingProgress?: number;
}

const upgrades: UpgradeEvent[] = [
  {
    protocol: "Uniswap V3",
    type: "governance",
    status: "active",
    proposalId: "UNI-042",
    description: "Fee tier adjustment for stablecoin pairs",
    timeRemaining: "2d 14h",
    riskScore: 85,
    volatilityImpact: 12.5,
    liquidityShift: -8.2,
    votingProgress: 67
  },
  {
    protocol: "Compound",
    type: "implementation",
    status: "upcoming",
    proposalId: "COMP-156",
    description: "Interest rate model upgrade",
    timeRemaining: "5d 8h",
    riskScore: 72,
    volatilityImpact: 18.3,
    liquidityShift: 15.6,
    votingProgress: 23
  },
  {
    protocol: "Aave V2",
    type: "parameter",
    status: "active",
    proposalId: "AIP-89",
    description: "Collateral factor adjustments",
    timeRemaining: "1d 3h",
    riskScore: 45,
    volatilityImpact: 6.8,
    liquidityShift: 3.2,
    votingProgress: 89
  }
];

const getRiskColor = (score: number) => {
  if (score >= 80) return "text-upgrade-critical bg-upgrade-critical/10 border-upgrade-critical/50";
  if (score >= 60) return "text-upgrade-warning bg-upgrade-warning/10 border-upgrade-warning/50";
  return "text-upgrade-success bg-upgrade-success/10 border-upgrade-success/50";
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "governance": return "bg-blue-500/10 text-blue-400 border-blue-500/50";
    case "implementation": return "bg-purple-500/10 text-purple-400 border-purple-500/50";
    case "parameter": return "bg-green-500/10 text-green-400 border-green-500/50";
    default: return "bg-muted";
  }
};

export const UpgradeTimelinePanel = () => {
  return (
    <Card className="h-full bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl text-primary flex items-center justify-between">
          Protocol Upgrades
          <Badge variant="outline" className="text-xs">3 Active</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Time Horizon Selection */}
        <div className="space-y-2">
          <Label>Time Horizon</Label>
          <Select defaultValue="short-term">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="short-term">Short-term (1-7 days)</SelectItem>
              <SelectItem value="medium-term">Medium-term (1-4 weeks)</SelectItem>
              <SelectItem value="long-term">Long-term (1-6 months)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Upgrade Types Filter */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="governance" className="text-xs">Gov</TabsTrigger>
            <TabsTrigger value="implementation" className="text-xs">Impl</TabsTrigger>
            <TabsTrigger value="parameter" className="text-xs">Param</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4 space-y-3">
            {upgrades.map((upgrade, index) => (
              <Card key={index} className="p-4 bg-card/30 border-border/30">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-sm">{upgrade.protocol}</span>
                      <Badge variant="outline" className={getTypeColor(upgrade.type)}>
                        {upgrade.type}
                      </Badge>
                    </div>
                    <Badge variant="outline" className={getRiskColor(upgrade.riskScore)}>
                      Risk: {upgrade.riskScore}
                    </Badge>
                  </div>

                  {/* Proposal Details */}
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground font-mono">
                      {upgrade.proposalId}
                    </div>
                    <div className="text-sm">{upgrade.description}</div>
                    <div className="text-xs text-muted-foreground">
                      Time remaining: {upgrade.timeRemaining}
                    </div>
                  </div>

                  {/* Voting Progress */}
                  {upgrade.votingProgress && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Voting Progress</span>
                        <span>{upgrade.votingProgress}%</span>
                      </div>
                      <Progress value={upgrade.votingProgress} className="h-2" />
                    </div>
                  )}

                  {/* Impact Metrics */}
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/30">
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Volatility Impact</div>
                      <div className="text-sm font-medium">
                        {upgrade.volatilityImpact > 0 ? '+' : ''}{upgrade.volatilityImpact}%
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Liquidity Shift</div>
                      <div className="text-sm font-medium">
                        {upgrade.liquidityShift > 0 ? '+' : ''}{upgrade.liquidityShift}%
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          {/* Other tab contents would filter the upgrades array */}
          <TabsContent value="governance" className="mt-4 space-y-3">
            {upgrades.filter(u => u.type === "governance").map((upgrade, index) => (
              <Card key={index} className="p-4 bg-card/30 border-border/30">
                {/* Same card structure as above */}
                <div className="text-sm">{upgrade.protocol} - {upgrade.description}</div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        {/* Risk Indicators Summary */}
        <Card className="p-3 bg-card/20 border-border/30">
          <div className="space-y-2">
            <div className="text-sm font-medium">Risk Indicators Summary</div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="text-upgrade-critical font-medium">3</div>
                <div className="text-muted-foreground">High Risk</div>
              </div>
              <div className="text-center">
                <div className="text-upgrade-warning font-medium">2</div>
                <div className="text-muted-foreground">Medium Risk</div>
              </div>
              <div className="text-center">
                <div className="text-upgrade-success font-medium">1</div>
                <div className="text-muted-foreground">Low Risk</div>
              </div>
            </div>
          </div>
        </Card>
      </CardContent>
    </Card>
  );
};
