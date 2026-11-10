export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json
          id: number
          target_id: string
          target_type: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          id?: never
          target_id: string
          target_type: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          id?: never
          target_id?: string
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_items: {
        Row: {
          amount: number
          category: string
          description: string
          id: string
          position: number
          project_id: string
        }
        Insert: {
          amount: number
          category: string
          description?: string
          id?: string
          position?: number
          project_id: string
        }
        Update: {
          amount?: number
          category?: string
          description?: string
          id?: string
          position?: number
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          id: string
          is_active: boolean
          name_en: string
          name_ru: string
          name_uz: string
          sort_order: number
        }
        Insert: {
          id: string
          is_active?: boolean
          name_en: string
          name_ru: string
          name_uz: string
          sort_order?: number
        }
        Update: {
          id?: string
          is_active?: boolean
          name_en?: string
          name_ru?: string
          name_uz?: string
          sort_order?: number
        }
        Relationships: []
      }
      comments: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          is_hidden: boolean
          parent_id: string | null
          project_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          is_hidden?: boolean
          parent_id?: string | null
          project_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          is_hidden?: boolean
          parent_id?: string | null
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          handled_at: string | null
          handled_by: string | null
          id: string
          message: string
          name: string
          status: Database["public"]["Enums"]["contact_status"]
          topic: Database["public"]["Enums"]["contact_topic"]
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          handled_at?: string | null
          handled_by?: string | null
          id?: string
          message: string
          name: string
          status?: Database["public"]["Enums"]["contact_status"]
          topic?: Database["public"]["Enums"]["contact_topic"]
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          handled_at?: string | null
          handled_by?: string | null
          id?: string
          message?: string
          name?: string
          status?: Database["public"]["Enums"]["contact_status"]
          topic?: Database["public"]["Enums"]["contact_topic"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_messages_handled_by_fkey"
            columns: ["handled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contribution_items: {
        Row: {
          contribution_id: string
          id: string
          kind: Database["public"]["Enums"]["reward_kind"]
          quantity: number
          reward_tier_id: string
          unit_amount: number
        }
        Insert: {
          contribution_id: string
          id?: string
          kind: Database["public"]["Enums"]["reward_kind"]
          quantity: number
          reward_tier_id: string
          unit_amount: number
        }
        Update: {
          contribution_id?: string
          id?: string
          kind?: Database["public"]["Enums"]["reward_kind"]
          quantity?: number
          reward_tier_id?: string
          unit_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "contribution_items_contribution_id_fkey"
            columns: ["contribution_id"]
            isOneToOne: false
            referencedRelation: "contributions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contribution_items_reward_tier_id_fkey"
            columns: ["reward_tier_id"]
            isOneToOne: false
            referencedRelation: "reward_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      contributions: {
        Row: {
          extra_amount: number
          shipping_amount: number
          amount: number
          backer_id: string
          created_at: string
          equity_share_pct: number | null
          id: string
          is_anonymous: boolean
          is_simulated: boolean
          payment_method: Database["public"]["Enums"]["payment_method"]
          project_id: string
          reward_tier_id: string | null
          status: Database["public"]["Enums"]["contribution_status"]
          charge_authorized_at: string | null
        }
        Insert: {
          extra_amount?: number
          shipping_amount?: number
          amount: number
          backer_id: string
          created_at?: string
          equity_share_pct?: number | null
          id?: string
          is_anonymous?: boolean
          is_simulated?: boolean
          payment_method: Database["public"]["Enums"]["payment_method"]
          project_id: string
          reward_tier_id?: string | null
          status?: Database["public"]["Enums"]["contribution_status"]
          charge_authorized_at?: string | null
        }
        Update: {
          extra_amount?: number
          shipping_amount?: number
          amount?: number
          backer_id?: string
          created_at?: string
          equity_share_pct?: number | null
          id?: string
          is_anonymous?: boolean
          is_simulated?: boolean
          payment_method?: Database["public"]["Enums"]["payment_method"]
          project_id?: string
          reward_tier_id?: string | null
          status?: Database["public"]["Enums"]["contribution_status"]
          charge_authorized_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contributions_backer_id_fkey"
            columns: ["backer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contributions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contributions_reward_tier_id_fkey"
            columns: ["reward_tier_id"]
            isOneToOne: false
            referencedRelation: "reward_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      equity_terms: {
        Row: {
          contract_type: Database["public"]["Enums"]["contract_type"]
          distribution_schedule: Database["public"]["Enums"]["distribution_schedule"]
          exit_horizon_years: number
          investor_profit_share_pct: number
          min_investment: number
          project_id: string
          projected_annual_return: string | null
        }
        Insert: {
          contract_type?: Database["public"]["Enums"]["contract_type"]
          distribution_schedule?: Database["public"]["Enums"]["distribution_schedule"]
          exit_horizon_years: number
          investor_profit_share_pct: number
          min_investment: number
          project_id: string
          projected_annual_return?: string | null
        }
        Update: {
          contract_type?: Database["public"]["Enums"]["contract_type"]
          distribution_schedule?: Database["public"]["Enums"]["distribution_schedule"]
          exit_horizon_years?: number
          investor_profit_share_pct?: number
          min_investment?: number
          project_id?: string
          projected_annual_return?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equity_terms_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluations: {
        Row: {
          business_plan_score: number
          confidence: Database["public"]["Enums"]["evaluation_confidence"]
          evaluated_at: string
          evaluated_by: string | null
          financial_score: number
          is_published: boolean
          market_score: number
          overall_score: number | null
          project_id: string
          risk_score: number
          risks: string[]
          strengths: string[]
          summary: string
          team_score: number
        }
        Insert: {
          business_plan_score: number
          confidence?: Database["public"]["Enums"]["evaluation_confidence"]
          evaluated_at?: string
          evaluated_by?: string | null
          financial_score: number
          is_published?: boolean
          market_score: number
          overall_score?: number | null
          project_id: string
          risk_score: number
          risks?: string[]
          strengths?: string[]
          summary?: string
          team_score: number
        }
        Update: {
          business_plan_score?: number
          confidence?: Database["public"]["Enums"]["evaluation_confidence"]
          evaluated_at?: string
          evaluated_by?: string | null
          financial_score?: number
          is_published?: boolean
          market_score?: number
          overall_score?: number | null
          project_id?: string
          risk_score?: number
          risks?: string[]
          strengths?: string[]
          summary?: string
          team_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_evaluated_by_fkey"
            columns: ["evaluated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string
          project_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          project_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      founder_identities: {
        Row: {
          birth_date: string | null
          company_name: string | null
          company_tin: string | null
          full_name: string | null
          method: Database["public"]["Enums"]["identity_method"]
          note: string | null
          passport_number: string | null
          pinfl: string | null
          user_id: string
          verified_at: string
          verified_by: string | null
        }
        Insert: {
          birth_date?: string | null
          company_name?: string | null
          company_tin?: string | null
          full_name?: string | null
          method: Database["public"]["Enums"]["identity_method"]
          note?: string | null
          passport_number?: string | null
          pinfl?: string | null
          user_id: string
          verified_at?: string
          verified_by?: string | null
        }
        Update: {
          birth_date?: string | null
          company_name?: string | null
          company_tin?: string | null
          full_name?: string | null
          method?: Database["public"]["Enums"]["identity_method"]
          note?: string | null
          passport_number?: string | null
          pinfl?: string | null
          user_id?: string
          verified_at?: string
          verified_by?: string | null
        }
        Relationships: []
      }
      founder_profiles: {
        Row: {
          bio: string | null
          created_at: string
          display_name: string
          experience_years: number | null
          is_verified: boolean
          location: string | null
          organization: string | null
          registration_number: string | null
          role_title: string | null
          updated_at: string
          user_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          display_name: string
          experience_years?: number | null
          is_verified?: boolean
          location?: string | null
          organization?: string | null
          registration_number?: string | null
          role_title?: string | null
          updated_at?: string
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          display_name?: string
          experience_years?: number | null
          is_verified?: boolean
          location?: string | null
          organization?: string | null
          registration_number?: string | null
          role_title?: string | null
          updated_at?: string
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "founder_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "founder_profiles_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          description: string
          evidence: string | null
          id: string
          position: number
          project_id: string
          release_percent: number
          review_note: string | null
          status: Database["public"]["Enums"]["milestone_status"]
          target_label: string | null
          title: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          description?: string
          evidence?: string | null
          id?: string
          position?: number
          project_id: string
          release_percent: number
          review_note?: string | null
          status?: Database["public"]["Enums"]["milestone_status"]
          target_label?: string | null
          title: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          description?: string
          evidence?: string | null
          id?: string
          position?: number
          project_id?: string
          release_percent?: number
          review_note?: string | null
          status?: Database["public"]["Enums"]["milestone_status"]
          target_label?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          data: Json
          id: string
          read_at: string | null
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json
          id?: string
          read_at?: string | null
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          read_at?: string | null
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      page_feedback: {
        Row: {
          context: Json
          created_at: string
          email: string | null
          handled_at: string | null
          handled_by: string | null
          id: string
          kind: string
          message: string
          page: string
          status: Database["public"]["Enums"]["contact_status"]
          user_id: string | null
        }
        Insert: {
          context?: Json
          created_at?: string
          email?: string | null
          handled_at?: string | null
          handled_by?: string | null
          id?: string
          kind?: string
          message: string
          page: string
          status?: Database["public"]["Enums"]["contact_status"]
          user_id?: string | null
        }
        Update: {
          context?: Json
          created_at?: string
          email?: string | null
          handled_at?: string | null
          handled_by?: string | null
          id?: string
          kind?: string
          message?: string
          page?: string
          status?: Database["public"]["Enums"]["contact_status"]
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_path: string | null
          city: string | null
          created_at: string
          full_name: string
          id: string
          is_blocked: boolean
          onboarded_at: string | null
          preferred_language: Database["public"]["Enums"]["app_language"]
          region_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          avatar_path?: string | null
          city?: string | null
          created_at?: string
          full_name?: string
          id: string
          is_blocked?: boolean
          onboarded_at?: string | null
          preferred_language?: Database["public"]["Enums"]["app_language"]
          region_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          avatar_path?: string | null
          city?: string | null
          created_at?: string
          full_name?: string
          id?: string
          is_blocked?: boolean
          onboarded_at?: string | null
          preferred_language?: Database["public"]["Enums"]["app_language"]
          region_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      project_documents: {
        Row: {
          created_at: string
          file_name: string
          id: string
          kind: Database["public"]["Enums"]["document_kind"]
          project_id: string
          storage_path: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          file_name: string
          id?: string
          kind: Database["public"]["Enums"]["document_kind"]
          project_id: string
          storage_path: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          file_name?: string
          id?: string
          kind?: Database["public"]["Enums"]["document_kind"]
          project_id?: string
          storage_path?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_translations: {
        Row: {
          language: Database["public"]["Enums"]["app_language"]
          project_id: string
          risks: string
          story: string
          summary: string
          tagline: string
          title: string
          updated_at: string
        }
        Insert: {
          language: Database["public"]["Enums"]["app_language"]
          project_id: string
          risks?: string
          story?: string
          summary?: string
          tagline?: string
          title: string
          updated_at?: string
        }
        Update: {
          language?: Database["public"]["Enums"]["app_language"]
          project_id?: string
          risks?: string
          story?: string
          summary?: string
          tagline?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_translations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_updates: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          is_hidden: boolean
          likes_count: number
          project_id: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          is_hidden?: boolean
          likes_count?: number
          project_id: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          is_hidden?: boolean
          likes_count?: number
          project_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_updates_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_updates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          allow_addons_only: boolean
          backer_count: number
          category_id: string
          cover_image_path: string | null
          created_at: string
          duration_days: number
          ends_at: string | null
          funded_percent: number | null
          id: string
          is_demo: boolean
          is_featured: boolean
          location: string | null
          min_contribution: number
          model: Database["public"]["Enums"]["funding_model"]
          original_language: Database["public"]["Enums"]["app_language"]
          organizer_type: Database["public"]["Enums"]["organizer_type"] | null
          owner_id: string
          charge_at: string | null
          pay_after_registration: boolean
          pledge_payment_due_at: string | null
          raised_amount: number
          region_id: string | null
          registration_confirmed_at: string | null
          registration_due_at: string | null
          review_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          slug: string
          starts_at: string | null
          status: Database["public"]["Enums"]["project_status"]
          submitted_at: string | null
          target_amount: number
          updated_at: string
        }
        Insert: {
          allow_addons_only?: boolean
          backer_count?: number
          category_id: string
          cover_image_path?: string | null
          created_at?: string
          duration_days?: number
          ends_at?: string | null
          funded_percent?: number | null
          id?: string
          is_demo?: boolean
          is_featured?: boolean
          location?: string | null
          min_contribution?: number
          model: Database["public"]["Enums"]["funding_model"]
          original_language?: Database["public"]["Enums"]["app_language"]
          organizer_type?: Database["public"]["Enums"]["organizer_type"] | null
          owner_id: string
          charge_at?: string | null
          pay_after_registration?: boolean
          pledge_payment_due_at?: string | null
          raised_amount?: number
          region_id?: string | null
          registration_confirmed_at?: string | null
          registration_due_at?: string | null
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          slug: string
          starts_at?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          submitted_at?: string | null
          target_amount: number
          updated_at?: string
        }
        Update: {
          allow_addons_only?: boolean
          backer_count?: number
          category_id?: string
          cover_image_path?: string | null
          created_at?: string
          duration_days?: number
          ends_at?: string | null
          funded_percent?: number | null
          id?: string
          is_demo?: boolean
          is_featured?: boolean
          location?: string | null
          min_contribution?: number
          model?: Database["public"]["Enums"]["funding_model"]
          original_language?: Database["public"]["Enums"]["app_language"]
          organizer_type?: Database["public"]["Enums"]["organizer_type"] | null
          owner_id?: string
          charge_at?: string | null
          pay_after_registration?: boolean
          pledge_payment_due_at?: string | null
          raised_amount?: number
          region_id?: string | null
          registration_confirmed_at?: string | null
          registration_due_at?: string | null
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          slug?: string
          starts_at?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          submitted_at?: string | null
          target_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      regions: {
        Row: {
          id: string
          name_en: string
          name_ru: string
          name_uz: string
          sort_order: number
        }
        Insert: {
          id: string
          name_en: string
          name_ru: string
          name_uz: string
          sort_order?: number
        }
        Update: {
          id?: string
          name_en?: string
          name_ru?: string
          name_uz?: string
          sort_order?: number
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          reason: string
          reporter_id: string
          resolved_at: string | null
          resolved_by: string | null
          status: Database["public"]["Enums"]["report_status"]
          target_id: string
          target_type: Database["public"]["Enums"]["report_target"]
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          reason: string
          reporter_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          target_id: string
          target_type: Database["public"]["Enums"]["report_target"]
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          reason?: string
          reporter_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          target_id?: string
          target_type?: Database["public"]["Enums"]["report_target"]
        }
        Relationships: [
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_components: {
        Row: {
          id: string
          name: string
          position: number
          quantity: number
          reward_tier_id: string
        }
        Insert: {
          id?: string
          name: string
          position?: number
          quantity?: number
          reward_tier_id: string
        }
        Update: {
          id?: string
          name?: string
          position?: number
          quantity?: number
          reward_tier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_components_reward_tier_id_fkey"
            columns: ["reward_tier_id"]
            isOneToOne: false
            referencedRelation: "reward_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_tiers: {
        Row: {
          available_from: string | null
          available_until: string | null
          compare_at_amount: number | null
          image_paths: string[]
          is_digital: boolean
          is_featured: boolean
          is_hidden: boolean
          kind: Database["public"]["Enums"]["reward_kind"]
          long_description: string
          per_backer_limit: number | null
          amount: number
          claimed_count: number
          description: string
          estimated_delivery: string | null
          id: string
          items: string[]
          position: number
          project_id: string
          quantity_limit: number | null
          title: string
        }
        Insert: {
          available_from?: string | null
          available_until?: string | null
          compare_at_amount?: number | null
          image_paths?: string[]
          is_digital?: boolean
          is_featured?: boolean
          is_hidden?: boolean
          kind?: Database["public"]["Enums"]["reward_kind"]
          long_description?: string
          per_backer_limit?: number | null
          amount: number
          claimed_count?: number
          description?: string
          estimated_delivery?: string | null
          id?: string
          items?: string[]
          position?: number
          project_id: string
          quantity_limit?: number | null
          title: string
        }
        Update: {
          available_from?: string | null
          available_until?: string | null
          compare_at_amount?: number | null
          image_paths?: string[]
          is_digital?: boolean
          is_featured?: boolean
          is_hidden?: boolean
          kind?: Database["public"]["Enums"]["reward_kind"]
          long_description?: string
          per_backer_limit?: number | null
          amount?: number
          claimed_count?: number
          description?: string
          estimated_delivery?: string | null
          id?: string
          items?: string[]
          position?: number
          project_id?: string
          quantity_limit?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_tiers_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      update_likes: {
        Row: {
          created_at: string
          update_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          update_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          update_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "update_likes_update_id_fkey"
            columns: ["update_id"]
            isOneToOne: false
            referencedRelation: "project_updates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "update_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_approve_milestone: {
        Args: { p_milestone_id: string }
        Returns: undefined
      }
      admin_list_users: {
        Args: { p_limit?: number; p_offset?: number; p_search?: string }
        Returns: {
          city: string
          contribution_total: number
          created_at: string
          email: string
          full_name: string
          id: string
          is_blocked: boolean
          is_founder: boolean
          onboarded: boolean
          project_count: number
          role: Database["public"]["Enums"]["app_role"]
          total_count: number
        }[]
      }
      admin_recent_comments: {
        Args: { p_limit?: number; p_only_hidden?: boolean }
        Returns: {
          author_id: string
          author_name: string
          body: string
          created_at: string
          id: string
          is_hidden: boolean
          parent_id: string
          project_id: string
          project_slug: string
        }[]
      }
      admin_resolve_report: {
        Args: {
          p_report_id: string
          p_status: Database["public"]["Enums"]["report_status"]
        }
        Returns: undefined
      }
      admin_return_milestone: {
        Args: { p_milestone_id: string; p_note: string }
        Returns: undefined
      }
      admin_review_project: {
        Args: { p_decision: string; p_note?: string; p_project_id: string }
        Returns: undefined
      }
      admin_save_evaluation: {
        Args: {
          p_business_plan_score: number
          p_confidence: Database["public"]["Enums"]["evaluation_confidence"]
          p_financial_score: number
          p_market_score: number
          p_project_id: string
          p_risk_score: number
          p_risks?: string[]
          p_strengths?: string[]
          p_summary: string
          p_team_score: number
        }
        Returns: undefined
      }
      admin_set_featured: {
        Args: { p_featured: boolean; p_project_id: string }
        Returns: undefined
      }
      admin_set_hidden: {
        Args: {
          p_hidden: boolean
          p_target: Database["public"]["Enums"]["report_target"]
          p_target_id: string
        }
        Returns: undefined
      }
      admin_set_feedback_handled: {
        Args: { p_feedback_id: string; p_handled: boolean }
        Returns: undefined
      }
      admin_set_message_handled: {
        Args: { p_handled: boolean; p_message_id: string }
        Returns: undefined
      }
      admin_set_role: {
        Args: {
          p_role: Database["public"]["Enums"]["app_role"]
          p_user_id: string
        }
        Returns: undefined
      }
      admin_set_user_blocked: {
        Args: { p_blocked: boolean; p_user_id: string }
        Returns: undefined
      }
      admin_clear_identity: { Args: { p_user_id: string }; Returns: undefined }
      admin_confirm_identity: {
        Args: { p_note?: string; p_user_id: string }
        Returns: undefined
      }
      admin_confirm_registration: {
        Args: { p_project_id: string }
        Returns: undefined
      }
      admin_verify_founder: {
        Args: { p_user_id: string; p_verified: boolean }
        Returns: undefined
      }
      contribute: {
        Args: {
          p_amount: number
          p_is_anonymous?: boolean
          p_payment_method: Database["public"]["Enums"]["payment_method"]
          p_project_id: string
          p_reward_tier_id?: string
        }
        Returns: string
      }
      contribute_cart: {
        Args: {
          p_extra_amount?: number
          p_is_anonymous?: boolean
          p_items: Json
          p_payment_method?: Database["public"]["Enums"]["payment_method"]
          p_project_id: string
        }
        Returns: string
      }
      delete_my_account: { Args: never; Returns: undefined }
      is_backer: {
        Args: { c: Database["public"]["Tables"]["comments"]["Row"] }
        Returns: boolean
      }
      mark_all_notifications_read: { Args: never; Returns: number }
      pay_pledge: {
        Args: {
          p_contribution_id: string
          p_payment_method: Database["public"]["Enums"]["payment_method"]
        }
        Returns: undefined
      }
      platform_stats: { Args: never; Returns: Json }
      telegram_link_token: { Args: never; Returns: string }
      telegram_status: { Args: never; Returns: boolean }
      telegram_unlink: { Args: never; Returns: undefined }
      recent_backers: {
        Args: { p_project_id: string; p_limit?: number }
        Returns: { first_name: string; city: string | null; backed_at: string }[]
      }
      search_project_ids: { Args: { p_query: string }; Returns: string[] }
      submit_milestone: {
        Args: { p_evidence: string; p_milestone_id: string }
        Returns: undefined
      }
      submit_project: { Args: { p_project_id: string }; Returns: undefined }
      withdraw_submission: {
        Args: { p_project_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_language: "uz" | "ru" | "en"
      app_role: "member" | "admin"
      contact_status: "new" | "handled"
      contact_topic: "general" | "founder" | "backer" | "report" | "partnership"
      contract_type: "musharakah" | "mudarabah"
      contribution_status: "confirmed" | "refunded" | "pledged" | "cancelled"
      distribution_schedule: "quarterly" | "biannually" | "annually"
      document_kind:
        | "registration"
        | "business_plan"
        | "identity"
        | "financials"
        | "other"
      evaluation_confidence: "high" | "moderate" | "in_review"
      funding_model: "donation" | "reward" | "equity"
      organizer_type: "individual" | "yatt" | "mchj" | "ngo"
      identity_method: "oneid" | "video_call"
      milestone_status: "pending" | "submitted" | "approved"
      notification_type:
        | "project_submitted"
        | "project_approved"
        | "project_changes_requested"
        | "project_rejected"
        | "project_ended"
        | "new_contribution"
        | "contribution_confirmed"
        | "new_comment"
        | "comment_reply"
        | "new_update"
        | "milestone_approved"
        | "contact_message"
        | "milestone_submitted"
        | "milestone_returned"
        | "content_reported"
        | "user_signed_up"
        | "page_feedback"
        | "pledge_payment_due"
        | "pledges_cancelled"
      payment_method: "click" | "payme" | "uzcard" | "humo" | "bank_wire"
      project_status:
        | "draft"
        | "pending_review"
        | "changes_requested"
        | "rejected"
        | "active"
        | "funded"
        | "unsuccessful"
        | "completed"
      report_status: "open" | "resolved" | "dismissed"
      report_target: "project" | "comment" | "update" | "user"
      reward_kind: "reward" | "addon"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_language: ["uz", "ru", "en"],
      app_role: ["member", "admin"],
      contact_status: ["new", "handled"],
      contact_topic: ["general", "founder", "backer", "report", "partnership"],
      contract_type: ["musharakah", "mudarabah"],
      contribution_status: ["confirmed", "refunded", "pledged", "cancelled"],
      distribution_schedule: ["quarterly", "biannually", "annually"],
      document_kind: [
        "registration",
        "business_plan",
        "identity",
        "financials",
        "other",
      ],
      evaluation_confidence: ["high", "moderate", "in_review"],
      funding_model: ["donation", "reward", "equity"],
      organizer_type: ["individual", "yatt", "mchj", "ngo"],
      identity_method: ["oneid", "video_call"],
      milestone_status: ["pending", "submitted", "approved"],
      notification_type: [
        "project_submitted",
        "project_approved",
        "project_changes_requested",
        "project_rejected",
        "project_ended",
        "new_contribution",
        "contribution_confirmed",
        "new_comment",
        "comment_reply",
        "new_update",
        "milestone_approved",
        "contact_message",
        "milestone_submitted",
        "milestone_returned",
        "content_reported",
        "user_signed_up",
        "page_feedback",
        "pledge_payment_due",
        "pledges_cancelled",
      ],
      payment_method: ["click", "payme", "uzcard", "humo", "bank_wire"],
      project_status: [
        "draft",
        "pending_review",
        "changes_requested",
        "rejected",
        "active",
        "funded",
        "unsuccessful",
        "completed",
      ],
      report_status: ["open", "resolved", "dismissed"],
      report_target: ["project", "comment", "update", "user"],
      reward_kind: ["reward", "addon"],
    },
  },
} as const
