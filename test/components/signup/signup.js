'use strict';
/* globals fetchMock */

var fetchMockLocal;

try {
  fetchMockLocal = fetchMock;
} catch (err) {
  fetchMockLocal = require('fetch-mock');
}

var Signup = exports.Signup || require('./../../../components/signup/signup').Signup;

describe('Signup', function() {
  it('should load', function() {
    expect(Signup).toBeDefined();
  });

  describe('contruction', function() {
    it('should construct', function() {
      var signup = new Signup();
      expect(signup).toBeDefined();
    });

    it('should support json', function() {
      var signup = new Signup({
        server: {
          url: 'http://localhost:8010'
        }
      });

      expect(signup).toBeDefined();
      expect(Signup.server.url).toEqual('http://localhost:8010');
    });
  });

  describe('signup', function() {
    afterEach(function() {
      fetchMockLocal.restore();
    });

    it('should require options', function() {
      var signup = new Signup();

      expect(function() {
        Signup.signup();
      }).toThrow(new Error('Login requires username and password'));
    });

    it('should require username', function() {
      var signup = new Signup();

      expect(function() {
        Signup.signup({
          password: 'IUH@8q98wejnsd'
        });
      }).toThrow(new Error('Login requires username and password'));
    });

    it('should require password', function() {
      var signup = new Signup();

      expect(function() {
        Signup.signup({
          username: 'anonymouse'
        });
      }).toThrow(new Error('Login requires username and password'));
    });

    it('should require a confirm password', function() {
      var signup = new Signup();

      expect(function() {
        Signup.signup({
          username: 'anonymouse',
          password: 'IUH@8q98wejnsd',
          confirmPassword: 'IUH@8q98wejndd'
        });
      }).toThrow(new Error('Passwords don\'t match, try again.'));
    });

    it('should signup', function(done) {
      var signup = new Signup({
        server: {
          url: 'http://localhost:8010'
        }
      });

      fetchMockLocal.mock({
        name: 'valid_signup',
        matcher: /authentication\/signup/,
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

      Signup.signup({
          username: 'anonymouse',
          password: 'IUH@8q98wejnsd',
          confirmPassword: 'IUH@8q98wejnsd'
        })
        .then(function(result) {
          expect(result.givenName).toEqual('Anony');
          expect(result.language).toEqual('fr');
          expect(result.createdAt).toEqual('2016-05-15T15:04:18.027Z');

          expect(fetchMockLocal.called('valid_signup')).toBeTruthy();

          done();
        })
        .catch(function(err) {
          expect(err).toBeNull();
          exect(false).toBeTruthy();

          expect(fetchMockLocal.called('valid_signup')).toBeTruthy();
          done();
        });
    });

    it('should accept a server url', function(done) {
      var signup = new Signup({
        server: 'http://example.com'
      });

      fetchMockLocal.mock({
        name: 'another_server',
        matcher: /authentication\/signup/,
        method: 'POST',
        response: {}
      });

      Signup.signup({
        username: 'anonymouse',
        password: 'IUH@8q98wejnsd',
        confirmPassword: 'IUH@8q98wejnsd',
        server: 'http://another.com'
      }).then(function(result) {
        expect(fetchMockLocal.called('another_server')).toBeTruthy();
        done();
      });
    });

    it('should handle 403', function(done) {
      var signup = new Signup({
        server: {
          url: 'http://localhost:8010'
        }
      });

      fetchMockLocal.mock({
        name: 'invalid_signup',
        matcher: /authentication\/signup/,
        method: 'POST',
        response: {
          status: 403,
          body: {
            message: 'Username already exists, please try again.'
          }
        }
      });

      Signup.signup({
          username: 'anonymouse',
          password: 'IUH@8q98wejnsd',
          confirmPassword: 'IUH@8q98wejnsd'
        })
        .then(function(result) {
          expect(result).toBeNull();
          expect(true).toBeFalsy();

          done();
        })
        .catch(function(err) {
          expect(err.status).toEqual(403);
          expect(err.statusText).toEqual('Forbidden');
          expect(err.message).toEqual('Username already exists, please try again.');
          // expect(err.url).toEqual('http://localhost:8010/v1/signup/signup');

          expect(fetchMockLocal.called('invalid_signup')).toBeTruthy();
          done();
        });
    });
  });
});
