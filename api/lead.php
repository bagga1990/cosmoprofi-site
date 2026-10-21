<?php
/*
 * Приём заявок с форм сайта.
 * Заявка сохраняется в файл на сервере, затем уходит в Telegram и на почту.
 * Настройки и секреты — в config.php рядом (образец: config.example.php).
 */
declare(strict_types=1);

ini_set('display_errors', '0');

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function reply(int $code, array $body): void {
    http_response_code($code);
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

if (!is_file(__DIR__ . '/config.php')) reply(500, ['ok' => false, 'error' => 'not_configured']);
$cfg = require __DIR__ . '/config.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') reply(405, ['ok' => false]);

/* только со своего сайта */
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = $cfg['allowed_origins'] ?? [];
if ($allowed && $origin !== '' && !in_array($origin, $allowed, true)) reply(403, ['ok' => false]);

$data = json_decode((string) file_get_contents('php://input', false, null, 0, 30000), true);
if (!is_array($data)) reply(400, ['ok' => false]);

/* ловушка для ботов: поле скрыто от людей */
if (!empty($data['website'])) reply(200, ['ok' => true]);

$clean = static fn($s, int $max = 500): string =>
    mb_substr(trim(preg_replace('/\s+/u', ' ', strip_tags((string) $s))), 0, $max);

$name  = $clean($data['name'] ?? '', 100);
$phone = $clean($data['phone'] ?? '', 40);
if ($name === '' || strlen(preg_replace('/\D/', '', $phone)) < 10) reply(422, ['ok' => false, 'error' => 'invalid']);
if (empty($data['consent_privacy']) || empty($data['consent_pd'])) reply(422, ['ok' => false, 'error' => 'consent']);

$fields = [];
foreach (array_slice((array) ($data['fields'] ?? []), 0, 30) as $f) {
    if (!is_array($f) || count($f) !== 2) continue;
    [$k, $v] = [$clean($f[0], 80), $clean($f[1])];
    if ($k !== '' && $v !== '') $fields[] = [$k, $v];
}
$page  = $clean($data['page'] ?? '', 200);
$url   = $clean($data['url'] ?? '', 300);
$ads   = !empty($data['consent_ads']);

/* не больше 5 заявок за 10 минут с одного адреса */
$dataDir = rtrim($cfg['data_dir'] ?? __DIR__ . '/data', '/');
if (!is_dir($dataDir)) @mkdir($dataDir, 0750, true);
$ip = $_SERVER['REMOTE_ADDR'] ?? '';
$rl = $dataDir . '/rl-' . md5($ip . date('Y-m-d'));
$now = time();
$hits = array_filter(array_map('intval', @file($rl, FILE_IGNORE_NEW_LINES) ?: []), static fn($t) => $t > $now - 600);
if (count($hits) >= 5) reply(429, ['ok' => false, 'error' => 'rate']);
$hits[] = $now;
@file_put_contents($rl, implode("\n", $hits));

$when = (new DateTime('now', new DateTimeZone('Europe/Moscow')))->format('d.m.Y H:i');

/* 1. копия заявки на сервере */
$record = ['time' => $when, 'name' => $name, 'phone' => $phone, 'fields' => $fields, 'page' => $page,
           'url' => $url, 'consent_ads' => $ads, 'ip' => $ip];
$stored = @file_put_contents($dataDir . '/leads-' . date('Y-m') . '.jsonl',
    json_encode($record, JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND | LOCK_EX) !== false;

/* текст заявки */
$lines = ["Имя: $name", "Телефон: $phone"];
foreach ($fields as [$k, $v]) $lines[] = "$k: $v";
$lines[] = '';
$lines[] = "Страница: $page";
if ($url !== '') $lines[] = $url;
$lines[] = 'Согласие на рассылку: ' . ($ads ? 'да' : 'нет');
$lines[] = "Время: $when (МСК)";
$subject = 'Заявка с сайта: ' . $name . ($page !== '' ? ' — ' . mb_substr($page, 0, 80) : '');

/* 2. Telegram */
$tgOk = false;
$token = $cfg['telegram_token'] ?? '';
foreach (($token !== '' ? ($cfg['telegram_chats'] ?? []) : []) as $chat) {
    $text = "<b>Новая заявка с сайта</b>\n\n" . htmlspecialchars(implode("\n", $lines), ENT_NOQUOTES, 'UTF-8');
    $res = http_post(rtrim($cfg['telegram_api'] ?? 'https://api.telegram.org', '/') . "/bot{$token}/sendMessage",
        ['chat_id' => $chat, 'text' => $text, 'parse_mode' => 'HTML', 'disable_web_page_preview' => 'true']);
    $tgOk = $tgOk || ($res !== null && str_contains($res, '"ok":true'));
}

/* 3. почта */
$mailOk = false;
$to = $cfg['mail_to'] ?? [];
if ($to) {
    $body = implode("\r\n", $lines);
    $smtp = $cfg['smtp'] ?? [];
    $mailOk = !empty($smtp['host']) && !empty($smtp['user'])
        ? smtp_send($smtp, $cfg['mail_from'] ?: $smtp['user'], $to, $subject, $body)
        : @mail(implode(',', $to), '=?UTF-8?B?' . base64_encode($subject) . '?=', $body,
            "MIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: 8bit\r\n"
            . ($cfg['mail_from'] ? "From: {$cfg['mail_from']}\r\n" : ''));
}

if (!$tgOk && !$mailOk && !$stored) reply(502, ['ok' => false, 'error' => 'delivery']);
reply(200, ['ok' => true]);


function http_post(string $url, array $params): ?string {
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [CURLOPT_POST => true, CURLOPT_POSTFIELDS => http_build_query($params),
            CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 10]);
        $res = curl_exec($ch);
        return $res === false ? null : $res;
    }
    $ctx = stream_context_create(['http' => ['method' => 'POST', 'timeout' => 10,
        'header' => "Content-Type: application/x-www-form-urlencoded\r\n", 'content' => http_build_query($params)]]);
    $res = @file_get_contents($url, false, $ctx);
    return $res === false ? null : $res;
}

/* Отправка письма через SMTP почтового ящика (порт 465, SSL). */
function smtp_send(array $s, string $from, array $to, string $subject, string $body): bool {
    $fp = @stream_socket_client((($s['secure'] ?? 'ssl') === 'ssl' ? 'ssl://' : 'tcp://') . $s['host'] . ':' . ($s['port'] ?? 465), $errno, $errstr, 15);
    if (!$fp) return false;
    stream_set_timeout($fp, 15);
    $read = static function () use ($fp): string {
        $out = '';
        while (($line = fgets($fp, 515)) !== false) { $out .= $line; if (isset($line[3]) && $line[3] === ' ') break; }
        return $out;
    };
    $cmd = static function (string $c, string $expect) use ($fp, $read): bool {
        fwrite($fp, $c . "\r\n");
        return str_starts_with($read(), $expect);
    };
    $ok = str_starts_with($read(), '220')
        && $cmd('EHLO ' . ($_SERVER['SERVER_NAME'] ?? 'localhost'), '250')
        && $cmd('AUTH LOGIN', '334') && $cmd(base64_encode($s['user']), '334') && $cmd(base64_encode($s['pass']), '235')
        && $cmd("MAIL FROM:<$from>", '250');
    foreach ($to as $rcpt) $ok = $ok && $cmd("RCPT TO:<$rcpt>", '25');
    if ($ok && $cmd('DATA', '354')) {
        $msg = "From: =?UTF-8?B?" . base64_encode('Сайт CosmoProfi') . "?= <$from>\r\n"
            . 'To: ' . implode(', ', $to) . "\r\n"
            . 'Subject: =?UTF-8?B?' . base64_encode($subject) . "?=\r\n"
            . 'Date: ' . date('r') . "\r\nMIME-Version: 1.0\r\n"
            . "Content-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
            . chunk_split(base64_encode($body)) . "\r\n.";
        $ok = $cmd($msg, '250');
    } else $ok = false;
    $cmd('QUIT', '221');
    fclose($fp);
    return $ok;
}
