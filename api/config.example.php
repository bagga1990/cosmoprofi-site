<?php
/*
 * Образец настроек приёма заявок.
 * На хостинге скопируйте этот файл в config.php (в ту же папку api/) и заполните.
 * config.php не хранится в репозитории: в нём токен бота и пароль почты.
 */
return [
    // Telegram: токен бота от @BotFather и chat_id получателей (человек или группа)
    'telegram_token' => '',
    'telegram_chats' => [],
    // Адрес Telegram API. Менять, только если хостинг не открывает api.telegram.org (тогда — адрес прокси)
    'telegram_api' => 'https://api.telegram.org',

    // Почта: куда присылать заявки
    'mail_to'   => ['Cosmo.profi-uchi@mail.ru'],
    // От чьего имени отправлять — обычно тот же ящик, что в smtp.user
    'mail_from' => '',

    // SMTP почтового ящика. Для Mail.ru: smtp.mail.ru, порт 465,
    // пароль — «пароль для внешних приложений» из настроек безопасности ящика.
    // Если оставить пустым, письмо уйдёт через mail() хостинга (чаще попадает в спам).
    'smtp' => ['host' => 'smtp.mail.ru', 'port' => 465, 'user' => '', 'pass' => ''],

    // С каких адресов сайта принимать заявки
    'allowed_origins' => ['https://cosmoprofiacademy.ru', 'https://www.cosmoprofiacademy.ru'],

    // Папка для копий заявок. Лучше вне публичной папки сайта, например:
    // 'data_dir' => dirname(__DIR__, 2) . '/leads',
    'data_dir' => __DIR__ . '/data',
];
