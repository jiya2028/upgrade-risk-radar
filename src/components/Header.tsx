import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Header = () => {
  return (
    <Card className="h-20 flex items-center justify-between px-6 rounded-none border-x-0 border-t-0 bg-card/50 backdrop-blur-sm">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-upgrade-warning rounded-full animate-pulse"></div>
          <h1 className="text-2xl font-bold text-primary">Protocol Upgrade Monitor</h1>
        </div>
        <Badge variant="secondary" className="bg-upgrade-success/10 text-upgrade-success border-upgrade-success/20">
          Real-time Monitoring Active
        </Badge>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="text-sm text-muted-foreground">
          Last Update: {new Date().toLocaleTimeString()}
        </div>
        <Badge variant="outline" className="border-upgrade-critical/50 text-upgrade-critical">
          3 Critical Upgrades
        </Badge>
      </div>
    </Card>
  );
};