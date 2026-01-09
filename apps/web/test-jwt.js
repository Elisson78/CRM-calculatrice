const jwt = require('jsonwebtoken');
console.log('JWT:', typeof jwt);
console.log('JWT keys:', Object.keys(jwt));
if (jwt.sign) {
    console.log('sign is present');
} else {
    console.log('sign is MISSING');
}
