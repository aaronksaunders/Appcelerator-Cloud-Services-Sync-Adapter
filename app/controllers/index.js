// Fetch will load models from persistent starage, sync'ing Backbone and persistent store.

var params = {
    "name" : "Appcelerator Cloud Services",
    "created_at" : "2011-03-22T21:12:14+0000",
    "updated_at" : "2011-03-22T21:12:14+0000",
    "address" : "58 South Park Ave.",
    "city" : "San Francisco",
    "state" : "California",
    "postal_code" : "94107-1807",
    "country" : "United States",
    "website" : "http://www.appcelerator.com",
    "twitter" : "acs",
    "lat" : 37.782227,
    "lng" : -122.393159
}
var aUser = Alloy.createModel('User');
aUser.login("testuserone", "password", {
    success : function(_d) {
        Ti.API.info(' SUCCESS ' + JSON.stringify(_d));
        Ti.API.info(' model stringified ' + _d.get("username"));

        Ti.API.info(' stored session ' + _d.retrieveStoredSession());
    },
    error : function(_e) {
        Ti.API.info(' ERROR ');
    }
});

function testPlaces() {
    //aPlace = Alloy.createModel('Place', params);
    //aPlace.save();
    var aPlace, places;
    places = Alloy.createCollection('Place');
    places.on("fetch", function() {
        Ti.API.info(' places...' + JSON.stringify(places));
    });
    places.fetch({});

    aPlace = Alloy.createModel('Place', {
        id : "50592aab18897b614e0092c2"
    });
    aPlace.fetch();
}

function customObjectTest() {
    var aPlace, places;
    places = Alloy.createCollection('Place');
    places.on("fetch", function() {
        Ti.API.info(' places...' + JSON.stringify(places));
    });
    places.fetch({});

    aPlace = Alloy.createModel('Place', {
        id : "50592aab18897b614e0092c2"
    });
    aPlace.fetch();
}
