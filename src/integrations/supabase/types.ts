export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      market_data: {
        Row: {
          id: string
          market_cap: number | null
          price_usd: number
          protocol_id: string
          timestamp: string
          volatility: number | null
          volume_24h: number | null
        }
        Insert: {
          id?: string
          market_cap?: number | null
          price_usd: number
          protocol_id: string
          timestamp?: string
          volatility?: number | null
          volume_24h?: number | null
        }
        Update: {
          id?: string
          market_cap?: number | null
          price_usd?: number
          protocol_id?: string
          timestamp?: string
          volatility?: number | null
          volume_24h?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "market_data_protocol_id_fkey"
            columns: ["protocol_id"]
            isOneToOne: false
            referencedRelation: "protocols"
            referencedColumns: ["id"]
          },
        ]
      }
      networks: {
        Row: {
          block_explorer_url: string
          chain_id: number
          created_at: string
          current_block_height: number | null
          gas_price: number | null
          id: string
          name: string
          rpc_url: string
          status: string
          tvl_usd: number | null
          updated_at: string
        }
        Insert: {
          block_explorer_url: string
          chain_id: number
          created_at?: string
          current_block_height?: number | null
          gas_price?: number | null
          id?: string
          name: string
          rpc_url: string
          status?: string
          tvl_usd?: number | null
          updated_at?: string
        }
        Update: {
          block_explorer_url?: string
          chain_id?: number
          created_at?: string
          current_block_height?: number | null
          gas_price?: number | null
          id?: string
          name?: string
          rpc_url?: string
          status?: string
          tvl_usd?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      protocol_upgrades: {
        Row: {
          created_at: string
          description: string | null
          execution_eta: string | null
          id: string
          liquidity_shift: number | null
          proposal_id: string
          protocol_id: string
          risk_score: number | null
          status: string
          title: string
          updated_at: string
          upgrade_type: string
          volatility_impact: number | null
          voting_ends_at: string | null
          voting_progress: number | null
          voting_starts_at: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          execution_eta?: string | null
          id?: string
          liquidity_shift?: number | null
          proposal_id: string
          protocol_id: string
          risk_score?: number | null
          status: string
          title: string
          updated_at?: string
          upgrade_type: string
          volatility_impact?: number | null
          voting_ends_at?: string | null
          voting_progress?: number | null
          voting_starts_at?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          execution_eta?: string | null
          id?: string
          liquidity_shift?: number | null
          proposal_id?: string
          protocol_id?: string
          risk_score?: number | null
          status?: string
          title?: string
          updated_at?: string
          upgrade_type?: string
          volatility_impact?: number | null
          voting_ends_at?: string | null
          voting_progress?: number | null
          voting_starts_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "protocol_upgrades_protocol_id_fkey"
            columns: ["protocol_id"]
            isOneToOne: false
            referencedRelation: "protocols"
            referencedColumns: ["id"]
          },
        ]
      }
      protocols: {
        Row: {
          contract_address: string
          created_at: string
          id: string
          name: string
          network_id: string
          protocol_type: string
          risk_score: number | null
          tvl_usd: number | null
          updated_at: string
        }
        Insert: {
          contract_address: string
          created_at?: string
          id?: string
          name: string
          network_id: string
          protocol_type: string
          risk_score?: number | null
          tvl_usd?: number | null
          updated_at?: string
        }
        Update: {
          contract_address?: string
          created_at?: string
          id?: string
          name?: string
          network_id?: string
          protocol_type?: string
          risk_score?: number | null
          tvl_usd?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "protocols_network_id_fkey"
            columns: ["network_id"]
            isOneToOne: false
            referencedRelation: "networks"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_assessments: {
        Row: {
          confidence_score: number | null
          created_at: string
          governance_risk: number | null
          id: string
          liquidity_risk: number | null
          market_risk: number | null
          overall_risk: number | null
          technical_risk: number | null
          upgrade_id: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          governance_risk?: number | null
          id?: string
          liquidity_risk?: number | null
          market_risk?: number | null
          overall_risk?: number | null
          technical_risk?: number | null
          upgrade_id: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          governance_risk?: number | null
          id?: string
          liquidity_risk?: number | null
          market_risk?: number | null
          overall_risk?: number | null
          technical_risk?: number | null
          upgrade_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "risk_assessments_upgrade_id_fkey"
            columns: ["upgrade_id"]
            isOneToOne: false
            referencedRelation: "protocol_upgrades"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
