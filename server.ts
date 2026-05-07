import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase Config
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY; // Use Service Role Key for backend if needed, but Anon Key is fine if RLS allows
const supabase = createClient(supabaseUrl || '', supabaseKey || '');

async function startServer() {
  const expressApp = express();
  const PORT = 3000;

  expressApp.use(cors());
  expressApp.use(express.json());

  // Middleware: Auth (API Key)
  const authenticate = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Chave de API não fornecida ou inválida (use Bearer <chave>)' });
    }

    const apiKey = authHeader.split(' ')[1];
    
    try {
      const { data: keyDoc, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('key', apiKey)
        .eq('active', true)
        .single();

      if (error || !keyDoc) {
        return res.status(401).json({ error: 'Chave de API inválida ou revogada' });
      }

      // Update last used
      await supabase
        .from('api_keys')
        .update({ last_used: new Date().toISOString() })
        .eq('id', keyDoc.id);

      next();
    } catch (error) {
      console.error('Auth error:', error);
      res.status(500).json({ error: 'Erro interno ao validar autenticação' });
    }
  };

  // --- API V1 ROUTES ---
  const v1 = express.Router();
  v1.use(authenticate);

  // 3.1 Listar/Buscar Kits e Itens
  v1.get('/kits-e-itens', async (req, res) => {
    try {
      const { 
        tipo, tema, preco_min, preco_max, cores, q, codigo, publicado, destaque,
        limit: limitVal = 7, 
        offset: offsetVal = 0,
        sort = 'destaque_desc,updated_at_desc'
      } = req.query as any;

      let query = supabase
        .from('kits_e_itens')
        .select('*', { count: 'exact' });

      if (tipo) query = query.eq('tipo', tipo);
      if (tema) query = query.eq('tema', tema);
      if (codigo) query = query.eq('codigo_produto', codigo);
      if (publicado !== undefined) query = query.eq('publicado', publicado === 'true');
      if (destaque !== undefined) query = query.eq('destaque', destaque === 'true');
      if (preco_min) query = query.gte('preco_locacao', Number(preco_min));
      if (preco_max) query = query.lte('preco_locacao', Number(preco_max));

      // Array filtering for cores
      if (cores) {
        const coresList = cores.split(',').map((c: string) => c.trim());
        query = query.contains('cores', coresList);
      }

      // Keyword search
      if (q) {
        query = query.or(`titulo.ilike.%${q}%,descricao.ilike.%${q}%`);
      }

      // Sorting
      const sortParts = (sort as string).split(',');
      sortParts.forEach(part => {
        const [field, order] = part.split('_');
        query = query.order(field, { ascending: order !== 'desc' });
      });

      // Pagination
      query = query.range(Number(offsetVal), Number(offsetVal) + Number(limitVal) - 1);

      const { data: items, count, error } = await query;

      if (error) throw error;

      res.json({
        meta: {
          limit: Number(limitVal),
          offset: Number(offsetVal),
          total: count,
          sort
        },
        items: items || []
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar itens' });
    }
  });

  // 3.2 Detalhes por ID
      v1.get('/kits-e-itens/:id', async (req: any, res: any) => {
    try {
      const { data: item, error } = await supabase
        .from('kits_e_itens')
        .select('*')
        .eq('id', req.params.id)
        .single();
        
      if (error || !item) return res.status(404).json({ error: 'Item não encontrado' });
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar item' });
    }
  });

  // 3.3 Detalhes por Código
    v1.get('/kits-e-itens/codigo/:codigo', async (req: any, res: any) => {
    try {
      const { data: item, error } = await supabase
        .from('kits_e_itens')
        .select('*')
        .eq('codigo_produto', req.params.codigo)
        .single();

      if (error || !item) return res.status(404).json({ error: 'Item com este código não encontrado' });
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar item pelo código' });
    }
  });

  // 4. Busca com IA
  v1.post('/busca-ia', async (req: any, res: any) => {
    const startTime = Date.now();
    const { query: userQuery, limit: limitVal = 7, modo = 'enxuto' } = req.body;

    if (!userQuery) return res.status(400).json({ error: 'O campo "query" é obrigatório' });

    try {
      // Get AI Config
      const { data: aiConfigData } = await supabase
        .from('ai_config')
        .select('*')
        .eq('id', 'global')
        .single();

      const aiConfig = aiConfigData || { 
        provider: 'gemini', 
        model: 'gemini-3.1-pro-preview',
        default_mode: 'enxuto'
      };

      const systemPrompt = `Você é um assistente de busca especializada para uma empresa de "Pegue e Monte" (locação de kits e itens de festas).
Seu objetivo é interpretar o texto do usuário e retornar um JSON com filtros de busca.

Estrutura do banco de dados:
- tipo: kit_completo, item_avulso, painel, mesa, baloes, outros
- tema: string (ex: "safari", "boteco", "princesas")
- preco_max: número
- cores: array de strings
- q: palavra-chave para título/descrição

IMPORTANTE: 
1. Retorne APENAS o JSON.
2. Se não identificar um filtro, retorne null para aquele campo.
3. Use o campo "interpretacao" para descrever o que você entendeu e se faltou algo.

Exemplo de saída:
{
  "filters": {
    "tipo": "kit_completo",
    "tema": "safari",
    "preco_max": 500,
    "cores": ["verde", "bege"],
    "q": "premium"
  },
  "interpretacao": "O usuário busca kits de safari em tons terrosos até 500 reais."
}`;

      let filters: any = {};
      let interpretacao = '';
      let providerUsed = aiConfig.provider;
      let modelUsed = aiConfig.model || (providerUsed === 'gemini' ? 'gemini-3.1-pro-preview' : 'gpt-4o');

      if (providerUsed === 'gemini') {
        const ai = new GoogleGenAI(process.env.GEMINI_API_KEY || aiConfig.api_key || '');
        const model = ai.getGenerativeModel({ model: modelUsed });
        
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: userQuery }] }],
          generationConfig: {
            responseMimeType: 'application/json'
          }
        });
        const aiResponse = JSON.parse(result.response.text());
        filters = aiResponse.filters;
        interpretacao = aiResponse.interpretacao;
      } else {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || aiConfig.api_key });
        const completion = await openai.chat.completions.create({
          model: modelUsed,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userQuery }
          ],
          response_format: { type: 'json_object' }
        });
        const aiResponse = JSON.parse(completion.choices[0].message.content || '{}');
        filters = aiResponse.filters;
        interpretacao = aiResponse.interpretacao;
      }

      // Execute Search using extracted filters
      let query = supabase
        .from('kits_e_itens')
        .select('*')
        .eq('publicado', true);

      if (filters.tipo) query = query.eq('tipo', filters.tipo);
      if (filters.tema) query = query.eq('tema', filters.tema);
      if (filters.preco_max) query = query.lte('preco_locacao', filters.preco_max);
      if (filters.cores && Array.isArray(filters.cores)) {
        query = query.contains('cores', filters.cores);
      }
      if (filters.q) {
        query = query.or(`titulo.ilike.%${filters.q}%,descricao.ilike.%${filters.q}%`);
      }

      const { data: itemsResult, error: searchError } = await query.limit(Number(limitVal));
      if (searchError) throw searchError;

      let items = itemsResult || [];
      const total = items.length;

      if (modo === 'enxuto') {
        items = items.map((i: any) => ({
          id: i.id,
          titulo: i.titulo,
          codigo_produto: i.codigo_produto,
          preco_locacao: i.preco_locacao,
          capa_url: i.capa_url
        }));
      }

      const duration = Date.now() - startTime;

      // LOG the request
      await supabase.from('ai_search_logs').insert({
        query: userQuery,
        provider: providerUsed,
        model: modelUsed,
        filters: filters,
        result_count: total,
        status: 'success',
        duration_ms: duration
      });

      res.json({
        meta: {
          limit: Number(limitVal),
          total,
          interpretacao: {
            filtros_extraidos: filters,
            observacoes: interpretacao
          }
        },
        items
      });

    } catch (error) {
      console.error('AI Search error:', error);
      res.status(500).json({ error: 'Erro ao processar busca com IA' });
    }
  });

  expressApp.use('/v1', v1);

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    expressApp.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    expressApp.use(express.static(distPath));
    expressApp.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  expressApp.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
