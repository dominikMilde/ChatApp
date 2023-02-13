const express = require("express");
const http = require('http');
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");

const WebSocket = require('ws');
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(bodyParser.json());

app.use(cors());

let forAlice = "";
let forBob = "";

app.post("/message/a", (req, res) => {
    //console.log(req.body.message);
    forBob = req.body.message;
    console.log("for bob", forBob);
    res.status(200).send("message received");
});

app.post("/message/b", (req, res) => {
    //console.log(req.body.message);
    forAlice = req.body.message;
    console.log("for alice", forAlice);
    res.status(200).send("message received");
});


app.get("/updatePoll/a", (req, res) => {
    //console.log(forBob);
    if (forAlice === "") {
        //console.log("ništa")
        res.sendStatus(204);
    }
    else {
        //console.log(forBob);
        res.status(200).send(forAlice);
        forAlice = "";
    }
})

app.get("/updatePoll/b", (req, res) => {
    //console.log(forBob);
    if (forBob === "") {
        //console.log("ništa")
        res.sendStatus(204);
    }
    else {
        //console.log(forBob);
        res.status(200).send(forBob);
        forBob = "";
    }
})

app.get("/updatePollLong/a", (req, res) => {
    new Promise((resolve) => {
        const intervalA = setInterval(() => {
            if (forAlice !== "") {
                clearInterval(intervalA);
                resolve();
            }
        }, 5000);
    }).then(() => {
        res.status(200).send(forAlice);
        forAlice = "";
    })
})

app.get("/updatePollLong/b", (req, res) => {
    new Promise((resolve) => {
        const interval = setInterval(() => {
            if (forBob !== "") {
                clearInterval(interval);
                resolve();
            }
        }, 5000);
    }).then(() => {
        res.status(200).send(forBob);
        forBob = "";
    })
})

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        console.log(`Received message: ${message}`);
        
        text = message.toString();
        if(text[0] === 'a' && text[1] === '+'){
            forBob = text.slice(2);
        }

        if(text[0] === 'b' && text[1] === '+'){
            forAlice = text.slice(2);
        }
        
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN && client !== ws) {
                client.send(text.slice(2));
            }
        });
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

app.listen(3000, () => {
    console.log("Server started on port 3000");
});

server.listen(3001, () => {
    console.log("Server in 3001");
})