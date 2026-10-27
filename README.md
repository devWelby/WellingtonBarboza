# Portfólio — Wellington Barboza

Site pessoal em HTML, CSS e JavaScript puro, sem build e sem dependências.
Publicado em [wellingtonbarboza.com](https://wellingtonbarboza.com/).

## Estrutura

```
.
├── .github/workflows/deploy.yml   Deploy automático via FTPS (HostGator)
├── .htaccess                      Regras do Apache: index, 404, cache, segurança
├── 404.html                       Página de erro (caminhos absolutos, noindex)
├── api/contato.php                Endpoint do formulário de contato
├── apple-touch-icon.png           Ícone 180x180 para a tela inicial do iOS
├── assets/fonts/                  JetBrains Mono (woff2 variável) e licença OFL
├── assets/images/                 foto-420/840 em AVIF, WebP e JPG (Sobre mim)
│                                  e og-1200x630 (og:image)
├── css/style.css                  Todo o estilo do site
├── favicon.svg                    Ícone da aba (SVG, sem arquivo binário)
├── js/script.js                   Máquina de escrever, abas, reveal, menu, formulário
├── index.html                     Página única
├── robots.txt
└── sitemap.xml                    Atualize o <lastmod> a cada mudança de conteúdo
```

## Rodando localmente

Qualquer servidor estático serve. Por exemplo:

```bash
python -m http.server 5500
```

E abra `http://127.0.0.1:5500`.

O formulário de contato precisa de PHP para funcionar de verdade. Sem PHP ele
cai automaticamente no `mailto:` — o comportamento esperado em ambiente local.

## Deploy

O push para a branch `main` dispara o workflow do GitHub Actions, que envia os
arquivos para `/public_html/` via FTPS (FTP com TLS).

Secrets necessários no repositório: `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`.

> O deploy do GitHub Actions é o único caminho para a produção. Se um dia
> usar a extensão SFTP do VS Code, mantenha `uploadOnSave` desativado: cada
> arquivo salvo subiria direto para o ar, competindo com o workflow.

## HTTPS

O site está no ar com HTTPS válido, atrás do Cloudflare.

- **HSTS:** ativo. O `.htaccess` envia `Strict-Transport-Security` (6 meses,
  sem `preload`) em todas as respostas. O navegador só honra o header sobre
  HTTPS, então enviá-lo sempre é seguro.
- **HTTP → HTTPS:** quem redireciona hoje é o Cloudflare. As regras
  equivalentes no `.htaccess` continuam comentadas de propósito. Só descomente
  se o site sair do Cloudflare, ou se o modo SSL dele for "Full"/"Full
  (strict)": no modo "Flexible", redirecionar na origem gera um loop.
