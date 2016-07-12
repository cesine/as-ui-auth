'use strict';
/* globals fetchMock */

var fetchMockLocal;

try {
  fetchMockLocal = fetchMock;
} catch (err) {
  fetchMockLocal = require('fetch-mock');
}

var Login = exports.Login || require('./../../../components/login/login').Login;

describe('Login', function() {
  it('should load', function() {
    expect(Login).toBeDefined();
  });

  describe('contruction', function() {
    it('should construct', function() {
      var login = new Login();
      expect(login).toBeDefined();
    });

    it('should support json', function() {
      var login = new Login({
        server: {
          url: 'http://localhost:8010'
        }
      });

      expect(login).toBeDefined();
      expect(Login.server.url).toEqual('http://localhost:8010');
    });
  });

  describe('login', function() {
    afterEach(function() {
      fetchMockLocal.restore();
    });

    it('should require options', function() {
      var login = new Login();

      expect(function() {
        Login.login();
      }).toThrow(new Error('Login requires username and password'));
    });

    it('should require username', function() {
      var login = new Login();

      expect(function() {
        Login.login({
          password: 'IUH@8q98wejnsd'
        });
      }).toThrow(new Error('Login requires username and password'));
    });

    it('should require password', function() {
      var login = new Login();

      expect(function() {
        Login.login({
          username: 'anonymouse'
        });
      }).toThrow(new Error('Login requires username and password'));
    });

    it('should login', function(done) {
      var login = new Login({
        server: {
          url: 'http://localhost:8010'
        }
      });

      fetchMockLocal.mock({
        name: 'valid_login',
        matcher: /\/v1\/login\/login/,
        method: 'POST',
        response: {
          id: 1,
          givenName: 'Anony',
          language: 'fr',
          username: 'anonymouse',
          createdAt: '2016-05-15T15:04:18.027Z',
          updatedAt: '2016-05-15T15:04:18.027Z'
        }
      });

      Login.login({
          username: 'anonymouse',
          password: 'IUH@8q98wejnsd'
        })
        .then(function(result) {
          expect(result.givenName).toEqual('Anony');
          expect(result.language).toEqual('fr');
          expect(result.createdAt).toEqual('2016-05-15T15:04:18.027Z');

          expect(fetchMockLocal.called('valid_login')).toBeTruthy();

          done();
        })
        .catch(function(err) {
          expect(err).toBeNull();
          exect(false).toBeTruthy();

          expect(fetchMockLocal.called('valid_login')).toBeTruthy();
          done();
        });
    });

    it('should accept a server url', function(done) {
      var login = new Login({
        server: 'http://example.com'
      });

      fetchMockLocal.mock({
        name: 'another_server',
        matcher: /\/v1\/login\/login/,
        method: 'POST',
        response: {}
      });

      Login.login({
        username: 'anonymouse',
        password: 'IUH@8q98wejnsd',
        server: 'http://another.com'
      }).then(function(result) {
        expect(fetchMockLocal.called('another_server')).toBeTruthy();
        done();
      });
    });

    it('should handle 403', function(done) {
      var login = new Login({
        server: {
          url: 'http://localhost:8010'
        }
      });

      fetchMockLocal.mock({
        name: 'invalid_login',
        matcher: /\/v1\/login\/login/,
        method: 'POST',
        response: {
          status: 403,
          body: {
            message: 'Invalid username or password, please try again.'
          }
        }
      });

      Login.login({
          username: 'anonymouse',
          password: 'IUH@8q98wejnsd'
        })
        .then(function(result) {
          expect(result).toBeNull();
          expect(true).toBeFalsy();

          done();
        })
        .catch(function(err) {
          expect(err.status).toEqual(403);
          expect(err.statusText).toEqual('Forbidden');
          expect(err.message).toEqual('Invalid username or password, please try again.');
          // expect(err.url).toEqual('http://localhost:8010/v1/login/login');

          expect(fetchMockLocal.called('invalid_login')).toBeTruthy();
          done();
        });
    });
  });
});
