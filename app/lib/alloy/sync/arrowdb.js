 /*
 * ArrowDB (ACS) sync adapter for Backbone with Promise support using Q
 * A more efficient approach to an Cloud Services Adapter for Appcelerator Titanium Alloy
 * (c) 2015 Aaron K Saunders <https://github.com/aaronksaunders>
 * Documentation: https://github.com/aaronksaunders/Appcelerator-Cloud-Services-Sync-Adapter
 */
function S4() {
	return ((1 + Math.random()) * 65536 | 0).toString(16).substring(1);
}

function guid() {
	return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
}

function InitAdapter(config) {
	Cloud = require("ti.cloud"), Cloud.debug = config.debug, config.Cloud =
	Cloud;
}

function Sync(method, model, opts) {
	var Q = require('q');
	opts = opts || {};

	var name = model.config.adapter.name,
	    settings = model.config.settings,
	    data = model.config.data,
	    object_name = model.config.settings.object_name,
	    object_method = Cloud[model.config.settings.object_method];

	if(model.config.debug) Ti.API.debug("method " + method);

	var deferred = Q.defer();

	switch (method) {
		case "create":
			// stick attributes into the params variable
			var params = {};
			// if custom object then set the classname in params variable
			if (model.config.settings.object_method === "Objects") {
				params['fields']    = model.toJSON();
				params['classname'] = object_name;
				params              = relegateCustomObjectsAttributes(params);
			} else {
				params = model.toJSON();
			}
			object_method.create(params, function(e) {
				if (e.success) {
					model.meta = e.meta;
					opts.success && opts.success(e[object_name][0]), model.trigger("fetch");
					debugger;
					deferred.resolve(model);
					return;
				}
				Ti.API.error(e);
				opts.error && opts.error(e.error && e.message || e);
				deferred.reject(e);
			});
			break;
		case "read":
			//debugger;
			var id_name = object_name.replace(/s+$/, "") + "_id",
			    params = {};
			params[id_name] = model.id = opts.id || model.id;

			!opts.data ? opts.data = {} : opts.data;
			if (model.config.settings.object_method === "Objects") {
				opts.data['classname'] = object_name;
				opts.data['id'] = model.id;
			} else {
				id_name = object_name.replace(/s+$/, "") + "_id";
				model.id && (opts.data[id_name] = model.id);
			}

			if (model.id) {
				getObject(model, opts, deferred);
			} else if (opts && opts.data && opts.data.q) {
				searchObjects(model, opts, deferred);
			} else {
				getObjects(model, opts, deferred);
			}
			break;
		case "update":
			if(model.config.debug) Ti.API.debug(' updating object with id ' + model.id);

			var params = {};
			// if custom object then set the classname in params variable
			if (model.config.settings.object_method === "Objects") {
				params['fields']    = model.toJSON();
				params['classname'] = object_name;
				params['id']        = model.id;
				params              = relegateCustomObjectsAttributes(params);
			} else {
				params = model.toJSON();
				var id_name = object_name.replace(/s+$/, "") + "_id";
				params[id_name] = model.id = opts.id || model.id;
			}

			if (model.config.settings.object_method === "Reviews") {
				var reviewdObject = model.get('reviewed_object');
				params[reviewdObject.type.toLowerCase() + '_id'] = reviewdObject.id;
			}

			object_method.update(params, function(e) {
				if (e.success) {
					model.meta = e.meta;
					opts.success && opts.success(e[object_name][0]), model.trigger("fetch");
					return deferred.resolve(model);

				}
				Ti.API.error(e);
				opts.error && opts.error(e.error && e.message || e);
				return deferred.reject(e);
			}), model.trigger("fetch");
			break;
		case "delete":
			var id_name = "";
			var params = {};

			if (model.config.settings.object_method === "Objects") {
				params['classname'] = object_name;
				params['id'] = model.id;
			} else {
				id_name = object_name.replace(/s+$/, "") + "_id";
				params[id_name] = model.id;
			}

			if (model.config.settings.object_method === "Reviews") {
				var reviewdObject = model.get('reviewed_object');
				params[reviewdObject.type.toLowerCase() + '_id'] = reviewdObject.id;
			}

			object_method.remove(params, function(e) {
				if (e.success) {
					model.meta = e.meta;
					opts.success && opts.success({}), model.trigger("fetch");
					return deferred.resolve({});
				} else {
					Ti.API.error(e);
					opts.error && opts.error(e.error && e.message || e);
					return deferred.reject(e);
				}
			});
		}

	return deferred.promise;
}

/**
 * Because Custom Objects accept one single parameter called `fields` for all the custom attributes
 * we want to define for that Custom Object, also because there are other parameters we should be
 * able to pass along to the Cloud.Objects.create() and Cloud.Objects.update() queries, we have to
 * process what's passed to the parameters using model.toJSON() and potentially deport those
 * optional parameters to the query itself rather than using them within the `fields` attribute of a
 * Custom Object.
 *
 * Use cases for this are actually upon creation or modification of a Custom Object where for
 * example the `photo` attribute will be passed using the same JS Object alongside all the custom
 * fields and has also been populated using model.toJSON() within `params.fields`.
 *
 * @param  {Object}  params  The initial JS Object used for the API query
 * @return {Object}  params  The initial JS Object modified (or not)
 */
function relegateCustomObjectsAttributes(params) {
	// We only want to deal with Custom Objects
	if (! _.has(params, 'classname')) {
		return params;
	}
	// Let's clarify what attributes we are talking about
	var relegatable_attributes = [
		'photo',
		'photo_id',
		'pretty_json',
		'tags',
		'acl_name',
		'acl_id',
		'su_id'
	];
	// For each single one, we check if our model had them passed to it alongside the Custom Object
	// fields. If so we simply move those up (relegate) to the params of the query rather than leaving them
	// within the Custom Object fields.
	_.each(relegatable_attributes, function(attr){
		// `this` ==> params
		if (_.has(this.fields, attr)) {
			this[attr] = this.fields[attr];
			delete this.fields[attr];
		}
	}, params);

	return params;
}

function getObject(_model, _opts, _deferred) {
	var object_name = _model.config.settings.object_name,
	    object_method = Cloud[_model.config.settings.object_method];
	// if this is a custom object then I need to provide the classname

	if (!_opts.data['response_json_depth'] && _model.config.settings.response_json_depth) {
		_opts.data['response_json_depth'] = _model.config.settings.response_json_depth;
	}
	if(_model.config.debug) Ti.API.debug(" searching for object id " + JSON.stringify(_opts.data));
	object_method.show(_opts.data, function(e) {
		if (e.success) {
			if (_model.id) {
				_model.meta = e.meta;
				_opts.success && _opts.success(e[object_name][0]), _model.trigger("fetch");
				return _deferred.resolve(_model);
			}
		} else {
			Ti.API.error(e);
			_opts.error && _opts.error(e.error && e.message || e);
			return _deferred.reject(e);
		}
	});
}

function getObjects(_model, _opts, _deferred) {
	var object_name = _model.config.settings.object_name,
	    object_method = Cloud[_model.config.settings.object_method];
	if (_model.config.settings.object_method === "Objects") {
		!_opts.data ? _opts.data = {} : _opts.data;
		_opts.data['classname'] = object_name;
	}
	if (!_opts.data['response_json_depth'] && _model.config.settings.response_json_depth) {
		_opts.data['response_json_depth'] = _model.config.settings.response_json_depth;
	}
	if(_model.config.debug) Ti.API.debug(" querying for all objects of type " + _model.config.settings.object_name + " " + (_opts.data && _opts.data.q));
	object_method.query((_opts.data || {}), function(e) {
		if (e.success) {
			var retArray = [];
			for (var i in e[object_name]) {
				retArray.push(e[object_name][i]);
			}
			_model.meta = e.meta;
			_opts.success && _opts.success(retArray), _model.trigger("fetch");
			return _deferred.resolve(_model);
		} else {
			Ti.API.error(e);
			_opts.error && _opts.error(e.error && e.message || e);
			return _deferred.reject(e);
		}
	});
}

function searchObjects(_model, _opts, _deferred) {
	var object_name = _model.config.settings.object_name,
	    object_method = Cloud[_model.config.settings.object_method];
	if (_model.config.settings.object_method === "Objects") {
		!_opts.data ? _opts.data = {} : _opts.data;
		_opts.data['classname'] = object_name;
	}
	if(_model.config.debug) Ti.API.debug(" searching for all objects of type " + _model.config.settings.object_name + " " + _opts.data.q);
	object_method.search(_opts.data, function(e) {
		if (e.success) {
			var retArray = [];
			for (var i in e[object_name]) {
				retArray.push(e[object_name][i]);
			}
			_model.meta = e.meta;
			_opts.success && _opts.success(retArray), _model.trigger("fetch");

			return _deferred.resolve(_model);

		} else {
			Ti.API.error(e);
			_opts.error && _opts.error(e.error && e.message || e);
			return _deferred.reject(e);
		}
	});
}

var Cloud,
    _ = require("alloy/underscore")._;

module.exports.sync = Sync, module.exports.beforeModelCreate = function(config) {
	return config = config || {}, config.data = {}, InitAdapter(config), config;
}, module.exports.afterModelCreate = function(Model) {
	return Model = Model || {}, Model.prototype.config.Model =
	Model, Model;
};
