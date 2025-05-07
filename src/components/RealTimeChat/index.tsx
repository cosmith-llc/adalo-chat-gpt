import React, { Component, forwardRef } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
  StyleSheet,
} from "react-native";
import { ChatMessage } from "./ChatMessage";
import { RealTimeChatProps } from "./generated";
import { InputBox } from "./InputBox";
// import * as Ably from "ably";
import axios from 'axios';
import scrollToEnd from './scrollToEnd';

const threadId = 'thread_rQGBVjd6zsELsBC1dh5I3Hqf';
const file_id = 'file-LgHJwvtNAfw9FJGbWQFpxT';
const assistant_id = 'asst_PgMhvpZO4W8rat69Evo11yz5'

// Get from Component properties
const OPENAI_API_KEY = '';

const headers = {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${OPENAI_API_KEY}`,
  "OpenAI-Beta": "assistants=v2"
};

const getLastMessage = async () => await axios.get(`https://api.openai.com/v1/threads/${threadId}/messages`, {
  method: 'GET',
  headers: headers
});
/*
const scrollToTheEnd = (flatList: { scrollToEnd: () => void; }) => {
  flatList.scrollToEnd();
}
*/
const convertMessages = (messages: { id: string; role: string; assistant_id: any; created_at: any; content: { text: { value: any; }; }[]; }[]) => {
  return messages.reverse().map((message: { id: string; role: string; assistant_id: any; created_at: any; content: { text: { value: any; }; }[]; }) => ({
    id: message.id,
    role: message.role === 'user' ? 'user' : 'assistant',
    message: message.content[0].text.value,
    createdDate: new Date(message.created_at)
  }));
};

class RealTimeChat extends Component<
  RealTimeChatProps,
  {
    messages: any[];
    oneTimeUpdate: boolean;
  }
> {
  constructor(props: RealTimeChatProps) {
    super(props);
    const sampleMessages = [{
      message: "First Message",
      createdDate: new Date(),
      senderId: this.props.clientId
    }, {
      message: "Second Message",
      createdDate: new Date(),
      senderId: `${this.props.clientId}+1`
    }]
    this.state = {
      oneTimeUpdate: (this.props.adaloMessages?.length || 0) > 0,
      messages: !!props.editor ? sampleMessages : this.props.adaloMessages?.map(message => message.messageData) || [],
    };
    this.sendMessage = this.sendMessage.bind(this);
  }
  async sendMessage(message: string) {
    if (message) {
      const data = {
        "role": "user",
        "content": message,
        "attachments": [{ "file_id": file_id, "tools": [{ "type": "file_search" }] }]
      };
      const urlSendMessage = `https://api.openai.com/v1/threads/${threadId}/messages`;
      await axios.post(urlSendMessage, data, { headers });

      const runResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ assistant_id, stream: true }),
      });

      if (!runResponse.ok) {
        throw new Error(`HTTP error! status: ${runResponse.status}`);
      }

      if (runResponse && runResponse.body) {
        const reader = runResponse.body.getReader();
        const decoder = new TextDecoder();
        const handleStreamedResponse = async (value: any) => {
          const lines = decoder.decode(value).split('\n');
          for (const line of lines) {
            if (line.trim().startsWith('data:')) {
              const data = line.trim().slice(5).trim();
              if (data === '[DONE]') {
                console.log('Done:', true);
                const lastMessage = await getLastMessage();
                const messages = convertMessages(lastMessage.data.data);
                this.setState({ messages: messages || [] })
              } else {
                try {
                  console.log('before end', data);
                  const event = JSON.parse(data);
                  console.log('event', event);
                } catch (error) {
                  console.error('Error parsing streamed response:', error);
                }
              }
            }
          }
        };

        const readLoop = async () => {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              break;
            }
            await handleStreamedResponse(value);
          }
        };

        readLoop();
      }



      if (this.props.onSend) {
        this.props.onSend(message)
      }
    }
  }
  async componentDidMount() {
    if (!this.props.editor) {
      console.log('componentDidMount:');
      const lastMessage = await getLastMessage();
      console.log('lastMessage', lastMessage);
      console.log('lastMessage', lastMessage.data);
      // this.setState({ messages: this.props.adaloMessages?.map(message => message.messageData) || []})
      const messages = convertMessages(lastMessage.data.data);
      this.setState({ messages: messages || [] })
      const element = this.refs.flatList;
      setTimeout(() => scrollToEnd(element), 150);
      //scrollToTheEnd(element);
      //scrollToTheEnd(element);

    }
  }
  componentDidUpdate(prevProps: RealTimeChatProps) {
    if (!this.props.editor) {

      if (this.state.messages.length === 0 && (this.props.adaloMessages || [])?.length > 0) {
        this.setState({ messages: this.props.adaloMessages?.map(message => message.messageData) || [] })
      }
    }
  }
  componentWillUnmount() {
    if (!this.props.editor) {
      //
    }
  }
  render() {
    console.log(this.props)
    return (
      <View style={{ backgroundColor: this.props.backgroundColor, flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View
            style={{
              height: this.props._height,
              width: this.props._width,
              backgroundColor: "#303030"
            }}
          >
            <FlatList
              ref="flatList"
              style={{ flex: 1 }}
              data={this.state.messages}
              renderItem={({ item }) => <ChatMessage urlAvatar={this.props.urlAvatar} isShowDataTime={this.props.isShowDataTime} receiverStyle={this.props.receivedChatWindow} senderStyle={this.props.senderChatWindow} myId={this.props.clientId || ''} message={item} />}
              keyExtractor={(item) => `item!.id`}
            />
            <InputBox inputStyle={this.props.inputStyle} buttonStyles={this.props.sendButton} sendMessage={this.sendMessage} />
          </View>
        </KeyboardAvoidingView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default RealTimeChat;
