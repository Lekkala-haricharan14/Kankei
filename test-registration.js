const http = require('http');

const data = JSON.stringify({
    name: 'Test User',
    email: 'test@example.com',
    password: 'test123',
    role: 'Client'
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log('Testing registration endpoint...\n');

const req = http.request(options, res => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers:`, JSON.stringify(res.headers, null, 2));

    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
        console.log('\nResponse Body:');
        try {
            console.log(JSON.stringify(JSON.parse(body), null, 2));
        } catch (e) {
            console.log(body);
        }
    });
});

req.on('error', error => {
    console.error('Error:', error.message);
});

req.write(data);
req.end();
