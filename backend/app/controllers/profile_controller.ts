import UserTransformer from '#transformers/user_transformer'
import type { HttpContext } from '@adonisjs/core/http'
import { ApiBearerAuth } from '@foadonis/openapi/decorators'

export default class ProfileController {
  // Sin esto, el contrato salía con `security: []`, que en OpenAPI no significa
  // «no se ha dicho nada» sino **«esta ruta es pública»**. La ruta la protege
  // `middleware.auth()` desde siempre; lo que mentía era el documento, y en la
  // dirección peor: quien integrara leyéndolo esperaría un 200 sin cabecera.
  @ApiBearerAuth()
  async show({ auth, serialize }: HttpContext) {
    return serialize(UserTransformer.transform(auth.getUserOrFail()))
  }
}
