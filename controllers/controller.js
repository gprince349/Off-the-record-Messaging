const Channel = require("../models/channel");
const auth = require("../utils/helper");
const WebSocket = require("ws");

// ==========================================================
//                In Memory Map of Channel-User
// ==========================================================
//  channel_name ---> [ {name:"...", ws:<websocket>}, ... ]
let channel_users = new Map();

// add user to channel_user map if channel exists
// else throw an error
async function add_user(channel, uname){
    if(channel_users.get(channel)){
        if(channel_users.get(channel).find( (x) => x.name === uname )){
            throw Error(`User with nickname '${uname}' is already in the channel`)
        }else{
            channel_users.get(channel).push({name:uname, ws:undefined});
        }
    }else{
        if(await Channel.exists(channel)){
            channel_users.set(channel, [{name:uname, ws:undefined}])
        }else{
            throw Error("add_user: Channel does not exists, create new channel");
        }
    }
}
// remove user from channel if channel exists
// else throw an error
exports.remove_user = (channel, uname) => {
    let ch = channel_users.get(channel);
    if(ch){
        let obj = ch.find( (x) => x.name === uname );
        if(obj){
            ch.splice(ch.indexOf(obj));
            if(obj.ws){ 
                // if valid socket existed only then send left msg bcz
                // join msg is sent only when socket is attached
                console.log(`"${uname}" left the channel`);
                this.send_message(channel, uname, `"${uname}" left the channel`);
            }
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
            if(obj.ws && obj.ws.readyState == WebSocket.OPEN){
                throw Error("You are already connected from some other Tab/client");
            }else{
                obj.ws = ws;
                this.send_message(channel, uname, `"${uname}" joined the channel`);
            }
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
            if(x.name != uname && x.ws && x.ws.readyState == WebSocket.OPEN){
                x.ws.send(JSON.stringify({name:uname, msg:msg}));
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
        let msg = req.query.msg || "";
        res.render('home',{msg:msg});
    }catch(e){
        console.log("getHome: ", e.message);
    }
}

// will create a channel and return status in json format
exports.createChannel = async (req, res)=>{
    try{
        let ch_name = req.body.name;

        if(!ch_name){ throw Error("Empty channel name not allowed"); }
        if(await Channel.exists(ch_name)){
            throw Error("Channel already exists, use different name");
        }else{
            let newchannel = new Channel(ch_name);
            newchannel.save();
            res.status(200).json({msg: "Channel Created."})
        }
    }catch(e){
        console.log("createChannel: ", e.message);
        res.status(200).json({error: e.message});
    }
}

// render chat page on success else
// render home page on error with error message
exports.joinChannel = async (req, res)=>{
    try{
        let nickname = req.body.nickname;
        let ch_name = req.body.channel;
        await add_user(ch_name, nickname);
        let token = auth.signAccessToken(ch_name, nickname);
        res.render("chat", {token:token});
    }catch(e){
        console.log("joinChannel: ", e.message);
        res.redirect(`/home?msg=${e.message}`);
    }
}

exports.leaveChannel = (req, res)=>{
    try{
        res.redirect("/home")
    }catch(e){
        console.log("leaveChannel: ", e.message);
        res.redirect('/home')
    }
}