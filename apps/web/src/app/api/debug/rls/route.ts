import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { authenticatedQueryOne, queryOne } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getCurrentSession();

        // 1. Check DB connection user (session independent)
        const dbUser = await queryOne<{ current_user: string, session_user: string }>('SELECT current_user, session_user');

        // 2. Check Role and RLS status within an authenticated context (if logged in)
        let authContextResult = null;
        let rlsStatus = null;

        if (session) {
            try {
                // We run a query that checks the CURRENT effective role inside the transaction
                authContextResult = await authenticatedQueryOne<{
                    current_user: string,
                    current_role: string,
                    session_config_role: string,
                    session_config_id: string
                }>(`
          SELECT 
            current_user, 
            current_role,
            current_setting('app.current_user_role', true) as session_config_role,
            current_setting('app.current_entreprise_id', true) as session_config_id
        `, [], {
                    userId: session.userId,
                    role: session.role,
                    entrepriseId: session.entrepriseId
                });

                // Check RLS on devis table specifically
                // We can't easily check "is RLS on for this query" directly in SQL standard, 
                // but we can check if the table has RLS enabled.
                // More importantly, we want to know if specific rows are visible.
                const rlsCheck = await authenticatedQueryOne<{ count: string }>(
                    'SELECT count(*) FROM pg_policies WHERE tablename = \'devis\''
                    , [], { userId: session.userId, role: session.role, entrepriseId: session.entrepriseId });

                rlsStatus = rlsCheck;

            } catch (e: any) {
                authContextResult = { error: e.message };
            }
        }

        return NextResponse.json({
            env: process.env.NODE_ENV,
            db_connection: dbUser,
            session: session ? {
                userId: session.userId,
                role: session.role,
                entrepriseId: session.entrepriseId
            } : 'No active session',
            authenticated_context_check: authContextResult,
            rls_policies_found: rlsStatus
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
