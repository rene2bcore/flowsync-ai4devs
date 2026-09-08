# El revisor adversarial en CI

> Qué hace el job, qué falta para que funcione, y por qué **no usamos la acción oficial** aunque sea lo que hizo el directo.
>
> Escrito el 2026-09-08, en la Demo 3 del Módulo 5.

## Qué hay montado

`.github/workflows/revision-adversarial.yml` lanza a Claude sobre cada cambio propuesto y publica el informe en el PR, o en el resumen del job si el PR vive en otro repositorio.

| | |
|---|---|
| **Instrucciones** | `.claude/agents/adversarial-reviewer.md`, sin su frontmatter |
| **Calibración** | [`REVIEW.md`](../REVIEW.md), en la raíz. Una pantalla |
| **El porqué de cada decisión** | [`.github/calibracion-revision.md`](../.github/calibracion-revision.md). **No se inyecta** |
| **Herramientas** | `Read`, `Grep`, `Glob`. Todo lo que escribe o sale a la red va negado explícitamente |
| **Topes** | `--max-turns 40` |
| **Bloquea** | **No.** Lo determinista bloquea; el revisor informa |

El diff se calcula en el runner y se le entrega **ya escrito en un fichero**, así que el revisor no necesita shell para verlo. Es la defensa que sigue en pie aunque falle cualquier otra.

## Las dos credenciales, y no se mezclan

| Secreto | De dónde sale | Contrapartida |
|---|---|---|
| `CLAUDE_CODE_OAUTH_TOKEN` | `claude setup-token` en local, contra la suscripción | No hay factura por token, pero **gasta la misma cuota que usas para trabajar** |
| `ANTHROPIC_API_KEY` | `console.anthropic.com` | Se factura aparte. Es lo correcto el día que esto deje de ser de una persona |

**Cruzarlas falla en la primera llamada, sin gastar nada y sin decir por qué.**

**Lo que no sirve**: OpenRouter, Cline, o cualquier otro proveedor. El CLI de Claude Code autentica contra Anthropic, Bedrock, Vertex o Foundry, y nada más. Cline no es un proveedor: es una extensión que consume claves que ya tengas.

### Lo único que falta

Crear el secreto en **Settings → Secrets and variables → Actions** del fork, con el valor que imprima `claude setup-token`. Nada más: no hace falta GitHub App, porque no usamos la acción oficial.

Mientras no exista, el job **se omite en verde** y lo dice en el resumen. La asimetría es deliberada: sin configurar es un estado esperado; configurado y roto sale **rojo**, porque entonces alguien cuenta con una revisión que no se ejecuta.

## Por qué no la acción oficial

El directo usa `anthropics/claude-code-action@v1`, que publica comentarios **en línea** sobre la línea que los provoca, firmados por la GitHub App de Claude. Es mejor que lo nuestro en todo menos en una cosa, y esa cosa nos deja fuera.

**La acción oficial necesita que el PR viva en el repositorio donde está instalada.** Los nuestros no:

| | Nuestro caso |
|---|---|
| El PR vive en | `LIDR-academy/flowsync-ai4devs` |
| El código vive en | `rene2bcore/flowsync-ai4devs` |
| ¿Podemos instalar la GitHub App en el repo del curso? | **No.** No somos administradores |
| ¿Recibe secretos un `pull_request` desde un fork? | **No.** Es una decisión de seguridad de GitHub |
| ¿Corre siquiera el workflow allí? | **No.** 16 ejecuciones en `action_required`, ninguna aprobada. Es [H-24](hallazgos.md) |

Por eso nuestro job dispara en **`push`** y busca si esa rama tiene un PR abierto arriba, en vez de esperar un evento `pull_request` que nunca llega con permisos. Es más feo y es lo que funciona.

**El día que esto deje de ser un fork, la acción oficial es la opción correcta**, y entonces hay que saber lo siguiente.

## La trampa del OIDC, que nos costará el día que cambiemos

Es el hallazgo más valioso del directo y el que más se parece a lo que este repositorio persigue.

La acción oficial cambia el token OIDC del workflow por uno efímero de la GitHub App. Para eso, Actions valida que el fichero del workflow **exista en la rama por defecto**. Si el workflow es nuevo y todavía no está en `main`:

| ¿Se pasó `github_token`? | Qué pasa |
|---|---|
| **No** | La validación OIDC no encuentra el fichero en `main` → **el job se salta a sí mismo**. Sale **verde**, y no revisa nada |
| **Sí** | El token directo no pasa por OIDC → corre y publica los comentarios |

**Verde sin haber revisado nada** es exactamente el modo de fallo que [R-14](auditoria-reglas-de-proceso.md) describe: una comprobación que da una garantía que no existe. El fix es una línea, `github_token: ${{ secrets.GITHUB_TOKEN }}`, y el motivo de que exista la validación es bueno: sin ella, cualquiera podría meter un workflow con permisos elevados y ejecutarlo antes de que nadie lo revise.

**Y nuestro job tiene hoy la misma forma de fallo, por otro motivo**: sus diez ejecuciones son verdes y **ninguna ha revisado nada**, porque no hay credencial. La diferencia es que la nuestra lo dice en el resumen. Eso lo hace menos grave, no correcto.

## Cómo verlo funcionar, cuando haya credencial

Por R-14, en este orden, y ninguna revisión cuenta hasta el paso 2:

1. Crear el secreto y empujar a una rama con PR abierto. El informe debe aparecer en el resumen del job.
2. **Verlo morder.** Plantar un defecto de una de las siete categorías graves -por ejemplo quitar la tercera condición de `isOverdueOn`, que es [H-15](hallazgos.md)- y comprobar que el informe **lo nombra con su `fichero:línea`**. Si no lo nombra, el problema está en el prompt o en `REVIEW.md`, y hay que arreglarlo **antes** de fiarse de un verde.

## En qué se va el dinero

Dos partidas, y solo la segunda es nueva: **minutos de máquina** y **consumo del modelo**. Escala con el tamaño del diff y con cuántas veces corre.

`concurrency` cancela la revisión anterior cuando llega un push nuevo, y la puerta sale antes de gastar nada si la rama no tiene PR. Con la suscripción, el presupuesto deja de ser dinero y pasa a ser **atención propia**: cada revisión inútil se paga en cuota que ibas a usar tú.

Precios oficiales en [claude.com/pricing](https://claude.com/pricing). No se copian cifras aquí: envejecen sin que nadie se entere.

## Lo que el directo propone y aquí queda como propuesta

**Tres revisores en cascada** en vez de uno: el adversarial encuentra, un segundo descarta falsos positivos, y un tercero prioriza qué aplica solo y qué necesita criterio humano. El argumento de fondo es que el cuello de botella ya no es escribir código sino verificarlo.

No se implementa hoy porque **el primero todavía no se ha visto morder ni una vez**. Encadenar tres revisores sobre uno que no cuenta multiplica el gasto por tres y la garantía por cero.
