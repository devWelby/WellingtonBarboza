<?php
declare(strict_types=1);

/**
 * Endpoint do formulário de contato do portfólio.
 * Recebe JSON { name, email, message } e envia por e-mail.
 */

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

const DESTINATARIO = 'contatowellington1587@gmail.com';

function responder(bool $success, string $message, int $status = 200): void
{
    http_response_code($status);
    echo json_encode(
        ['success' => $success, 'message' => $message],
        JSON_UNESCAPED_UNICODE
    );
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    responder(false, 'Método não permitido.', 405);
}

$payload = json_decode((string) file_get_contents('php://input'), true);
if (!is_array($payload)) {
    $payload = $_POST;
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

$assunto = sprintf('[Portfólio] Nova mensagem de %s', $name);

$corpo = "Nova mensagem enviada pelo formulário do portfólio.\n\n"
    . "Nome: {$name}\n"
    . "E-mail: {$email}\n"
    . 'Data: ' . date('d/m/Y H:i:s') . "\n"
    . 'IP: ' . ($_SERVER['REMOTE_ADDR'] ?? 'desconhecido') . "\n\n"
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
