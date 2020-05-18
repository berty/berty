import React from 'react'
import { ActivityIndicator } from 'react-native'

export const Fallback: React.FC<{ error?: Error }> = ({ error }) => <ActivityIndicator />
export default Fallback
