# Portfólio — Wellington Barboza

Site pessoal em HTML, CSS e JavaScript puro, sem build e sem dependências.
Publicado em [wellingtonbarboza.com](https://wellingtonbarboza.com/).

## Estrutura

```
.
├── .github/workflows/deploy.yml   Deploy automático via FTP (HostGator)
├── .htaccess                      Regras do Apache: index, cache, segurança
├── api/contato.php                Endpoint do formulário de contato
├── assets/images/                 Fotos otimizadas (versões 320/420/640/840)
├── css/style.css                  Todo o estilo do site
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

> A extensão SFTP do VS Code (`.vscode/sftp.json`) está com `uploadOnSave`
> desativado de propósito. Ligar isso faz cada arquivo salvo subir direto para
> a produção, competindo com o deploy do GitHub Actions.

## HTTPS

O redirecionamento HTTP → HTTPS e o header HSTS estão comentados no `.htaccess`.
Ative o AutoSSL no cPanel primeiro; só depois descomente as linhas indicadas.
