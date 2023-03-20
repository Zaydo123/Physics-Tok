const express = require('express');
const { WebcastPushConnection } = require('tiktok-live-connector');
const { WebSocketServer } = require('ws');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname+'/client/public/index.html'));
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
});





// Create a new wrapper object and pass the username
let username = process.env.USERNAME;
let tiktokLiveConnection = new WebcastPushConnection(username);
let events = {'users': [{}]};

// Connect to the chat (await can be used as well)
tiktokLiveConnection.connect().then(state => {
    console.info(`Connected to roomId ${state.roomId}`);
}).catch(err => {
    console.error('Failed to connect', err);
})
tiktokLiveConnection.on('chat', data => {
    console.log(`${data.uniqueId} (userId:${data.userId}) writes: ${data.comment}`);
})

