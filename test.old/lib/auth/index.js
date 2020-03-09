/* test/lib/auth/index.js */
'use strict';

const chai = require('chai');
const should = chai.should();
const expect = chai.expect;
const assert = chai.assert;

const MEREQ = require('../../mock/express/request.js');

const JWT = require('jwt-simple');
let ttl = new Date();
ttl.setHours(ttl.getHours() + 1);

const { Auth, AuthByPrivs, AuthByRoles } = require('../../../lib/auth');

describe('lib/auth/simple', function () {

	describe('$decodeJWT', function(){
		it('should return correctly decoded', function(){
			let token = {'exp':ttl.getTime(),'payload':{'a':1}};
			let testencode = JWT.encode(token,process.env.JWT_SECRET);
			let testdecode = Auth.decodeJWT(testencode, process.env.JWT_SECRET);
			expect(testdecode).to.deep.equal(token);
		});
	});

	describe('$encodeJWT', function(){
		it('should return correctly decoded', function(){
			let token = {'exp':ttl.getTime(),'payload':{'a':1}};
			let testencode = Auth.encodeJWT(token,process.env.JWT_SECRET);
			expect(testencode).to.deep.equal(JWT.encode(token, process.env.JWT_SECRET));
		});
	});

	describe('#constructor', function () {
		const auth = new Auth(process.env.JWT_SECRET, {});
		it('should return instanceof Auth', function(){
			expect(auth).to.be.instanceof(Auth);	
		});
	});

	describe('#generateAuthMiddleWare', function () {
		const auth = new Auth(process.env.JWT_SECRET, {});
		const user_jwt = JWT.encode({'exp': ttl.getTime(), 'user':{'id':'123'}}, process.env.JWT_SECRET );
		
		it('should return an function for use as authentication middleware',
			function () {
				const headers = { 'authorization': 'Bearer ' + user_jwt };
				const req = MEREQ(headers);
				const res = new (require('../../mock/express/response.js'))();

				const func_authChecker = auth.middleware();

				assert.equal(func_authChecker.length, 3, 'Middleware should expect three arguments');
			}
		);
	});

});

describe('lib/auth/authbyprivs', function () {

	describe('#constructor', function () {
		let auth = new AuthByPrivs(process.env.JWT_SECRET,{});
		it('should return instanceof Auth', function(){
			expect(auth).to.be.instanceof(Auth);	
		});
	});

	describe('#middleware', function () {
		let auth = new AuthByPrivs(process.env.JWT_SECRET,{});
		const user_jwt = JWT.encode({'exp':ttl.getTime(),'privileges':[1,15]}, process.env.JWT_SECRET );
		const bad_user_jwt = JWT.encode({'exp':ttl.getTime(),'privileges':[1,6]}, process.env.JWT_SECRET );
		
		it('should return an function for use as authentication middleware',function() {
				const headers = { 'authorization': 'Bearer ' + user_jwt };
				const req = MEREQ(headers);
				const res = new (require('../../mock/express/response.js'))();
				const func_authChecker = auth.middleware([0,7]);
				assert.equal(func_authChecker.length, 3, 'Middleware should expect three arguments');
			}
		);

		it('should return the next callback with no error parameter when privileges match', function(done) {
			const headers = { 'authorization': 'Bearer ' + user_jwt };
			const req = MEREQ(headers);
			const res = new (require('../../mock/express/response.js'))();
			const func_authChecker = auth.middleware([0,7]);
			func_authChecker(req, res, function(error){
				expect(error).to.be.undefined;
				done();
			});
		});

		it('should RESPOND X-error-code 401.13 when privileges mismatch', function(done) {
			const headers = { 'authorization': 'Bearer ' + bad_user_jwt };
			const req = MEREQ(headers);
			const res = new (require('../../mock/express/response.js'))();
			const func_authChecker = auth.middleware([0,7]);
			const response = func_authChecker(req, res, function(error_response){
				expect(error_response._header["X-Error-Code"]).to.equal("401.13");
				done();
			});
		});

	});		

});


describe('lib/auth/authbyroles', function () {

	describe('#constructor', function () {
		let auth = new AuthByRoles(process.env.JWT_SECRET,{});
		it('should return instanceof Auth', function(){
			expect(auth).to.be.instanceof(Auth);	
		});
	});

	describe('#middleware', function () {
		let auth = new AuthByRoles(process.env.JWT_SECRET,{});
		const user_jwt = JWT.encode({'exp':ttl.getTime(),'roles':["role1","role2"]}, process.env.JWT_SECRET );
		const bad_user_jwt = JWT.encode({'exp':ttl.getTime(),'roles':["notrole1","notrole2"]}, process.env.JWT_SECRET );
		
		it('should return an function for use as authentication middleware',function() {
				const headers = { 'authorization': 'Bearer ' + user_jwt };
				const req = MEREQ(headers);
				const res = new (require('../../mock/express/response.js'))();
				const func_authChecker = auth.middleware(["role1"],["notrole1"]);
				assert.equal(func_authChecker.length, 3, 'Middleware should expect three arguments');
			}
		);

		it('should return the next callback with no error parameter when roles match', function(done) {
			const headers = { 'authorization': 'Bearer ' + user_jwt };
			const req = MEREQ(headers);
			const res = new (require('../../mock/express/response.js'))();
			const func_authChecker = auth.middleware(["role1"],["notrole1"]);
			func_authChecker(req, res, function(error){
				expect(error).to.be.undefined;
				done();
			});
		});

		it('should RESPOND X-error-code 401.13 when roles mismatch', function(done) {
			const headers = { 'authorization': 'Bearer ' + bad_user_jwt };
			const req = MEREQ(headers);
			const res = new (require('../../mock/express/response.js'))();
			const func_authChecker = auth.middleware(["role1"],["notrole1"]);
			const response = func_authChecker(req, res, function(error_response){
				expect(error_response._header["X-Error-Code"]).to.equal("401.13");
				done();
			});
		});

	});		

});
