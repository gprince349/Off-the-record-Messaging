const Channel = require("../models/channel");
const auth = require("../utils/helper");

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
// and also close the WEB SOCKET
function remove_user(channel, uname){
    let ch = channel_users.get(channel);
    if(ch){
        let obj = ch.find( (x) => x.name === uname );
        if(obj){
            ch.splice(ch.indexOf(obj));
            if(obj.ws){ obj.ws.close(); }
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

        Channel.exists(ch_name, ()=>{
            let e = Error("Channel already exists, use different name");
            console.log("createChannel: ", e.message);
            res.status(200).json({error: e.message});
        }, ()=>{
            let newchannel = new Channel(ch_name);
            newchannel.save();
            res.status(200).json({status: "Channel Created."})
            // res.render('home', {})
        })
    }catch(e){
        console.log("createChannel: ", e.message);
        res.status(200).json({error: e.message});
    }
}

/*
    if JWT token is valid then there must be an entry in the
        channel_user map for that
    if there is no entry in map then JWT must me unset
*/

// render chat page on success else
// render home page on error with error message
exports.joinChannel = (req, res)=>{
    try{
        // if there is already valid jwt then use that only
        if(req.cookies.jwt && auth.verify(req.cookies.jwt) ){
            // nothing to do actully
        }else{
            let nickname = req.body.nickname;
            let ch_name = req.body.channel;
            add_user(ch_name, nickname);
            auth.set_jwt_token(ch_name, nickname, res);
        }
        res.render("chat", {});
    }catch(e){
        console.log("joinChannel: ", e.message);
        res.render("home", {error: e.message});
    }
}

exports.leaveChannel = (req, res)=>{
    try{
        if(req.cookies.jwt){
            let dtoken = auth.decodeToken(req.cookies.jwt);
            // will close ws and remove entry
            remove_user(dtoken.channel, dtoken.name);
            res.status(200).json({msg: "Left the channel"});
        }else{
            res.status(200).json({msg: "Not in any channel"});
        }
    }catch(e){
        console.log("leaveChannel: ", e.message);
        res.status(200).json({error: e.message});
    }
}