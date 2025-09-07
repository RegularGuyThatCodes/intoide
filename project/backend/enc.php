<?php
// Fucking hell, welcome to Antoide backend encryption module

// AES-256-CBC encryption function
function encryptApp($appData, $key) {
    // Don't fuck around, generate a random IV every time
    $ivLength = openssl_cipher_iv_length('AES-256-CBC');
    $iv = openssl_random_pseudo_bytes($ivLength);

    // Encrypt that shit
    $encrypted = openssl_encrypt($appData, 'AES-256-CBC', $key, 0, $iv);

    if ($encrypted === false) {
        error_log("Encryption fucked up"); // seriously, check logs if shit breaks
        return null;
    }

    // Return IV + ciphertext so we can decrypt later, can't lose the IV
    return bin2hex($iv) . ':' . $encrypted;
}

// AES-256-CBC decryption function
function decryptApp($encryptedData, $key) {
    $parts = explode(':', $encryptedData);
    if (count($parts) !== 2) {
        error_log("Encrypted data fucked up, can't decrypt");
        return null;
    }

    $iv = hex2bin($parts[0]);
    $ciphertext = $parts[1];

    $decrypted = openssl_decrypt($ciphertext, 'AES-256-CBC', $key, 0, $iv);
    if ($decrypted === false) {
        error_log("Decryption fucked up"); // check this shit
        return null;
    }

    return $decrypted;
}

?>
