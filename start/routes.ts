/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { createAgoraValidator } from '#validators/agora'
import Agora from '#models/agora'
import { createParticipantValidator } from '#validators/participant'

// route to manage agora
router.on('/').renderInertia('agora/new')
router.post('/', async ({ request, response }) => {
  const payload = await request.validateUsing(createAgoraValidator)
  const createdAgora = await Agora.create(payload)
  console.log(createdAgora)

  return response.redirect(`/${createdAgora.id}`)
})
router.on('/:id').setHandler(async ({ request, inertia }) => {
  const { id } = request.params()
  const agora = await Agora.findOrFail(id)
  const url = 'localhost:3333'
  const inviteUrl = `${url}/join/${agora.inviteCode}`
  return inertia.render('agora/show', { title: agora.title, inviteUrl })
})

// routes to join an agora
router.on('/join/:code').setHandler(async ({ request, inertia }) => {
  const { code } = request.params()
  const agora = await Agora.findBy('inviteCode', code)
  if (!agora) return inertia.render('agora/not_found')

  return inertia.render('agora/join', { title: agora.title })
})
router.post('/join/:code', async ({ request, inertia, response }) => {
  const { code } = request.params()
  const payload = await request.validateUsing(createParticipantValidator)
  const agora = await Agora.findBy('inviteCode', code)
  if (!agora) return inertia.render('agora/not_found')

  await agora.related('participants').create(payload)
  return response.redirect(`/agora/success`)
})
router.on('/agora/success').renderInertia('agora/success')

router.on('*').renderInertia('errors/not_found')
