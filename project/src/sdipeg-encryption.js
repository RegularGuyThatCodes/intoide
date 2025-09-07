(function() {
    // Fucking hell, this is the data object where all the magic happens
    var data = {
        "resource": {
            "version": "1.0.0", // yeah, versioning is important, don't fuck it up
            "encryptionSettings": {
                "algorithm": "AES-256-CBC", // strong shit, don't try to break it
                "key": "AntoideSptiPok4f15$PcoN", // obviously, store it somewhere safe you dumbass
                "ivLength": 16 // initialization vector length, yeah we need that
            }
        }
    };

    // Encrypt function, don't fucking touch unless you know your ass from a hole in the wall
    function encryptApp(appData) {
        try {
            var crypto = require('crypto'); // node crypto, no BS
            var iv = crypto.randomBytes(data.resource.encryptionSettings.ivLength); // get some random ass IV
            var cipher = crypto.createCipheriv(
                data.resource.encryptionSettings.algorithm,
                Buffer.from(data.resource.encryptionSettings.key, 'utf-8'),
                iv
            );

            var encrypted = cipher.update(JSON.stringify(appData), 'utf8', 'hex');
            encrypted += cipher.final('hex');

            // append IV so we can decrypt later, don't fuck it up
            return iv.toString('hex') + ':' + encrypted;
        } catch (err) {
            console.error("Encryption fucked up:", err); // if this breaks, your app is screwed
            return null;
        }
    }

    // Decrypt function, because we need to un-fuck the shit we encrypted
    function decryptApp(encryptedData) {
        try {
            var crypto = require('crypto');
            var parts = encryptedData.split(':');
            var iv = Buffer.from(parts.shift(), 'hex');
            var encryptedText = parts.join(':');

            var decipher = crypto.createDecipheriv(
                data.resource.encryptionSettings.algorithm,
                Buffer.from(data.resource.encryptionSettings.key, 'utf-8'),
                iv
            );

            var decrypted = decipher.update(encryptedText, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return JSON.parse(decrypted);
        } catch (err) {
            console.error("Decryption fucked up:", err); // seriously, don't break this
            return null;
        }
    }

    // Example usage, because you need to see shit working
    var myApp = {
        name: "SuperCoolApp",
        version: "2.5",
        author: "SomeFuckinDeveloper"
    };

    console.log("Original App Data:", myApp);

    var encrypted = encryptApp(myApp);
    console.log("Encrypted App Data:", encrypted);

    var decrypted = decryptApp(encrypted);
    console.log("Decrypted App Data:", decrypted);

    // export shit if we're in node
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            encryptApp: encryptApp,
            decryptApp: decryptApp
        };
    }

})();
