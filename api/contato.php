<?php
declare(strict_types=1);

/**
 * Endpoint do formulário de contato do portfólio.
 * Recebe JSON { name, email, message, website } e envia por e-mail.
 *
 * O campo "website" é uma armadilha: fica escondido no formulário, então
 * uma pessoa nunca o preenche e um robô quase sempre preenche.
 */

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

const DESTINATARIO   = 'contatowellington1587@gmail.com';
const LIMITE_CURTO   = 3;    // envios permitidos...
const JANELA_CURTA   = 900;  // ...a cada 15 minutos
const LIMITE_LONGO   = 8;    // envios permitidos...
const JANELA_LONGA   = 86400; // ...a cada 24 horas

function responder(bool $success, string $message, int $status = 200): void
{
    http_response_code($status);
    echo json_encode(
        ['success' => $success, 'message' => $message],
        JSON_UNESCAPED_UNICODE
    );
    exit;
}

/**
 * O site fica atrás do Cloudflare, então REMOTE_ADDR é o IP dele, não o do
 * visitante. Sem isso, o limite por IP juntaria todo mundo no mesmo balde.
 */
function ipDoVisitante(): string
{
    $candidatos = [
        $_SERVER['HTTP_CF_CONNECTING_IP'] ?? null,
        isset($_SERVER['HTTP_X_FORWARDED_FOR'])
            ? trim(explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0])
            : null,
        $_SERVER['REMOTE_ADDR'] ?? null,
    ];

    foreach ($candidatos as $ip) {
        if (is_string($ip) && filter_var($ip, FILTER_VALIDATE_IP)) {
            return $ip;
        }
    }

    return '0.0.0.0';
}

/**
 * Limite por IP, guardado fora da pasta pública para não ser acessível
 * pela web nem apagado pelo deploy.
 */
function dentroDoLimite(string $ip): bool
{
    $dir = sys_get_temp_dir() . '/portfolio-contato';
    if (!is_dir($dir) && !@mkdir($dir, 0700, true) && !is_dir($dir)) {
        return true; // Sem onde gravar, não trava o envio legítimo.
    }

    $arquivo = $dir . '/' . hash('sha256', $ip) . '.json';
    $agora   = time();

    $handle = @fopen($arquivo, 'c+');
    if ($handle === false) {
        return true;
    }

    try {
        if (!flock($handle, LOCK_EX)) {
            return true;
        }

        $conteudo = stream_get_contents($handle);
        $registros = json_decode((string) $conteudo, true);
        if (!is_array($registros)) {
            $registros = [];
        }

        // Descarta o que já saiu da janela mais longa.
        $registros = array_values(array_filter(
            $registros,
            static fn($t) => is_int($t) && $t > $agora - JANELA_LONGA
        ));

        $recentes = count(array_filter(
            $registros,
            static fn($t) => $t > $agora - JANELA_CURTA
        ));

        if ($recentes >= LIMITE_CURTO || count($registros) >= LIMITE_LONGO) {
            return false;
        }

        $registros[] = $agora;

        ftruncate($handle, 0);
        rewind($handle);
        fwrite($handle, (string) json_encode($registros));
        fflush($handle);

        return true;
    } finally {
        flock($handle, LOCK_UN);
        fclose($handle);
    }
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    responder(false, 'Método não permitido.', 405);
}

$payload = json_decode((string) file_get_contents('php://input'), true);
if (!is_array($payload)) {
    $payload = $_POST;
}

// Armadilha para robôs: responde como sucesso para não ensinar nada a eles.
if (trim((string) ($payload['website'] ?? '')) !== '') {
    responder(true, 'Mensagem enviada com sucesso!');
}

$name    = trim((string) ($payload['name'] ?? ''));
$email   = trim((string) ($payload['email'] ?? ''));
$message = trim((string) ($payload['message'] ?? ''));

if ($name === '' || $email === '' || $message === '') {
    responder(false, 'Preencha todos os campos.', 422);
}

if (mb_strlen($name) > 120 || mb_strlen($message) > 5000) {
    responder(false, 'Conteúdo muito longo.', 422);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    responder(false, 'E-mail inválido.', 422);
}

// Impede header injection via campos do formulário.
if (preg_match('/[\r\n]/', $name . $email)) {
    responder(false, 'Dados inválidos.', 422);
}

$ip = ipDoVisitante();

if (!dentroDoLimite($ip)) {
    responder(
        false,
        'Você já enviou algumas mensagens. Aguarde alguns minutos ou fale pelo WhatsApp.',
        429
    );
}

$assunto = sprintf('[Portfólio] Nova mensagem de %s', $name);

$corpo = "Nova mensagem enviada pelo formulário do portfólio.\n\n"
    . "Nome: {$name}\n"
    . "E-mail: {$email}\n"
    . 'Data: ' . date('d/m/Y H:i:s') . "\n"
    . "IP: {$ip}\n\n"
    . "Mensagem:\n{$message}\n";

$remetente = 'no-reply@' . preg_replace('/^www\./', '', (string) ($_SERVER['HTTP_HOST'] ?? 'wellingtonbarboza.com'));

$headers = implode("\r\n", [
    'From: Portfolio <' . $remetente . '>',
    'Reply-To: ' . $email,
    'Content-Type: text/plain; charset=UTF-8',
    'MIME-Version: 1.0',
]);

$enviado = @mail(
    DESTINATARIO,
    '=?UTF-8?B?' . base64_encode($assunto) . '?=',
    $corpo,
    $headers,
    '-f' . $remetente
);

if (!$enviado) {
    responder(false, 'Não foi possível enviar agora. Tente pelo WhatsApp ou e-mail direto.', 500);
}

responder(true, 'Mensagem enviada com sucesso!');
