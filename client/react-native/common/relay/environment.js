import { SubscriptionClient } from 'subscriptions-transport-ws'
import {
  RelayNetworkLayer,
  urlMiddleware,
  perfMiddleware,
  retryMiddleware,
} from 'react-relay-network-modern/es'

import { Environment, RecordSource, Store } from 'relay-runtime'

const logStyle = {
  relayOK:
    'font-weight:bold;color:#FFFFFF;background-color:#F26B02;letter-spacing:1pt;word-spacing:2pt;font-size:12px;text-align:left;font-family:arial, helvetica, sans-serif;line-height:1;',
  relayERROR:
    'font-weight:bold;color:#FFFFFF;background-color:#880606;letter-spacing:1pt;word-spacing:2pt;font-size:12px;text-align:left;font-family:arial, helvetica, sans-serif;line-height:1;',
  title:
    'font-weight:normal;font-style:italic;color:#FFFFFF;background-color:#000000;',
}

// eslint-disable-next-line
// if (__DEV__) {
//   installRelayDevTools()
// }

const setupSubscription = ({ ip, port }) => (
  config,
  variables,
  cacheConfig,
  observer
) => {
  const query = config.text
  const client = new SubscriptionClient(`ws://${ip}:${port}/query`, {
    reconnect: true,
  })

  const observable = client.request({ query, variables })
  observable.subscribe(observer.onNext, observer.onError, observer.onCompleted)
  return observable
}

const perfLogger = (msg, req, res) => {
  try {
    if (res.ok) {
      console.groupCollapsed(
        '%c RELAY %c %s',
        logStyle.relayOK,
        logStyle.title,
        msg
      )
    } else {
      const errorReason = res.text
        ? res.text
        : `Server return empty response with Status Code: ${res.status}.`

      console.group('%c RELAY %c %s', logStyle.relayERROR, logStyle.title, msg)
      console.warn(errorReason)
    }

    if (typeof req !== 'undefined') {
      console.dir(req)
    }

    if (typeof res !== 'undefined') {
      console.dir(res)
    }

    console.groupEnd()
  } catch (err) {
    console.log('[RELAY_NETWORK]', msg, req, res)
  }
}

const setupMiddlewares = async ({ getIp, getPort }) => [
  // eslint-disable-next-line
  __DEV__ ? perfMiddleware({ logger: perfLogger }) : null,
  urlMiddleware({
    url: `http://${await getIp()}:${await getPort()}/query`,
  }),
  retryMiddleware({
    allowMutations: true,
    fetchTimeout: 5000,
    retryDelays: () => 2000,
    beforeRetry: async ({
      forceRetry,
      abort,
      delay,
      attempt,
      lastError,
      req,
    }) => {
      req.fetchOpts.url = `http://${await getIp()}:${await getPort()}/query`

      // eslint-disable-next-line
      if (__DEV__) {
        try {
          // Unlock query
          console.groupCollapsed(
            '%c RELAY %c %s',
            logStyle.relayERROR,
            logStyle.title,
            'fetch query error'
          )
          console.log(req)
          console.warn(lastError)

          console.warn(
            'call `forceRelayRetry()` for immediately retry! Or wait ' +
              delay +
              ' ms.'
          )
          console.groupEnd()
        } catch (err) {
          console.log('[RELAY_NETWORK]', req, lastError)
        }

        console.warn(
          'call `forceRelayRetry()` for immediately retry! Or wait ' +
            delay +
            ' ms.'
        )
      }
    },
  }),
]

export const setup = async ({ getIp, getPort }) => {
  return new Environment({
    network: new RelayNetworkLayer(await setupMiddlewares({ getIp, getPort }), {
      subscribeFn: setupSubscription({
        ip: await getIp(),
        port: await getPort(),
      }),
    }),
    store: new Store(new RecordSource()),
  })
}
