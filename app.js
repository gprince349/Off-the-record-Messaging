require("dotenv").config();
const path = require("path");
const express = require("express");
const db = require("./utils/database");
const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(express.static(path.join(__dirname,'public')));

// middleware to print every request on terminal
app.use('', (req, res, next)=>{
    console.log(req.method, req.httpVersion, req.ip, req.url);
    next();
});

const routes = require("./routes/routes");
app.use("/", routes);


app.listen(Number(process.env.PORT), "",
    ()=> console.log("listening on port", process.env.PORT)
);