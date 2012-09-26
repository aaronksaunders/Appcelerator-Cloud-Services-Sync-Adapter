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
            this.config.Cloud.Users.logout(function(e) {
                if (e.success) {
                    _opts.success && _opts.success(null);
                } else {
                    _opts.error && _opts.error((e.error && e.message) || e);
                }
            });
        }

        function showMe(_opts) {
            this.config.Cloud.Users.showMe(function(e) {
                if (e.success) {
                    var user = e.users[0];
                    Ti.API.info('Logged in! You are now logged in as ' + user.id);
                    _opts.success && _opts.success(new model(user));
                } else {
                    Ti.API.error(e);
                    _opts.error && _opts.error((e.error && e.message) || e);
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
                    _opts.success && _opts.success(new model(user));
                } else {
                    Ti.API.error(e);
                    _opts.error && _opts.error((e.error && e.message) || e);
                }
            });
        }


        _.extend(Model.prototype, {
            login : login,
            showMe : showMe,
            logout : logout,
            retrieveStoredSession : retrieveStoredSession,
            hasStoredSession : hasStoredSession,
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