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
if (true) {
    var aUser = Alloy.createModel('User');
    aUser.login("testuserone", "password", {
        success : function(_d) {
            Ti.API.info(' SUCCESS ' + JSON.stringify(_d));
            Ti.API.info(' model stringified ' + _d.get("username"));

            Ti.API.info(' stored session ' + _d.retrieveStoredSession());

            //testPhotos();

            // testCreateUser();

            testBookObject();
        },
        error : function(_e) {
            Ti.API.info(' ERROR ');
        }
    });
} else {
    //testQueryUsers();
    //testBookObject();
}

function testBookObject() {
    aBook = Alloy.createModel('Book', {
        id : "50636a1d18897b7d7b057065"
    });
    aBook.fetch();

    aBook.on("fetch", function() {
        Ti.API.info('FETCHED BOOK ' + aBook);
    });

    return;

    if (true) {
        var books = Alloy.createCollection('Book');

        // You can bind any Backbone event to models or collections but fetch is convenient because
        // fetch occurs when the persistent store is sync'd to the local Backbone server.
        books.on("fetch", function() {
            Ti.API.info(books);
        });

        // Fetch will load models from persistent storage, sync'ing Backbone and persistent store.
        books.fetch();

        // Now we can add items to the model.
        var book = Alloy.createModel('Book', {
            book : "Jungle Book",
            author : "Kipling"
        });
        books.add(book);

        // Use Backbone shortcut to create a model and add to collection in single step. Does the same
        // thing as the creating a new model and then adding it to the collection.
        books.add({
            book : "War and Peace",
            author : "Tolstoy"
        });

        // Add will add models to local Backbone server but save triggers the CRUD create operation
        // causing the model to get added to the persistent store. During create an id is added to the
        // model signaling that the model has been persisted and no longer in the new state.
        books.forEach(function(model) {
            model.save();
        });

        // UPDATE - update the model save here triggers the CRUD update operation
        book.save({
            author : "R Kipling"
        });

        // Okay time to show the results. Remember this sync's local Backbone server with persistent store.
        books.fetch();
    } else {
        // DELETE - destroy triggers the CRUD delete operation
        var books = Alloy.createCollection('Book');
        books.fetch({
            success : function() {
                for ( i = books.length - 1; i >= 0; i--) {
                    var model = books.at(i);
                    Ti.API.info(' deleting object ' + model.toString());
                    model.destroy();
                };
            }
        });

    }
}

//
// full text search using q parameter
//
function testSearchUsers() {

    var userCollection = Alloy.createCollection('User');
    userCollection.on("fetch", function() {
        Ti.API.info(' users...' + JSON.stringify(userCollection));
    });
    userCollection.fetch({
        data : {
            q : "UserTwo"
        },
        success : function(collection, response) {
            Ti.API.info('success ' + JSON.stringify(collection));
        },
        error : function(collection, response) {
            Ti.API.error('error ' + JSON.stringify(collection));
        }
    });

}

//
// searching the user objects by using
function testQueryUsers() {
    var userCollection = Alloy.createCollection("User");
    userCollection.on("fetch", function() {
        Ti.API.info(" users..." + JSON.stringify(userCollection));
    }), userCollection.fetch({
        data : {
            where : JSON.stringify({
                "last_name" : "UserOne"
            })
        },
        success : function(collection, response) {
            Ti.API.info("success " + JSON.stringify(collection));
        },
        error : function(collection, response) {
            Ti.API.error("error " + JSON.stringify(collection));
        }
    });
}

function testCreateUser() {
    var params = {
        username : "testusertwo",
        password : "password",
        password_confirmation : "password",
        first_name : "Test",
        last_name : "UserTwo"
    }
    var aUser = Alloy.createModel('User', params);
    aUser.save({}, {
        success : function(_d) {
            Ti.API.info('success ' + JSON.stringify(_d));
        },
        error : function(_d) {
            Ti.API.error('error ' + JSON.stringify(_d));
        }
    })

}

function testPlaces() {
    //aPlace = Alloy.createModel('Place', params);
    //aPlace.save();
    var aPlace, places;
    places = Alloy.createCollection('Place');
    places.on("fetch", function() {
        Ti.API.info(' places...' + JSON.stringify(places));
    });
    places.fetch();

    aPlace = Alloy.createModel('Place', {
        id : "50592aab18897b614e0092c2"
    });
    aPlace.fetch();
}

function testPhotos() {
    var aPhoto, photoCollection;
    var params = {
        photo : Ti.Filesystem.getFile('bryce09122010a.jpg').read(),
        'photo_sync_sizes[]' : 'small_240'
    }
    aPhoto = Alloy.createModel('Photo', params);
    aPhoto.save();

    photoCollection = Alloy.createCollection('Photo');
    photoCollection.on("fetch", function() {
        Ti.API.info(' photos...' + JSON.stringify(places));
    });
    photoCollection.fetch();

}