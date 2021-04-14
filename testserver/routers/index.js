/* routes/index.js */

/**
 * Main Router Sign
 * @param {object} app Express App
 * @param {object} routeroptions  Router Options set at Server Level. Can be overloaded
 * @param {object} dependecies Expressif dependecies
 */
// FIXME: Make a wrapper to this functions an expose an key:prop object to make the life easier to the clients
function registerRouters( app, routeroptions, dependecies = {} ) {
	// Router v1
	app.use( '/v1/healthcheck',   require('./healthcheck')(dependecies) );
	// Router v2
	app.use( '/v2/healthcheck',   require('./healthcheck/v2')(routeroptions, dependecies ) );
	// Router Product
	app.use( '/v1/products',   require('./products')(routeroptions, dependecies ) );
}

module.exports = registerRouters;

