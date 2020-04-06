import React from 'react'
import { View, StyleSheet } from 'react-native'
import { BlurView } from '@react-native-community/blur'
import { InvalidScan } from './InvalidScan'
import { AddThisContact } from './AddThisContact'

export const AddContact: React.FC<{ route: { params: { value: string } } }> = ({
	route: {
		params: { value },
	},
}) => {
	console.log('got val', value)

	let children
	try {
		const val = decodeURIComponent(value)
		const parts = val.split(' ')
		if (parts.length != 2) {
			throw new Error('Wrong content')
		}
		const [b64Name, ref] = parts
		const name = Buffer.from(b64Name, 'base64').toString()
		children = <AddThisContact name={name} publicKey='unknown' reference={ref} />
	} catch (e) {
		children = <InvalidScan title='Invalid link' error={e.toString()} />
	}
	return (
		<View>
			<BlurView style={[StyleSheet.absoluteFill]} blurType='light' />
			<View
				style={{
					justifyContent: 'center',
					alignItems: 'center',
					width: '100%',
					height: '100%',
					backgroundColor: 'transparent',
				}}
			>
				{children}
			</View>
		</View>
	)
}
