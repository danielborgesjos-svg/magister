# Magister ERP — Sistema de Gestão Inteligente

> ERP/CRM completo desenvolvido para a **Magister Tech**, com Inteligência Artificial integrada (JARVIS), módulo WhatsApp, gestão financeira, OS, estoque, agenda e muito mais.

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 16 + React 19 + Tailwind CSS |
| Backend | Next.js Server Actions (API Routes) |
| Banco de dados | SQLite (dev) → PostgreSQL (produção) |
| ORM | Prisma 5 |
| Autenticação | NextAuth.js |
| WhatsApp | Evolution API + Baileys |
| IA | Groq API (LLaMA 3) |
| Animações | Framer Motion |
| Gráficos | Recharts |
| Deploy | PM2 + NGINX + Docker |

## Módulos do Sistema

- **Painel Geral** — KPIs, gráficos de receita vs despesas, donut de OS por status
- **JARVIS IA** — Insights automáticos, análise preditiva, chat inteligente
- **CRM/Clientes** — Cadastro completo, histórico, segmentação
- **Pipeline de Vendas** — Kanban visual, negociações, funil
- **Ordens de Serviço** — Abertura, kanban, rotas, app técnico
- **Financeiro** — Lançamentos, DRE, cobranças, contratos
- **Estoque** — Produtos, movimentações, alertas de mínimo
- **Agenda** — Compromissos, integração com Google Calendar
- **WhatsApp** — Chat omnichannel, fluxos de IA, automações
- **Campanhas** — Marketing, disparo de mensagens
- **Relatórios** — Análises completas com filtros
- **Configurações** — Personalização completa do sistema

## Instalação (Desenvolvimento)

```bash
# Clonar repositório
git clone https://github.com/danielborgesjos-svg/magister.git
cd magister

# Instalar dependências
npm install

# Configurar ambiente
cp .env.example .env
# Edite o .env com suas variáveis

# Configurar banco de dados
npx prisma generate
npx prisma migrate dev

# Iniciar servidor de desenvolvimento
npm run dev
```

Acesse: `http://localhost:3000`

## Deploy em Produção (VPS)

```bash
# Na VPS, primeira vez:
git clone https://github.com/danielborgesjos-svg/magister.git /var/www/magister
cd /var/www/magister
cp .env.example .env
# Preencha o .env com as variáveis reais
bash deploy.sh

# Atualizações futuras:
bash /var/www/magister/deploy.sh
```

## Variáveis de Ambiente

Copie `.env.example` para `.env` e preencha:

```env
DATABASE_URL=         # PostgreSQL em produção
GROQ_API_KEY=         # Chave da API Groq (IA)
EVOLUTION_API_URL=    # URL da Evolution API (WhatsApp)
EVOLUTION_API_KEY=    # Chave de acesso da Evolution API
NEXTAUTH_SECRET=      # Gerar: openssl rand -hex 32
NEXTAUTH_URL=         # URL pública do sistema
```

## Arquitetura de Produção

```
INTERNET
    │
[erp.magistertech.com.br]
    │
[NGINX - Proxy Reverso]
    ├── :3002 → Next.js ERP (PM2)
    └── :8080 → Evolution API (Docker)
    │
[PostgreSQL :5432]
```

## Licença

Proprietário — Magister Tech © 2025
