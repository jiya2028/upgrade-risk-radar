import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UpgradeEvent {
  id: string;
  protocol: string;
  type: "governance" | "implementation" | "parameter";
  status: "upcoming" | "active" | "completed" | "failed";
  proposalId: string;
  description: string;
  timeRemaining: string;
  riskScore: number;
  volatilityImpact: number;
  liquidityShift: number;
  votingProgress?: number;
  voting_ends_at?: string;
  execution_eta?: string;
}

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
  const [upgrades, setUpgrades] = useState<UpgradeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeHorizon, setSelectedTimeHorizon] = useState("short-term");
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  // Fetch protocol upgrades from database
  const fetchUpgrades = async () => {
    try {
      const { data: upgradesData, error } = await supabase
        .from('protocol_upgrades')
        .select(`
          *,
          protocols!inner(name, protocol_type)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data and calculate time remaining
      const transformedUpgrades = upgradesData?.map(upgrade => {
        const votingEnds = upgrade.voting_ends_at ? new Date(upgrade.voting_ends_at) : null;
        const executionEta = upgrade.execution_eta ? new Date(upgrade.execution_eta) : null;
        const now = new Date();
        
        let timeRemaining = "N/A";
        if (votingEnds && votingEnds > now) {
          const diff = votingEnds.getTime() - now.getTime();
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          timeRemaining = `${days}d ${hours}h`;
        } else if (executionEta && executionEta > now) {
          const diff = executionEta.getTime() - now.getTime();
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          timeRemaining = `${days}d ${hours}h`;
        }

        return {
          id: upgrade.id,
          protocol: upgrade.protocols?.name || "Unknown",
          type: upgrade.upgrade_type as "governance" | "implementation" | "parameter",
          status: upgrade.status as "upcoming" | "active" | "completed" | "failed",
          proposalId: upgrade.proposal_id,
          description: upgrade.description || upgrade.title,
          timeRemaining,
          riskScore: upgrade.risk_score || 0,
          volatilityImpact: Number(upgrade.volatility_impact) || 0,
          liquidityShift: Number(upgrade.liquidity_shift) || 0,
          votingProgress: Number(upgrade.voting_progress) || 0,
          voting_ends_at: upgrade.voting_ends_at,
          execution_eta: upgrade.execution_eta
        };
      }) || [];

      setUpgrades(transformedUpgrades);
    } catch (error) {
      console.error('Error fetching upgrades:', error);
      toast({
        title: "Error",
        description: "Failed to fetch protocol upgrades",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch governance proposals from blockchain monitor
  const fetchGovernanceProposals = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('blockchain-monitor', {
        body: { action: 'fetch_governance' }
      });

      if (error) throw error;

      if (data?.success && data?.proposals) {
        // Add governance proposals to the state
        const governanceUpgrades = data.proposals.map((proposal: any) => ({
          id: `governance-${proposal.id}`,
          protocol: proposal.protocol,
          type: proposal.type,
          status: proposal.status,
          proposalId: proposal.id,
          description: proposal.title,
          timeRemaining: proposal.timeRemaining,
          riskScore: proposal.riskScore,
          volatilityImpact: proposal.volatilityImpact,
          liquidityShift: proposal.liquidityShift,
          votingProgress: proposal.votingProgress
        }));

        setUpgrades(prev => [...prev, ...governanceUpgrades]);
      }
    } catch (error) {
      console.error('Error fetching governance proposals:', error);
    }
  };

  useEffect(() => {
    fetchUpgrades();
    fetchGovernanceProposals();

    // Set up real-time subscription for protocol upgrades
    const channel = supabase
      .channel('protocol-upgrades-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'protocol_upgrades'
        },
        () => {
          fetchUpgrades(); // Refetch data on changes
        }
      )
      .subscribe();

    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      fetchGovernanceProposals();
    }, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  // Filter upgrades based on active tab
  const filteredUpgrades = upgrades.filter(upgrade => {
    if (activeTab === "all") return true;
    return upgrade.type === activeTab;
  });

  const riskCounts = {
    high: upgrades.filter(u => u.riskScore >= 80).length,
    medium: upgrades.filter(u => u.riskScore >= 60 && u.riskScore < 80).length,
    low: upgrades.filter(u => u.riskScore < 60).length
  };

  if (loading) {
    return (
      <Card className="h-full bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-muted-foreground">Loading protocol upgrades...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl text-primary flex items-center justify-between">
          Protocol Upgrades
          <Badge variant="outline" className="text-xs">{upgrades.filter(u => u.status === 'active').length} Active</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Time Horizon Selection */}
        <div className="space-y-2">
          <Label>Time Horizon</Label>
          <Select value={selectedTimeHorizon} onValueChange={setSelectedTimeHorizon}>
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="text-xs">All ({upgrades.length})</TabsTrigger>
            <TabsTrigger value="governance" className="text-xs">Gov</TabsTrigger>
            <TabsTrigger value="implementation" className="text-xs">Impl</TabsTrigger>
            <TabsTrigger value="parameter" className="text-xs">Param</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4 space-y-3">
            {filteredUpgrades.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No {activeTab === "all" ? "" : activeTab} upgrades found
              </div>
            ) : (
              filteredUpgrades.map((upgrade, index) => (
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
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Risk Indicators Summary */}
        <Card className="p-3 bg-card/20 border-border/30">
          <div className="space-y-2">
            <div className="text-sm font-medium">Risk Indicators Summary</div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="text-upgrade-critical font-medium">{riskCounts.high}</div>
                <div className="text-muted-foreground">High Risk</div>
              </div>
              <div className="text-center">
                <div className="text-upgrade-warning font-medium">{riskCounts.medium}</div>
                <div className="text-muted-foreground">Medium Risk</div>
              </div>
              <div className="text-center">
                <div className="text-upgrade-success font-medium">{riskCounts.low}</div>
                <div className="text-muted-foreground">Low Risk</div>
              </div>
            </div>
          </div>
        </Card>
      </CardContent>
    </Card>
  );
};
