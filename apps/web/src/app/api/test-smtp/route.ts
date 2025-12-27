import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { host, port, user, pass, secure } = body;

        console.log(`🔌 Testando conexão SMTP para: ${host}:${port} (${user})`);

        if (!host || !port || !user || !pass) {
            return NextResponse.json(
                { error: 'Données manquantes. Veuillez remplir tous les champs SMTP.' },
                { status: 400 }
            );
        }

        const transporter = nodemailer.createTransport({
            host,
            port: Number(port),
            secure: secure, // true for 465, false for other ports
            auth: {
                user,
                pass,
            },
            tls: {
                rejectUnauthorized: false,
                ciphers: 'SSLv3'
            },
            connectionTimeout: 10000, // 10s
        });

        // Verificar conexão
        await new Promise((resolve, reject) => {
            transporter.verify(function (error, success) {
                if (error) {
                    console.error('❌ Erreur SMTP Verify:', error);
                    reject(error);
                } else {
                    console.log('✅ SMTP Ready');
                    resolve(success);
                }
            });
        });

        return NextResponse.json({
            success: true,
            message: 'Connexion SMTP réussie ! ✅'
        });

    } catch (error) {
        console.error('❌ Erreur test SMTP:', error);
        return NextResponse.json(
            {
                error: 'Échec de connexion SMTP',
                details: error instanceof Error ? error.message : 'Erreur inconnue'
            },
            { status: 500 }
        );
    }
}
