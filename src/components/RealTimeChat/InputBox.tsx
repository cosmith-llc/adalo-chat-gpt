import React, { useState, useEffect } from "react";
import { TextInput, StyleSheet, View, TouchableOpacity, ActivityIndicator } from "react-native";
import Icon from '@protonapp/material-components/src/Icon'
import { IInputStyle, ISendButton } from "./generated";

interface InputBoxProps {
  sendMessage: (message: string) => void
  buttonStyles?: ISendButton
  inputStyle?: IInputStyle
}

export const InputBox = ({ sendMessage, buttonStyles, inputStyle }: InputBoxProps) => {
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState("");
  const [myUserId, setMyUserId] = useState<string | null>(null);

  const onPress = () => {
    if (!sending && message) {
      setSending(true)
      sendMessage(message)
      setSending(false)
      setMessage("")
    }
  };

  return (
    <View style={[styles.container,
    {
      borderColor: inputStyle?.borderColor,
      backgroundColor: inputStyle?.backgroundColor,
      borderWidth: inputStyle?.borderWidth,
      borderRadius: inputStyle?.borderRadius
    }
    ]}>
      <View style={styles.mainContainer}>
        <TextInput
          placeholder={"Type Message"}
          multiline
          //@ts-ignore
          style={[styles.textInput, { borderColor: 'none', outline: 'none' }]}
          value={message}
          onChangeText={setMessage}
        />
      </View>

      <TouchableOpacity onPress={onPress} disabled={message.trim() === '' || sending}
        style={[
          styles.buttonContainer,
          (message.trim() === '' || sending) && { opacity: 0.5 } // визуально делаем неактивной
        ]}>

        <View style={styles.buttonContainer}>
          {
            sending && buttonStyles?.showSendingIndicator ? (
              <ActivityIndicator size="small" color={buttonStyles?.indicatorColor} />
            ) : (
              <Icon iconName={buttonStyles?.buttonIcon || "send"} iconColor={buttonStyles?.buttonIconColor || styles.icons} />
            )
          }
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    margin: 10,
    padding: 12,
    backgroundColor: "#414141",
    color: "#afafaf",
    alignItems: "center",
    borderColor: "#ffffff26",
    borderWidth: 1,
  },
  mainContainer: {
    flexDirection: "row",
    padding: 10,
    flex: 1,
    marginRight: 10,
    alignItems: "center",
    backgroundСolor: "#414141",
  },
  textInput: {
    flex: 1,
    padding: 5,
    fontSize: 16,
    color: "#afafaf",
    textAlignVertical: 'center',
  },
  buttonContainer: {
    borderRadius: 25,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    fill: "#000",
    backgroundColor: "#fff",
  },
  icons: {
    marginHorizontal: 5,
  },
});
