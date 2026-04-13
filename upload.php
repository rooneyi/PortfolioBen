<?php
// Simple handler pour recevoir les demandes avec pièces jointes

$to = 'rc-service@rc-service.tech';
$subject = $_POST['subject'] ?? 'Demande de diagnostic';
$body = $_POST['body'] ?? '';
$name = $_POST['name'] ?? '';
$phone = $_POST['phone'] ?? '';
$address = $_POST['address'] ?? '';

// Sécurisation basique : n'autoriser que certains types de fichiers (whitelist)
$maxSize = 10 * 1024 * 1024; // 10 Mo
$allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'];
$allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
];

$bodyFull = "--- INFORMATIONS CLIENT ---\n" .
    "Nom: $name\n" .
    "Téléphone: $phone\n" .
    "Adresse: $address\n\n" .
    $body;

$from = 'no-reply@rc-service.tech';
$boundary = md5(uniqid((string)time(), true));

$headers = "From: RC Service <{$from}>\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: multipart/mixed; boundary=\"{$boundary}\"";

$message = "--{$boundary}\r\n";
$message .= "Content-Type: text/plain; charset=\"utf-8\"\r\n";
$message .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
$message .= $bodyFull . "\r\n";

if (!empty($_FILES['attachments']['name'][0])) {
    $count = count($_FILES['attachments']['name']);
    for ($i = 0; $i < $count; $i++) {
        if ($_FILES['attachments']['error'][$i] !== UPLOAD_ERR_OK) {
            continue;
        }
        $tmpName = $_FILES['attachments']['tmp_name'][$i];
        $fileName = basename($_FILES['attachments']['name'][$i]);
        $fileType = mime_content_type($tmpName) ?: 'application/octet-stream';

        // Taille max
        if (filesize($tmpName) > $maxSize) {
            http_response_code(400);
            header('Content-Type: application/json');
            echo json_encode([
                'success' => false,
                'error' => 'Un fichier est trop volumineux (max 10 Mo).',
            ]);
            exit;
        }

        // Vérification extension
        $ext = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
        if (!in_array($ext, $allowedExtensions, true)) {
            http_response_code(400);
            header('Content-Type: application/json');
            echo json_encode([
                'success' => false,
                'error' => 'Type de fichier non autorisé.',
            ]);
            exit;
        }

        // Vérification type MIME
        if (!in_array($fileType, $allowedMimeTypes, true)) {
            http_response_code(400);
            header('Content-Type: application/json');
            echo json_encode([
                'success' => false,
                'error' => 'Type de fichier non autorisé (MIME).',
            ]);
            exit;
        }
        $fileData = chunk_split(base64_encode(file_get_contents($tmpName)));

        $message .= "--{$boundary}\r\n";
        $message .= "Content-Type: {$fileType}; name=\"{$fileName}\"\r\n";
        $message .= "Content-Transfer-Encoding: base64\r\n";
        $message .= "Content-Disposition: attachment; filename=\"{$fileName}\"\r\n\r\n";
        $message .= $fileData . "\r\n";
    }
}

$message .= "--{$boundary}--";

$success = mail($to, $subject, $message, $headers);

header('Content-Type: application/json');
echo json_encode(['success' => (bool) $success]);
