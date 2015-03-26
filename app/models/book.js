exports.definition = {

	config : {
		"columns" : {},
		"defaults" : {},
		"adapter" : {
			"type" : "acs",
		},
		"settings" : {
			"object_name" : "book",
			"object_method" : "Objects"
		}
	},

	extendModel : function(Model) {
		_.extend(Model.prototype, {});
		return Model;
	},

	extendCollection : function(Collection) {
		_.extend(Collection.prototype, {});
		return Collection;
	}
};