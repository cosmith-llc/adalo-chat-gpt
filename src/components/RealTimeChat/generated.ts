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

export interface IBackButton {
  buttonIcon?: string;
  buttonIconColor?: string;
  iconSize?: number;
}

export interface IUrlAvatar {
  chatUrl?: string;
  isShowChatUrl?: boolean;
  userUrl?: string;
  isShowUserUrl?: boolean;
  radiusAvatar?: number;
}

export interface IInputStyle {
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  backgroundColor?: string;
  indicatorColor?: string;
  textInputColor?: string;
}

export interface ISenderChatWindow {
  backgroundColor?: string;
  textColor?: string;
  textDataColor?: string;
  borderColor?: string;
  fontSize?: number;
  borderRadius?: number;
  borderWidth?: number;
  marginLeft?: number;
  marginRight?: number;
  horizontalPadding?: number;
  vertiacalPadding?: number;
}

export interface IReceivedChatWindow {
  backgroundColor?: string;
  textColor?: string;
  textDataColor?: string;
  borderColor?: string;
  fontSize?: number;
  borderRadius?: number;
  borderWidth?: number;
  marginLeft?: number;
  marginRight?: number;
  horizontalPadding?: number;
  vertiacalPadding?: number;
}

export interface IAdaloMessages {
  id: number;
  messageData?: IMessageData;
  _meta: any;
}

export interface RealTimeChatProps {
  backButton?: IBackButton;
  sendButton?: ISendButton;
  urlAvatar?: IUrlAvatar;
  inputStyle?: IInputStyle;
  senderChatWindow?: ISenderChatWindow;
  receivedChatWindow?: IReceivedChatWindow;
  adaloMessages?: IAdaloMessages[];
  placeholder?: string;
  apiKey?: string;
  assistantId?: string;
  threadId?: string;
  fileId?: string;
  clientId?: string;
  channelName?: string;
  subscriptionKey?: string;
  onSend?: (Messages?: string) => void;
  onSendChatGpt?: (MessagesChatGpt?: string) => void;
  onPressBack: () => void;
  backgroundColor?: string;
  appId: string;
  _fonts: IFonts;
  _width: number;
  _height: number;
  _screenHeight: number;
  editor: boolean;
  isShowDataTime: boolean;
}
