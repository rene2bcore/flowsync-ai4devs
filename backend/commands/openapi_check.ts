import { readFile } from 'node:fs/promises'
import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { comparar } from '#openapi/diff'
import { CONTRATO, construirDocumento, serializar } from '#openapi/document'

export default class OpenapiCheck extends BaseCommand {
  static commandName = 'openapi:check'
  static description = 'Falla si docs/api/openapi.json ya no es el contrato que genera el código'

  static options: CommandOptions = { startApp: true }

  async run() {
    const destino = this.app.makePath(...CONTRATO)
    const generado = await construirDocumento()

    let versionado: string
    try {
      versionado = await readFile(destino, 'utf-8')
    } catch {
      this.logger.error('docs/api/openapi.json no existe. Ejecuta `npm run openapi:generate`.')
      this.exitCode = 1
      return
    }

    if (versionado === serializar(generado)) {
      this.logger.success('docs/api/openapi.json coincide con el documento generado')
      return
    }

    // Compara el JSON ya parseado y no el texto: si solo cambiara el formato,
    // la lista saldría vacía y el mensaje lo dice en vez de fingir una deriva.
    const diferencias = comparar(JSON.parse(versionado), JSON.parse(JSON.stringify(generado)))

    this.logger.error('docs/api/openapi.json ya no es el contrato que genera el código.')
    if (diferencias.length === 0) {
      this.logger.info('El contenido coincide y el formato no. Ejecuta `npm run openapi:generate`.')
    } else {
      for (const { ruta, motivo } of diferencias.slice(0, 20)) {
        this.logger.info(`  ${ruta} · ${motivo}`)
      }
      if (diferencias.length > 20) {
        this.logger.info(`  ... y ${diferencias.length - 20} más`)
      }
    }
    this.logger.info('Arréglalo con `npm run openapi:generate`. Este comando no arregla nada.')

    this.exitCode = 1
  }
}
