/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Fragment } from 'react'
import { SafeAreaView, StyleSheet, ScrollView, View, Text, StatusBar, Button } from 'react-native'

import {
	Header,
	LearnMoreLinks,
	Colors,
	DebugInstructions,
	ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen'

// import BertyCore from '@berty-tech/react-native-core'
//
// const startDaemon = (): void => {
//   console.log('BertyCore:', BertyCore)
//   if (BertyCore.invoke) {
//     const promise = BertyCore.invoke('/berty.daemon.Daemon/Start', '')
//     console.log('BertyCore.invoke("/berty.daemon.Daemon/Start", "")', promise)
//     if (promise && promise.then) {
//       promise.then((result: any) => console.log('.then():', result))
//     }
//   }
// }

// const DebugStartDaemonButton = () => (
//   <Button title="Start daemon" onPress={startDaemon} />
// )

const styles = StyleSheet.create({
	scrollView: {
		backgroundColor: Colors.lighter,
	},
	engine: {
		position: 'absolute',
		right: 0,
	},
	body: {
		backgroundColor: Colors.white,
	},
	sectionContainer: {
		marginTop: 32,
		paddingHorizontal: 24,
	},
	sectionTitle: {
		fontSize: 24,
		fontWeight: '600',
		color: Colors.black,
	},
	sectionDescription: {
		marginTop: 8,
		fontSize: 18,
		fontWeight: '400',
		color: Colors.dark,
	},
	highlight: {
		fontWeight: '700',
	},
	footer: {
		color: Colors.dark,
		fontSize: 12,
		fontWeight: '600',
		padding: 4,
		paddingRight: 12,
		textAlign: 'right',
	},
})

const App = () => {
	return (
		<Fragment>
			<StatusBar barStyle='dark-content' />
			<ScrollView contentInsetAdjustmentBehavior='automatic' style={styles.scrollView}>
				<Header />
				<View style={styles.engine}>
					<Text style={styles.footer}>Engine: {global.HermesInternal ? 'Hermes' : 'JSC'}</Text>
				</View>
				{/*<View style={styles.engine}>
            <DebugStartDaemonButton />
          </View>*/}
				<View style={styles.body}>
					<View style={styles.sectionContainer}>
						<Text style={styles.sectionTitle}>Step One</Text>
						<Text style={styles.sectionDescription}>
							Edit <Text style={styles.highlight}>App.js</Text> to change this screen and then come
							back to see your edits.
						</Text>
					</View>
					<View style={styles.sectionContainer}>
						<Text style={styles.sectionTitle}>See Your Changes</Text>
						<Text style={styles.sectionDescription}>
							<ReloadInstructions />
						</Text>
					</View>
					<View style={styles.sectionContainer}>
						<Text style={styles.sectionTitle}>Debug</Text>
						<Text style={styles.sectionDescription}>
							<DebugInstructions />
						</Text>
					</View>
					<View style={styles.sectionContainer}>
						<Text style={styles.sectionTitle}>Learn More</Text>
						<Text style={styles.sectionDescription}>
							Read the docs to discover what to do next:
						</Text>
					</View>
					<LearnMoreLinks />
				</View>
			</ScrollView>
		</Fragment>
	)
}

export default App
