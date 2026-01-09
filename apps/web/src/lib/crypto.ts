import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'votre-cle-de-securite-de-32-chars-min'; // Deve ter 32 caracteres (256 bits)
const IV_LENGTH = 16; // Para AES, o IV deve ter 16 bytes

/**
 * Criptografa uma string
 */
export function encrypt(text: string): string {
    if (!text) return text;

    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    } catch (error) {
        console.error('Criptografia falhou:', error);
        return text;
    }
}

/**
 * Descriptografa uma string
 */
export function decrypt(text: string): string {
    if (!text) return text;

    try {
        const textParts = text.split(':');
        const iv = Buffer.from(textParts.shift() || '', 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (error) {
        // Se falhar, assume que o texto não estava criptografado (legado)
        // console.warn('Descriptografia falhou (possível texto plano):', error.message);
        return text;
    }
}
