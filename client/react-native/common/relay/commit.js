import { commitMutation } from 'react-relay'
import environment from './environment'

export default (mutation, clientMutationId, input = {}) =>
  new Promise((resolve, reject) =>
    commitMutation(environment, {
      mutation,
      variables: { input: { clientMutationId, ...input } },
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
