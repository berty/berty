import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useStyles } from '@berty-tech/styles'
import { ScreenProps, useNavigation } from '@berty-tech/berty-navigation'

export const ConnectedPeers: React.FC<ScreenProps.Settings.ConnectedPeers> = () => {
	const { goBack } = useNavigation()
	const [{ background, flex, color, padding }] = useStyles()
    return <WebView source={{ uri: 'https://webui.ipfs.io/' }} />;
}
