import router from '@adonisjs/core/services/router'
import openapi from '@foadonis/openapi/services/main'
import type { OpenAPIDocument } from '@martin.xyz/openapi-decorators/types'

/**
 * El contrato vive en dos sitios y esta es la única función que lo construye,
 * para que `openapi:generate` y `openapi:check` no puedan divergir: si el
 * generador escribiera de una forma y el comprobador leyera de otra, el check
 * fallaría por la diferencia entre los dos comandos y no por el contrato.
 */
export async function construirDocumento(): Promise<OpenAPIDocument> {
  // Sin volcar las rutas al store, `buildDocument()` sale con `paths: {}` y el
  // contrato entero pasaría a estar vacío sin que nada se queje. El servidor
  // hace este commit al arrancar; un comando de ace no.
  router.commit()

  return openapi.buildDocument()
}

/**
 * Una sola serialización para los dos comandos: dos espacios y salto final.
 * Si cada uno eligiera la suya, el check fallaría por la indentación y no por
 * el contrato, que es ruido con apariencia de hallazgo.
 */
export function serializar(documento: OpenAPIDocument): string {
  return `${JSON.stringify(documento, null, 2)}\n`
}
