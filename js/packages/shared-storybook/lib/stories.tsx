import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Example } from "@berty-tech/components"

namespace Storybook {
	export interface API {
		storiesOf(
			arg0: string,
			arg1: object
		): { add(arg0: string, arg1: React.FunctionComponent): void }
	}
}

const { centeredView } = StyleSheet.create({
	centeredView: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#F5FCFF',
	},
})

export default (api: Storybook.API): void => {
	const CenteredView: React.FunctionComponent = (props) => {
		return <View style={centeredView}>{props.children}</View>
	}

	api.storiesOf('SharedCenteredView', module).add('default view', function() {
		return (
			<CenteredView>
				<Text>Hello Storybook</Text>
			</CenteredView>
		)
	})

	api.storiesOf('SharedExampleComponent', module).add('default view', function() {
		return (
			<CenteredView>
				<Example name="Shared" />
			</CenteredView>
		)
	})

	api.storiesOf('SharedOtherCenteredView', module).add('default view', function() {
		return (
			<CenteredView>
				<Text>Hello Storybook 2</Text>
			</CenteredView>
		)
	})
}
