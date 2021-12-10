import React from 'react'
import { KeyboardAvoidingView, KeyboardAvoidingViewProps, Platform, View } from 'react-native'

export const IOSOnlyKeyboardAvoidingView: React.FC<KeyboardAvoidingViewProps> =
	Platform.OS === 'ios'
		? props => <KeyboardAvoidingView {...props} />
		: props => <View style={props.style}>{props.children}</View>
