# Pousada Cabana

Site institucional da Pousada Cabana (Avaré, SP), desenvolvido pela Agência NODEX.

Etapa atual: site institucional + página de quartos (Etapa 1 e 2). O sistema
administrativo (reservas, calendário, check-in/out, comanda, caixa, funcionários,
chatbot) é uma etapa futura — veja `docs/superpowers/specs/` para o design completo.

## Stack

- [Next.js](https://nextjs.org) 16 (App Router) + TypeScript
- Tailwind CSS v4
- Framer Motion
- lucide-react

## Rodando localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Conteúdo provisório

Fotos, vídeo do Hero e dados de contato (endereço/telefone/redes sociais) ainda
são placeholders até o material real da pousada chegar — ver `data/contact.ts`
e os componentes `MediaPlaceholder`.
