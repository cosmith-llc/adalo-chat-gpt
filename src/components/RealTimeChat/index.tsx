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
    console.log(props._screenHeight)
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

  updateLasMessage(messages: {
    id: string;
    role: string;
    message: any;
    createdDate: any;
  }[]) {

    let gptMessage = messages.filter(e => e.role === "assistant")
    const lastMessage = gptMessage[gptMessage.length - 1].message.replace(/【\d+:\d+(?:-\d+)?†[^】]+】/g, '')
    if (this.props.onSendChatGpt) {
      this.props.onSendChatGpt(lastMessage)
    }
  }

  async sendMessage(message: string) {
    if (!message) return;

    this.setState({
      messages: [
        ...this.state.messages,
        {
          message: message,
          role: 'user',
          createdDate: (new Date()).getTime() / 1000
        },
        {
          message: '',
          role: 'assistant',
          createdDate: (new Date()).getTime() / 1000
        }
      ],
      updateList: true
    });

    setTimeout(() => scrollToEnd(this.refs.flatList, this.state.messages.length), 150);

    const { apiKey, assistantId, threadId } = this.props;

    try {
      await axios.post(`https://api.openai.com/v1/threads/${threadId}/messages`, {
        role: 'user',
        content: message
      }, { headers: headers(apiKey) });

      const runRes = await axios.post(`https://api.openai.com/v1/threads/${threadId}/runs`, {
        assistant_id: assistantId,
        tools: [{ type: 'file_search' }],
        tool_choice: { type: 'file_search' }
      }, { headers: headers(apiKey) });

      const runId = runRes.data.id;

      const waitForRun = async () => {
        let status = 'in_progress';
        while (status !== 'completed' && status !== 'failed' && status !== 'cancelled') {
          await new Promise(res => setTimeout(res, 1500));
          const res = await axios.get(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
            headers: headers(apiKey)
          });
          status = res.data.status;
        }
        return status;
      };

      const finalStatus = await waitForRun();

      if (finalStatus === 'completed') {
        const lastMessage = await getLastMessage(apiKey, threadId);
        const messages = convertMessages(lastMessage.data.data);
        this.updateLasMessage(messages)
        this.setState({ messages: messages || [], updateList: false });
        setTimeout(() => scrollToEnd(this.refs.flatList, this.state.messages.length), 150);
      } else {
        console.error('Run ended with status:', finalStatus);
        this.setState({ updateList: false });
      }

      if (this.props.onSend) {
        this.props.onSend(message);
      }

    } catch (err) {
      console.error('Error during sendMessage:', err);
      this.setState({ updateList: false });
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
    this.updateLasMessage(messages)
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
      <View style={{
        flex: 1
      }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'position' : 'height'}
        >
          <View
            style={[styles.container, {
              height: this.props._screenHeight,
              width: '100%',
              backgroundColor: this.props.backgroundColor
            }]}
          >
            <FlatList
              ref="flatList"
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled={Platform.OS === 'android' ? true : undefined}
              style={{
                flex: 1,
              }}
              contentContainerStyle={{ minWidth: '100%' }}
              data={this.state.messages}
              renderItem={({ item }) => <ChatMessage key={item.id} urlAvatar={this.props.urlAvatar}
                isShowDataTime={this.props.isShowDataTime}
                receiverStyle={this.props.receivedChatWindow}
                senderStyle={this.props.senderChatWindow}
                myId={this.props.clientId || ''}
                message={item} />}
              keyExtractor={(item) => item!.id}
              initialNumToRender={50}
              onContentSizeChange={() => {
                if (this.state.messages.length > 0) {
                  scrollToEnd(this.refs.flatList, this.state.messages.length);
                }
              }}
            />
            {this.props.sendButton?.showSendingIndicator && this.state.updateList ?
              <Loader colorIndicator={this.props.sendButton!.indicatorColor} /> : ''}
            <InputBox updateList={this.state.updateList} inputStyle={this.props.inputStyle}
              buttonStyles={this.props.sendButton} sendMessage={this.sendMessage}
              placeholder={this.props.placeholder} />
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
