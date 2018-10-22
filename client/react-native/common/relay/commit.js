import { commitMutation } from 'react-relay'
import environment from './environment'

export default (mutation, clientMutationId, input = {}, configs) => {
  return new Promise((resolve, reject) =>
    commitMutation(environment, {
      mutation,
      variables: { clientMutationId, ...input },
      onCompleted: (res, errs) => {
        if (errs && errs.length) {
          reject(errs)
          return
        }
        if (res && res.errors) {
          reject(res.erros)
          return
        }
        resolve(res)
      },
      onError: reject,
      ...configs,
    })
  )
}
