[![Appcelerator Titanium](http://www-static.appcelerator.com/badges/titanium-git-badge-sq.png)](http://appcelerator.com/titanium/) [![Appcelerator Alloy](http://www-static.appcelerator.com/badges/alloy-git-badge-sq.png)](http://appcelerator.com/alloy/)

New and improved ACS Alloy Module
===
_Concepts here are meant to be a introductory guide to concepts covered in my book on Appcelerator Alloy and Appcelerator Cloud Services_

![text](https://raw.githubusercontent.com/aaronksaunders/testInClass/master/screens/small_book_cover.png)

#####[Available On Amazon.com](http://www.amazon.com/Building-Cross-Platform-Titanium-Appcelerator-Services/dp/1118673255)
===
#### NEW 3/20/2015 - Promise Support for ACS Queries

_Keep a look out for updated video to show use of new adapter here in the [Appcelerator Alloy Video Series](https://www.youtube.com/channel/UCMCcqbJpyL3LAv3PJeYz2bg)_

We all have become acustom to using promises to avoid the callback hell so here we have an example of an ACS adapter that supports promises using the $q javascript library.

So now you can query your custom object like this
```Javascript
/**
* gets books and returns a promise
*/
function getBooks() {
	var books = Alloy.createCollection('Book');
	return books.fetch();
}

// need a user object to login with
var aUser = Alloy.createModel('User');

// notice the call to the extended function with no success or error
// callbacks, they are handled by the promise structure
aUser.login("testuserone", "password").then(function(_response) {
	// successful login here!!
	Ti.API.info(' Success:Login, with Promise\n ' + JSON.stringify(_response, null, 2));
	
	// now query for the books and the success will be handled by 
	// the next `then` function below, else it falls thru to the 
	// error 
	return getBooks(); //<-- returns a promise also!
}).then(function(_bookResp) {
    // here we handle the successful book query
	Ti.API.info(' Success:Books, with Promise\n ' + JSON.stringify(_bookResp, null, 2));
}, function(_error) {
    // ANY errors is the promise chain will fall thru to here
	Ti.API.error(' ERROR ' + JSON.stringify(_error));
});
```
This approach is MUCH cleaner that the old callback approach ,give it a try... the adapter still support both approaches.


Using the Adapter with Appcelerator Cloud Services Objects
-
Creating an object, works just like the books demo provided; here is using the ACS Place object, see the Appcelerator Cloud Service documentation to ensure the proper naming of the properties

First lets look at the changes I made to the model JSON file, `app/models/place.js` this is for the places object
```Javascript
exports.definition = {
    "columns": {},
    "defaults": {},
    "adapter": {
        "type": "acs",
    },
    "settings": {
        "object_name": "places", // <-- MUST BE SET TO ACS OBJECT
        "object_method": "Places"
    }
}
```
and this is for the user object `app/models/user.js`, make the appropriate edits.
```Javascript
exports.definition = {
    "columns": {},
    "defaults": {},
    "adapter": {
        "type": "acs",
    },
    "debug": true,
    "settings": {
        "object_name": "users", // <-- MUST BE SET TO ACS OBJECT
        "object_method": "Users"
    }
}
```	
For Custom Objects, we can support them by providing the name of  the custom object in the configuration setting property and then set the object_method. See example of a custom object called book
```javascript
exports.definition = {
    config : {
    "columns": {},
    "defaults": {},
    "adapter": {
        "type": "acs",
    },
    "debug": true,
    "settings": {
        "object_name": "book",
        "object_method": "Objects" //<--indicates a Custom ACS object
       }
    }
}
```
If you notice, **the main change to the models file is setting the adapter to acs and then specifying the object name**. I know there is a 
cleaner way to do this, ie derive it from the file name, but this is an acceptable solution that provide clear self documentation; I will get to that later


And finally this is how it works when creating a `Place` object in Appcelerator Cloud Services
	
```Javascript	
// See Appcelerator Cloud Services documentation for the appropriate parameters
// for the object you are trying to create
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


function testPlaces() {
	
	var aPlace, places;
	
	// create a place object
	aPlace = Alloy.createModel('Place', params);
	// save the object
	aPlace.save();
	
	// create a collection
	places = Alloy.createCollection('Place');
	
	
	// fetch the data
	places.fetch().then(function(_places){
		Ti.API.info(' places...' + JSON.stringify(_places));
	}, function(_error){
		Ti.API.error(' places...' + JSON.stringify(_error));
	})


	// can also fetch individual item
	aPlace = Alloy.createModel('Place', {
		id : "SPECIFY PLACE ID"
	});
	aPlace.fetch().then(function(_place){
		Ti.API.info(' place...' + JSON.stringify(_place));
	}, function(_error){
		Ti.API.error(' places...' + JSON.stringify(_error));
	})
}
```

The Sync Adapter
-
You are going to want to hop on over to `app/lib/alloy/sync/arrowdb.js` to see the beginnings of the code for the adapter

The sync adapter leverages the fact that for the most part the [Appcelerator Cloud Services `ti.cloud` module](http://docs.appcelerator.com/titanium/latest/#!/api/Titanium.Cloud) follows a specific pattern when working with objects:

`Cloud.[OBJECT-NAME].[OBJECT-ACTION]`

So for working with the `User` Object `OBJECT-NAME=Users` and `OBJECT-ACTION=create` gives us the function call:

`Cloud.Users.create`

Which mean that for working with the `Place` Object `OBJECT-NAME=Places` and `OBJECT-ACTION=create` gives us the function call:

`Cloud.Places.create`

This makes it possible to normalize the functionality in the sync adapter into a few specific patterns to meet our needs for performing the basic CRUD Actions on Appcelerator Cloud Services Objects.

####Extending Appcelerator Cloud Services Alloy Objects in the Sync Adapter

The code for the `User` model is more interesting since I needed to extend the object to support all of the 
special case methods that the user object supports. Using the pattern of extending Backbone objects, Alloy allows you to add methods to both model and collection to support seperation of concerns, where model functionality is kept in the model.

In the code example below you can see how the `login` function is created in the `app/models/user.js` file. Added functions are exposed through the extending of the original Alloy Backbone object.

```Javascript
/**
 *
 * @param {Object} _login username or email address
 * @param {Object} _password password
 * @param {Object} _opts aadditional options to pass to function, used with callback
 */
function _login(_login, _password, _opts) {
	var self = this;
	var deferred = Q.defer();

	_opts = _opts || {};

	this.config.Cloud.Users.login({
		login : _login,
		password : _password
	}, function(e) {
		if (e.success) {
			var user = e.users[0];
			Ti.API.debug('Logged in! You are now logged in as ' + user.id);

			// save session id
			Ti.App.Properties.setString('sessionId', e.meta.session_id);
			var newModel = new model(user);
			_opts.success && _opts.success(newModel);
			deferred.resolve(newModel);
		} else {
			Ti.API.error(e);
			_opts.error && _opts.error(self, (e.error && e.message) || e);
			deferred.reject(e);
		}
	});
	return deferred.promise;
}
```
This function is then exposed using a code similar to the listing below:
```Javascript
_.extend(Model.prototype, {
	login : _login, // expose the login function..
});
```
See additional documentation here [Extending the Backbone.Model Class](http://docs.appcelerator.com/titanium/latest/#!/guide/Alloy_Collection_and_Model_Objects-section-36739589_AlloyCollectionandModelObjects-ExtendingtheBackbone.ModelClass)

The basic pattern here is that we are wrapping the [Appcelerator Cloud Services login](http://docs.appcelerator.com/titanium/latest/#!/api/Titanium.Cloud.Users) functionality in the User model and then providing promises support to make working with the Objects much easier.

Notice that to create a user, there is not need for a specific model extension sense the Appcelerator Cloud Services API call for creating objects all follow the same pattern and that is encapsulated in the sync adapter.

```Javascript
// sample useage in a controller.js file of app
function testCreateUser() {
	var params = {
		username : "testusertwo",
		password : "password",
		password_confirmation : "password",
		first_name : "Test",
		last_name : "UserTwo"
	};
	var aUser = Alloy.createModel('User', params);
	aUser.save().then(function(_user){
		Ti.API.info(' User...' + JSON.stringify(_user));
	}, function(_error){
		Ti.API.error(' User Error...' + JSON.stringify(_error));
	});
}
```
####Additional Changes Required for Promise Support and proper file installation

* You will need to include the [$q javascript library](https://github.com/kriskowal/q/blob/v1/README.md) in your project. I suggest you create a `lib` folder in the `app` directory and add the file there, at the root.
* You add  the `app/alloy/sync/arrowdb.js` file to your `app/alloy/sync` folder also.
* You will need to update your `alloy.js` file to support the models and collections returning the promise from the sync adapter, see `line 10` and `line 36` where we return the result from the sync adapter

The new changes to `alloy.js`, add the lines below to the file.
_When this fix actually makes it to the master release, you will no longer need to patch the Collection and Model objects in Alloy: [ALOY-1174 - Update sync adapters to support promises in addition to callbacks](https://jira.appcelerator.org/browse/ALOY-1174)_

```javascript
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
	mod && _.isFunction(mod.afterModelCreate) &amp;&amp; mod.afterModelCreate(Model, name);
	return Model;
};
```


Object Searching and Querying
-
So we keep it pretty simple here and pass in the parameters as part of the options in `data` as a javascript hash


```Javascript
// create the user collection like you normally do
var userCollection = Alloy.createCollection('User');
```

Now we do a fetch, but we pass in the query string in as a parameter; we are saying do a full text search on the
term `UserTwo` in all `User` objects that are in the database

```Javascript
userCollection.fetch({
	data : {
		q : "UserTwo"
	}).then(function(_userCollection){
		Ti.API.info(' Users...' + JSON.stringify(_userCollection));
	}, function(_error){
		Ti.API.error(' User Error...' + JSON.stringify(_error));
	});
```
The function will return a promise that we process the results to get the response from the sync adapter

Now to use the query capabilities of Appcelerator Cloud Services, create the user collection like you normally do

```Javascript
var userCollection = Alloy.createCollection('User');
```

Now we do a fetch, but we pass in the query string in as a parameter; we are saying find all `User` objects with the `last_name` field of `UserTwo`

```Javascript
userCollection.fetch({
	data : {
		where : JSON.stringify({
			"last_name" : "UserOne"
		})
	}).then(function(_userCollection){
		Ti.API.info(' Users...' + JSON.stringify(_userCollection));
	}, function(_error){
		Ti.API.error(' User Error...' + JSON.stringify(_error));
	});
```
The function will return a promise that we process the results to get the response from the sync adapter. **Please note that the `where` parameter is a JSON object that has been converted to a string**. Failure to recognize that will cause you hours of debugging pain and confusion.

See the Appcelerator Cloud Services Documention on querying objects to understand all of different possibilities when performing queries against Appcelerator Cloud Services Objects. [ACS Query API Overview](http://docs.appcelerator.com/cloud/latest/#!/guide/search_query)


The rest of the model follows the same path; check it out and tell me what you think
