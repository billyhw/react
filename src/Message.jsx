import React, {Component} from 'react';

class Message extends Component {

  render() {
    const test = {
      color: this.props.color
    }

    return (
      <div className="message">
        <span className="message-username" style={test}>{this.props.displayName}</span>
        <span className="message-content" id={this.props.type} dangerouslySetInnerHTML={{__html: this.props.content}}></span>
      </div>
    );
  }
}

export default Message;