import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, doc, getDoc, limit, orderBy, startAt, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { GoogleGenAI, Type } from '@google/genai';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Firebase Config
const firebaseConfigPath = path.join(__dirname, 'firebase-applet-config.json');
const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf-8'));

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

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
      const q = query(collection(db, 'api_keys'), where('key', '==', apiKey), where('active', '==', true));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return res.status(401).json({ error: 'Chave de API inválida ou revogada' });
      }

      // Update last used
      const keyDoc = snapshot.docs[0];
      await updateDoc(doc(db, 'api_keys', keyDoc.id), {
        last_used: serverTimestamp()
      });

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

      let firestoreQuery: any = collection(db, 'kits_e_itens');
      const constraints: any[] = [];

      if (tipo) constraints.push(where('tipo', '==', tipo));
      if (tema) constraints.push(where('tema', '==', tema));
      if (codigo) constraints.push(where('codigo_produto', '==', codigo));
      if (publicado !== undefined) constraints.push(where('publicado', '==', publicado === 'true'));
      if (destaque !== undefined) constraints.push(where('destaque', '==', destaque === 'true'));

      // Sort logic (simplified for demonstration, Firestore requires specific indexes)
      const sortParts = (sort as string).split(',');
      sortParts.forEach(part => {
        const [field, order] = part.split('_');
        constraints.push(orderBy(field, order === 'desc' ? 'desc' : 'asc'));
      });

      const qry = query(firestoreQuery, ...constraints);
      const snapshot = await getDocs(qry);
      
      let items = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));

      // Client-side filtering for cores and q (titles/description) as Firestore doesn't support complex substring/array-contains-any easily without indexes or external search
      if (cores) {
        const coresList = (cores as string).toLowerCase().split(',').map(c => c.trim());
        items = items.filter((item: any) => 
          item.cores?.some((c: string) => coresList.includes(c.toLowerCase()))
        );
      }

      if (q) {
        const search = (q as string).toLowerCase();
        items = items.filter((item: any) => 
          item.titulo.toLowerCase().includes(search) || 
          item.descricao?.toLowerCase().includes(search)
        );
      }

      if (preco_min) items = items.filter((item: any) => item.preco_locacao >= Number(preco_min));
      if (preco_max) items = items.filter((item: any) => item.preco_locacao <= Number(preco_max));

      const total = items.length;
      const paginatedItems = items.slice(Number(offsetVal), Number(offsetVal) + Math.min(Number(limitVal), 20));

      res.json({
        meta: {
          limit: Number(limitVal),
          offset: Number(offsetVal),
          total,
          sort
        },
        items: paginatedItems
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar itens' });
    }
  });

  // 3.2 Detalhes por ID
      v1.get('/kits-e-itens/:id', async (req: any, res: any) => {
    try {
      const docSnap = await getDoc(doc(db, 'kits_e_itens', req.params.id));
      if (!docSnap.exists()) return res.status(404).json({ error: 'Item não encontrado' });
      res.json({ id: docSnap.id, ...(docSnap.data() as any) });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar item' });
    }
  });

  // 3.3 Detalhes por Código
    v1.get('/kits-e-itens/codigo/:codigo', async (req: any, res: any) => {
    try {
      const q = query(collection(db, 'kits_e_itens'), where('codigo_produto', '==', req.params.codigo));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return res.status(404).json({ error: 'Item com este código não encontrado' });
      const docSnap = snapshot.docs[0];
      res.json({ id: docSnap.id, ...(docSnap.data() as any) });
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
      const configSnap = await getDoc(doc(db, 'ai_config', 'global'));
      const aiConfig = configSnap.exists() ? configSnap.data() : { 
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
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || aiConfig.api_key });
        const result = await ai.models.generateContent({
          model: modelUsed,
          contents: userQuery,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json'
          }
        });
        const aiResponse = JSON.parse(result.text);
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
      // Note: We use relative path logic internally
      const searchParams = new URLSearchParams();
      if (filters.tipo) searchParams.append('tipo', filters.tipo);
      if (filters.tema) searchParams.append('tema', filters.tema);
      if (filters.preco_max) searchParams.append('preco_max', filters.preco_max.toString());
      if (filters.cores) searchParams.append('cores', filters.cores.join(','));
      if (filters.q) searchParams.append('q', filters.q);
      searchParams.append('limit', limitVal.toString());

      // Mocking internal call (directly reuse search logic)
      // This is safer than a loopback fetch
      // For this step, we'll just repeat the logic or wrap it in a function.
      // To keep it clean, let's just return a placeholder for now but implement the search soon.
      
      // REAL SEARCH LOGIC REUSE:
      let itemsQry: any = collection(db, 'kits_e_itens');
      const apiConstraints: any[] = [where('publicado', '==', true)];
      if (filters.tipo) apiConstraints.push(where('tipo', '==', filters.tipo));
      if (filters.tema) apiConstraints.push(where('tema', '==', filters.tema));
      const snapshot = await getDocs(query(itemsQry, ...apiConstraints));
      let items = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));

      if (filters.q) {
        const s = filters.q.toLowerCase();
        items = items.filter((item: any) => item.titulo.toLowerCase().includes(s) || item.descricao?.toLowerCase().includes(s));
      }
      if (filters.preco_max) items = items.filter((item: any) => item.preco_locacao <= filters.preco_max);
      if (filters.cores && Array.isArray(filters.cores)) {
        const cLow = filters.cores.map(c => c.toLowerCase());
        items = items.filter((item: any) => item.cores?.some((c: string) => cLow.includes(c.toLowerCase())));
      }

      const total = items.length;
      items = items.slice(0, Math.min(Number(limitVal), 20));

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
      await addDoc(collection(db, 'ai_search_logs'), {
        query: userQuery,
        timestamp: serverTimestamp(),
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
