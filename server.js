var express = require('express');

var app = express();

app.use('/css',express.static(__dirname +'/views/css'));

var dgram = require('dgram');
var server = dgram.createSocket('udp6');
const sqlite3 = require('sqlite3').verbose();
var ts = Date.now();

var message;
var longitude,latitude;

var db = new sqlite3.Database('aerophilia.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
        if (err) {
            console.error("error " + err.message);
        }
        console.log('Connected to the aerophilia database.');
    });

try {
    db.run('CREATE TABLE IF NOT EXISTS data(timestamp,value)');
} catch (e) {

}

server.on('message', (msg, rinfo) => {
    console.log(msg.toString());
    message = msg.toString().split(",");

    longitude = message[3];///100;
    latitude = message[5];///100;
    db.run(`INSERT INTO data(timestamp,value) VALUES(?,?)`, [ts, msg], function (err) {
        if (err) {
            console.log(err);
        }
        console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
    });
});

server.on('listening', () => {
    const address = server.address();
    console.log(`server listening ${address.address}:${address.port}`);
});

server.on('error', (err) => {
    console.log(`server error:\n${err.stack}`);
    server.close();
});

//app.set('port', 80);
server.bind(13000);

//parsing data from body
// var bodyParser = require('body-parser');
// app.use(bodyParser.urlencoded({
//     extended: true
// }));

//setup view engine as ejs
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.get('/', function (req, res) {
    res.render('index.html',{longitude:longitude,latitude:latitude});
});
app.get('/index2', function (req, res) {
    res.render('index2.html',{longitude:longitude,latitude:latitude});
});

app.listen(80, function () { 
    console.log("server is running at localhost:80");
})
