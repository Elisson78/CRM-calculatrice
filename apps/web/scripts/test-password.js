const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.env.local' });

const email = 'mv@gmail.com';
const hash = '$2b$12$LdNRDqEQQMjlPM4egWANQeAlgK7CfhqbQXGeh9k0uju1xsddBJrWm';
const passwordToTest = '123456'; // Just a guess

async function test() {
    console.log('Testing password for:', email);
    console.log('Hash:', hash);

    const isValid = await bcrypt.compare(passwordToTest, hash);
    console.log(`Is '123456' valid?`, isValid);

    const jwtSecret = process.env.JWT_SECRET;
    console.log('JWT_SECRET defined?', !!jwtSecret);

    if (jwtSecret) {
        try {
            const token = jwt.sign({ userId: 'test' }, jwtSecret);
            console.log('JWT generation works');
        } catch (e) {
            console.error('JWT generation failed:', e.message);
        }
    }
}

test();
