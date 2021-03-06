/* lib/middlewares/authvalidator/index.js */
'use strict';

const ERROR = require('../../exception');
const RESPOND = require('../../respond');
const Auth = require('../../auth/');

/**
 * Auth Middleware
 * @param {string} type [public, simple, privileges, roles]
 */
module.exports = function authvalidatormwr({ type = 'public', rprivs = null, /*dprivs = null,*/ rroles = null, droles = null, secret = process.env.JWT_SECRET }) {
	// Return the express middleware function
	return function validateReq(req, res, next) {
		let dtoken, token;
		try {
			token = Auth.parseAuthHeaders(req.headers);
		} catch (e) {
			return RESPOND.notAuthorized(res, req, e);
		}
		try {
			dtoken = Auth.decodeJWT(token, secret);
		} catch (e) {
			const err = Auth.decodeErr(e);
			switch (true) {
			case (err instanceof ERROR.AuthError):
				return RESPOND.notAuthorized(res, req, err);
			default:
				return RESPOND.serverError(res, req, err);
			}
		}
		req.dtoken = dtoken;

		if ( type === 'simple' ) {
			// Nothing to do Request already check the JWT is inside - Just call the callback
			return next();
		} else if( type === 'privileges' ){
			// Check privileges in the JWT
			if ( req.dtoken.privileges ) {
				if ( !Array.isArray( req.dtoken.privileges ) ) {
					const err = new ERROR.AuthError( 'JWT payload is corrupt', ERROR.codes.JWT_PAYLOAD_CORRUPT );
					return RESPOND.NotAuthorized( res, req, err );
				} else {
					const _isInt = function _isInt ( val ) {
						return !isNaN(val) && (function(x) { return (x | 0) === x; })(parseFloat(val));
					};
					const _isMatchingUserPriv = function _isMatchingUserPriv ( priv, idx ) {
						switch ( priv ) {
						case undefined:
						case 0: return true;
						default:
							if ( _isInt(req.dtoken.privileges[idx]) ) {
								return Boolean( (req.dtoken.privileges[idx] & priv) == priv );
							} else {
								//FIXME: Avoid throw an error
								throw new Error(`privileges are corrupt - expected integer but received: ${req.dtoken.privileges[idx]}`);
							}
						}
					};
					if ( rprivs.every(_isMatchingUserPriv) ) {
						return next();
					} else {
						let errobj = new ERROR.Unauthorized('Insufficient privileges',ERROR.codes.INSUFFICIENT_PRIVILEGES);
						return next(RESPOND.notAuthorized(res, req, errobj));
					}
				}
			} else {
				let errobj = new ERROR.BadAuth('User token payload missing privileges property', ERROR.codes.JWT_PAYLOAD_CORRUPT);
				return next(RESPOND.notAuthorized(res, req, errobj));
			}
		} else if ( type === 'roles ') {
			// Check rroles and droles in the JWT
			if ( req.dtoken.roles ) {
				if ( !Array.isArray( req.dtoken.roles ) ) {
					const err = new ERROR.AuthError( 'JWT payload is corrupt', ERROR.codes.JWT_PAYLOAD_CORRUPT );
					return RESPOND.NotAuthorized( res, req, err );
				} else {
					const _isMatchingUserRole = function _isMatchingUserRole ( role ) {
						return req.dtoken.roles.includes(role);
					};
					if ( !rroles.every(_isMatchingUserRole) || droles.every(_isMatchingUserRole) ) {
						let errobj = new ERROR.Unauthorized('Insufficient privileges',ERROR.codes.INSUFFICIENT_PRIVILEGES);
						return next(RESPOND.notAuthorized(res, req, errobj));
					} else {
						return next();
					}
				}
			} else {
				let errobj = new ERROR.BadAuth('User token payload missing privileges property', ERROR.codes.JWT_PAYLOAD_CORRUPT);
				return next(RESPOND.notAuthorized(res, req, errobj));
			}
		} else {
			// Pass the callback
			return next();
		}
	}.bind(this);
};
