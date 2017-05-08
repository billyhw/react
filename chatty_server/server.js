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

// For user counter, initialize at 0
let numClients = 0;

// Set up a callback that will run when a client connects to the server
// When a client connects they are assigned a socket, represented by
// the ws parameter in the callback.
wss.on('connection', (ws) => {

  // whenever someone logs in, add one to numClients
  numClients += 1;
  console.log("Number of users:", numClients);

  // For broadcasting numClients
  const broadcastNumClients = (num) => {
    wss.clients.forEach((c) => {
      message = {"type":"numClients", "value":num};
      c.send(JSON.stringify(message));
    });
  }

  broadcastNumClients(numClients);

  // Random Color generator
  function randomColor () {
    const rand255 = () => {
      return Math.floor(Math.random() * 255);
    }
    return "rgb(" + rand255() + "," + rand255() + "," + rand255() + ")";
  }

  // The color for one client (stay the same throughout his/her session)
  const color = randomColor();

    ws.on('message', (rawMessage) => {

      // message broadcast to everyone except sender
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
            if (matches = message.content.match(/\.(png|jpg|jpeg|gif)$/)) {
              // If message is a url to a pic, want to show the pic.
              message = {
                "content" : `<img src="${message.content}" alt=""/>`,
                "type" : "incomingMessageWithPicture",
                "id" : uuidV1(),
                // username is for changing username, if set to undefined (below), username won't be updated
                "username" : message.username,
                // displayName is for displaying name with message
                "displayName": message.username,
                "color" : color
              }
            ws.send(JSON.stringify(message)); // send to sender
            message.username = undefined; // for everyone else, no need to update username
            broadcast(message); // send to everyone else
            }
            else {
              // otherwise display the message
              message = {
              "type": "incomingMessage",
              "id": uuidV1(),
              // username is for changing username, if set to undefined (below), username won't be updated
              "username": message.username,
              // displayName is for displaying name with message
              "displayName": message.username,
              "content": message.content,
              "color": color
              };
            ws.send(JSON.stringify(message)); // send to sender
            message.username = undefined; // for everyone else, no need to update username
            broadcast(message); // send to everyone else
            }
          break;
        case "postNotification":
            message = {
            "type": "incomingNotification",
            "id": uuidV1(),
            // username is for changing username, if set to undefined (below), username won't be updated
            "username": message.username,
            // displayName is for displaying name with message
            "displayName": message.username,
            "content": message.content,
            "color": color
            };
            ws.send(JSON.stringify(message)); // send to sender
            message.username = undefined; // for everyone else, no need to update username
            broadcast(message); // send to everyone else
          break;
        default:
        // show an error in the console if the message type is unknown
        throw new Error("Unknown event type " + message.type);
      }

    })

    // Set up a callback for when a client closes the socket. This usually means they closed their browser.
    ws.on('close', () => {
      console.log('Client disconnected')
      numClients -= 1; // decrement numClients by 1 if someone exit
      console.log("Number of users:", numClients);
      broadcastNumClients(numClients)
    });

});