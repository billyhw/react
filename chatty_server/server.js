// server.js

const express = require('express');
const SocketServer = require('ws').Server;
const uuidV1 = require('uuid/v1');
const fetch = require('node-fetch');

// Set the port to 3001
const PORT = 3001;

// Create a new express server
const server = express()
   // Make the express server serve static assets (html, javascript, css) from the /public folder
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${ PORT }`));

// Create the WebSockets server
const wss = new SocketServer({ server });

let numClients = 0;

// Set up a callback that will run when a client connects to the server
// When a client connects they are assigned a socket, represented by
// the ws parameter in the callback.
wss.on('connection', (ws) => {

  numClients += 1;
  console.log("Number of users:", numClients);

  const broadcastNumClients = (num) => {
    wss.clients.forEach((c) => {
      message = {"type":"numClients", "value":num};
      c.send(JSON.stringify(message));
    });
  }

  broadcastNumClients(numClients);

  function randomColor () {
    const rand255 = () => {
      return Math.floor(Math.random() * 255);
    }
    return "rgb(" + rand255() + "," + rand255() + "," + rand255() + ")";
  }

  const color = randomColor();

    ws.on('message', (rawMessage) => {

      const broadcast = (message) => {
        wss.clients.forEach((c) => {
          if(c != ws) {
            c.send(JSON.stringify(message));
          }
        });
      }

      message = JSON.parse(rawMessage);
      switch(message.type) {
        case "postMessage":
            if (matches = message.content.match(/.png$/)) {
              message = {
                "content" : `<img src="${message.content}" alt=""/>`,
                "type" : "incomingMessageWithPicture",
                "id" : uuidV1(),
                "username" : message.username,
                "displayName": message.username,
                "color" : color
              }
            ws.send(JSON.stringify(message));
            message.username = undefined;
            broadcast(message);
            }
            else {
              message = {
              "type": "incomingMessage",
              "id": uuidV1(),
              "username": message.username,
              "displayName": message.username,
              "content": message.content,
              "color": color
              };
            ws.send(JSON.stringify(message));
            message.username = undefined;
            broadcast(message);
            }
          break;
        case "postNotification":
            message = {
            "type": "incomingNotification",
            "id": uuidV1(),
            "username": message.username,
            "displayName": message.username,
            "content": message.content,
            "color": color
            };
            ws.send(JSON.stringify(message));
            message.username = undefined;
            broadcast(message);
          break;
        default:
        // show an error in the console if the message type is unknown
        throw new Error("Unknown event type " + message.type);
      }

    })

    // Set up a callback for when a client closes the socket. This usually means they closed their browser.
    ws.on('close', () => {
      console.log('Client disconnected')
      numClients -= 1;
      console.log("Number of users:", numClients);
      broadcastNumClients(numClients)// ws.send(`${numClients} users online`);
    });

});