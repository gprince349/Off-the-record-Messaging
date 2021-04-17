require("dotenv").config();
const path = require("path");
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cookieParser = require("cookie-parser");
const db = require("./utils/database");
const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(express.urlencoded());
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname,'public')));

// middleware to print every request on terminal
app.use('', (req, res, next)=>{
    console.log(req.method, req.httpVersion, req.ip, req.url);
    next();
});

const routes = require("./routes/routes");
app.use("/", routes);


// create server
const server = http.createServer(app);

const ctrl = require("./controllers/controller");
const auth = require("./utils/helper");
// create websocket
const wss = new WebSocket.Server({server});

wss.on('connection', (ws, req) => {
    console.log("Got connection", req.url, req.socket.remoteAddress);
    try{
        let s = req.url.split('/');
        let jwt = s[1];
        let dtoken;
        if(auth.verify(jwt)){
            dtoken = auth.decodeToken(jwt);
            ctrl.attach_socket(dtoken.channel, dtoken.name, ws);
        }else{
            throw Error("Token is not Valid")
        }
        ws.onmessage = (msg) => {
            ctrl.send_message(dtoken.channel, dtoken.name, msg.data);
        }
        ws.onclose = (e) => {
            console.log(dtoken.channel, dtoken.name, "CLOSED");
        }
    }catch(e){
        console.log("app.js:", e.message);
        ws.send(e.message);
        ws.close();
    }
})


// start server
server.listen(Number(process.env.PORT), "",
    ()=> console.log("listening on port", process.env.PORT)
);