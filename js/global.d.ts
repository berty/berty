declare module '*.svg' {
	import React from 'react'
	import { SvgProps } from 'react-native-svg'
	const content: React.FC<SvgProps>
	export default content
}
declare module '*.ttf'

declare var __DEV__: boolean | undefined

declare module 'react-native-in-app-notification'
declare module 'linkify-it'
declare module 'react-native-flags'
declare module 'react-native-emoji-board'
declare module 'react-native-android-keyboard-adjust'
declare module 'emoji-datasource'
declare module 'eventemitter3'

declare module 'google-palette' {
	const content: (type: string, count: number) => string[]
	export default content
}

declare module '*.png'

declare module '*.gif'

declare module '*.json'

declare module 'react-native-restart' {
	import RNRestart from 'react-native-restart/lib/typescript'
	export default RNRestart
}
