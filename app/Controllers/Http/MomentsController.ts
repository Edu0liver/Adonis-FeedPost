import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Moment from 'App/Models/Moment'
import { v4 as uuidV4 } from 'uuid'
import Application from '@ioc:Adonis/Core/Application'

export default class MomentsController {
  private validationOptions = {
    types: ['image'],
    size: '2mb',
  }

  public async store({ request, response }: HttpContextContract) {
    const data = request.body()
    const image = request.file('image', this.validationOptions)

    if (image) {
      const imageName = `${uuidV4()}.${image.extname}`

      await image.move(Application.tmpPath('uploads'), {
        name: imageName,
      })

      data.image = imageName
    }

    const moment = await Moment.create(data)

    return response.status(201).json(moment)
  }

  public async index({ response }: HttpContextContract) {
    const moments = await Moment.all()

    return response.status(200).json(moments)
  }

  public async show({ response, params }: HttpContextContract) {
    const moment = await Moment.findOrFail(params.id)

    return response.status(200).json(moment)
  }

  public async delete({ response, params }: HttpContextContract) {
    const moment = await Moment.findOrFail(params.id)

    await moment.delete()

    return response.status(200).json(moment)
  }

  public async update({ request, response, params }: HttpContextContract) {
    const data = request.body()

    const moment = await Moment.findOrFail(params.id)

    moment.title = data.title
    moment.description = data.description

    if (moment.image !== data.image || !moment.image) {
      const image = request.file('image', this.validationOptions)

      if (image) {
        const imageName = `${uuidV4()}.${image.extname}`

        await image.move(Application.tmpPath('uploads'), {
          name: imageName,
        })

        moment.image = imageName
      }
    }

    await moment.save()

    return response.status(200).json(moment)
  }
}
