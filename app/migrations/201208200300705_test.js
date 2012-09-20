migration.up = function(db) {
	db.createTable("test",
		{
		    "columns": {
		        "string": "id"
		    },
		    "defaults": {},
		    "adapter": {
		        "type": "sql",
		        "tablename": "test"
		    }
		}
	);
};

migration.down = function(db) {
	db.dropTable("test");
};
