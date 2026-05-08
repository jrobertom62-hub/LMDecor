export type KitItemType = 'kit_completo' | 'item_avulso' | 'painel' | 'mesa' | 'bolos_fakes' | 'outros';

export interface KitItem {
  id: string;
  codigo_produto: string;
  titulo: string;
  descricao: string;
  tipo: KitItemType;
  tema: string;
  preco_locacao: number;
  cores: string[];
  dimensoes: string;
  itens_inclusos: string;
  imagens: string[];
  capa_url: string;
  fotos?: string[];
  url_publica: string;
  destaque: boolean;
  publicado: boolean;
  created_at: any;
  updated_at: any;
}

export interface SiteConfig {
  nome_empresa: string;
  logo_url: string;
  favicon_url: string;
  endereco_texto: string;
  whatsapp: string;
  email: string;
  google_maps_url: string;
  politica_privacidade: string;
  termos_uso: string;
  politica_cookies: string;
  updated_at: any;
}
