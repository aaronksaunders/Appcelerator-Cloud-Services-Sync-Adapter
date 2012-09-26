exports.definition = {

    config : {
        "columns" : {
        },
        "defaults" : {},
        "adapter" : {
            "type" : "acs",
            "collection_name" : "places"
        },
        "settings" : {
            "object_name" : "places",
            "object_method" : "Places"
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