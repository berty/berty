let integrationTestsRequest = false
if (window && window.location && window.location.href) {
  const url = new URL(window && window.location ? window.location.href : '')
  integrationTestsRequest = url.searchParams.get('integration-tests') === 'true'
}

export const isIntegrationMode =
  process.env['ENVIRONMENT'] === 'integration_test' || integrationTestsRequest

if (isIntegrationMode) console.log('Integration mode enabled')
