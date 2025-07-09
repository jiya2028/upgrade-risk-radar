import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface NetworkData {
  id: string;
  name: string;
  status: 'active' | 'warning' | 'critical';
  current_block_height: number;
  gas_price: number;
  tvl_usd: number;
}

export interface ProtocolData {
  id: string;
  name: string;
  tvl_usd: number;
  risk_score: number;
  protocol_type: string;
  network: {
    name: string;
    status: string;
  };
}

export const useProtocolData = () => {
  const [networks, setNetworks] = useState<NetworkData[]>([]);
  const [protocols, setProtocols] = useState<ProtocolData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchNetworks = async () => {
    try {
      const { data, error } = await supabase
        .from('networks')
        .select('*')
        .order('tvl_usd', { ascending: false });

      if (error) throw error;
      
      const transformedNetworks: NetworkData[] = (data || []).map(network => ({
        id: network.id,
        name: network.name,
        status: network.status as 'active' | 'warning' | 'critical',
        current_block_height: network.current_block_height || 0,
        gas_price: Number(network.gas_price) || 0,
        tvl_usd: Number(network.tvl_usd) || 0
      }));
      
      setNetworks(transformedNetworks);
    } catch (error) {
      console.error('Error fetching networks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch network data",
        variant: "destructive"
      });
    }
  };

  const fetchProtocols = async () => {
    try {
      const { data, error } = await supabase
        .from('protocols')
        .select(`
          *,
          networks!inner(name, status)
        `)
        .order('tvl_usd', { ascending: false });

      if (error) throw error;

      const transformedProtocols = data?.map(protocol => ({
        id: protocol.id,
        name: protocol.name,
        tvl_usd: Number(protocol.tvl_usd) || 0,
        risk_score: protocol.risk_score || 0,
        protocol_type: protocol.protocol_type,
        network: {
          name: protocol.networks?.name || 'Unknown',
          status: protocol.networks?.status || 'active'
        }
      })) || [];

      setProtocols(transformedProtocols);
    } catch (error) {
      console.error('Error fetching protocols:', error);
      toast({
        title: "Error",
        description: "Failed to fetch protocol data",
        variant: "destructive"
      });
    }
  };

  const updateNetworkStatus = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('blockchain-monitor', {
        body: { action: 'monitor_networks' }
      });

      if (error) throw error;

      if (data?.success) {
        console.log('Network monitoring update completed');
        fetchNetworks(); // Refresh network data
      }
    } catch (error) {
      console.error('Error updating network status:', error);
    }
  };

  const seedInitialData = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('data-seeder');
      
      if (error) throw error;

      if (data?.success) {
        console.log('Initial data seeded successfully');
        fetchNetworks();
        fetchProtocols();
      }
    } catch (error) {
      console.error('Error seeding data:', error);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await fetchNetworks();
      await fetchProtocols();
      
      // Check if we have protocols, if not, seed initial data
      const { count: protocolCount } = await supabase
        .from('protocols')
        .select('*', { count: 'exact', head: true });

      if (!protocolCount || protocolCount === 0) {
        await seedInitialData();
      }

      setLoading(false);
    };

    initializeData();

    // Set up real-time subscriptions
    const networksChannel = supabase
      .channel('networks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'networks'
        },
        () => fetchNetworks()
      )
      .subscribe();

    const protocolsChannel = supabase
      .channel('protocols-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'protocols'
        },
        () => fetchProtocols()
      )
      .subscribe();

    // Update network status every minute
    const networkInterval = setInterval(updateNetworkStatus, 60000);

    return () => {
      supabase.removeChannel(networksChannel);
      supabase.removeChannel(protocolsChannel);
      clearInterval(networkInterval);
    };
  }, []);

  return {
    networks,
    protocols,
    loading,
    refreshData: () => {
      fetchNetworks();
      fetchProtocols();
    }
  };
};