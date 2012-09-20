function S4() {
    return ((1 + Math.random()) * 65536 | 0).toString(16).substring(1);
}

function guid() {
    return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
}

function InitAdapter(config) {
    Cloud = require("ti.cloud"), Cloud.debug = !0, config.Cloud = Cloud;
}

function Sync(model, method, opts) {
    var name = model.config.adapter.name, settings = model.config.settings, data = model.config.data, object_name = model.config.settings.object_name, object_method = Cloud[model.config.settings.object_method];
    Ti.API.info("method " + method);
    switch (method) {
      case "create":
        object_method.create(model.toJSON(), function(e) {
            if (e.success) {
                var m = new model.config.Model(e[object_name][0]);
                opts.success && opts.success(e[object_name][0]), model.trigger("fetch");
                return;
            }
            opts.error && opts.error();
        });
        break;
      case "read":
        var id_name = object_name.replace(/s+$/, "") + "_id", params = {};
        params[id_name] = model.id = opts.id || model.id, model.id ? (Ti.API.info(" searching for object id " + model.id), object_method.show(params, function(e) {
            if (e.success) {
                if (model.id) {
                    var m = new model.config.Model(e[object_name][0]);
                    opts.success && opts.success(e[object_name][0]), model.trigger("fetch");
                    return;
                }
            } else opts.error && opts.error();
        })) : (Ti.API.info(" searching for all objects of type " + model.config.settings.object_name), object_method.query(function(e) {
            if (e.success) {
                if (e[object_name].length !== 0) {
                    var retArray = [];
                    for (var i in e[object_name]) {
                        var m = new model.config.Model(e[object_name][i]);
                        retArray.push(e[object_name][i]);
                    }
                    opts.success && opts.success(retArray), model.trigger("fetch");
                    return;
                }
            } else opts.error && opts.error();
        }));
        break;
      case "update":
        var params = model.toJSON(), id_name = object_name.replace(/s+$/, "") + "_id";
        params[id_name] = model.id, object_method.update(params, function(e) {
            if (e.success) {
                var m = new model.config.Model(e[object_name][0]);
                opts.success && opts.success(e[object_name][0]), model.trigger("fetch");
                return;
            }
            opts.error && opts.error();
        }), model.trigger("fetch");
        break;
      case "delete":
        var id_name = object_name.replace(/s+$/, "") + "_id", params = {};
        params[id_name] = model.id, object_method.remove(params, function(e) {
            if (e.success) {
                opts.success && opts.success({}), model.trigger("fetch");
                return;
            }
            opts.error && opts.error();
        });
    }
}

var Cloud, _ = require("alloy/underscore")._;

module.exports.sync = Sync, module.exports.beforeModelCreate = function(config) {
    return config = config || {}, config.data = {}, InitAdapter(config), config;
}, module.exports.afterModelCreate = function(Model) {
    return Model = Model || {}, Model.prototype.config.Model = Model, Model;
};