import React, {Component} from 'react';
import Message from './Message.jsx';

class MessageList extends Component {

  render() {
    let output = this.props.messages.map(message => <Message key={message.id} username={message.username} displayName={message.displayName} content={message.content} color={message.color} type={message.type}/>);
    return (
      <main className="messages">
        {output}
      </main>
    );
  }

}

export default MessageList;
