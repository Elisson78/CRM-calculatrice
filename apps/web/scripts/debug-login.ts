
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables FIRST
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function debugLogin() {
    // Now import modules that rely on env vars
    const { authenticateUser, findUserByEmail, verifyPassword } = await import('../src/lib/auth');
    const { pool } = await import('../src/lib/db');

    const email = process.argv[2];
    const password = process.argv[3];

    if (!email || !password) {
        console.log('Usage: npx tsx scripts/debug-login.ts <email> <password>');
        process.exit(1);
    }

    console.log('\n--- Debugging Login ---');
    console.log(`Email provided: ${email}`);
    console.log(`Password provided: ${'*'.repeat(password.length)}`);

    // 1. Check Environment Variables
    console.log('\n1. Checking Environment Variables...');
    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL is missing!');
    } else {
        console.log('✅ DATABASE_URL is set.');
        const url = process.env.DATABASE_URL;
        // Hide password simply by checking structure
        const match = url.match(/postgresql:\/\/([^:]+):([^@]+)@/);
        if (match) {
            console.log(`   User: ${match[1]}`);
            console.log(`   Password detected (length): ${match[2].length}`);
        }
    }

    if (!process.env.JWT_SECRET) {
        console.error('❌ JWT_SECRET is missing!');
    } else {
        console.log('✅ JWT_SECRET is set.');
    }

    try {
        // 2. Test DB Connection
        console.log('\n2. Testing Database Connection...');
        const client = await pool.connect();
        console.log('✅ Database connected successfully.');
        client.release();

        // 3. Find User
        console.log(`\n3. Searching for user: ${email}...`);
        const user = await findUserByEmail(email);

        if (!user) {
            console.error(`❌ User not found: ${email}`);
            console.log('Tip: Check if the email is correct in the "users" table.');
        } else {
            console.log('✅ User found:');
            console.log(`   ID: ${user.id}`);
            console.log(`   Role: ${user.role}`);

            const rawUser = await pool.query('SELECT password_hash FROM users WHERE email = $1', [email]);
            const passwordHash = rawUser.rows[0]?.password_hash;

            if (!passwordHash) {
                console.error('❌ User has no password_hash set!');
            } else {
                console.log('✅ User has a password hash.');

                // 4. Test Password
                console.log('\n4. Verifying verifyPassword directly...');
                const isMatch = await verifyPassword(password, passwordHash);

                if (isMatch) {
                    console.log('✅ Password Match: YES');
                } else {
                    console.error('❌ Password Match: NO');
                    console.log('Tip: The password provided does not match the stored hash.');
                }
            }
        }

        // 5. Test Full Authentication Flow
        console.log('\n5. Testing full authenticateUser() flow...');
        const authResult = await authenticateUser(email, password);

        if (authResult) {
            console.log('✅ Login Successful!');
            console.log('Token generated successfully');
        } else {
            console.error('❌ Login Failed via authenticateUser().');
        }

    } catch (error) {
        console.error('\n❌ Unexpected Error:', error);
    } finally {
        const { pool } = await import('../src/lib/db');
        await pool.end();
    }
}

debugLogin();
