exports.definition = {

    config : {
        "columns" : {
            "active" : "boolean"
        },
        "adapter" : {
            "type" : "acs",
            "collection_name" : "users"
        },
        "settings" : {
            "object_name" : "users",
            "object_method" : "Users"
        }
    },
    extendModel : function(Model) {

        function logout(_opts) {
            var self = this;
            this.config.Cloud.Users.logout(function(e) {
                if (e.success) {
                    _opts.success && _opts.success(null);
                    
                    // REMOVE session id
                    Ti.App.Properties.removeProperty('sessionId');
                } else {
                    _opts.error && _opts.error(self, (e.error && e.message) || e);
                }
            });
        }

        function showMe(_opts) {
            var self = this;
            this.config.Cloud.Users.showMe(function(e) {
                if (e.success) {
                    var user = e.users[0];
                    Ti.API.info('Logged in! You are now logged in as ' + user.id);
                    _opts.success && _opts.success(new model(user));
                } else {
                    Ti.API.error(e);
                    _opts.error && _opts.error(self, (e.error && e.message) || e);
                }
            });
        }

        function hasStoredSession() {
            return this.config.Cloud.hasStoredSession();
        }

        function retrieveStoredSession() {
            return this.config.Cloud.retrieveStoredSession();
        }

        function login(_login, _password, _opts) {
            var self = this;
            this.config.Cloud.Users.login({
                login : _login,
                password : _password
            }, function(e) {
                if (e.success) {
                    var user = e.users[0];
                    Ti.API.info('Logged in! You are now logged in as ' + user.id);

                    // save session id
                    Ti.App.Properties.setString('sessionId', e.meta.session_id);

                    _opts.success && _opts.success(new model(user));
                } else {
                    Ti.API.error(e);
                    _opts.error && _opts.error(self, (e.error && e.message) || e);
                }
            });
        }

        function authenticated() {
            // check for existing user session
            // check for session before logging in again
            debugger;
            if (Ti.App.Properties.hasProperty('sessionId')) {
                //set up cloud module to use saved session
                this.config.Cloud.sessionId = Ti.App.Properties.getString('sessionId');
                Ti.API.info('SESSION ID ' + this.config.Cloud.sessionId);
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
}