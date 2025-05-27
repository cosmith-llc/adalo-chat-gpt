import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import Icon from '@protonapp/material-components/src/Icon'
import { IBackButton } from './generated';

interface InputBoxProps {
  actionBack: () => void
  backButton?: IBackButton
  backgroundColor?: string
}

const SendBackButton = ({ backButton, backgroundColor, actionBack }: InputBoxProps) => {

  const onPress = () => {
    if (actionBack) {
      actionBack()
    }
  }
  return (
    <View style={[styles.container, {
      backgroundColor: backgroundColor
    }]} >
      <TouchableOpacity onPress={onPress}
        style={[
          styles.buttonContainer,
        ]}>
        <View style={styles.buttonContainer}>
          <Icon iconName={backButton?.buttonIcon || 'arrow-back-ios'}
            iconColor={backButton?.buttonIconColor || styles.icons} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    padding: 5,
    paddingLeft: 10,
    paddingRight: 10,
    marginTop: 5,
    marginBottom: 5,

  },
  buttonContainer: {
    borderRadius: 25,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    fill: 'gray',
  },
  icons: {
    marginHorizontal: 5,
  },
});

export default SendBackButton;
