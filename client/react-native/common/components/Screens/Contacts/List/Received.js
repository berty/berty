import React from 'react'
import GenericList from './GenericList'

const Received = () => <GenericList filter={{ filter: { status: 4 } }} ignoreMyself />

export default Received
