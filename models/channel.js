const db = require("../utils/database");

module.exports = class Channel{
    constructor(name){
        this.name = name;
    }

    save(){
        try{
            var stmt = db.prepare("INSERT INTO channels (name) VALUES (?)");
            stmt.run(this.name);
            stmt.finalize();
        }catch(e){
            console.log("channel.js : ", e.message);
        }
    }

    static exists(name){
        return new Promise( (resolve, reject) => {
            db.get(`select * from channels where name = '${name}'`, (err, row)=>{
                if(err){
                    console.log("channel.js: exists: ", err.message);
                    resolve(true);
                }else if(row){
                    resolve(true);
                }else{
                    resolve(false);
                }
            });
        });
    }
}