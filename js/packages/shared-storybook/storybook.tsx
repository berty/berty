import React from 'react'
import { storiesOf } from '@storybook/react-native'
import Example from './Example'

storiesOf("Shared Library", module)
    .add("Example", () => <>
        <Example name='World' />
        <Example name=':)' />
    </>)
