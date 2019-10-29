import React from 'react'
import { Text } from 'react-native'

type ExampleComponent = React.FunctionComponent<{ name: string }>

export const Example: ExampleComponent = ({ name }) => <Text>Hello {name} !</Text>

export default Example
