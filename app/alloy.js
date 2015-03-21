// The contents of this file will be executed before any of
// your view controllers are ever executed, including the index.
// You have access to all functionality on the `Alloy` namespace.
//
// This is a great place to do any initialization for your app
// or create any global variables/functions that you'd like to
// make available throughout your app. You can easily make things
// accessible globally by attaching them to the `Alloy.Globals`
// object. For example:
//
// Alloy.Globals.someGlobalFunction = function(){};

Alloy.C = function(name, modelDesc, model) {
	var extendObj = {
		model : model
	};
	var config = ( model ? model.prototype.config : {}) || {};
	var mod;
	if (config.adapter && config.adapter.type) {
		mod = require("alloy/sync/" + config.adapter.type);
		extendObj.sync = function(method, model, opts) {
			return mod.sync(method, model, opts);
		};
	} else
		extendObj.sync = function(method, model) {
			Ti.API.warn("Execution of " + method + "#sync() function on a collection that does not support persistence");
			Ti.API.warn("model: " + JSON.stringify(model.toJSON()));
		};
	var Collection = Backbone.Collection.extend(extendObj);
	Collection.prototype.config = config;
	_.isFunction(modelDesc.extendCollection) && ( Collection = modelDesc.extendCollection(Collection) || Collection);
	mod && _.isFunction(mod.afterCollectionCreate) && mod.afterCollectionCreate(Collection);
	return Collection;
};

Alloy.M = function(name, modelDesc, migrations) {
	var config = (modelDesc || {}).config || {};
	var adapter = config.adapter || {};
	var extendObj = {};
	var extendClass = {};
	var mod;
	if (adapter.type) {
		mod = require("alloy/sync/" + adapter.type);
		extendObj.sync = function(method, model, opts) {
			return mod.sync(method, model, opts);
		};
	} else
		extendObj.sync = function(method, model) {
			Ti.API.warn("Execution of " + method + "#sync() function on a model that does not support persistence");
			Ti.API.warn("model: " + JSON.stringify(model.toJSON()));
		};
	extendObj.defaults = config.defaults;
	migrations && (extendClass.migrations = migrations);
	mod && _.isFunction(mod.beforeModelCreate) && ( config = mod.beforeModelCreate(config, name) || config);
	var Model = Backbone.Model.extend(extendObj, extendClass);
	Model.prototype.config = config;
	_.isFunction(modelDesc.extendModel) && ( Model = modelDesc.extendModel(Model) || Model);
	mod && _.isFunction(mod.afterModelCreate) && mod.afterModelCreate(Model, name);
	return Model;
};

