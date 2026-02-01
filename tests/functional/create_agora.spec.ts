import { test } from '@japa/runner'
import Agora from '#models/agora'

test.group('Create agora', () => {
  test('it should create an agora and be able to find it', async ({ assert }) => {
    const agora = await Agora.create({
      title: 'Test Agora Title',
    })

    assert.isDefined(agora.id)
    assert.equal(agora.title, 'Test Agora Title')

    const foundAgora = await Agora.findOrFail(agora.id)
    assert.equal(foundAgora.id, agora.id)
    assert.equal(foundAgora.title, 'Test Agora Title')
  })
})
