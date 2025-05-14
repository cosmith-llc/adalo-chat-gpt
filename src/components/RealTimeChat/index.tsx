import React, { Component } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, View, } from 'react-native';
import { ChatMessage } from './ChatMessage';
import { RealTimeChatProps } from './generated';
import { InputBox } from './InputBox';
// import * as Ably from "ably";
import axios from 'axios';
import scrollToEnd from './scrollToEnd';
import Loader from './Loader'

// Get from Component properties
const OPENAI_API_KEY = '';

const headers = (API_KEY) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${API_KEY}`,
  'OpenAI-Beta': 'assistants=v2'
});


const getLastMessage = async (API_KEY, thread_Id) => await axios.get(`https://api.openai.com/v1/threads/${thread_Id}/messages`, {
  method: 'GET',
  headers: headers(API_KEY)
});

const convertMessages = (messages: {
  id: string;
  role: string;
  assistant_id: any;
  created_at: any;
  content: { text: { value: any; }; }[];
}[]) => {
  return messages.reverse().map((message: {
    id: string;
    role: string;
    assistant_id: any;
    created_at: any;
    content: { text: { value: any; }; }[];
  }) => ({
    id: message.id,
    role: message.role === 'user' ? 'user' : 'assistant',
    message: message.content[0].text.value,
    createdDate: message.created_at
  }));
};

class RealTimeChat extends Component<RealTimeChatProps,
  {
    messages: any[];
    oneTimeUpdate: boolean;
    updateList: boolean
    loaded: boolean;
    loading: boolean;
  }> {

  constructor(props: RealTimeChatProps) {
    super(props);
    const sampleMessages = [
      {
        message: 'First Message',
        createdDate: new Date(),
        senderId: this.props.clientId
      },
      {
        message: 'Second Message',
        createdDate: new Date(),
        senderId: `${this.props.clientId}+1`
      }
    ];

    this.state = {
      loading: false,
      loaded: false,
      oneTimeUpdate: (this.props.adaloMessages?.length || 0) > 0,
      messages: !!props.editor ? sampleMessages : this.props.adaloMessages?.map(message => message.messageData) || [],
      updateList: false
    };

    this.sendMessage = this.sendMessage.bind(this);
  }

  async sendMessage(message: string) {
    if (message) {
      this.setState({
        messages: [
          ...this.state.messages,
          {
            message: message,
            role: 'user',
            createdDate: new Date()
          },
          {
            message: '',
            role: 'assistant',
            createdDate: new Date()
          }
        ]
      });
      this.setState({ updateList: true });
      setTimeout(() => scrollToEnd(this.refs.flatList, this.state.messages.length), 150);
      const { apiKey, assistantId, threadId, fileId } = this.props;

      const data = {
        'role': 'user',
        'content': message
      };
      const urlSendMessage = `https://api.openai.com/v1/threads/${threadId}/messages`;

      //@ts-ignore
      await axios.post(urlSendMessage, data, { headers: headers(apiKey) });

      const runResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
        method: 'POST',
        headers: headers(apiKey),
        body: JSON.stringify({
          assistant_id: assistantId, stream: true,
          tools: [{ type: 'file_search' }],
          tool_choice: { type: 'file_search' }
        }),
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
                const lastMessage = await getLastMessage(apiKey, threadId);
                const messages = convertMessages(lastMessage.data.data);
                this.setState({ messages: messages || [] })
                setTimeout(() => scrollToEnd(this.refs.flatList, this.state.messages.length), 150);
                this.setState({ updateList: false })
              } else {
                try {
                  const event = JSON.parse(data);
                  if (event && event.object === 'thread.message.delta') {
                    const messages = this.state.messages;
                    const length = messages.length;
                    messages[length - 1].message = messages[length - 1].message + event.delta.content[0].text.value;
                    this.setState({ messages: [...this.state.messages] })
                  }
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
      const { apiKey, threadId } = this.props;

      await this.loadMessages(apiKey, threadId);

      const element = this.refs.flatList;
      setTimeout(() => scrollToEnd(element, this.state.messages.length), 150);
    }
  }

  async loadMessages(apiKey, threadId) {
    let messages = [];
    if (apiKey && threadId) {
      this.setState({ loading: true });
      const lastMessage = await getLastMessage(apiKey, threadId);
      this.setState({ loaded: true });
      //@ts-ignore
      messages = convertMessages(lastMessage.data.data);
    }
    this.setState({ messages: messages || [] })
  }

  componentDidUpdate(prevProps: RealTimeChatProps) {
    if (!this.props.editor) {
      if (this.state.messages.length === 0) {
        if (!this.state.loaded && !this.state.loading) {
          const { apiKey: prevApiKey, threadId: prevThreadId } = prevProps;
          const { apiKey, threadId } = this.props;

          if (apiKey !== prevApiKey || threadId !== prevThreadId) {
            this.loadMessages(apiKey, threadId);
          }
        }
      }
    }
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'position' : 'height'}
        >
          <View
            style={[styles.container, {
              height: this.props._height,
              width: this.props._width,
              backgroundColor: this.props.backgroundColor
            }]}
          >
            <FlatList
              ref="flatList"
              style={{ flex: 1 }}
              data={this.state.messages}
              renderItem={({ item }) => <ChatMessage urlAvatar={this.props.urlAvatar}
                                                     isShowDataTime={this.props.isShowDataTime}
                                                     receiverStyle={this.props.receivedChatWindow}
                                                     senderStyle={this.props.senderChatWindow}
                                                     myId={this.props.clientId || ''}
                                                     message={item}/>}
              keyExtractor={(item) => item!.id}
            />
            {this.props.sendButton?.showSendingIndicator && this.state.updateList ?
              <Loader colorIndicator={this.props.sendButton!.indicatorColor}/> : ''}
            <InputBox updateList={this.state.updateList} inputStyle={this.props.inputStyle}
                      buttonStyles={this.props.sendButton} sendMessage={this.sendMessage}
                      placeholder={this.props.placeholder}/>
          </View>
        </KeyboardAvoidingView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    backgroundColor: '#303030'
  }
});

export default RealTimeChat;
