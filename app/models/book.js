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
        "object_name": "book",
        "object_method": "Objects"
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