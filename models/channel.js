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

    static exists(name, success, faliure){
        // try{
            var stmt = db.prepare("select * from channels where name = ?");
            stmt.get(name, (err, res)=>{
                if(err){
                    throw Error(err.message);
                }else if(res){
                    success();
                }else{
                    faliure();
                }
            });
            stmt.finalize();
        // }catch(e){
        //     console.log("channel.js : ", e.message);
        // } 
    }
}