const bcrypt = require('bcryptjs');
console.log('Bcrypt:', typeof bcrypt);
console.log('Bcrypt keys:', Object.keys(bcrypt));
if (bcrypt.compare) {
    console.log('compare is present');
} else {
    console.log('compare is MISSING');
}
