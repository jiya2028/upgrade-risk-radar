import { NetworkMonitorPanel } from "@/components/NetworkMonitorPanel";
import { UpgradeTimelinePanel } from "@/components/UpgradeTimelinePanel";
import { ExecutionGuidancePanel } from "@/components/ExecutionGuidancePanel";
import { Header } from "@/components/Header";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 h-[calc(100vh-80px)]">
        {/* Left Panel: Network Monitoring Dashboard */}
        <div className="lg:col-span-1">
          <NetworkMonitorPanel />
        </div>
        
        {/* Center Panel: Protocol Upgrade Timeline and Risk Indicators */}
        <div className="lg:col-span-1">
          <UpgradeTimelinePanel />
        </div>
        
        {/* Right Panel: Execution Guidance and Recommendations */}
        <div className="lg:col-span-1">
          <ExecutionGuidancePanel />
        </div>
      </div>
    </div>
  );
};

export default Index;