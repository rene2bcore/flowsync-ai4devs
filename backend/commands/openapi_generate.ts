import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { CONTRATO, construirDocumento, serializar } from '#openapi/document'

export default class OpenapiGenerate extends BaseCommand {
  static commandName = 'openapi:generate'
  static description = 'Escribe docs/api/openapi.json con el contrato que genera el código'

  static options: CommandOptions = { startApp: true }

  async run() {
    const destino = this.app.makePath(...CONTRATO)
    const contenido = serializar(await construirDocumento())

    await mkdir(dirname(destino), { recursive: true })
    await writeFile(destino, contenido, 'utf-8')

    this.logger.success(`docs/api/openapi.json escrito (${contenido.length} bytes)`)
  }
}
