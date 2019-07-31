const queryArgsDefault = {
  'integration-tests': false,
  'report-host': undefined,
  'report-port': undefined,
}

const query = {}

if (window && window.location && window.location.href) {
  const url = new URL(window && window.location ? window.location.href : '')
  Object.keys(queryArgsDefault).reduce((qArgs, key) => {
    query[key] = url.searchParams.get(key) || queryArgsDefault[key]
    return query
  }, query)
}

export const isIntegrationMode =
  query['integration-tests'] ||
  process.env.REACT_APP_ENVIRONMENT === 'integration_test' ||
  undefined
export const reportServerHost =
  query['report-host'] || process.env['REPORT_HOST'] || undefined
export const reportServerPort =
  query['report-port'] || process.env['REPORT_PORT'] || undefined

if (isIntegrationMode) {
  console.log(
    `Integration mode enabled, reporting to: http://${reportServerHost ||
      'localhost'}${reportServerPort ? `:${reportServerPort}` : ''}`
  )
}
