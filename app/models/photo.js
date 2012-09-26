exports.definition = {

    config : {
    "columns": {
        "active": "boolean"
    },
    "defaults": {},
    "adapter": {
        "type": "acs",
    },
    "settings": {
        "object_name": "photos",
        "object_method": "Photos"
    }
    },

    extendModel : function(Model) {
        _.extend(Model.prototype, {


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