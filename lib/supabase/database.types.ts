export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      admin_invites: {
        Row: {
          created_at: string;
          email: string;
        };
        Insert: {
          created_at?: string;
          email: string;
        };
        Update: {
          created_at?: string;
          email?: string;
        };
        Relationships: [];
      };
      ethics_cases: {
        Row: {
          author_id: string;
          content_type: "text" | "pdf" | "link";
          content_value: string;
          cover_path: string | null;
          cover_url: string | null;
          created_at: string;
          detail: string;
          id: string;
          is_published: boolean;
          published_at: string | null;
          slug: string;
          summary: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          author_id: string;
          content_type: "text" | "pdf" | "link";
          content_value: string;
          cover_path?: string | null;
          cover_url?: string | null;
          created_at?: string;
          detail: string;
          id?: string;
          is_published?: boolean;
          published_at?: string | null;
          slug: string;
          summary: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          author_id?: string;
          content_type?: "text" | "pdf" | "link";
          content_value?: string;
          cover_path?: string | null;
          cover_url?: string | null;
          created_at?: string;
          detail?: string;
          id?: string;
          is_published?: boolean;
          published_at?: string | null;
          slug?: string;
          summary?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ethics_cases_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      module_contents: {
        Row: {
          content_data: Json;
          created_at: string;
          id: string;
          module_id: string;
          sequence: number;
          summary: string | null;
          title: string;
          type: "text" | "image" | "youtube" | "link" | "pdf";
          updated_at: string;
        };
        Insert: {
          content_data?: Json;
          created_at?: string;
          id?: string;
          module_id: string;
          sequence: number;
          summary?: string | null;
          title: string;
          type: "text" | "image" | "youtube" | "link" | "pdf";
          updated_at?: string;
        };
        Update: {
          content_data?: Json;
          created_at?: string;
          id?: string;
          module_id?: string;
          sequence?: number;
          summary?: string | null;
          title?: string;
          type?: "text" | "image" | "youtube" | "link" | "pdf";
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "module_contents_module_id_fkey";
            columns: ["module_id"];
            isOneToOne: false;
            referencedRelation: "modules";
            referencedColumns: ["id"];
          },
        ];
      };
      modules: {
        Row: {
          author_id: string;
          created_at: string;
          estimated_duration_minutes: number;
          id: string;
          is_featured: boolean;
          is_published: boolean;
          learning_objectives: string[];
          level: string;
          opening_narrative: string;
          short_description: string;
          slug: string;
          thumbnail_path: string | null;
          thumbnail_url: string | null;
          title: string;
          track: string;
          updated_at: string;
        };
        Insert: {
          author_id: string;
          created_at?: string;
          estimated_duration_minutes?: number;
          id?: string;
          is_featured?: boolean;
          is_published?: boolean;
          learning_objectives?: string[];
          level?: string;
          opening_narrative: string;
          short_description: string;
          slug: string;
          thumbnail_path?: string | null;
          thumbnail_url?: string | null;
          title: string;
          track?: string;
          updated_at?: string;
        };
        Update: {
          author_id?: string;
          created_at?: string;
          estimated_duration_minutes?: number;
          id?: string;
          is_featured?: boolean;
          is_published?: boolean;
          learning_objectives?: string[];
          level?: string;
          opening_narrative?: string;
          short_description?: string;
          slug?: string;
          thumbnail_path?: string | null;
          thumbnail_url?: string | null;
          title?: string;
          track?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "modules_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      users: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email: string;
          id: string;
          name: string;
          role: "admin" | "student";
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email: string;
          id: string;
          name: string;
          role?: "admin" | "student";
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string;
          id?: string;
          name?: string;
          role?: "admin" | "student";
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      app_role: "admin" | "student";
      ethics_case_content_type: "text" | "pdf" | "link";
      module_content_type: "text" | "image" | "youtube" | "link" | "pdf";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
