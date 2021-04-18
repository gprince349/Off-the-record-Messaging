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
    decodeToken,
    verify,
}
