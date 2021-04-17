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
async function add_user(channel, uname, ifExistError=true){
    if(channel_users.get(channel)){
        if(channel_users.get(channel).find( (x) => x.name === uname )){
            if(ifExistError){
                throw Error(`User with nickname '${uname}' is already in the channel`)
            }
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
// and also close the WEB SOCKET
function remove_user(channel, uname){
    let ch = channel_users.get(channel);
    if(ch){
        let obj = ch.find( (x) => x.name === uname );
        if(obj){
            ch.splice(ch.indexOf(obj));
            if(obj.ws && obj.ws.readyState == WebSocket.OPEN){ 
                obj.ws.close(); 
            }
        }
    }else{
        throw Error("remove_user: Channel does not exists, create new channel");
    }
}
exports.remove_user = remove_user;

exports.attach_socket = (channel, uname, ws) => {
    let ch = channel_users.get(channel);
    if(ch){
        let obj = ch.find( (x) => x.name === uname );
        if(obj){
            if(obj.ws && obj.ws.readyState == WebSocket.OPEN){
                throw Error("You are already connected from some other Tab/client");
            }else{
                obj.ws = ws;
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
        // if there is already valid jwt then use that only
        if(req.cookies.jwt && auth.verify(req.cookies.jwt) ){
            const dtoken = auth.decodeToken(req.cookies.jwt);
            await add_user(dtoken.channel, dtoken.name, false);
        }else{
            let nickname = req.body.nickname;
            let ch_name = req.body.channel;
            await add_user(ch_name, nickname);
            auth.set_jwt_token(ch_name, nickname, res);
        }
        res.render("chat", {});
    }catch(e){
        console.log("joinChannel: ", e.message);
        res.redirect("/home");
    }
}

exports.leaveChannel = (req, res)=>{
    try{
        if(req.cookies.jwt){
            let dtoken = auth.decodeToken(req.cookies.jwt);
            // will close ws and remove entry
            remove_user(dtoken.channel, dtoken.name);
            auth.unset_jwt_tokens(res);
        }
        res.redirect("/home")
    }catch(e){
        console.log("leaveChannel: ", e.message);
        res.redirect('/home')
    }
}