// ===========================================================
// This module contain all JWT related authentication methods
// ===========================================================
const JWT = require('jsonwebtoken');

jwt_expire_time     = eval(process.env.jwt_expire_time); // in seconds
cookie_expire_time  = eval(process.env.cookie_expire_time)*1000 // in miliseconds

function signAccessToken(channel, uname){
    const payload = {channel:channel, name:uname}
    const options = {
        expiresIn: jwt_expire_time, // time in seconds
    }
    return JWT.sign(payload, process.env.SECRET, options);
}

function set_jwt_token(channel, uname, res){
    const token = signAccessToken(channel, uname);
    res.cookie("jwt", token, {
        // secure:true,
        maxAge: cookie_expire_time,
    });
}

function unset_jwt_tokens(res){
    res.cookie('jwt', "", {maxAge:1});
}

function decodeToken(token){
    return JWT.decode(token)
}

// middleware for authenticating clients
function verify(token){
    try{
        JWT.verify(token, process.env.SECRET);
        return true;
    }catch(e){
        return false;
    }
}

module.exports = {
    signAccessToken,
    set_jwt_token,
    decodeToken,
    unset_jwt_tokens,
    verify,
}
