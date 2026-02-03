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
import env from '#start/env'
import transmit from '@adonisjs/transmit/services/main'
const HealthChecksController = () => import('#controllers/health_checks_controller')

transmit.registerRoutes()

router.get('/health', [HealthChecksController])
// route to manage agora
router.on('/').renderInertia('agora/new')
router.post('/', async ({ request, response }) => {
  const payload = await request.validateUsing(createAgoraValidator)
  const createdAgora = await Agora.create(payload)
  return response.redirect(`/${createdAgora.id}`)
})
router.on('/success').renderInertia('agora/success')
router.on('/:id').setHandler(async ({ request, inertia }) => {
  const { id } = request.params()
  const agora = await Agora.findOrFail(id)
  await agora.load('participants')
  const url = `${env.get('URL') ?? 'http://localhost:3333'}`
  const inviteUrl = `${url}/join/${agora.inviteCode}`
  return inertia.render('agora/show', {
    id: agora.id,
    title: agora.title,
    inviteUrl,
    participants: agora.participants.sort((a, b) => (a.joinedAt < b.joinedAt ? 1 : -1)),
  })
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
  const newParticipant = await request.validateUsing(createParticipantValidator)
  const agora = await Agora.findBy('inviteCode', code)
  if (!agora) return inertia.render('agora/not_found')

  const participant = await agora.related('participants').create(newParticipant)

  await transmit.broadcast(`${agora.id}/participants`, {
    participant: participant.serialize(),
  })

  return response.redirect(`/success`)
})

router.on('*').renderInertia('errors/not_found')
