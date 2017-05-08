import React, {Component} from 'react';

class ChatBar extends Component {

  constructor(props) {
    super();
    this.state = {newUser: "", newMessage: ""};
  }

  handleMessageChange = (event) => {
    this.setState({newMessage: event.target.value});
  }

  handleNameChange = (event) => {
    this.setState({newUser: event.target.value});
  }

  handleSubmit = (event) => {
    event.preventDefault();

    // if field is empty, user is anonymous
    if (!this.state.newUser) {
      this.state.newUser = "Anonymous";
    }

    const wss = this.props.connection;

    this.state.newUser !== this.props.currentUser ?
      (
        // send both notification and message if user changes name
        wss.send(JSON.stringify({"type": "postNotification", "content": `${this.props.currentUser} has changed name to ${this.state.newUser}.`})),
        wss.send(JSON.stringify({"type": "postMessage", "username": this.state.newUser, "content": this.state.newMessage}))
      ) :
        // otherwise just send message
        wss.send(JSON.stringify({"type": "postMessage", "username": this.state.newUser, "content": this.state.newMessage}));
    // By setting newUser to the update newUser here, no need to type in current username everytime.
    this.setState({newUser: this.state.newUser, newMessage: ""});
  }

  render() {
    return (
      <footer className="chatbar">
        <form className="chatbar" onSubmit={this.handleSubmit}>
        <input type="text" className="chatbar-username" placeholder={this.props.currentUser} value={this.state.newUser} onChange={this.handleNameChange} />
        <input type="text" className="chatbar-message" placeholder="Type a message and hit ENTER" value={this.state.newMessage} onChange={this.handleMessageChange} />
        <input className="submit-btn" type="submit" value="Submit" />
        </form>
      </footer>
    );
  }
}
export default ChatBar;