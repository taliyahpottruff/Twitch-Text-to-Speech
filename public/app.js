const statusElement = document.querySelector('#status'); 

document.getElementById("listenBtn").addEventListener("click", function(event){
  event.preventDefault()
});

function speakMessage(message) {
  const utterance = new SpeechSynthesisUtterance(message);
  utterance.volume = document.querySelector('#volume').value;
  window.speechSynthesis.speak(utterance);
}

function speakMessagePolly(message, tags) {
  let uuid = self.crypto.randomUUID();
  const sendme = {
      message: message, 
      id: uuid, 
      user: tags['display-name']
  };
   const http = new XMLHttpRequest(); 
   const url = 'https://wb971sijqi.execute-api.us-west-1.amazonaws.com/speech';
   http.open("POST", url);
   http.setRequestHeader("Content-Type", "application/json");
   http.send(JSON.stringify(sendme));
   http.onreadystatechange = function() {
    if (http.readyState == XMLHttpRequest.DONE) {
        var response = JSON.parse(http.responseText); 
        new Audio(response.url).play();
    }
   } 
}

function writeMessage(tags,message) {
  let div = document.createElement('div'); 
  div.className = "single-message";

  let chatter = document.createElement('span'); 
  chatter.className= "chatter";
  chatter.style.color = tags['color'];
  chatter.textContent = tags['display-name']+': ';

  let chatMessage = document.createElement('span'); 
  chatMessage.className= "messageContent"; 
  chatMessage.textContent = message; 

  div.appendChild(chatter); 
  div.appendChild(chatMessage); 

  document.getElementById("messages").appendChild(div); 
}

function startListening() {
  const channel = document.querySelector("#channelname").value;
  if(isAZ(channel) == false) {
    statusElement.className = "error"; 
    statusElement.textContent = "Please enter just the channel name, not the entire URL."; 
  }
  else {
    const client = new tmi.Client({
      connection: {
        secure: true,
        reconnect: true,
      },
      channels: [channel],
    });

    document.getElementById("listenBtn").textContent = "Listening...";
    document.getElementById("listenBtn").disabled = true; 
    statusElement.className = "success"; 

    client.connect().then(() => {
      statusElement.textContent = `Connected to twitch. Listening for messages in ${channel}...`;
    });

    client.on('message', (wat, tags, message, self) => {
      writeMessage(tags, message); 
      if(!document.getElementById('hqspeech').checked) {
        speakMessage(message); 
      }
      else {
        speakMessagePolly(message,tags); 
      }
    });
  }
}

function isAZ(string) {
  var res = string.match(/^(#)?[a-zA-Z0-9]{4,25}$/); 
  return (res !== null)
}