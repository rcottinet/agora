import scheduler from 'adonisjs-scheduler/services/main'
import Agora from '#models/agora'
import Participant from '#models/participant'
import logger from '@adonisjs/core/services/logger'

scheduler
  .call(async () => {
    await Participant.query().delete()
    await Agora.query().delete()
    logger.info('Cleared Agora and Participant records')
  })
  .everyTwoHours()
