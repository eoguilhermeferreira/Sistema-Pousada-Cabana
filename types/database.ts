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
      backups: {
        Row: {
          created_at: string
          gerado_por: string | null
          id: string
          tabelas: Json | null
          tamanho_bytes: number
        }
        Insert: {
          created_at?: string
          gerado_por?: string | null
          id?: string
          tabelas?: Json | null
          tamanho_bytes?: number
        }
        Update: {
          created_at?: string
          gerado_por?: string | null
          id?: string
          tabelas?: Json | null
          tamanho_bytes?: number
        }
        Relationships: [
          {
            foreignKeyName: "backups_gerado_por_fkey"
            columns: ["gerado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      caixa: {
        Row: {
          aberto_em: string
          aberto_por: string | null
          created_at: string
          diferenca: number | null
          fechado_em: string | null
          fechado_por: string | null
          funcionario_nome: string
          id: string
          observacao_abertura: string | null
          observacao_fechamento: string | null
          status: string
          updated_at: string
          valor_contado: number | null
          valor_esperado: number | null
          valor_inicial: number
        }
        Insert: {
          aberto_em?: string
          aberto_por?: string | null
          created_at?: string
          diferenca?: number | null
          fechado_em?: string | null
          fechado_por?: string | null
          funcionario_nome: string
          id?: string
          observacao_abertura?: string | null
          observacao_fechamento?: string | null
          status?: string
          updated_at?: string
          valor_contado?: number | null
          valor_esperado?: number | null
          valor_inicial?: number
        }
        Update: {
          aberto_em?: string
          aberto_por?: string | null
          created_at?: string
          diferenca?: number | null
          fechado_em?: string | null
          fechado_por?: string | null
          funcionario_nome?: string
          id?: string
          observacao_abertura?: string | null
          observacao_fechamento?: string | null
          status?: string
          updated_at?: string
          valor_contado?: number | null
          valor_esperado?: number | null
          valor_inicial?: number
        }
        Relationships: [
          {
            foreignKeyName: "caixa_aberto_por_fkey"
            columns: ["aberto_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "caixa_fechado_por_fkey"
            columns: ["fechado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      caixa_movimentacoes: {
        Row: {
          caixa_id: string
          created_at: string
          descricao: string | null
          id: string
          origem: string
          pagamento_id: string | null
          tipo: string
          usuario_id: string | null
          valor: number
        }
        Insert: {
          caixa_id: string
          created_at?: string
          descricao?: string | null
          id?: string
          origem: string
          pagamento_id?: string | null
          tipo: string
          usuario_id?: string | null
          valor: number
        }
        Update: {
          caixa_id?: string
          created_at?: string
          descricao?: string | null
          id?: string
          origem?: string
          pagamento_id?: string | null
          tipo?: string
          usuario_id?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "caixa_movimentacoes_caixa_id_fkey"
            columns: ["caixa_id"]
            isOneToOne: false
            referencedRelation: "caixa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "caixa_movimentacoes_pagamento_id_fkey"
            columns: ["pagamento_id"]
            isOneToOne: false
            referencedRelation: "pagamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "caixa_movimentacoes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
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
          aguardando_humano: boolean
          atendido_por: string | null
          canal: string
          created_at: string
          hospede_nome: string | null
          hospede_telefone: string | null
          id: string
          identificador_externo: string | null
          status: string
          ultima_mensagem: string | null
          ultima_mensagem_em: string | null
          updated_at: string
        }
        Insert: {
          aguardando_humano?: boolean
          atendido_por?: string | null
          canal?: string
          created_at?: string
          hospede_nome?: string | null
          hospede_telefone?: string | null
          id?: string
          identificador_externo?: string | null
          status?: string
          ultima_mensagem?: string | null
          ultima_mensagem_em?: string | null
          updated_at?: string
        }
        Update: {
          aguardando_humano?: boolean
          atendido_por?: string | null
          canal?: string
          created_at?: string
          hospede_nome?: string | null
          hospede_telefone?: string | null
          id?: string
          identificador_externo?: string | null
          status?: string
          ultima_mensagem?: string | null
          ultima_mensagem_em?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_conversas_atendido_por_fkey"
            columns: ["atendido_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_mensagens: {
        Row: {
          conteudo: string
          conversa_id: string
          created_at: string
          enviada_por: string | null
          id: string
          remetente: string
        }
        Insert: {
          conteudo: string
          conversa_id: string
          created_at?: string
          enviada_por?: string | null
          id?: string
          remetente: string
        }
        Update: {
          conteudo?: string
          conversa_id?: string
          created_at?: string
          enviada_por?: string | null
          id?: string
          remetente?: string
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_mensagens_conversa_id_fkey"
            columns: ["conversa_id"]
            isOneToOne: false
            referencedRelation: "chatbot_conversas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chatbot_mensagens_enviada_por_fkey"
            columns: ["enviada_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          cpf: string
          created_at: string
          email: string
          id: string
          nome: string
          telefone: string
          updated_at: string
        }
        Insert: {
          cpf: string
          created_at?: string
          email: string
          id: string
          nome: string
          telefone: string
          updated_at?: string
        }
        Update: {
          cpf?: string
          created_at?: string
          email?: string
          id?: string
          nome?: string
          telefone?: string
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
      empresa_configuracoes: {
        Row: {
          cep: string
          cidade: string
          cnpj: string
          codigo_atividade: string | null
          codigo_servico_municipal: string | null
          created_at: string
          email: string
          endereco: string
          estado: string
          id: string
          incentivador_cultural: boolean | null
          inscricao_municipal: string
          iss_aliquota_padrao: number | null
          iss_retido: boolean
          item_lc116: string | null
          municipio_incidencia: string | null
          nome_fantasia: string
          optante_simples_nacional: boolean | null
          razao_social: string
          regime_especial_tributacao: string | null
          regime_tributario: string | null
          telefone: string
          updated_at: string
        }
        Insert: {
          cep?: string
          cidade?: string
          cnpj?: string
          codigo_atividade?: string | null
          codigo_servico_municipal?: string | null
          created_at?: string
          email?: string
          endereco?: string
          estado?: string
          id?: string
          incentivador_cultural?: boolean | null
          inscricao_municipal?: string
          iss_aliquota_padrao?: number | null
          iss_retido?: boolean
          item_lc116?: string | null
          municipio_incidencia?: string | null
          nome_fantasia?: string
          optante_simples_nacional?: boolean | null
          razao_social?: string
          regime_especial_tributacao?: string | null
          regime_tributario?: string | null
          telefone?: string
          updated_at?: string
        }
        Update: {
          cep?: string
          cidade?: string
          cnpj?: string
          codigo_atividade?: string | null
          codigo_servico_municipal?: string | null
          created_at?: string
          email?: string
          endereco?: string
          estado?: string
          id?: string
          incentivador_cultural?: boolean | null
          inscricao_municipal?: string
          iss_aliquota_padrao?: number | null
          iss_retido?: boolean
          item_lc116?: string | null
          municipio_incidencia?: string | null
          nome_fantasia?: string
          optante_simples_nacional?: boolean | null
          razao_social?: string
          regime_especial_tributacao?: string | null
          regime_tributario?: string | null
          telefone?: string
          updated_at?: string
        }
        Relationships: []
      }
      estoque: {
        Row: {
          created_at: string
          funcionario_id: string | null
          id: string
          localizacao: Database["public"]["Enums"]["localizacao_estoque"] | null
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
          venda_balcao_id: string | null
        }
        Insert: {
          created_at?: string
          funcionario_id?: string | null
          id?: string
          localizacao?: Database["public"]["Enums"]["localizacao_estoque"] | null
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
          venda_balcao_id?: string | null
        }
        Update: {
          created_at?: string
          funcionario_id?: string | null
          id?: string
          localizacao?: Database["public"]["Enums"]["localizacao_estoque"] | null
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
          venda_balcao_id?: string | null
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
          {
            foreignKeyName: "estoque_funcionario_id_fkey"
            columns: ["funcionario_id"]
            isOneToOne: false
            referencedRelation: "funcionarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estoque_venda_balcao_id_fkey"
            columns: ["venda_balcao_id"]
            isOneToOne: false
            referencedRelation: "vendas_balcao"
            referencedColumns: ["id"]
          },
        ]
      }
      financeiro: {
        Row: {
          caixa_id: string | null
          categoria: string
          created_at: string
          descricao: string | null
          id: string
          pagamento_id: string | null
          reserva_id: string | null
          tipo: string
          updated_at: string
          usuario_id: string | null
          valor: number
        }
        Insert: {
          caixa_id?: string | null
          categoria: string
          created_at?: string
          descricao?: string | null
          id?: string
          pagamento_id?: string | null
          reserva_id?: string | null
          tipo: string
          updated_at?: string
          usuario_id?: string | null
          valor: number
        }
        Update: {
          caixa_id?: string | null
          categoria?: string
          created_at?: string
          descricao?: string | null
          id?: string
          pagamento_id?: string | null
          reserva_id?: string | null
          tipo?: string
          updated_at?: string
          usuario_id?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "financeiro_caixa_id_fkey"
            columns: ["caixa_id"]
            isOneToOne: false
            referencedRelation: "caixa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_pagamento_id_fkey"
            columns: ["pagamento_id"]
            isOneToOne: false
            referencedRelation: "pagamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_reserva_id_fkey"
            columns: ["reserva_id"]
            isOneToOne: false
            referencedRelation: "reservas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      funcionario_adiantamentos: {
        Row: {
          created_at: string
          funcionario_id: string
          id: string
          observacao: string | null
          registrado_por: string | null
          valor: number
        }
        Insert: {
          created_at?: string
          funcionario_id: string
          id?: string
          observacao?: string | null
          registrado_por?: string | null
          valor: number
        }
        Update: {
          created_at?: string
          funcionario_id?: string
          id?: string
          observacao?: string | null
          registrado_por?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "funcionario_adiantamentos_funcionario_id_fkey"
            columns: ["funcionario_id"]
            isOneToOne: false
            referencedRelation: "funcionarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funcionario_adiantamentos_funcionario_id_fkey"
            columns: ["funcionario_id"]
            isOneToOne: false
            referencedRelation: "funcionarios_visivel"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funcionario_adiantamentos_registrado_por_fkey"
            columns: ["registrado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      funcionario_consumos: {
        Row: {
          created_at: string
          funcionario_id: string
          id: string
          produto_id: string
          quantidade: number
          registrado_por: string | null
          valor_total: number
          valor_unitario: number
        }
        Insert: {
          created_at?: string
          funcionario_id: string
          id?: string
          produto_id: string
          quantidade: number
          registrado_por?: string | null
          valor_total: number
          valor_unitario: number
        }
        Update: {
          created_at?: string
          funcionario_id?: string
          id?: string
          produto_id?: string
          quantidade?: number
          registrado_por?: string | null
          valor_total?: number
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "funcionario_consumos_funcionario_id_fkey"
            columns: ["funcionario_id"]
            isOneToOne: false
            referencedRelation: "funcionarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funcionario_consumos_funcionario_id_fkey"
            columns: ["funcionario_id"]
            isOneToOne: false
            referencedRelation: "funcionarios_visivel"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funcionario_consumos_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funcionario_consumos_registrado_por_fkey"
            columns: ["registrado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      funcionario_historico: {
        Row: {
          created_at: string
          descricao: string | null
          evento: string
          funcionario_id: string
          id: string
          usuario_id: string | null
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          evento: string
          funcionario_id: string
          id?: string
          usuario_id?: string | null
        }
        Update: {
          created_at?: string
          descricao?: string | null
          evento?: string
          funcionario_id?: string
          id?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "funcionario_historico_funcionario_id_fkey"
            columns: ["funcionario_id"]
            isOneToOne: false
            referencedRelation: "funcionarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funcionario_historico_funcionario_id_fkey"
            columns: ["funcionario_id"]
            isOneToOne: false
            referencedRelation: "funcionarios_visivel"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funcionario_historico_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      funcionario_templates_faciais: {
        Row: {
          capturado_em: string
          created_at: string
          descritor: Json
          funcionario_id: string
          id: string
        }
        Insert: {
          capturado_em?: string
          created_at?: string
          descritor: Json
          funcionario_id: string
          id?: string
        }
        Update: {
          capturado_em?: string
          created_at?: string
          descritor?: Json
          funcionario_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "funcionario_templates_faciais_funcionario_id_fkey"
            columns: ["funcionario_id"]
            isOneToOne: false
            referencedRelation: "funcionarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funcionario_templates_faciais_funcionario_id_fkey"
            columns: ["funcionario_id"]
            isOneToOne: false
            referencedRelation: "funcionarios_visivel"
            referencedColumns: ["id"]
          },
        ]
      }
      funcionarios: {
        Row: {
          bairro: string | null
          cargo: Database["public"]["Enums"]["cargo_usuario"]
          cep: string | null
          cidade: string | null
          complemento: string | null
          cpf: string
          created_at: string
          data_admissao: string
          data_nascimento: string | null
          duracao_almoco_minutos: number | null
          email: string | null
          estado: string | null
          foto_url: string | null
          horario_entrada: string | null
          horario_saida: string | null
          horario_saida_almoco: string | null
          id: string
          nome: string
          numero: string | null
          observacoes: string | null
          pin_ponto_hash: string | null
          rg: string | null
          rua: string | null
          salario: number | null
          status: string
          telefone: string
          turno: string
          updated_at: string
          usuario_id: string | null
        }
        Insert: {
          bairro?: string | null
          cargo: Database["public"]["Enums"]["cargo_usuario"]
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          cpf: string
          created_at?: string
          data_admissao?: string
          data_nascimento?: string | null
          duracao_almoco_minutos?: number | null
          email?: string | null
          estado?: string | null
          foto_url?: string | null
          horario_entrada?: string | null
          horario_saida?: string | null
          horario_saida_almoco?: string | null
          id?: string
          nome: string
          numero?: string | null
          observacoes?: string | null
          pin_ponto_hash?: string | null
          rg?: string | null
          rua?: string | null
          salario?: number | null
          status?: string
          telefone: string
          turno?: string
          updated_at?: string
          usuario_id?: string | null
        }
        Update: {
          bairro?: string | null
          cargo?: Database["public"]["Enums"]["cargo_usuario"]
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          cpf?: string
          created_at?: string
          data_admissao?: string
          data_nascimento?: string | null
          duracao_almoco_minutos?: number | null
          email?: string | null
          estado?: string | null
          foto_url?: string | null
          horario_entrada?: string | null
          horario_saida?: string | null
          horario_saida_almoco?: string | null
          id?: string
          nome?: string
          numero?: string | null
          observacoes?: string | null
          pin_ponto_hash?: string | null
          rg?: string | null
          rua?: string | null
          salario?: number | null
          status?: string
          telefone?: string
          turno?: string
          updated_at?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "funcionarios_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      hospedes: {
        Row: {
          bairro: string | null
          cep: string | null
          cidade: string | null
          complemento: string | null
          cpf: string | null
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
          telefone: string | null
          telefone_secundario: string | null
          updated_at: string
        }
        Insert: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          cpf?: string | null
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
          telefone?: string | null
          telefone_secundario?: string | null
          updated_at?: string
        }
        Update: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          cpf?: string | null
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
          telefone?: string | null
          telefone_secundario?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      integracoes_configuracoes: {
        Row: {
          campos: Json
          chave: string
          conectado: boolean
          created_at: string
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          campos?: Json
          chave: string
          conectado?: boolean
          created_at?: string
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          campos?: Json
          chave?: string
          conectado?: boolean
          created_at?: string
          id?: string
          nome?: string
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
      nfse_certificado_digital: {
        Row: {
          arquivo_base64: string | null
          atualizado_em: string
          atualizado_por: string | null
          id: string
          nome_arquivo: string | null
          senha: string | null
          titular_cnpj: string | null
          validade_ate: string | null
        }
        Insert: {
          arquivo_base64?: string | null
          atualizado_em?: string
          atualizado_por?: string | null
          id?: string
          nome_arquivo?: string | null
          senha?: string | null
          titular_cnpj?: string | null
          validade_ate?: string | null
        }
        Update: {
          arquivo_base64?: string | null
          atualizado_em?: string
          atualizado_por?: string | null
          id?: string
          nome_arquivo?: string | null
          senha?: string | null
          titular_cnpj?: string | null
          validade_ate?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nfse_certificado_digital_atualizado_por_fkey"
            columns: ["atualizado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      nfse_integracao_config: {
        Row: {
          ambiente: string
          contato_fiorilli_em: string | null
          contato_fiorilli_observacao: string | null
          contato_fiorilli_realizado: boolean
          created_at: string
          endpoint_homologacao_abrasf_legado: string | null
          endpoint_homologacao_nacional: string | null
          endpoint_producao_abrasf_legado: string | null
          endpoint_producao_nacional: string | null
          id: string
          observacoes: string | null
          serie_rps: string | null
          updated_at: string
          webservice_tipo: string
        }
        Insert: {
          ambiente?: string
          contato_fiorilli_em?: string | null
          contato_fiorilli_observacao?: string | null
          contato_fiorilli_realizado?: boolean
          created_at?: string
          endpoint_homologacao_abrasf_legado?: string | null
          endpoint_homologacao_nacional?: string | null
          endpoint_producao_abrasf_legado?: string | null
          endpoint_producao_nacional?: string | null
          id?: string
          observacoes?: string | null
          serie_rps?: string | null
          updated_at?: string
          webservice_tipo?: string
        }
        Update: {
          ambiente?: string
          contato_fiorilli_em?: string | null
          contato_fiorilli_observacao?: string | null
          contato_fiorilli_realizado?: boolean
          created_at?: string
          endpoint_homologacao_abrasf_legado?: string | null
          endpoint_homologacao_nacional?: string | null
          endpoint_producao_abrasf_legado?: string | null
          endpoint_producao_nacional?: string | null
          id?: string
          observacoes?: string | null
          serie_rps?: string | null
          updated_at?: string
          webservice_tipo?: string
        }
        Relationships: []
      }
      notas_fiscais: {
        Row: {
          ambiente_emissao: string | null
          cancelada_em: string | null
          cancelada_motivo: string | null
          codigo_autenticacao: string | null
          competencia: string
          created_at: string
          criada_por: string | null
          data_emissao: string
          desconto: number
          emitida_em: string | null
          emitida_por: string | null
          erro_codigo: string | null
          erro_em: string | null
          erro_mensagem: string | null
          id: string
          iss_aliquota: number
          iss_valor: number
          numero: number
          observacoes: string | null
          protocolo_prefeitura: string | null
          reserva_id: string | null
          serie: string
          servico_descricao: string
          servico_quantidade: number
          servico_valor_total: number
          servico_valor_unitario: number
          status: string
          tomador_bairro: string | null
          tomador_cep: string | null
          tomador_cidade: string | null
          tomador_complemento: string | null
          tomador_documento: string
          tomador_email: string | null
          tomador_empresa: string | null
          tomador_estado: string | null
          tomador_nome: string
          tomador_numero: string | null
          tomador_rua: string | null
          tomador_telefone: string | null
          updated_at: string
          valor_final: number
          valor_produtos: number
          xml_retorno: string | null
        }
        Insert: {
          ambiente_emissao?: string | null
          cancelada_em?: string | null
          cancelada_motivo?: string | null
          codigo_autenticacao?: string | null
          competencia?: string
          created_at?: string
          criada_por?: string | null
          data_emissao?: string
          desconto?: number
          emitida_em?: string | null
          emitida_por?: string | null
          erro_codigo?: string | null
          erro_em?: string | null
          erro_mensagem?: string | null
          id?: string
          iss_aliquota?: number
          iss_valor?: number
          numero?: number
          observacoes?: string | null
          protocolo_prefeitura?: string | null
          reserva_id?: string | null
          serie?: string
          servico_descricao?: string
          servico_quantidade?: number
          servico_valor_total?: number
          servico_valor_unitario?: number
          status?: string
          tomador_bairro?: string | null
          tomador_cep?: string | null
          tomador_cidade?: string | null
          tomador_complemento?: string | null
          tomador_documento?: string
          tomador_email?: string | null
          tomador_empresa?: string | null
          tomador_estado?: string | null
          tomador_nome?: string
          tomador_numero?: string | null
          tomador_rua?: string | null
          tomador_telefone?: string | null
          updated_at?: string
          valor_final?: number
          valor_produtos?: number
          xml_retorno?: string | null
        }
        Update: {
          ambiente_emissao?: string | null
          cancelada_em?: string | null
          cancelada_motivo?: string | null
          codigo_autenticacao?: string | null
          competencia?: string
          created_at?: string
          criada_por?: string | null
          data_emissao?: string
          desconto?: number
          emitida_em?: string | null
          emitida_por?: string | null
          erro_codigo?: string | null
          erro_em?: string | null
          erro_mensagem?: string | null
          id?: string
          iss_aliquota?: number
          iss_valor?: number
          numero?: number
          observacoes?: string | null
          protocolo_prefeitura?: string | null
          reserva_id?: string | null
          serie?: string
          servico_descricao?: string
          servico_quantidade?: number
          servico_valor_total?: number
          servico_valor_unitario?: number
          status?: string
          tomador_bairro?: string | null
          tomador_cep?: string | null
          tomador_cidade?: string | null
          tomador_complemento?: string | null
          tomador_documento?: string
          tomador_email?: string | null
          tomador_empresa?: string | null
          tomador_estado?: string | null
          tomador_nome?: string
          tomador_numero?: string | null
          tomador_rua?: string | null
          tomador_telefone?: string | null
          updated_at?: string
          valor_final?: number
          valor_produtos?: number
          xml_retorno?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notas_fiscais_criada_por_fkey"
            columns: ["criada_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notas_fiscais_emitida_por_fkey"
            columns: ["emitida_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notas_fiscais_reserva_id_fkey"
            columns: ["reserva_id"]
            isOneToOne: false
            referencedRelation: "reservas"
            referencedColumns: ["id"]
          },
        ]
      }
      notas_fiscais_produtos: {
        Row: {
          created_at: string
          descricao: string
          id: string
          nota_fiscal_id: string
          produto_id: string | null
          quantidade: number
          quarto_consumo_id: string | null
          valor_total: number
          valor_unitario: number
        }
        Insert: {
          created_at?: string
          descricao: string
          id?: string
          nota_fiscal_id: string
          produto_id?: string | null
          quantidade: number
          quarto_consumo_id?: string | null
          valor_total: number
          valor_unitario: number
        }
        Update: {
          created_at?: string
          descricao?: string
          id?: string
          nota_fiscal_id?: string
          produto_id?: string | null
          quantidade?: number
          quarto_consumo_id?: string | null
          valor_total?: number
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "notas_fiscais_produtos_nota_fiscal_id_fkey"
            columns: ["nota_fiscal_id"]
            isOneToOne: false
            referencedRelation: "notas_fiscais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notas_fiscais_produtos_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notas_fiscais_produtos_quarto_consumo_id_fkey"
            columns: ["quarto_consumo_id"]
            isOneToOne: false
            referencedRelation: "quarto_consumos"
            referencedColumns: ["id"]
          },
        ]
      }
      pagamento_formas: {
        Row: {
          created_at: string
          forma: Database["public"]["Enums"]["forma_pagamento"]
          id: string
          pagamento_id: string
          troco: number | null
          valor: number
          valor_recebido: number | null
        }
        Insert: {
          created_at?: string
          forma: Database["public"]["Enums"]["forma_pagamento"]
          id?: string
          pagamento_id: string
          troco?: number | null
          valor: number
          valor_recebido?: number | null
        }
        Update: {
          created_at?: string
          forma?: Database["public"]["Enums"]["forma_pagamento"]
          id?: string
          pagamento_id?: string
          troco?: number | null
          valor?: number
          valor_recebido?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pagamento_formas_pagamento_id_fkey"
            columns: ["pagamento_id"]
            isOneToOne: false
            referencedRelation: "pagamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      pagamentos: {
        Row: {
          caixa_id: string
          created_at: string
          id: string
          inclui_consumo: boolean
          inclui_hospedagem: boolean
          observacao: string | null
          quarto_id: string
          reserva_id: string
          usuario_id: string | null
          valor_consumo: number
          valor_hospedagem: number
          valor_total: number
        }
        Insert: {
          caixa_id: string
          created_at?: string
          id?: string
          inclui_consumo?: boolean
          inclui_hospedagem?: boolean
          observacao?: string | null
          quarto_id: string
          reserva_id: string
          usuario_id?: string | null
          valor_consumo?: number
          valor_hospedagem?: number
          valor_total: number
        }
        Update: {
          caixa_id?: string
          created_at?: string
          id?: string
          inclui_consumo?: boolean
          inclui_hospedagem?: boolean
          observacao?: string | null
          quarto_id?: string
          reserva_id?: string
          usuario_id?: string | null
          valor_consumo?: number
          valor_hospedagem?: number
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_caixa_id_fkey"
            columns: ["caixa_id"]
            isOneToOne: false
            referencedRelation: "caixa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagamentos_quarto_id_fkey"
            columns: ["quarto_id"]
            isOneToOne: false
            referencedRelation: "quartos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagamentos_reserva_id_fkey"
            columns: ["reserva_id"]
            isOneToOne: false
            referencedRelation: "reservas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagamentos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      pontos: {
        Row: {
          atrasado: boolean
          confianca: number | null
          created_at: string
          funcionario_id: string
          id: string
          metodo: string
          minutos_diferenca: number | null
          observacoes: string | null
          registrado_em: string
          registrado_por: string | null
          tipo: string
          updated_at: string
        }
        Insert: {
          atrasado?: boolean
          confianca?: number | null
          created_at?: string
          funcionario_id: string
          id?: string
          metodo?: string
          minutos_diferenca?: number | null
          observacoes?: string | null
          registrado_em?: string
          registrado_por?: string | null
          tipo: string
          updated_at?: string
        }
        Update: {
          atrasado?: boolean
          confianca?: number | null
          created_at?: string
          funcionario_id?: string
          id?: string
          metodo?: string
          minutos_diferenca?: number | null
          observacoes?: string | null
          registrado_em?: string
          registrado_por?: string | null
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pontos_funcionario_id_fkey"
            columns: ["funcionario_id"]
            isOneToOne: false
            referencedRelation: "funcionarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pontos_funcionario_id_fkey"
            columns: ["funcionario_id"]
            isOneToOne: false
            referencedRelation: "funcionarios_visivel"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pontos_registrado_por_fkey"
            columns: ["registrado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      pousada_configuracoes: {
        Row: {
          capa_url: string | null
          cep: string
          cidade: string
          created_at: string
          email: string
          endereco: string
          estado: string
          facebook: string
          horario_funcionamento: string
          id: string
          instagram: string
          logo_url: string | null
          nome: string
          site: string
          telefone: string
          updated_at: string
          whatsapp: string
        }
        Insert: {
          capa_url?: string | null
          cep?: string
          cidade?: string
          created_at?: string
          email?: string
          endereco?: string
          estado?: string
          facebook?: string
          horario_funcionamento?: string
          id?: string
          instagram?: string
          logo_url?: string | null
          nome?: string
          site?: string
          telefone?: string
          updated_at?: string
          whatsapp?: string
        }
        Update: {
          capa_url?: string | null
          cep?: string
          cidade?: string
          created_at?: string
          email?: string
          endereco?: string
          estado?: string
          facebook?: string
          horario_funcionamento?: string
          id?: string
          instagram?: string
          logo_url?: string | null
          nome?: string
          site?: string
          telefone?: string
          updated_at?: string
          whatsapp?: string
        }
        Relationships: []
      }
      preferencias_sistema: {
        Row: {
          autenticacao_dois_fatores: boolean
          created_at: string
          formato_data: string
          formato_hora: string
          id: string
          idioma: string
          itens_por_pagina: number
          minutos_expiracao_sessao: number
          moeda: string
          notificacoes_ativas: boolean
          sons_ativos: boolean
          tema: string
          updated_at: string
        }
        Insert: {
          autenticacao_dois_fatores?: boolean
          created_at?: string
          formato_data?: string
          formato_hora?: string
          id?: string
          idioma?: string
          itens_por_pagina?: number
          minutos_expiracao_sessao?: number
          moeda?: string
          notificacoes_ativas?: boolean
          sons_ativos?: boolean
          tema?: string
          updated_at?: string
        }
        Update: {
          autenticacao_dois_fatores?: boolean
          created_at?: string
          formato_data?: string
          formato_hora?: string
          id?: string
          idioma?: string
          itens_por_pagina?: number
          minutos_expiracao_sessao?: number
          moeda?: string
          notificacoes_ativas?: boolean
          sons_ativos?: boolean
          tema?: string
          updated_at?: string
        }
        Relationships: []
      }
      produto_localizacoes: {
        Row: {
          created_at: string
          id: string
          localizacao: Database["public"]["Enums"]["localizacao_estoque"]
          produto_id: string
          quantidade: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          localizacao: Database["public"]["Enums"]["localizacao_estoque"]
          produto_id: string
          quantidade?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          localizacao?: Database["public"]["Enums"]["localizacao_estoque"]
          produto_id?: string
          quantidade?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "produto_localizacoes_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
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
          pago: boolean
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
          pago?: boolean
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
          pago?: boolean
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
      quarto_historico: {
        Row: {
          alterado_em: string
          alterado_por: string | null
          id: string
          quarto_id: string
          status_anterior: Database["public"]["Enums"]["status_quarto"]
          status_novo: Database["public"]["Enums"]["status_quarto"]
        }
        Insert: {
          alterado_em?: string
          alterado_por?: string | null
          id?: string
          quarto_id: string
          status_anterior: Database["public"]["Enums"]["status_quarto"]
          status_novo: Database["public"]["Enums"]["status_quarto"]
        }
        Update: {
          alterado_em?: string
          alterado_por?: string | null
          id?: string
          quarto_id?: string
          status_anterior?: Database["public"]["Enums"]["status_quarto"]
          status_novo?: Database["public"]["Enums"]["status_quarto"]
        }
        Relationships: [
          {
            foreignKeyName: "quarto_historico_alterado_por_fkey"
            columns: ["alterado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quarto_historico_quarto_id_fkey"
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
          valor_casal: number | null
          valor_diaria: number
          valor_pessoa_adicional: number | null
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
          valor_casal?: number | null
          valor_diaria?: number
          valor_pessoa_adicional?: number | null
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
          valor_casal?: number | null
          valor_diaria?: number
          valor_pessoa_adicional?: number | null
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
          checkin_em: string | null
          checkin_por: string | null
          checkout_em: string | null
          checkout_por: string | null
          cliente_id: string | null
          codigo: string
          confirmada_em: string | null
          confirmada_por: string | null
          created_at: string
          data_entrada: string
          data_saida: string
          hospedagem_paga: boolean
          hospede_principal_id: string
          id: string
          observacoes: string | null
          pagamento_programado_data: string | null
          pagamento_programado_forma:
            | Database["public"]["Enums"]["forma_pagamento"]
            | null
          pagamento_programado_observacao: string | null
          quantidade_adultos: number
          quantidade_criancas: number
          quarto_id: string
          status: Database["public"]["Enums"]["status_reserva"]
          updated_at: string
          valor_consumo_pago: number
          valor_criancas: number
          valor_diaria: number
          valor_hospedagem_pago: number
          valor_total: number
        }
        Insert: {
          checkin_em?: string | null
          checkin_por?: string | null
          checkout_em?: string | null
          checkout_por?: string | null
          cliente_id?: string | null
          codigo?: string
          confirmada_em?: string | null
          confirmada_por?: string | null
          created_at?: string
          data_entrada: string
          data_saida: string
          hospedagem_paga?: boolean
          hospede_principal_id: string
          id?: string
          observacoes?: string | null
          pagamento_programado_data?: string | null
          pagamento_programado_forma?:
            | Database["public"]["Enums"]["forma_pagamento"]
            | null
          pagamento_programado_observacao?: string | null
          quantidade_adultos?: number
          quantidade_criancas?: number
          quarto_id: string
          status?: Database["public"]["Enums"]["status_reserva"]
          updated_at?: string
          valor_consumo_pago?: number
          valor_criancas?: number
          valor_diaria: number
          valor_hospedagem_pago?: number
          valor_total: number
        }
        Update: {
          checkin_em?: string | null
          checkin_por?: string | null
          checkout_em?: string | null
          checkout_por?: string | null
          cliente_id?: string | null
          codigo?: string
          confirmada_em?: string | null
          confirmada_por?: string | null
          created_at?: string
          data_entrada?: string
          data_saida?: string
          hospedagem_paga?: boolean
          hospede_principal_id?: string
          id?: string
          observacoes?: string | null
          pagamento_programado_data?: string | null
          pagamento_programado_forma?:
            | Database["public"]["Enums"]["forma_pagamento"]
            | null
          pagamento_programado_observacao?: string | null
          quantidade_adultos?: number
          quantidade_criancas?: number
          quarto_id?: string
          status?: Database["public"]["Enums"]["status_reserva"]
          updated_at?: string
          valor_consumo_pago?: number
          valor_criancas?: number
          valor_diaria?: number
          valor_hospedagem_pago?: number
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "reservas_checkin_por_fkey"
            columns: ["checkin_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservas_checkout_por_fkey"
            columns: ["checkout_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservas_confirmada_por_fkey"
            columns: ["confirmada_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
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
      sessoes_login: {
        Row: {
          criado_em: string
          dispositivo: string | null
          id: string
          ip: string | null
          navegador: string | null
          usuario_id: string | null
        }
        Insert: {
          criado_em?: string
          dispositivo?: string | null
          id?: string
          ip?: string | null
          navegador?: string | null
          usuario_id?: string | null
        }
        Update: {
          criado_em?: string
          dispositivo?: string | null
          id?: string
          ip?: string | null
          navegador?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessoes_login_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      sistema_logs: {
        Row: {
          acao: string
          created_at: string
          detalhes: Json | null
          id: string
          modulo: string
          usuario_id: string | null
          usuario_nome: string
        }
        Insert: {
          acao: string
          created_at?: string
          detalhes?: Json | null
          id?: string
          modulo: string
          usuario_id?: string | null
          usuario_nome?: string
        }
        Update: {
          acao?: string
          created_at?: string
          detalhes?: Json | null
          id?: string
          modulo?: string
          usuario_id?: string | null
          usuario_nome?: string
        }
        Relationships: [
          {
            foreignKeyName: "sistema_logs_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          ativo: boolean
          avatar_url: string | null
          cargo: Database["public"]["Enums"]["cargo_usuario"]
          cpf: string | null
          created_at: string
          email: string
          id: string
          nome: string
          telefone: string | null
          ultimo_acesso: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          avatar_url?: string | null
          cargo?: Database["public"]["Enums"]["cargo_usuario"]
          cpf?: string | null
          created_at?: string
          email: string
          id: string
          nome: string
          telefone?: string | null
          ultimo_acesso?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          avatar_url?: string | null
          cargo?: Database["public"]["Enums"]["cargo_usuario"]
          cpf?: string | null
          created_at?: string
          email?: string
          id?: string
          nome?: string
          telefone?: string | null
          ultimo_acesso?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      vendas_balcao: {
        Row: {
          cancelada_em: string | null
          cancelada_por: string | null
          caixa_id: string
          created_at: string
          id: string
          observacao: string | null
          status: string
          updated_at: string
          usuario_id: string | null
          valor_total: number
        }
        Insert: {
          cancelada_em?: string | null
          cancelada_por?: string | null
          caixa_id: string
          created_at?: string
          id?: string
          observacao?: string | null
          status?: string
          updated_at?: string
          usuario_id?: string | null
          valor_total: number
        }
        Update: {
          cancelada_em?: string | null
          cancelada_por?: string | null
          caixa_id?: string
          created_at?: string
          id?: string
          observacao?: string | null
          status?: string
          updated_at?: string
          usuario_id?: string | null
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "vendas_balcao_caixa_id_fkey"
            columns: ["caixa_id"]
            isOneToOne: false
            referencedRelation: "caixa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendas_balcao_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendas_balcao_cancelada_por_fkey"
            columns: ["cancelada_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      venda_balcao_itens: {
        Row: {
          created_at: string
          id: string
          produto_id: string
          quantidade: number
          valor_total: number
          valor_unitario: number
          venda_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          produto_id: string
          quantidade: number
          valor_total: number
          valor_unitario: number
          venda_id: string
        }
        Update: {
          created_at?: string
          id?: string
          produto_id?: string
          quantidade?: number
          valor_total?: number
          valor_unitario?: number
          venda_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "venda_balcao_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venda_balcao_itens_venda_id_fkey"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "vendas_balcao"
            referencedColumns: ["id"]
          },
        ]
      }
      venda_balcao_formas: {
        Row: {
          created_at: string
          forma: Database["public"]["Enums"]["forma_pagamento"]
          id: string
          troco: number | null
          valor: number
          valor_recebido: number | null
          venda_id: string
        }
        Insert: {
          created_at?: string
          forma: Database["public"]["Enums"]["forma_pagamento"]
          id?: string
          troco?: number | null
          valor: number
          valor_recebido?: number | null
          venda_id: string
        }
        Update: {
          created_at?: string
          forma?: Database["public"]["Enums"]["forma_pagamento"]
          id?: string
          troco?: number | null
          valor?: number
          valor_recebido?: number | null
          venda_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "venda_balcao_formas_venda_id_fkey"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "vendas_balcao"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      funcionarios_visivel: {
        Row: {
          bairro: string | null
          cargo: Database["public"]["Enums"]["cargo_usuario"] | null
          cep: string | null
          cidade: string | null
          complemento: string | null
          cpf: string | null
          created_at: string | null
          data_admissao: string | null
          data_nascimento: string | null
          duracao_almoco_minutos: number | null
          email: string | null
          estado: string | null
          foto_url: string | null
          horario_entrada: string | null
          horario_saida: string | null
          horario_saida_almoco: string | null
          id: string | null
          nome: string | null
          numero: string | null
          observacoes: string | null
          pin_ponto_configurado: boolean | null
          rg: string | null
          rua: string | null
          salario: number | null
          status: string | null
          telefone: string | null
          turno: string | null
          updated_at: string | null
          usuario_id: string | null
        }
        Insert: {
          bairro?: string | null
          cargo?: Database["public"]["Enums"]["cargo_usuario"] | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          cpf?: string | null
          created_at?: string | null
          data_admissao?: string | null
          data_nascimento?: string | null
          duracao_almoco_minutos?: number | null
          email?: string | null
          estado?: string | null
          foto_url?: string | null
          horario_entrada?: string | null
          horario_saida?: string | null
          horario_saida_almoco?: string | null
          id?: string | null
          nome?: string | null
          numero?: string | null
          observacoes?: string | null
          pin_ponto_configurado?: never
          rg?: string | null
          rua?: string | null
          salario?: never
          status?: string | null
          telefone?: string | null
          turno?: string | null
          updated_at?: string | null
          usuario_id?: string | null
        }
        Update: {
          bairro?: string | null
          cargo?: Database["public"]["Enums"]["cargo_usuario"] | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          cpf?: string | null
          created_at?: string | null
          data_admissao?: string | null
          data_nascimento?: string | null
          duracao_almoco_minutos?: number | null
          email?: string | null
          estado?: string | null
          foto_url?: string | null
          horario_entrada?: string | null
          horario_saida?: string | null
          horario_saida_almoco?: string | null
          id?: string | null
          nome?: string | null
          numero?: string | null
          observacoes?: string | null
          pin_ponto_configurado?: never
          rg?: string | null
          rua?: string | null
          salario?: never
          status?: string | null
          telefone?: string | null
          turno?: string | null
          updated_at?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "funcionarios_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      abrir_caixa: {
        Args: {
          p_funcionario_nome: string
          p_observacao?: string
          p_valor_inicial: number
        }
        Returns: {
          aberto_em: string
          aberto_por: string | null
          created_at: string
          diferenca: number | null
          fechado_em: string | null
          fechado_por: string | null
          funcionario_nome: string
          id: string
          observacao_abertura: string | null
          observacao_fechamento: string | null
          status: string
          updated_at: string
          valor_contado: number | null
          valor_esperado: number | null
          valor_inicial: number
        }
        SetofOptions: {
          from: "*"
          to: "caixa"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      cancelar_reserva: { Args: { p_reserva_id: string }; Returns: undefined }
      confirmar_reserva: { Args: { p_reserva_id: string }; Returns: undefined }
      criar_reserva_admin: {
        Args: {
          p_data_entrada: string
          p_data_saida: string
          p_hospede_principal_id: string
          p_hospedes_extra?: Json
          p_observacoes?: string
          p_quantidade_adultos: number
          p_quarto_id: string
          p_valor_criancas: number
          p_valor_diaria: number
          p_valor_total: number
        }
        Returns: {
          codigo: string
          id: string
        }[]
      }
      criar_reserva_cliente: {
        Args: {
          p_acompanhantes_adultos?: Json
          p_bairro?: string
          p_cep?: string
          p_cidade?: string
          p_complemento?: string
          p_criancas?: Json
          p_data_entrada: string
          p_data_saida: string
          p_empresa?: string
          p_estado?: string
          p_numero?: string
          p_observacoes?: string
          p_quarto_id: string
          p_rua?: string
        }
        Returns: {
          codigo: string
          id: string
          valor_total: number
        }[]
      }
      criar_usuario_admin: {
        Args: {
          p_cargo: Database["public"]["Enums"]["cargo_usuario"]
          p_cpf?: string
          p_email: string
          p_nome: string
          p_senha: string
          p_telefone?: string
        }
        Returns: {
          ativo: boolean
          avatar_url: string | null
          cargo: Database["public"]["Enums"]["cargo_usuario"]
          cpf: string | null
          created_at: string
          email: string
          id: string
          nome: string
          telefone: string | null
          ultimo_acesso: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "usuarios"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      current_cargo: {
        Args: never
        Returns: Database["public"]["Enums"]["cargo_usuario"]
      }
      distancia_descritores_jsonb: {
        Args: { a: Json; b: Json }
        Returns: number
      }
      excluir_usuario_admin: {
        Args: { p_usuario_id: string }
        Returns: undefined
      }
      fazer_checkin_reserva: {
        Args: { p_reserva_id: string }
        Returns: undefined
      }
      fazer_checkout_reserva: {
        Args: { p_reserva_id: string }
        Returns: undefined
      }
      fechar_caixa: {
        Args: {
          p_caixa_id: string
          p_observacao?: string
          p_valor_contado: number
        }
        Returns: {
          aberto_em: string
          aberto_por: string | null
          created_at: string
          diferenca: number | null
          fechado_em: string | null
          fechado_por: string | null
          funcionario_nome: string
          id: string
          observacao_abertura: string | null
          observacao_fechamento: string | null
          status: string
          updated_at: string
          valor_contado: number | null
          valor_esperado: number | null
          valor_inicial: number
        }
        SetofOptions: {
          from: "*"
          to: "caixa"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      finalizar_pagamento_hospedagem: {
        Args: {
          p_caixa_id: string
          p_formas: Json
          p_incluir_consumo: boolean
          p_incluir_hospedagem: boolean
          p_observacao?: string
          p_reserva_id: string
          p_valor_consumo?: number
          p_valor_hospedagem?: number
        }
        Returns: {
          caixa_id: string
          created_at: string
          id: string
          inclui_consumo: boolean
          inclui_hospedagem: boolean
          observacao: string | null
          quarto_id: string
          reserva_id: string
          usuario_id: string | null
          valor_consumo: number
          valor_hospedagem: number
          valor_total: number
        }
        SetofOptions: {
          from: "*"
          to: "pagamentos"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      informacoes_sistema: { Args: never; Returns: Json }
      is_staff: { Args: never; Returns: boolean }
      listar_dados_reconhecimento_facial: {
        Args: never
        Returns: {
          cargo: Database["public"]["Enums"]["cargo_usuario"]
          descritor: Json
          foto_url: string
          funcionario_id: string
          nome: string
        }[]
      }
      marcar_no_show_reserva: {
        Args: { p_reserva_id: string }
        Returns: undefined
      }
      reconhecer_e_registrar_ponto: {
        Args: { p_descritor: Json }
        Returns: {
          atrasado: boolean
          cargo: Database["public"]["Enums"]["cargo_usuario"]
          foto_url: string
          funcionario_id: string
          minutos_diferenca: number
          nome: string
          ponto_id: string
          registrado_em: string
          tipo: string
        }[]
      }
      redefinir_senha_usuario: {
        Args: { p_nova_senha: string; p_usuario_id: string }
        Returns: undefined
      }
      registrar_adiantamento_funcionario: {
        Args: {
          p_funcionario_id: string
          p_observacao?: string
          p_valor: number
        }
        Returns: {
          created_at: string
          funcionario_id: string
          id: string
          observacao: string | null
          registrado_por: string | null
          valor: number
        }
        SetofOptions: {
          from: "*"
          to: "funcionario_adiantamentos"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      registrar_consumo_funcionario: {
        Args: {
          p_funcionario_id: string
          p_produto_id: string
          p_quantidade: number
        }
        Returns: {
          created_at: string
          funcionario_id: string
          id: string
          produto_id: string
          quantidade: number
          registrado_por: string | null
          valor_total: number
          valor_unitario: number
        }
        SetofOptions: {
          from: "*"
          to: "funcionario_consumos"
          isOneToOne: true
          isSetofReturn: false
        }
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
          pago: boolean
          produto_id: string
          quantidade: number
          quarto_id: string
          reserva_id: string | null
          updated_at: string
          usuario_id: string | null
          valor_total: number
          valor_unitario: number
        }
        SetofOptions: {
          from: "*"
          to: "quarto_consumos"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      registrar_evento_chatbot: {
        Args: {
          p_aguardando_humano?: boolean
          p_chave_api: string
          p_hospede_nome?: string
          p_mensagem?: string
          p_remetente?: string
          p_remote_jid: string
        }
        Returns: string
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
        SetofOptions: {
          from: "*"
          to: "estoque"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      registrar_venda_balcao: {
        Args: {
          p_caixa_id: string
          p_formas: Json
          p_itens: Json
          p_observacao?: string
        }
        Returns: {
          cancelada_em: string | null
          cancelada_por: string | null
          caixa_id: string
          created_at: string
          id: string
          observacao: string | null
          status: string
          updated_at: string
          usuario_id: string | null
          valor_total: number
        }
        SetofOptions: {
          from: "*"
          to: "vendas_balcao"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      cancelar_venda_balcao: {
        Args: { p_venda_id: string }
        Returns: undefined
      }
      confirmar_emissao_nota: {
        Args: {
          p_ambiente: string
          p_codigo_autenticacao: string
          p_nota_id: string
          p_protocolo: string
          p_xml_retorno?: string
        }
        Returns: {
          ambiente_emissao: string | null
          cancelada_em: string | null
          cancelada_motivo: string | null
          codigo_autenticacao: string | null
          competencia: string
          created_at: string
          criada_por: string | null
          data_emissao: string
          desconto: number
          emitida_em: string | null
          emitida_por: string | null
          erro_codigo: string | null
          erro_em: string | null
          erro_mensagem: string | null
          id: string
          iss_aliquota: number
          iss_valor: number
          numero: number
          observacoes: string | null
          protocolo_prefeitura: string | null
          reserva_id: string | null
          serie: string
          servico_descricao: string
          servico_quantidade: number
          servico_valor_total: number
          servico_valor_unitario: number
          status: string
          tomador_bairro: string | null
          tomador_cep: string | null
          tomador_cidade: string | null
          tomador_complemento: string | null
          tomador_documento: string
          tomador_email: string | null
          tomador_empresa: string | null
          tomador_estado: string | null
          tomador_nome: string
          tomador_numero: string | null
          tomador_rua: string | null
          tomador_telefone: string | null
          updated_at: string
          valor_final: number
          valor_produtos: number
          xml_retorno: string | null
        }
        SetofOptions: {
          from: "*"
          to: "notas_fiscais"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      iniciar_emissao_nota: {
        Args: { p_nota_id: string }
        Returns: {
          ambiente_emissao: string | null
          cancelada_em: string | null
          cancelada_motivo: string | null
          codigo_autenticacao: string | null
          competencia: string
          created_at: string
          criada_por: string | null
          data_emissao: string
          desconto: number
          emitida_em: string | null
          emitida_por: string | null
          erro_codigo: string | null
          erro_em: string | null
          erro_mensagem: string | null
          id: string
          iss_aliquota: number
          iss_valor: number
          numero: number
          observacoes: string | null
          protocolo_prefeitura: string | null
          reserva_id: string | null
          serie: string
          servico_descricao: string
          servico_quantidade: number
          servico_valor_total: number
          servico_valor_unitario: number
          status: string
          tomador_bairro: string | null
          tomador_cep: string | null
          tomador_cidade: string | null
          tomador_complemento: string | null
          tomador_documento: string
          tomador_email: string | null
          tomador_empresa: string | null
          tomador_estado: string | null
          tomador_nome: string
          tomador_numero: string | null
          tomador_rua: string | null
          tomador_telefone: string | null
          updated_at: string
          valor_final: number
          valor_produtos: number
          xml_retorno: string | null
        }
        SetofOptions: {
          from: "*"
          to: "notas_fiscais"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      reabrir_nota_rejeitada: {
        Args: { p_nota_id: string }
        Returns: {
          ambiente_emissao: string | null
          cancelada_em: string | null
          cancelada_motivo: string | null
          codigo_autenticacao: string | null
          competencia: string
          created_at: string
          criada_por: string | null
          data_emissao: string
          desconto: number
          emitida_em: string | null
          emitida_por: string | null
          erro_codigo: string | null
          erro_em: string | null
          erro_mensagem: string | null
          id: string
          iss_aliquota: number
          iss_valor: number
          numero: number
          observacoes: string | null
          protocolo_prefeitura: string | null
          reserva_id: string | null
          serie: string
          servico_descricao: string
          servico_quantidade: number
          servico_valor_total: number
          servico_valor_unitario: number
          status: string
          tomador_bairro: string | null
          tomador_cep: string | null
          tomador_cidade: string | null
          tomador_complemento: string | null
          tomador_documento: string
          tomador_email: string | null
          tomador_empresa: string | null
          tomador_estado: string | null
          tomador_nome: string
          tomador_numero: string | null
          tomador_rua: string | null
          tomador_telefone: string | null
          updated_at: string
          valor_final: number
          valor_produtos: number
          xml_retorno: string | null
        }
        SetofOptions: {
          from: "*"
          to: "notas_fiscais"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      registrar_erro_emissao_nota: {
        Args: {
          p_ambiente: string
          p_codigo: string
          p_mensagem: string
          p_nota_id: string
        }
        Returns: {
          ambiente_emissao: string | null
          cancelada_em: string | null
          cancelada_motivo: string | null
          codigo_autenticacao: string | null
          competencia: string
          created_at: string
          criada_por: string | null
          data_emissao: string
          desconto: number
          emitida_em: string | null
          emitida_por: string | null
          erro_codigo: string | null
          erro_em: string | null
          erro_mensagem: string | null
          id: string
          iss_aliquota: number
          iss_valor: number
          numero: number
          observacoes: string | null
          protocolo_prefeitura: string | null
          reserva_id: string | null
          serie: string
          servico_descricao: string
          servico_quantidade: number
          servico_valor_total: number
          servico_valor_unitario: number
          status: string
          tomador_bairro: string | null
          tomador_cep: string | null
          tomador_cidade: string | null
          tomador_complemento: string | null
          tomador_documento: string
          tomador_email: string | null
          tomador_empresa: string | null
          tomador_estado: string | null
          tomador_nome: string
          tomador_numero: string | null
          tomador_rua: string | null
          tomador_telefone: string | null
          updated_at: string
          valor_final: number
          valor_produtos: number
          xml_retorno: string | null
        }
        SetofOptions: {
          from: "*"
          to: "notas_fiscais"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      remover_certificado_digital_nfse: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      salvar_certificado_digital_nfse: {
        Args: {
          p_arquivo_base64: string
          p_nome_arquivo: string
          p_senha: string
          p_titular_cnpj?: string
          p_validade_ate?: string
        }
        Returns: undefined
      }
      status_certificado_digital_nfse: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      registrar_ponto_facial: {
        Args: { p_confianca?: number; p_funcionario_id: string }
        Returns: {
          atrasado: boolean
          confianca: number | null
          created_at: string
          funcionario_id: string
          id: string
          metodo: string
          minutos_diferenca: number | null
          observacoes: string | null
          registrado_em: string
          registrado_por: string | null
          tipo: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "pontos"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      definir_pin_ponto_funcionario: {
        Args: { p_funcionario_id: string; p_pin: string }
        Returns: undefined
      }
      reconhecer_ponto_por_pin: {
        Args: { p_pin: string }
        Returns: {
          atrasado: boolean
          cargo: Database["public"]["Enums"]["cargo_usuario"]
          foto_url: string
          funcionario_id: string
          minutos_diferenca: number
          nome: string
          ponto_id: string
          registrado_em: string
          tipo: string
        }[]
      }
      remover_consumo_quarto: {
        Args: { p_consumo_id: string }
        Returns: undefined
      }
      remover_pin_ponto_funcionario: {
        Args: { p_funcionario_id: string }
        Returns: undefined
      }
      repor_localizacao_estoque: {
        Args: {
          p_localizacao: Database["public"]["Enums"]["localizacao_estoque"]
          p_motivo?: string
          p_produto_id: string
          p_quantidade: number
        }
        Returns: {
          created_at: string
          id: string
          localizacao: Database["public"]["Enums"]["localizacao_estoque"] | null
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
        SetofOptions: {
          from: "*"
          to: "estoque"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      registrar_saida_caixa: {
        Args: { p_caixa_id: string; p_descricao: string; p_valor: number }
        Returns: {
          caixa_id: string
          created_at: string
          descricao: string | null
          id: string
          origem: string
          pagamento_id: string | null
          tipo: string
          usuario_id: string | null
          valor: number
        }
        SetofOptions: {
          from: "*"
          to: "caixa_movimentacoes"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      trocar_quarto_reserva: {
        Args: { p_novo_quarto_id: string; p_reserva_id: string }
        Returns: {
          checkin_em: string | null
          checkin_por: string | null
          checkout_em: string | null
          checkout_por: string | null
          cliente_id: string | null
          codigo: string
          confirmada_em: string | null
          confirmada_por: string | null
          created_at: string
          data_entrada: string
          data_saida: string
          hospedagem_paga: boolean
          hospede_principal_id: string
          id: string
          observacoes: string | null
          pagamento_programado_data: string | null
          pagamento_programado_forma:
            | Database["public"]["Enums"]["forma_pagamento"]
            | null
          pagamento_programado_observacao: string | null
          quantidade_adultos: number
          quantidade_criancas: number
          quarto_id: string
          status: Database["public"]["Enums"]["status_reserva"]
          updated_at: string
          valor_consumo_pago: number
          valor_criancas: number
          valor_diaria: number
          valor_hospedagem_pago: number
          valor_total: number
        }
        SetofOptions: {
          from: "*"
          to: "reservas"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      cargo_usuario:
        | "administrador"
        | "recepcao"
        | "financeiro"
        | "limpeza"
        | "gerente"
        | "cozinha"
        | "lavanderia"
      forma_pagamento:
        | "pix"
        | "dinheiro"
        | "cartao_debito"
        | "cartao_credito"
        | "deposito"
      localizacao_estoque: "geladeira" | "prateleira"
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
        | "reposicao"
        | "venda_balcao"
        | "consumo_funcionario"
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
      cargo_usuario: [
        "administrador",
        "recepcao",
        "financeiro",
        "limpeza",
        "gerente",
        "cozinha",
        "lavanderia",
      ],
      forma_pagamento: [
        "pix",
        "dinheiro",
        "cartao_debito",
        "cartao_credito",
        "deposito",
      ],
      localizacao_estoque: ["geladeira", "prateleira"],
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
        "reposicao",
        "venda_balcao",
        "consumo_funcionario",
      ],
    },
  },
} as const
