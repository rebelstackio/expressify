/* lib/error/types.js */

module.exports = {
	/* 2xx */
	oK: 'Ok',
	created: 'Created',
	accepted: 'Accepted',
	noContent: 'NoContent',
	resetContent: 'ResetContent',
	partialContent: 'PartialContent',
	/* 3XX */
	notModified: 'NotModified',
	temporaryRedirect: 'Temporary Redirect',
	/* 4XX */
	badRequest:  'BadRequest',
	unauthorized: 'Unauthorized',
	paymentRequired: 'PaymentRequired',
	forbidden: 'Forbidden',
	notFound: 'NotFound',
	methodNotAllowed: 'MethodNotAllowed',
	notAcceptable: 'NotAcceptable',
	proxyAuthenticationRequired: 'ProxyAuthenticationRequired',
	RequestTimeout: 'requestTimeout',
	conflict: 'Conflict',
	/* 5XX */
	serverError: 'ServerError',
	notImplemented: 'NotImplemented',
	badGateway: 'BadGateway',
	serviceUnavailable: 'ServiceUnavailable',
	gatewayTimeout: 'GatewayTimeout',
};
