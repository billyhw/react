import React, {Component} from 'react';
import NavBar from './NavBar.jsx';
import ChatBar from './ChatBar.jsx';
import MessageList from './MessageList.jsx';

// the user and message pair
const userAndMessages = {
  currentUser: {name: "Bob"},
  messages: [
    {
      id: 1,
      username: "Bob",
      content: "Has anyone seen my marbles?",
    },
    {
      id: 2,
      username: "Anonymous",
      content: "No, I think you lost them. You lost your marbles Bob. You lost them for good."
    }
  ]
};

// Apps will have messages and currentUser as props
// MessageList (or Message) have message as props
// ChatBar has currentUser as prop

class App extends Component {

  constructor(props) {
    super();
    this.state = {
      currentUser: userAndMessages.currentUser.name,
      messages: [],
      numUsers: 0
    };
    this.connection = new WebSocket("ws://localhost:3001");
  }

  componentDidMount() {
    //console.log(connection)
    this.connection.onmessage = (rawMessage) => {

      rawMessage = JSON.parse(rawMessage.data);

      let newMessage = null;
      let messages = null;
      switch(rawMessage.type) {
        case "incomingMessage":
            newMessage = {
              id: rawMessage.id,
              username: rawMessage.username,
              displayName: rawMessage.displayName,
              content: rawMessage.content,
              color: rawMessage.color
            };
            messages = this.state.messages.concat(newMessage);
            // this.setState({messages: messages})
            // this.setState({currentUser: newMessage.username, messages: messages})
            this.setState({currentUser: rawMessage.username ? newMessage.username : this.state.currentUser, messages: messages})
          break;
        case "incomingMessageWithPicture":
            newMessage = {
              id: rawMessage.id,
              username: rawMessage.username,
              displayName: rawMessage.displayName,
              content: rawMessage.content,
              color: rawMessage.color,
              type: "incomingMessageWithPicture"
            };
            messages = this.state.messages.concat(newMessage);
            // this.setState({messages: messages})
            // this.setState({currentUser: newMessage.username, messages: messages})
            this.setState({currentUser: rawMessage.username ? newMessage.username : this.state.currentUser, messages: messages})
          break;
        case "incomingNotification":
            newMessage = {
              id: rawMessage.id,
              type: "incomingNotification",
              username: rawMessage.username,
              displayName: rawMessage.displayName,
              content: rawMessage.content,
              color: rawMessage.color
            };
            messages = this.state.messages.concat(newMessage);
            // this.setState({currentUser: newMessage.username, messages: messages})
            this.setState({currentUser: rawMessage.username ? newMessage.username : this.state.currentUser, messages: messages})
          break;
        case "numClients":
            this.setState({numUsers: rawMessage.value});
          break;
        default:
        // show an error in the console if the message type is unknown
        throw new Error("Unknown event type " + rawMessage.type);
      }
      }
    }

  render() {
    return (
      <div className="footer">
        <NavBar value = {this.state.numUsers} />
        <MessageList messages={this.state.messages} />
        <ChatBar connection={this.connection} currentUser={this.state.currentUser} />
      </div>
    );
  }
}

export default App;
