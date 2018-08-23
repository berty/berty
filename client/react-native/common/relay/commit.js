import { commitMutation } from 'react-relay'
import environment from './environment'

export default (mutation, variables = {}) =>
  new Promise((resolve, reject) =>
    commitMutation(environment, {
      mutation,
      variables,
      onCompleted: resolve,
      onError: reject,
    })
  )
