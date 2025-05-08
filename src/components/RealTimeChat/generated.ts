/*********** Manifest Props *******************
 * This file is auto generated, making manual *
 * edits to this file might result in loosing *
 * information.                               *
 **********************************************/
export interface IStyles {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?:
    | 'normal'
    | 'bold'
    | '100'
    | '200'
    | '300'
    | '400'
    | '500'
    | '600'
    | '700'
    | '800'
    | '900'
    | undefined;
  textAlignment?: string;
  color?: string;
}

export interface IFonts {
  body: string;
  heading: string;
}

export interface IAvatar {
  uri: string;
  cache: string;
}

export interface IMessageData {
  message?: string;
  senderId?: string;
  createdDate?: string;
}

export interface ISendButton {
  buttonIcon?: string;
  buttonIconColor?: string;
  showSendingIndicator?: boolean;
  indicatorColor?: string;
}

export interface IInputStyle {
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  backgroundColor?: string;
}

export interface ISenderChatWindow {
  backgroundColor?: string;
  textColor?: string;
  borderRadius?: number;
  marginLeft?: number;
  marginRight?: number;
  padding?: number;
}

export interface IReceivedChatWindow {
  backgroundColor?: string;
  textColor?: string;
  borderRadius?: number;
  marginLeft?: number;
  marginRight?: number;
  padding?: number;
}

export interface IAdaloMessages {
  id: number;
  messageData?: IMessageData;
  _meta: any;
}

export interface RealTimeChatProps {
  sendButton?: ISendButton;
  inputStyle?: IInputStyle;
  senderChatWindow?: ISenderChatWindow;
  receivedChatWindow?: IReceivedChatWindow;
  adaloMessages?: IAdaloMessages[];
  apiKey?: string;
  threadId?: string;
  fileId?: string;
  clientId?: string;
  channelName?: string;
  subscriptionKey?: string;
  onSend?: (Messages?: string) => void;
  backgroundColor?: string;
  appId: string;
  _fonts: IFonts;
  _width: number;
  _height: number;
  editor: boolean;
  isShowDataTime: boolean;
}
