declare interface Window {
	location: string
}

declare module '@clarketm/saga-monitor'
declare module 'redux-test-recorder'
declare module 'react-native-jdenticon'

declare module '*.svg' {
	import { SvgProps } from 'react-native-svg'
	const content: React.FC<SvgProps>
	export default content
}
