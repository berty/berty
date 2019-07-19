export default (promise, timeoutValue, timeoutPromise) =>
  new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => timeoutPromise().catch(reject),
      timeoutValue
    )
    promise.then(result => {
      clearTimeout(timeout)
      resolve(result)
    })
  })
