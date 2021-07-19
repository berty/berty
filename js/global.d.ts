declare module '*.svg' {
	import React from 'react'
	import { SvgProps } from 'react-native-svg'
	const content: React.FC<SvgProps>
	export default content
}

declare module 'react-native-in-app-notification'
declare module 'react-native-audiowaveform'
declare module 'linkify-it'
declare module 'react-native-flags'
declare module 'react-native-emoji-board'
declare module 'react-native-android-keyboard-adjust'
declare module 'emoji-datasource'
declare module '@flyerhq/react-native-android-uri-path'

declare module 'google-palette' {
	const content: (type: string, count: number) => string[]
	export default content
}

declare module '*.png'

declare module '*.gif'

declare module '*.json'
