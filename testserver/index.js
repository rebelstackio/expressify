/* index.js */
require('dotenv').config();

global.E = require('../index');
// Set up logger based in the current environment
global.LOGGER = console;
// Set up Authorization by privileges
global.A = new E.AuthByPrivs(process.env.JWT_SECRET);
// Set up the server
const server = new E.Server(
	{
		"port": process.env.PORT,
		"routers": [
			{ "relpath": "routers" }
		],
		"port": process.env.PORT,
		"bodyparser": {
			"limit": '10mb',
			"extended": true
		}
	},
	{
		gLOGGER: global.LOGGER
	}
);

// Unhandled exceptions
process.on('uncaughtException', function (err) {
	LOGGER.error('Unexpected Error:', err);
	process.exit(1);
});

if (process.env.NODE_ENV !== 'testing') {
	// Graceful-shutdown only in production or staging
	process.on('SIGINT', () => {
		LOGGER.info('SIGINT signal received.');
		try {
			// Close server
			server.close();
			// Check db connection and close it
			if (global.db) {
				global.db.close();
			}
			process.exit(0);
		} catch (error) {
			LOGGER.error(error);
			process.exit(1);
		}
	});
}

server.start();