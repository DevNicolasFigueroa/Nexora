/**
 * Tipos de la base de datos de Supabase.
 *
 * ⚠️ Archivo de referencia manual: regenerar tras cada migración con:
 *     supabase gen types typescript --local > src/lib/types/database.ts
 * (el esquema de base de datos se definirá en una fase posterior)
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/** Roles disponibles dentro de una organización. */
export type Rol = "propietario" | "administrador" | "miembro";

export interface Database {
  public: {
    Tables: {
      organizaciones: {
        Row: {
          id: string;
          nombre: string;
          slug: string;
          creado_en: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          slug: string;
          creado_en?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          slug?: string;
          creado_en?: string;
        };
        Relationships: [];
      };
      perfiles: {
        Row: {
          id: string;
          organizacion_id: string;
          nombre_completo: string | null;
          rol: Rol;
          creado_en: string;
        };
        Insert: {
          id: string;
          organizacion_id: string;
          nombre_completo?: string | null;
          rol?: Rol;
          creado_en?: string;
        };
        Update: {
          organizacion_id?: string;
          nombre_completo?: string | null;
          rol?: Rol;
          creado_en?: string;
        };
        Relationships: [
          {
            foreignKeyName: "perfiles_organizacion_id_fkey";
            columns: ["organizacion_id"];
            isOneToOne: false;
            referencedRelation: "organizaciones";
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

/** Tipos de utilidad derivados del esquema. */
export type Organizacion = Database["public"]["Tables"]["organizaciones"]["Row"];
export type Perfil = Database["public"]["Tables"]["perfiles"]["Row"];
