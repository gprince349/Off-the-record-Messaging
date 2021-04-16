require("dotenv").config();
const path = require("path");
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const db = require("./utils/database");
const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');
// app.use(express.json())
app.use(express.static(path.join(__dirname,'public')));

// middleware to print every request on terminal
// app.use('', (req, res, next)=>{
//     console.log(req.method, req.httpVersion, req.ip, req.url);
//     next();
// });

const routes = require("./routes/routes");
app.use("/", routes);


// create server
const server = http.createServer(app);

const ctrl = require("./controllers/controller");
// create websocket
const wss = new WebSocket.Server({server});

wss.on('connection', (ws, req) => {
    console.log("Got connection", req.url, req.socket.remoteAddress);
    let s = req.url.split('/');
    let channel = s[1];
    let name = s[2];
    try{
        ctrl.attach_socket(channel, name, ws);
    }catch(e){
        console.log("app.js:", e.message);
        ws.send(e.message);
        ws.close();
    }

    ws.onmessage = (msg) => {
        console.log(msg.data)
        ctrl.send_message(channel, name, msg);
    }
    ws.onclose = (e) => {
        console.log(channel, name, "CLOSED");
    }
})


// start server
server.listen(Number(process.env.PORT), "",
    ()=> console.log("listening on port", process.env.PORT)
);