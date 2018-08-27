import { commitMutation } from 'react-relay'
import environment from './environment'

export default (mutation, variables = {}) =>
  new Promise((resolve, reject) =>
    commitMutation(environment, {
      mutation,
      variables,
      onCompleted: (res, errs) => {
        if (errs && errs.length) {
          reject(errs)
          return
        }
        resolve(res)
      },
      onError: reject,
    })
  )
