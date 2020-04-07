declare interface Window {
	location: string
}

declare module 'simpleflakes/lib/simpleflakes-legacy'
declare module '@clarketm/saga-monitor'
declare module 'redux-test-recorder'

declare module '*.svg' {
	import { SvgProps } from 'react-native-svg'
	const content: React.FC<SvgProps>
	export default content
}
