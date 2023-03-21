import './App.css';
import logo from './logo.svg';


let tiktokMesageCount = 0;
let maxMessages = 3;

let physicsMessageCount = 0;
let physicsMaxMessages = 3;

let lastUpdate = Date.now();

let latestFollowers = [];

function App() {
  return (
    <>
      <marquee behavior="scroll" direction="left" scrollamount="10">Follow and comment on our latest post for a chance to win a free premium membership.</marquee>
      <div className="header">
        <div class="header-text">
        <h1>Physics-Chat.com</h1>
        <h2>Unblocked ChatGPT Website</h2>
        </div>
        <img src={logo} className="App-logo" alt="logo" />
      </div>
      <hr>
      </hr>
      <br>
      </br>

      <div className="info">
        <div className="tiktok">
          <p>Chat</p>
         <div id="tiktok-chat">
         </div>
        </div>
      </div>

      <div className="info2">
        <div className="website">
          <p>ChatGPT</p>
         <div id="physics-chat">
         </div>
        </div>
      </div>
      
    </>
          
  );
}

function appendTiktokMessage(type,author,message) {
  let chat = document.getElementById('tiktok-chat');

  if(tiktokMesageCount > maxMessages) {
    chat.removeChild(chat.firstChild);
  }

  if (chat) {
    tiktokMesageCount++;
    let messageElement;
    if(type === 'comment'){
      messageElement = document.createElement('div');
      messageElement.className = 'message';
      messageElement.innerHTML = `<span class="message-user">${author} : </span><span class="message-text">${message}</span>`;
      chat.appendChild(messageElement);
    } else if(type === 'like'){
      messageElement = document.createElement('div');
      messageElement.className = 'like';
      messageElement.innerHTML = `<span class="like-user">${author} : </span><span class="like-text">${message}</span>`;
    } else if(type === 'follow'){
      messageElement = document.createElement('div');
      messageElement.className = 'follow';
      messageElement.innerHTML = `<span class="follow-user">${author} : </span><span class="follow-text">${message}</span>`;
    } else if (type === 'gift'){
      messageElement = document.createElement('div');
      messageElement.className = 'gift';
      messageElement.innerHTML = `<span class="gift-user">${author} : </span><span class="gift-text">${message}</span>`;
    }  else{
      console.log('no message type');
    }
    if(messageElement){
      chat.appendChild(messageElement);
    }
  }  
}

function appendPhysicsMessage(events) {
  let chat = document.getElementById('physics-chat');

  
  for(let i = 0; i < events.length; i++){
    if(physicsMessageCount > physicsMaxMessages) {
      chat.removeChild(chat.firstChild);
    } else{
      physicsMessageCount++;
    }
    let messageElement = document.createElement('div');
    messageElement.className = 'message';
    messageElement.innerHTML = `<span class="message-user">${events[i].firstName} : </span><span class="message-text">${events[i].event}</span>`;
    chat.appendChild(messageElement);
  }

}


// connect to websocket on 127.0,0,1:3001
const socket = new WebSocket('ws://' + window.location.hostname + ':3001');

// when a message is recieved, append it to the chat
socket.onopen = function (event) {
  document.getElementById('tiktok-chat').innerHTML = 'Connected to Tiktok Live Chat';
  let message = {"id":Date.now(),"type":"connection"};
  socket.send(JSON.stringify(message));
};

socket.onmessage = function (event) {
  //string to json
  const data = JSON.parse(event.data);
  if(data.type=='physics'){
    appendPhysicsMessage(data.events);
  } else{
    appendTiktokMessage(data.type,data.username, data.message);
  }
};
export default App;
