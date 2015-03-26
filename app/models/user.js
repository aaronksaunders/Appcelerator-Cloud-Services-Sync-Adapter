exports.definition = {

	config : {
		"columns" : {},
		"adapter" : {
			"type" : "acs",
		},
		"settings" : {
			"object_name" : "users",
			"object_method" : "Users"
		}
	},
	extendModel : function(Model) {
		var Q = require('q');

		/**
		 *
		 */
		function logout(_opts) {
			var self = this;
			var deferred = Q.defer();
			_opts = _opts || {};
			this.config.Cloud.Users.logout(function(e) {
				if (e.success) {
					_opts.success && _opts.success(null);

					// REMOVE session id
					Ti.App.Properties.removeProperty('sessionId');
					_opts.success && _opts.success(null);
					deferred.resolve({});
				} else {
					_opts.error && _opts.error(self, (e.error && e.message) || e);
					deferred.reject(e);
				}
			});
			return deferred.promise;
		}

		/**
		 *
		 * @param {Object} _opts
		 */
		function showMe(_opts) {
			var self = this;
			var deferred = Q.defer();
			_opts = _opts || {};
			this.config.Cloud.Users.showMe(function(e) {
				if (e.success) {
					var user = e.users[0];
					Ti.API.debug('Logged in! You are now logged in as ' + user.id);
					var newModel = new model(user);
					_opts.success && _opts.success(newModel);
					deferred.resolve(newModel);
				} else {
					Ti.API.error(e);
					_opts.error && _opts.error(self, (e.error && e.message) || e);
					deferred.reject(e);
				}
			});
			return deferred.promise;
		}

		/**
		 *
		 */
		function hasStoredSession() {
			return this.config.Cloud.hasStoredSession();
		}

		/**
		 *
		 */
		function retrieveStoredSession() {
			return this.config.Cloud.sessionId;
		}

		/**
		 *
		 * @param {Object} _login
		 * @param {Object} _password
		 * @param {Object} _opts
		 */
		function login(_login, _password, _opts) {
			var self = this;
			var deferred = Q.defer();

			_opts = _opts || {};

			this.config.Cloud.Users.login({
				login : _login,
				password : _password
			}, function(e) {
				if (e.success) {
					var user = e.users[0];
					Ti.API.debug('Logged in! You are now logged in as ' + user.id);

					// save session id
					Ti.App.Properties.setString('sessionId', e.meta.session_id);
					var newModel = new model(user);
					_opts.success && _opts.success(newModel);
					deferred.resolve(newModel);
				} else {
					Ti.API.error(e);
					_opts.error && _opts.error(self, (e.error && e.message) || e);
					deferred.reject(e);
				}
			});
			return deferred.promise;
		}

		/**
		 *
		 */
		function authenticated() {
			// check for existing user session
			// check for session before logging in again
			debugger;
			if (Ti.App.Properties.hasProperty('sessionId')) {
				//set up cloud module to use saved session
				this.config.Cloud.sessionId = Ti.App.Properties.getString('sessionId');
				Ti.API.debug('SESSION ID ' + this.config.Cloud.sessionId);
				return true;
			} else {
				return false;
			}
		}


		_.extend(Model.prototype, {
			login : login,
			showMe : showMe,
			logout : logout,
			retrieveStoredSession : retrieveStoredSession,
			hasStoredSession : hasStoredSession,
			authenticated : authenticated,
		});
		// end extend

		return Model;
	},
	extendCollection : function(Collection) {
		_.extend(Collection.prototype, {

		});
		// end extend

		return Collection;
	}
};
