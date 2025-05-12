import React, { useState } from "react";
import { StyleSheet, Dimensions, View, Text, Image } from "react-native";
import { IUrlAvatar, IReceivedChatWindow, ISenderChatWindow } from "./generated";
import Icon from '@protonapp/material-components/src/Icon'
import Markdown from "react-native-markdown-display";

export type ChatMessageProps = {
  message: {
    role: string,
    message: string,
    createdDate: string
  };
  myId: String;
  senderStyle?: ISenderChatWindow;
  receiverStyle?: IReceivedChatWindow;
  isShowDataTime?: boolean;
  urlAvatar?: IUrlAvatar;
};

export const ChatMessage = (props: ChatMessageProps) => {
  const { message, isShowDataTime, urlAvatar } = props;
  const isMyMessage = () => {
    return message.role === 'user';
  };
  const formatTimeFromTimestamp = (timestamp): string => {
    if (!timestamp || isNaN(timestamp)) return 'Invalid timestamp';

    const date = new Date(timestamp * 1000); // множимо на 1000, бо JS очікує мілісекунди

    if (isNaN(date.getTime())) return 'Invalid date';

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${hours}:${minutes}`;
  };

  const ShowUrl = () => {
    if (isMyMessage() && urlAvatar?.isShowUserUrl) {
      return (
        <View style={[styles.imgContainer, {
          width: props.urlAvatar?.radiusAvatar ? props.urlAvatar?.radiusAvatar * 2 : 20,
          height: props.urlAvatar?.radiusAvatar ? props.urlAvatar?.radiusAvatar * 2 : 20,
          borderRadius: props.urlAvatar?.radiusAvatar ? props.urlAvatar?.radiusAvatar : 10,
        }]}>
          <Image source={{ uri: urlAvatar?.userUrl }} style={styles.imgAvatar} />
        </View>
      )

    }
    if (!isMyMessage() && urlAvatar?.isShowChatUrl) {
      return (
        <View style={[styles.imgContainer, {
          width: props.urlAvatar?.radiusAvatar ? props.urlAvatar?.radiusAvatar * 2 : 20,
          height: props.urlAvatar?.radiusAvatar ? props.urlAvatar?.radiusAvatar * 2 : 20,
          borderRadius: props.urlAvatar?.radiusAvatar ? props.urlAvatar?.radiusAvatar : 10,
        }]}>
          <Image source={{ uri: urlAvatar?.chatUrl }} style={styles.imgAvatar} />
        </View>
      )
    }
    return <></>
  }

  return (
    <View style={[styles.container, {
      flexDirection: isMyMessage() ? "row-reverse" : "row",
      // alignItems: isMyMessage() ? 'flex-end' : "flex-start",
      // flexDirection: isMyMessage() ? "row-reverse" : "row",
    }]}>
      <ShowUrl />
      <View
        style={[
          styles.messageBox,
          {
            borderRadius: isMyMessage() ? props.senderStyle?.borderRadius || 0 : props.receiverStyle?.borderRadius || 0,
            borderWidth: isMyMessage() ? props.senderStyle?.borderWidth : props.receiverStyle?.borderWidth,
            borderColor: isMyMessage() ? props.senderStyle?.borderColor : props.receiverStyle?.borderColor,
            backgroundColor: isMyMessage() ? props.senderStyle?.backgroundColor : props.receiverStyle?.backgroundColor,
            marginLeft: isMyMessage() ? props.senderStyle?.marginLeft : props.receiverStyle?.marginLeft,
            marginRight: isMyMessage() ? props.senderStyle?.marginRight : props.receiverStyle?.marginRight,
            paddingVertical: isMyMessage() ? props.senderStyle?.vertiacalPadding : props.receiverStyle?.vertiacalPadding,
            paddingHorizontal: isMyMessage() ? props.senderStyle?.horizontalPadding : props.receiverStyle?.horizontalPadding,
          },
        ]}
      >
        <Text style={[styles.message, { color: isMyMessage() ? props.senderStyle?.textColor : props.receiverStyle?.textColor }]}><Markdown>{message.message}</Markdown></Text>
        {isShowDataTime ? <Text style={[styles.time, { color: isMyMessage() ? props.senderStyle?.textDataColor : props.receiverStyle?.textDataColor }]}>{formatTimeFromTimestamp(message.createdDate)}</Text> : ''}
      </View>
    </View >
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  messageBox: {
    maxWidth: "70%",
    padding: 10,
    backgroundСolor: "#303030",
    borderColor: "#ffffff26",
    borderWidth: 1,
    borderRadius: 28,
  },
  name: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  message: {
    width: "100%",
    color: '#fff',
  },
  media: {
    width: "100%",
    height: Dimensions.get("screen").width,
    marginVertical: 10,
  },
  time: {
    alignSelf: "flex-end",
    fontSize: 12,
    color: "gray",
  },
  imgContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee'
  },
  imgAvatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  }
});
