import User from '#models/user'
import Task from '#models/task'
import { errores, invalido } from '#tests/helpers/api'
import type { ApiClient } from '@japa/api-client'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

/**
 * Los nombres de regla son contrato con el frontend.
 *
 * `frontend/src/lib/api.ts` traduce los errores de validación a castellano con
 * un `switch (rule)` sobre ocho identificadores que **los emite VineJS**, no
 * nosotros. Si uno cambia -al subir de versión, al reescribir un validador o al
 * renombrar una regla- el `switch` cae al caso por defecto y la persona ve un
 * mensaje genérico en lugar del suyo. Sin ruido, sin rojo, sin nada.
 *
 * Era H-05, y estuvo abierto desde el 2026-08-24 con la nota «parcialmente
 * vigilado»: las 28 pruebas del frontend cubren `api.ts` con payloads
 * fabricados a mano, así que siguen en verde aunque el backend deje de emitir
 * ese nombre. Comprobaban la traducción, no el acoplamiento.
 *
 * Esta suite ata los ocho contra la API de verdad. No comprueba el mensaje
 * -eso es del frontend- sino que el identificador siga llegando.
 */
test.group('Contrato | los nombres de regla que el frontend traduce', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  /** Los ocho `case` de `traducirError` en `frontend/src/lib/api.ts`. */
  const TRADUCIDOS = [
    'database.unique',
    'sameAs',
    'email',
    'required',
    'minLength',
    'maxLength',
    'date',
    'enum',
  ]

  const emitidos = new Set<string>()

  function anotar(lista: { rule?: string }[]) {
    for (const { rule } of lista) if (rule) emitidos.add(rule)
    return lista
  }

  async function sesion(client: ApiClient) {
    const user = await User.create({
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'secreto123',
    })
    const respuesta = await client
      .post('/api/v1/auth/login')
      .json({ email: 'ada@example.com', password: 'secreto123' })
    return { user, token: (respuesta.body() as { data: { token: string } }).data.token }
  }

  test('el alta emite required, email, minLength y sameAs', async ({ client, assert }) => {
    const sinNada = anotar(errores(await client.post('/api/v1/auth/signup').json(invalido({}))))
    assert.includeMembers(
      sinNada.map((e) => e.rule),
      ['required']
    )

    const malos = anotar(
      errores(
        await client.post('/api/v1/auth/signup').json(
          invalido({
            fullName: null,
            email: 'esto-no-es-un-email',
            password: 'corta',
            passwordConfirmation: 'otra-distinta',
          })
        )
      )
    )
    const reglas = malos.map((e) => e.rule)
    assert.includeMembers(reglas, ['email', 'minLength', 'sameAs'])
  })

  test('un email ya registrado emite database.unique', async ({ client, assert }) => {
    await User.create({
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'secreto123',
    })

    const lista = anotar(
      errores(
        await client.post('/api/v1/auth/signup').json(
          invalido({
            fullName: 'Otra',
            email: 'ada@example.com',
            password: 'secreto123',
            passwordConfirmation: 'secreto123',
          })
        )
      )
    )
    assert.includeMembers(
      lista.map((e) => e.rule),
      ['database.unique']
    )
  })

  test('un título de más de 200 caracteres emite maxLength', async ({ client, assert }) => {
    const { token } = await sesion(client)

    const lista = anotar(
      errores(
        await client
          .post('/api/v1/tasks')
          .bearerToken(token)
          .json(invalido({ title: 'x'.repeat(201) }))
      )
    )
    assert.includeMembers(
      lista.map((e) => e.rule),
      ['maxLength']
    )
  })

  test('un estado que no existe emite enum', async ({ client, assert }) => {
    const { token } = await sesion(client)

    const lista = anotar(
      errores(
        await client
          .get('/api/v1/tasks')
          .bearerToken(token)
          .qs({ status: 'inventado', today: '2026-09-09' })
      )
    )
    assert.includeMembers(
      lista.map((e) => e.rule),
      ['enum']
    )
  })

  test('una fecha mal formada emite date', async ({ client, assert }) => {
    const { user, token } = await sesion(client)
    const tarea = await Task.create({ title: 'Con fecha', assigneeId: user.id })

    const lista = anotar(
      errores(
        await client
          .put(`/api/v1/tasks/${tarea.id}/due-date`)
          .bearerToken(token)
          .json(invalido({ dueDate: '32 de febrero', today: '2026-09-09' }))
      )
    )
    assert.includeMembers(
      lista.map((e) => e.rule),
      ['date']
    )
  })

  /**
   * El cierre. Las pruebas de arriba comprueban cada nombre por separado; esta
   * comprueba que **no falte ninguno** de los ocho que el frontend traduce.
   *
   * Si mañana alguien añade un `case` a `traducirError` sin una ruta que lo
   * emita, o quita del backend una regla que el frontend sigue traduciendo,
   * esta prueba lo dice con el nombre exacto.
   */
  test('los ocho nombres que traduce el frontend los emite la API', async ({ assert }) => {
    const sinEmitir = TRADUCIDOS.filter((regla) => !emitidos.has(regla))
    assert.deepEqual(
      sinEmitir,
      [],
      `el frontend traduce reglas que la API ya no emite: ${sinEmitir.join(', ')}`
    )
  })
})
