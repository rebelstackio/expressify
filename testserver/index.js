/* index.js */
require('dotenv').config();

const cors = require('cors');
// const bodyParser = require('body-parser');
const methodOR  = require('method-override');

const Logger = require('./lib/logger');
const DB = require('../lib/db/pg');

global.E = require('../index');
// Set up logger based in the current environment
global.LOGGER = Logger({ level: process.env.LOG_LEVEL });
// Set up database
global.DB = new DB();
// Set up Authorization by privileges
global.A = new global.E.AuthByPrivs(process.env.JWT_SECRET);
// Set up the server
const server = global.E.ServerV2(
	{
		'port': process.env.PORT,
		// This is really important,
		'wdir': __dirname ,
		'schemas_options': {
			'draft06': true
		}
	},
);

// Configure middlewares here:
server.configureapp((app, express) => {
	app.disable('x-powered-by');
	app.use(cors({
		// Allow to continue with options endpoints
		preflightContinue: true
	}));

	// // Pass bodyparser options ( allows huge json bodies  )
	app.use(express.json({}));
	// for parsing application/x-www-form-urlencoded
	app.use(express.urlencoded({extended:true}));

	app.enable('trust proxy');

	app.use(methodOR('X-HTTP-Method-Override'));
});

// Unhandled exceptions
process.on('uncaughtException', function (err) {
	global.LOGGER.error('Unexpected Error:', err);
	process.exit(1);
});

if (process.env.NODE_ENV !== 'testing') {
	// Graceful-shutdown only in production or staging
	process.on('SIGINT', () => {
		global.LOGGER.info('SIGINT signal received.');
		try {
			// Close server
			server.stop();
			// Check db connection and close it
			if (global.db) {
				global.db.close();
			}
			process.exit(0);
		} catch (error) {
			global.LOGGER.error(error);
			process.exit(1);
		}
	});
}

server.start();
