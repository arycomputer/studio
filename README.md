# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Como Rodar o Projeto

Para rodar este projeto localmente, você precisará de dois terminais abertos simultaneamente. Um para a aplicação Next.js (frontend) e outro para os serviços de IA com Genkit (backend).

### 1. Primeiro Terminal (Aplicação Next.js)

Neste terminal, você irá instalar as dependências e iniciar o servidor de desenvolvimento da aplicação.

```bash
# Instalar as dependências do projeto
npm install

# Iniciar o servidor de desenvolvimento do Next.js
npm run dev
```

Após executar `npm run dev`, sua aplicação estará disponível em [http://localhost:9002](http://localhost:9002).

### 2. Segundo Terminal (Serviços de IA - Genkit)

Neste terminal, você iniciará o ambiente de desenvolvimento do Genkit, que gerencia as "flows" de inteligência artificial.

```bash
# Iniciar o servidor de desenvolvimento do Genkit
npm run genkit:dev
```

Este comando inicia as ferramentas de observabilidade do Genkit e expõe os endpoints necessários para que sua aplicação Next.js possa se comunicar com os modelos de IA.
