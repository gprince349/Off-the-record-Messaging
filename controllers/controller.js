const Channel = require("../models/channel");

// ==========================================================
//                In Memory Map of Channel-User
// ==========================================================
//  channel_name ---> [ {name:"...", ws:<websocket>}, ... ]
let channel_users = new Map();

// add user to channel_user map if channel exists
// else throw an error
function add_user(channel, uname){
    if(channel_users.get(channel)){
        if(channel_users.get(channel).find( (x) => x.name === uname )){
            throw Error(`User with nickname '${uname}' is already in the channel`)
        }
        channel_users.get(channel).push({name:uname, ws:undefined});
    }else{
        Channel.exists(channel, ()=>{
            channel_users.set(channel, [{name:uname, ws:undefined}])
        }, ()=>{
            throw Error("add_user: Channel does not exists, create new channel");
        });
    }
}
// remove user from channel if channel exists
// else throw an error
function remove_user(channel, uname){
    let ch = channel_users.get(channel);
    if(ch){
        let obj = ch.find( (x) => x.name === uname );
        if(obj){
            ch.splice(ch.indexOf(obj));
        }
    }else{
        throw Error("remove_user: Channel does not exists, create new channel");
    }
}

exports.attach_socket = (channel, uname, ws) => {
    let ch = channel_users.get(channel);
    if(ch){
        let obj = ch.find( (x) => x.name === uname );
        if(obj){
            obj.ws = ws;
        }else{
            throw Error(`User '${uname}' does not exist`);
        }
    }else{
        throw Error("attach_socket: Channel does not exists, create new channel");
    }
}

exports.send_message = (channel, uname, msg) => {
    let ch = channel_users.get(channel);
    if(ch){
        ch.forEach( x => {
            if(x.name != uname && x.ws){
                x.ws.send(msg);
            }
        })
    }else{
        throw Error("send_message: Channel does not exists, create new channel");
    }
}

// ==========================================================
// ==========================================================
// will render Home Page
exports.getHome = (req, res)=>{
    try{
        res.render('home',{});
    }catch(e){
        console.log("getHome: ", e.message);
    }
}

// will create a channel and return status in json format
exports.createChannel = (req, res)=>{
    try{
        let ch_name = req.body.name;

        console.log(req.body)
        console.log(res.body)

        Channel.exists(ch_name, ()=>{
            let e = Error("Channel already exists, use different name");
            console.log("createChannel: ", e.message);
            res.status(200).json({error: e.message});
        }, ()=>{
            let newchannel = new Channel(ch_name);
            newchannel.save();
            // res.status(200).json({status: "Channel Created."})
            res.render('home', {})
        })
    }catch(e){
        console.log("createChannel: ", e.message);
        res.status(200).json({error: e.message});
    }
}

// render chat page on success else
// render home page on error with error message
exports.joinChannel = (req, res)=>{
    try{
        let nickname = req.body.nickname;
        let ch_name = req.body.channel;
        add_user(ch_name, nickname);

        res.render("chat", {});
    }catch(e){
        console.log("joinChannel: ", e.message);
        res.render("home", {error: e.message});
    }
}

exports.leaveChannel = (req, res)=>{
    try{
        // TODO: remove from map and close the socket
        remove_user()
    }catch(e){
        console.log("leaveChannel: ", e.message);
    }
}