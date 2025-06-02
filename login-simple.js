#!/usr/bin/env node

const http = require('http');
const fs = require('fs');

const BASE_URL = 'http://localhost:4000'; // API Gateway

function makeRequest(method, path, data) {
    return new Promise((resolve, reject) => {
        const url = new URL(BASE_URL + path);
        
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (data) {
            const postData = JSON.stringify(data);
            options.headers['Content-Length'] = Buffer.byteLength(postData);
        }

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                try {
                    const response = JSON.parse(body);
                    resolve({ 
                        status: res.statusCode, 
                        data: response, 
                        headers: res.headers,
                        cookies: res.headers['set-cookie']
                    });
                } catch (error) {
                    resolve({ 
                        status: res.statusCode, 
                        data: body, 
                        headers: res.headers,
                        cookies: res.headers['set-cookie']
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function login() {
    console.log('🔐 Logging in as admin...');
    
    const loginData = {
        email: 'admin@test.com',
        password: 'admin123'
    };

    try {
        const response = await makeRequest('POST', '/api/users/signin', loginData);
        
        if (response.status === 200) {
            console.log('✅ Login successful');
            
            // Extract session cookie
            const cookies = response.cookies;
            if (cookies && cookies.length > 0) {
                const sessionCookie = cookies.find(cookie => cookie.includes('session='));
                if (sessionCookie) {
                    // Save just the session cookie value
                    const cookieValue = sessionCookie.split(';')[0]; // Get just "session=value" part
                    fs.writeFileSync('session-cookie.txt', cookieValue);
                    console.log('✅ Session cookie saved to session-cookie.txt');
                    return cookieValue;
                } else {
                    console.log('❌ No session cookie found');
                    return null;
                }
            } else {
                console.log('❌ No cookies in response');
                return null;
            }
        } else {
            console.log('❌ Login failed:', response.data);
            return null;
        }
    } catch (error) {
        console.error('❌ Login error:', error.message);
        return null;
    }
}

async function main() {
    const cookie = await login();
    if (cookie) {
        console.log('🎉 Ready to run tests with authenticated session');
    } else {
        console.log('❌ Failed to get authentication cookie');
    }
}

main().catch(console.error);
