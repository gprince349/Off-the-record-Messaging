const Channel = require("../models/channel");

// ==========================================================
//                In Memory Map of Channel-User
// ==========================================================
let channel_users = new Map();

// add user to channel_user map if channel exists
// else throw an error
void function add_user(channel, user){
    if(channel_users.get(channel)){
        if(channel_users.get(channel).has(user)){
            throw Error("User with nickname '"+ user +"' is already in the channel")
        }
        channel_users.get(channel).add(user);
    }else{
        Channel.exists(channel, ()=>{
            channel_users.set(channel, new Set([user]))
        }, ()=>{
            throw Error("Channel does not exists, create new channel");
        });
    }
}

// remove user from channel if channel exists
// else throw an error
void function remove_user(channel, user){
    if(channel_users.get(channel)){
        channel_users.get(channel).delete(user);
    }else{
        throw Error("Channel does not exists, create new channel");
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
        Channel.exists(ch_name, ()=>{
            throw Error("Channel already exists, use different name");
        }, ()=>{
            let newchannel = new Channel(ch_name);
            newchannel.save();
            res.status(200).json({status: "Channel Created."})
        })
    }catch(e){
        console.log("createChannel: ", e.message);
        res.status(200).json({error: e.message});
    }
}

// render chat page on success 
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
    }catch(e){
        console.log("leaveChannel: ", e.message);
    }
}