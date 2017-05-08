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

// // Broadcast to all.
// wss.broadcast = function broadcast(data) {
//   wss.clients.forEach(function each(client) {
//     if (client.readyState === SocketServer.OPEN) {
//       client.send(JSON.stringify(data));
//     }
//   });
// };

let numClients = 0;
// Set up a callback that will run when a client connects to the server
// When a client connects they are assigned a socket, represented by
// the ws parameter in the callback.
wss.on('connection', (ws) => {

  numClients += 1;
  console.log("Number of users:", numClients);
  // ws.send(`${numClients} users online`);

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
      console.log(message)
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
            //broadcast(message);
            ws.send(JSON.stringify(message));
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
              console.log('received message:', message);
            //broadcast(message);
            ws.send(JSON.stringify(message));
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
            console.log('received message:', message);
            //broadcast(message);
            ws.send(JSON.stringify(message));
          break;
        default:
        // show an error in the console if the message type is unknown
        throw new Error("Unknown event type " + message.type);
      }

// broadcast to everyone else
      message = JSON.parse(rawMessage);
      switch(message.type) {
        case "postMessage":
            if (matches = message.content.match(/.png$/)) {
              message = {
                "content" : `<img src="${message.content}" alt=""/>`,
                "type" : "incomingMessageWithPicture",
                "id" : uuidV1(),
                "username" : undefined,
                "displayName": message.username,
                "color" : color
              }
              broadcast(message)
            }
            else {
              message = {
              "type": "incomingMessage",
              "id": uuidV1(),
              "username": undefined,
              "displayName": message.username,
              "content": message.content,
              "color": color
              };
              console.log('received message:', message);
              broadcast(message);
            }
          break;
        case "postNotification":
            message = {
            "type": "incomingNotification",
            "id": uuidV1(),
            "username": undefined,
            "displayName": message.username,
            "content": message.content,
            "color": color
            };
            console.log('received message:', message);
            broadcast(message);
            //ws.send(JSON.stringify(message));
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