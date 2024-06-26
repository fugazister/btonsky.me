module.exports = {
	apps: [
		{
			script: 'index.js',
			name: 'btonsky',
			env_production: {
				PORT: '8080'
			}
		}
	],
	deploy: {
		production: {
			user: 'btonsky',
			host: ['164.90.174.67'],
			ref: 'origin/main',
			repo: 'git@github.com:fugazister/btonsky.me.git',
			path: '/home/btonsky/app',
			'post-deploy': 'npm i'
		}
	}
}