const http = require('node:http');
const https = require('node:https');
const { parse } = require('node-html-parser');
const BASE_URL = 'https://tonsky.me';
const vigenere = require('vigenere');

let pageTitle = '';

function get(url, successCallback, errorCallback) {
	https.get(url, (res) => {
		let data = [];
		let response;
	
		res.on('data', chunk => {
			data.push(chunk);
		});
	
		res.on('end', () => {
			response = Buffer.concat(data).toString();
			successCallback(response);
		});
	}).on('error', (error) => {
		errorCallback(error);
	})
}

function theRemover(domString) {
	const root = parse(domString);

	pageTitle = root.querySelector('title').textContent;
  
	[
		...root.querySelectorAll('.dark_mode'),
		...root.querySelectorAll('.cover'),
		...root.querySelectorAll('.spacer'),
		...root.querySelectorAll('.pointers'),
		...root.querySelectorAll('.menu'),
		...root.querySelectorAll('title'),
		...root.querySelectorAll('script'),
		...root.querySelectorAll('img'),
		...root.querySelectorAll('meta'),
		...root.querySelectorAll('link'),
		...root.querySelectorAll('video'),
	].forEach(el => el.remove());

	root.querySelectorAll('a').forEach(link => {
		let href = link.getAttribute('href');

		if (href.startsWith('/')) {
			link.setAttribute('href', `${BASE_URL}${href}`);
		}
	});

	const result = root.textContent;

	return result;
}

function theCipher(input) {
	return vigenere.encode(input, 'nikitonsky').split('').join(' ');
}

function thePackager(input) {
	const parsedInput = input;
	const result = `
	<html>
		<head>
			<title>${pageTitle}</title>
		</head>
		<body style="font-family: monospace; font-size: large; text-transform: uppercase">${parsedInput}</body>
	</html>`;

	return result;
}

const server = http.createServer((req, res) => {
	if (req.url.includes('favicon')) {
		res.writeHead(404);
		return res.end();
	}

	get(`${BASE_URL}${req.url}`, (response) => {
		res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
		res.end(thePackager(theCipher(theRemover(response))));
	}, () => {
		res.writeHead(418);
		res.end();
	});
});

if (typeof process.env.PORT === 'undefined') {
	console.error('PORT environment variable must be set');
} else {
	server.listen(process.env.PORT);
}
