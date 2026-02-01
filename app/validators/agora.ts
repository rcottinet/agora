import vine from '@vinejs/vine'

export const createAgoraValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(6).maxLength(100),
  })
)
