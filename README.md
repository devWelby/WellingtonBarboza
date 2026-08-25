# Portfólio — Wellington Barboza

Site pessoal em HTML, CSS e JavaScript puro, sem build e sem dependências.
Publicado em [wellingtonbarboza.com](https://wellingtonbarboza.com/).

## Estrutura

```
.
├── .github/workflows/deploy.yml   Deploy automático via FTP (HostGator)
├── .htaccess                      Regras do Apache: index, cache, segurança
├── api/contato.php                Endpoint do formulário de contato
├── assets/images/                 foto-420/840 (Sobre mim) e perfil-640 (og:image)
├── css/style.css                  Todo o estilo do site
├── favicon.svg                    Ícone da aba (SVG, sem arquivo binário)
├── js/script.js                   Máquina de escrever, abas, reveal, formulário
├── index.html                     Página única
├── robots.txt
└── sitemap.xml
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
arquivos para `/public_html/` via FTP.

Secrets necessários no repositório: `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`.

> O deploy do GitHub Actions é o único caminho para a produção. Se um dia
> usar a extensão SFTP do VS Code, mantenha `uploadOnSave` desativado: cada
> arquivo salvo subiria direto para o ar, competindo com o workflow.

## HTTPS

O redirecionamento HTTP → HTTPS e o header HSTS estão comentados no `.htaccess`.
Ative o AutoSSL no cPanel primeiro; só depois descomente as linhas indicadas.
