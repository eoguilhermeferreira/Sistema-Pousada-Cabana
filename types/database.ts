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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      caixa: {
        Row: {
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      categorias_produto: {
        Row: {
          created_at: string
          id: string
          nome: string
          ordem: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          ordem?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          ordem?: number
          updated_at?: string
        }
        Relationships: []
      }
      categorias_quarto: {
        Row: {
          cor: string
          created_at: string
          id: string
          nome: string
          ordem: number
          slug: string
          updated_at: string
        }
        Insert: {
          cor: string
          created_at?: string
          id?: string
          nome: string
          ordem?: number
          slug: string
          updated_at?: string
        }
        Update: {
          cor?: string
          created_at?: string
          id?: string
          nome?: string
          ordem?: number
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      chatbot_conversas: {
        Row: {
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      comodidades: {
        Row: {
          created_at: string
          icone: string
          id: string
          nome: string
          ordem: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          icone: string
          id?: string
          nome: string
          ordem?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          icone?: string
          id?: string
          nome?: string
          ordem?: number
          updated_at?: string
        }
        Relationships: []
      }
      estoque: {
        Row: {
          created_at: string
          id: string
          motivo: string | null
          produto_id: string
          quantidade: number
          quarto_id: string | null
          reserva_id: string | null
          tipo: Database["public"]["Enums"]["tipo_movimentacao_estoque"]
          updated_at: string
          usuario_id: string | null
          valor_total: number | null
          valor_unitario: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          motivo?: string | null
          produto_id: string
          quantidade: number
          quarto_id?: string | null
          reserva_id?: string | null
          tipo: Database["public"]["Enums"]["tipo_movimentacao_estoque"]
          updated_at?: string
          usuario_id?: string | null
          valor_total?: number | null
          valor_unitario?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          motivo?: string | null
          produto_id?: string
          quantidade?: number
          quarto_id?: string | null
          reserva_id?: string | null
          tipo?: Database["public"]["Enums"]["tipo_movimentacao_estoque"]
          updated_at?: string
          usuario_id?: string | null
          valor_total?: number | null
          valor_unitario?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "estoque_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estoque_quarto_id_fkey"
            columns: ["quarto_id"]
            isOneToOne: false
            referencedRelation: "quartos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estoque_reserva_id_fkey"
            columns: ["reserva_id"]
            isOneToOne: false
            referencedRelation: "reservas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estoque_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      financeiro: {
        Row: {
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      funcionarios: {
        Row: {
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      hospedes: {
        Row: {
          bairro: string | null
          cep: string | null
          cidade: string | null
          complemento: string | null
          cpf: string
          created_at: string
          data_nascimento: string | null
          email: string | null
          empresa: string | null
          estado: string | null
          foto_url: string | null
          id: string
          nome: string
          numero: string | null
          observacoes: string | null
          profissao: string | null
          rua: string | null
          sexo: Database["public"]["Enums"]["sexo_hospede"] | null
          status: Database["public"]["Enums"]["status_hospede"]
          telefone: string
          telefone_secundario: string | null
          updated_at: string
        }
        Insert: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          cpf: string
          created_at?: string
          data_nascimento?: string | null
          email?: string | null
          empresa?: string | null
          estado?: string | null
          foto_url?: string | null
          id?: string
          nome: string
          numero?: string | null
          observacoes?: string | null
          profissao?: string | null
          rua?: string | null
          sexo?: Database["public"]["Enums"]["sexo_hospede"] | null
          status?: Database["public"]["Enums"]["status_hospede"]
          telefone: string
          telefone_secundario?: string | null
          updated_at?: string
        }
        Update: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          cpf?: string
          created_at?: string
          data_nascimento?: string | null
          email?: string | null
          empresa?: string | null
          estado?: string | null
          foto_url?: string | null
          id?: string
          nome?: string
          numero?: string | null
          observacoes?: string | null
          profissao?: string | null
          rua?: string | null
          sexo?: Database["public"]["Enums"]["sexo_hospede"] | null
          status?: Database["public"]["Enums"]["status_hospede"]
          telefone?: string
          telefone_secundario?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      mensagens: {
        Row: {
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      notas_fiscais: {
        Row: {
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      pontos: {
        Row: {
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      produtos: {
        Row: {
          ativo: boolean
          categoria_id: string
          codigo: string
          created_at: string
          descricao: string | null
          fornecedor: string | null
          id: string
          imagem_url: string | null
          nome: string
          observacoes: string | null
          quantidade: number
          unidade: string
          updated_at: string
          valor_venda: number
        }
        Insert: {
          ativo?: boolean
          categoria_id: string
          codigo: string
          created_at?: string
          descricao?: string | null
          fornecedor?: string | null
          id?: string
          imagem_url?: string | null
          nome: string
          observacoes?: string | null
          quantidade?: number
          unidade?: string
          updated_at?: string
          valor_venda?: number
        }
        Update: {
          ativo?: boolean
          categoria_id?: string
          codigo?: string
          created_at?: string
          descricao?: string | null
          fornecedor?: string | null
          id?: string
          imagem_url?: string | null
          nome?: string
          observacoes?: string | null
          quantidade?: number
          unidade?: string
          updated_at?: string
          valor_venda?: number
        }
        Relationships: [
          {
            foreignKeyName: "produtos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias_produto"
            referencedColumns: ["id"]
          },
        ]
      }
      quarto_comodidades: {
        Row: {
          comodidade_id: string
          quarto_id: string
        }
        Insert: {
          comodidade_id: string
          quarto_id: string
        }
        Update: {
          comodidade_id?: string
          quarto_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quarto_comodidades_comodidade_id_fkey"
            columns: ["comodidade_id"]
            isOneToOne: false
            referencedRelation: "comodidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quarto_comodidades_quarto_id_fkey"
            columns: ["quarto_id"]
            isOneToOne: false
            referencedRelation: "quartos"
            referencedColumns: ["id"]
          },
        ]
      }
      quarto_consumos: {
        Row: {
          created_at: string
          id: string
          produto_id: string
          quantidade: number
          quarto_id: string
          reserva_id: string | null
          updated_at: string
          usuario_id: string | null
          valor_total: number
          valor_unitario: number
        }
        Insert: {
          created_at?: string
          id?: string
          produto_id: string
          quantidade: number
          quarto_id: string
          reserva_id?: string | null
          updated_at?: string
          usuario_id?: string | null
          valor_total: number
          valor_unitario: number
        }
        Update: {
          created_at?: string
          id?: string
          produto_id?: string
          quantidade?: number
          quarto_id?: string
          reserva_id?: string | null
          updated_at?: string
          usuario_id?: string | null
          valor_total?: number
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "quarto_consumos_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quarto_consumos_quarto_id_fkey"
            columns: ["quarto_id"]
            isOneToOne: false
            referencedRelation: "quartos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quarto_consumos_reserva_id_fkey"
            columns: ["reserva_id"]
            isOneToOne: false
            referencedRelation: "reservas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quarto_consumos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      quarto_fotos: {
        Row: {
          created_at: string
          id: string
          ordem: number
          quarto_id: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          ordem?: number
          quarto_id: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          ordem?: number
          quarto_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "quarto_fotos_quarto_id_fkey"
            columns: ["quarto_id"]
            isOneToOne: false
            referencedRelation: "quartos"
            referencedColumns: ["id"]
          },
        ]
      }
      quartos: {
        Row: {
          capacidade_maxima: number
          categoria_id: string
          created_at: string
          descricao: string | null
          id: string
          numero: string
          status: Database["public"]["Enums"]["status_quarto"]
          updated_at: string
          valor_diaria: number
        }
        Insert: {
          capacidade_maxima?: number
          categoria_id: string
          created_at?: string
          descricao?: string | null
          id?: string
          numero: string
          status?: Database["public"]["Enums"]["status_quarto"]
          updated_at?: string
          valor_diaria?: number
        }
        Update: {
          capacidade_maxima?: number
          categoria_id?: string
          created_at?: string
          descricao?: string | null
          id?: string
          numero?: string
          status?: Database["public"]["Enums"]["status_quarto"]
          updated_at?: string
          valor_diaria?: number
        }
        Relationships: [
          {
            foreignKeyName: "quartos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias_quarto"
            referencedColumns: ["id"]
          },
        ]
      }
      relatorios: {
        Row: {
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      reserva_historico: {
        Row: {
          created_at: string
          descricao: string | null
          evento: string
          id: string
          reserva_id: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          evento: string
          id?: string
          reserva_id: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          evento?: string
          id?: string
          reserva_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reserva_historico_reserva_id_fkey"
            columns: ["reserva_id"]
            isOneToOne: false
            referencedRelation: "reservas"
            referencedColumns: ["id"]
          },
        ]
      }
      reserva_hospedes: {
        Row: {
          created_at: string
          id: string
          idade: number | null
          nome: string | null
          reserva_id: string
          tipo: string
          valor: number
        }
        Insert: {
          created_at?: string
          id?: string
          idade?: number | null
          nome?: string | null
          reserva_id: string
          tipo: string
          valor?: number
        }
        Update: {
          created_at?: string
          id?: string
          idade?: number | null
          nome?: string | null
          reserva_id?: string
          tipo?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "reserva_hospedes_reserva_id_fkey"
            columns: ["reserva_id"]
            isOneToOne: false
            referencedRelation: "reservas"
            referencedColumns: ["id"]
          },
        ]
      }
      reservas: {
        Row: {
          codigo: string
          created_at: string
          data_entrada: string
          data_saida: string
          hospede_principal_id: string
          id: string
          observacoes: string | null
          quantidade_adultos: number
          quantidade_criancas: number
          quarto_id: string
          status: Database["public"]["Enums"]["status_reserva"]
          updated_at: string
          valor_criancas: number
          valor_diaria: number
          valor_total: number
        }
        Insert: {
          codigo?: string
          created_at?: string
          data_entrada: string
          data_saida: string
          hospede_principal_id: string
          id?: string
          observacoes?: string | null
          quantidade_adultos?: number
          quantidade_criancas?: number
          quarto_id: string
          status?: Database["public"]["Enums"]["status_reserva"]
          updated_at?: string
          valor_criancas?: number
          valor_diaria: number
          valor_total: number
        }
        Update: {
          codigo?: string
          created_at?: string
          data_entrada?: string
          data_saida?: string
          hospede_principal_id?: string
          id?: string
          observacoes?: string | null
          quantidade_adultos?: number
          quantidade_criancas?: number
          quarto_id?: string
          status?: Database["public"]["Enums"]["status_reserva"]
          updated_at?: string
          valor_criancas?: number
          valor_diaria?: number
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "reservas_hospede_principal_id_fkey"
            columns: ["hospede_principal_id"]
            isOneToOne: false
            referencedRelation: "hospedes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservas_quarto_id_fkey"
            columns: ["quarto_id"]
            isOneToOne: false
            referencedRelation: "quartos"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          ativo: boolean
          avatar_url: string | null
          cargo: Database["public"]["Enums"]["cargo_usuario"]
          created_at: string
          email: string
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          avatar_url?: string | null
          cargo?: Database["public"]["Enums"]["cargo_usuario"]
          created_at?: string
          email: string
          id: string
          nome: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          avatar_url?: string | null
          cargo?: Database["public"]["Enums"]["cargo_usuario"]
          created_at?: string
          email?: string
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      criar_reserva_site: {
        Args: {
          p_cpf: string
          p_criancas?: Json
          p_data_entrada: string
          p_data_saida: string
          p_email: string
          p_nome: string
          p_observacoes?: string
          p_quantidade_adultos: number
          p_quarto_id: string
          p_telefone: string
        }
        Returns: {
          codigo: string
          id: string
          valor_total: number
        }[]
      }
      registrar_consumo_quarto: {
        Args: {
          p_produto_id: string
          p_quantidade: number
          p_quarto_id: string
          p_reserva_id?: string
        }
        Returns: {
          created_at: string
          id: string
          produto_id: string
          quantidade: number
          quarto_id: string
          reserva_id: string | null
          updated_at: string
          usuario_id: string | null
          valor_total: number
          valor_unitario: number
        }
      }
      registrar_movimentacao_estoque: {
        Args: {
          p_motivo?: string
          p_produto_id: string
          p_quantidade: number
          p_tipo: Database["public"]["Enums"]["tipo_movimentacao_estoque"]
        }
        Returns: {
          created_at: string
          id: string
          motivo: string | null
          produto_id: string
          quantidade: number
          quarto_id: string | null
          reserva_id: string | null
          tipo: Database["public"]["Enums"]["tipo_movimentacao_estoque"]
          updated_at: string
          usuario_id: string | null
          valor_total: number | null
          valor_unitario: number | null
        }
      }
      remover_consumo_quarto: {
        Args: { p_consumo_id: string }
        Returns: undefined
      }
    }
    Enums: {
      cargo_usuario: "administrador" | "recepcao" | "financeiro" | "limpeza"
      sexo_hospede: "masculino" | "feminino" | "outro"
      status_hospede: "ativo" | "inativo"
      status_quarto:
        | "disponivel"
        | "reservado"
        | "ocupado"
        | "limpeza"
        | "manutencao"
      status_reserva:
        | "reservada"
        | "confirmada"
        | "checkin_realizado"
        | "checkout_realizado"
        | "cancelada"
        | "no_show"
      tipo_movimentacao_estoque:
        | "entrada"
        | "saida"
        | "ajuste"
        | "perda"
        | "consumo_quarto"
        | "devolucao_quarto"
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
    Enums: {
      cargo_usuario: ["administrador", "recepcao", "financeiro", "limpeza"],
      sexo_hospede: ["masculino", "feminino", "outro"],
      status_hospede: ["ativo", "inativo"],
      status_quarto: [
        "disponivel",
        "reservado",
        "ocupado",
        "limpeza",
        "manutencao",
      ],
      status_reserva: [
        "reservada",
        "confirmada",
        "checkin_realizado",
        "checkout_realizado",
        "cancelada",
        "no_show",
      ],
      tipo_movimentacao_estoque: [
        "entrada",
        "saida",
        "ajuste",
        "perda",
        "consumo_quarto",
        "devolucao_quarto",
      ],
    },
  },
} as const
