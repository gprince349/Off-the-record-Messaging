var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./otr1.db', (err)=>{
    if(err){
        console.log("Error while connecting to database", err.message);
    }else{
        console.log("Connected to database");
    }
});

db.serialize(function() {
  db.run("CREATE TABLE IF NOT EXISTS channels (name TEXT primary key,\
     timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)");
});

module.exports = db;