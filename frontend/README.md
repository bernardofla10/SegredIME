# 🎨 SegredIME Frontend
Esta é a interface administrativa do sistema SegredIME, construída com **Next.js 16**, **TypeScript** e **Tailwind CSS v4**.

## 🚀 Como Rodar Localmente (Sem Docker)
1. Certifique-se de estar na pasta `frontend/`.
2. Instale as dependências com suporte a peer dependencies antigas:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
4. Acesse: [http://localhost:3000](http://localhost:3000)

## 🔧 Configuração da API
O frontend busca os dados da API Django. Por padrão, ele tenta se conectar a `http://localhost:8000`. 
Para alterar essa URL, defina a variável de ambiente:
`NEXT_PUBLIC_API_URL=http://sua-api:8000`

## 📦 Componentes UI
Este projeto utiliza componentes baseados no **Shadcn/UI**. Devido ao uso do React 19, algumas dependências foram instaladas com `--legacy-peer-deps`:
- `react-day-picker`
- `embla-carousel-react`
- `recharts`
- `vaul`
- `cmdk`
- `sonner`
- `react-hook-form`
- `zod`
- `react-resizable-panels`

---
