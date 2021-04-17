const db = require("../utils/database");

module.exports = class Channel{
    constructor(name){
        this.name = name;
    }

    save(){
        try{
            var stmt = db.prepare("INSERT INTO channels (name) VALUES (?)");
            // console.log(this.name)
            stmt.run(this.name);
            stmt.finalize();
        }catch(e){
            console.log("channel.js : ", e.message);
        }
    }

    static exists(name){
        // try{
            // console.log(name);

            // var stmt = db.prepare("select * from channels where name = ?");
            // stmt.get(name, (err, res)=>{
            //     if(err){
            //         throw Error(err.message);
            //     }else if(res){
            //         success();
            //     }else{
            //         faliure();
            //     }
            // });
            // stmt.finalize();
        // }catch(e){
        //     console.log("channel.js : ", e.message);
        // } 
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