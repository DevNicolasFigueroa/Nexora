/**
 * Supabase database types.
 *
 * ⚠️ Manually maintained reference file: regenerate after every migration with:
 *     supabase gen types typescript --local > src/lib/types/database.ts
 * (the database schema will be created in a later phase)
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/** Roles available inside an organization. */
export type Role = "owner" | "member";

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          organization_id: string;
          full_name: string | null;
          role: Role;
          created_at: string;
        };
        Insert: {
          id: string;
          organization_id: string;
          full_name?: string | null;
          role?: Role;
          created_at?: string;
        };
        Update: {
          organization_id?: string;
          full_name?: string | null;
          role?: Role;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

/** Utility types derived from the schema. */
export type Organization = Database["public"]["Tables"]["organizations"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
