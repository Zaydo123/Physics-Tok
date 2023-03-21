const express = require('express');
const { WebcastPushConnection } = require('tiktok-live-connector');
const { WebSocketServer } = require('ws');
const path = require('path');
const { v4: uuidv4 } = require('uuid')
const https = require('https');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

// Handles any requests that don't match the ones above
app.get('*', (req,res) =>{
    res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

//webscoket server connected to express
const server = app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});

const wsServer = new WebSocketServer({ server });

const clients = {};

wsServer.on('connection', function(connection) {
    // Generate a unique code for every user
    const userId = uuidv4();
    console.log(`Recieved a new connection.`);
    // Store the new connection and handle messages
    clients[userId] = connection;
    console.log(`${userId} connected.`);
    //console.log(clients)
    wsServer.on('message', function(message) {
        console.log(`Recieved a new message.`);
    });

});

wsServer.on('close', function(connection) {
    console.log(`Connection closed.`);
});


// Create a new wrapper object and pass the username
let username = process.env.USERNAME;
let tiktokLiveConnection = new WebcastPushConnection(username);
let events = {'users': [{}]};

//get physics-chat.com/events and read json file. if the new data is different from the old data, send a message to the websocket server
//if the new data is the same as the old data, do nothing
let mostRecentPhysicsEvent = {};
function fetchPhysicsEvents(){
    https.get('https://physics-chat.com/events', (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
            data += chunk;
        });
        resp.on('end', () => {
            let newData = JSON.parse(data);
            if(JSON.stringify(newData) != JSON.stringify(events)){
                events = newData;
                events = events.events;
                wsServer.clients.forEach((client) => {
                    message = {type:"physics","events":events};
                    if(events.length > 0){
                        if((events[events.length-1].firstName != mostRecentPhysicsEvent.firstName)&&(events[events.length-1].time != mostRecentPhysicsEvent.time)){
                            mostRecentPhysicsEvent = events[events.length-1];
                            console.log("new physics event");
                            client.send(JSON.stringify(message));
                        } else{
                            console.log("no new physics events");
                        }
                    }
                });
            }
        });
    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
}
    



//setIntreval fetchPhysicsEvents();
setInterval(fetchPhysicsEvents, 20000);

let lastUpdate = new Date();

tiktokLiveConnection.on('chat', data => {
    // Connect to the chat (await can be used as well)
    tiktokLiveConnection.connect().then(state => {
        console.info(`Connected to roomId ${state.roomId}`);
    }).catch(err => {
        console.error('Failed to connect', err);
    })
    //console.log(`${data.uniqueId} (userId:${data.userId}) writes: ${data.comment}`);
    wsServer.clients.forEach((client) => {
        message = {type:"comment","username":data.uniqueId, "message":data.comment};
        client.send(JSON.stringify(message));
    });
    if(new Date() - lastUpdate > 1000){
        fetchPhysicsEvents();
        lastUpdate = new Date();
    }

});

tiktokLiveConnection.on('like', data => {
    //console.log(`${data.uniqueId} (userId:${data.userId}) liked the stream!`);
    wsServer.clients.forEach((client) => {
        message = {type:"like","username":data.uniqueId, "message":"liked the stream!"};
        client.send(JSON.stringify(message));
    });
});

tiktokLiveConnection.on('gift', data => {
    //console.log(`${data.uniqueId} (userId:${data.userId}) sent a gift!`);
    wsServer.clients.forEach((client) => {
        message = {type:"gift","username":data.uniqueId, "message":"sent a gift!"};
        client.send(JSON.stringify(message));
    });
});
