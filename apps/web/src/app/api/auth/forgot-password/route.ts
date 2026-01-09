import { NextResponse } from 'next/server';
import { findUserByEmail } from '@/lib/auth';
import { query } from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email est requis' }, { status: 400 });
        }

        const user = await findUserByEmail(email);

        if (!user) {
            // Pour des raisons de sécurité, ne pas révéler que l'email n'existe pas
            return NextResponse.json({ message: 'Si cet email correspond à un compte, vous recevrez un lien de récupération.' });
        }

        // Générer um token aléatoire
        const token = crypto.randomBytes(32).toString('hex');
        const expiry = new Date(Date.now() + 3600000); // 1 heure

        // Enregistrer le token dans la base de données
        await query(
            'UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE id = $3',
            [token, expiry, user.id]
        );

        // Envoyer l'email
        const emailSent = await sendPasswordResetEmail(user.email, token);

        if (!emailSent) {
            return NextResponse.json({ error: 'Erreur lors de l\'envoi de l\'email' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Si cet email correspond à un compte, vous recevrez un lien de récupération.' });
    } catch (error) {
        console.error('Erreur forgot-password:', error);
        return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 });
    }
}
