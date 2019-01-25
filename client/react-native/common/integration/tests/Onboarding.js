export default function (spec) {
  spec.describe('Onboarding', function () {
    spec.it('works', async function () {
      let authScreenExists
      const nickname = process.env['NICKNAME'] || 'Berty'

      try {
        await spec.exists('Auth.TextInput')
        authScreenExists = true
      } catch (error) {
        authScreenExists = false
      }

      if (authScreenExists === true) {
        await spec.pause(2400)
        console.info('Fill text input with nickname "' + nickname + '"')
        await spec.fillIn('Auth.TextInput', nickname)

        await spec.pause(2400)
        console.info('Press validation button')
        await spec.press('Auth.Button')
      } else {
        console.log('Auth screen skipped')
      }
    })
  })
}
