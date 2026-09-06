# Recorrido del curso, de S1 a S5

> Qué se hizo en cada módulo, en orden, qué quedó en el repositorio y qué se encontró.
>
> Las fechas y la atribución de cada hallazgo salen del historial de git -del commit que introdujo cada entrada-, no de la memoria. Donde no se pudo verificar, se dice.
>
> Última revisión: 2026-09-05.

## El resumen, antes del detalle

| | S1 | S2 | S3 | S4 | S5 |
|---|---|---|---|---|---|
| **Tema** | Priming | Spec-Driven Development | OpenSpec | Verificación | Guardarraíles |
| **Rama** | `feat/login-frontend` | `docs/alcance-mvp` | `s3/start` | `s4/start` | `feat/portar-cierres-modulo-4` |
| **PR** | [#12](https://github.com/LIDR-academy/flowsync-ai4devs/pull/12) | [#14](https://github.com/LIDR-academy/flowsync-ai4devs/pull/14) | [#15](https://github.com/LIDR-academy/flowsync-ai4devs/pull/15) | [#21](https://github.com/LIDR-academy/flowsync-ai4devs/pull/21) | [#22](https://github.com/LIDR-academy/flowsync-ai4devs/pull/22) |
| **Funcionalidad nueva** | Cuentas en pantalla | **Ninguna** | Tareas, entero | **Ninguna** | **Ninguna** |
| **Hallazgos** | — | **H-01 a H-10** | H-11 a H-14 | **H-15 a H-22** | H-23, y nueve que volvieron |
| **Pruebas al cerrar** | 0 | 0 | 37 | 75 + 28 | 75 + 28 |

**Diecisiete de los veintitrés hallazgos salieron de los dos módulos que no añadieron funcionalidad.** Mirar encuentra más que construir, y eso es lo que dice este recorrido leído de arriba abajo.

---

## S1 · Priming · 2026-08-19

**Qué se hizo.** Autenticación en el frontend sobre la API que el repositorio ya traía: registro, acceso, perfil protegido y cierre de sesión, con guards de ruta y el token en `localStorage`.

**Qué quedó.** Las pantallas de cuentas, `lib/api.ts` como único punto de contacto con el backend, y `auth/` con su proveedor de sesión.

**Hallazgos: ninguno registrado.** El subagente `adversarial-reviewer` sí pasó sobre el PR -hay un commit que dice «hallazgos del adversarial-reviewer sobre LID-3»- pero se arreglaron en el mismo commit y **`docs/hallazgos.md` todavía no existía**. Se perdieron como registro.

Es el primer caso del patrón que este proyecto acabaría persiguiendo: un hallazgo arreglado y no anotado es un hallazgo que nadie puede contrastar después.

---

## S2 · Spec-Driven Development · 2026-08-24

**Qué se hizo.** El PRD del MVP, el alcance, y el backlog de la épica E2 con sus criterios de aceptación. Cero código de producto.

**Qué quedó.** `docs/prd/`, `docs/backlog/` con doce ficheros, `docs/estado-actual.md` -la auditoría del repositorio- y **`docs/hallazgos.md`, que nace aquí**.

**Hallazgos: diez, de una vez.** H-01 a H-10, todos en el mismo commit del 2026-08-24. Y **ninguno es de código propio**: salieron de mirar el repositorio antes de tocarlo.

| | Qué |
|---|---|
| **H-01** | Los tests comparten base de datos con desarrollo |
| **H-02** | Cero pruebas automatizadas en todo el proyecto |
| **H-03** | `/account/logout` no envuelve la respuesta en `data` |
| **H-04** | `fullName` es `nullable`, no `optional` |
| **H-05** | La traducción de errores depende de los nombres de regla del backend |
| **H-06** | El token vive en `localStorage` |
| **H-07 a H-10** | Herramental: `jq` ausente, un symlink que Windows no materializa, el esquema generado que rompe el lint, los tipos de Jira en dos idiomas |

**Y un hallazgo que no lleva número**: al traducir requisitos a historias apareció que **E2-5 no tiene requisito propio en el PRD**. Dos requisitos la dan por hecha y ninguno crea la pantalla donde abrir la tarea. Quedó como punto abierto PA-6, que además dice algo más incómodo: la estimación cuenta tres superficies como cero.

**Lo que enseña S2.** El módulo que menos código produjo es el que más defectos encontró, y los encontró **leyendo**. La auditoría previa no es burocracia: es la forma más barata de encontrar cosas.

---

## S3 · OpenSpec · 2026-08-25 y 26

**Qué se hizo.** La gestión de tareas entera, con el flujo `propose → gate humano → apply`, y después la base de pruebas como segundo change.

**Qué quedó.** La spec viva en `openspec/specs/` -`auth` por ingeniería inversa, `tasks` por delta-, tres changes archivados, la lista compartida con crear, cambiar estado, vencimiento y filtro, y las primeras 37 pruebas.

**Hallazgos: cuatro, y cada uno salió de una actividad distinta.**

| | Cuándo salió |
|---|---|
| **H-11** · el email distingue mayúsculas | Al escribir la spec viva de `auth`. Documentar lo que el código hace obliga a mirarlo |
| **H-12** · el registro tipado solo modela la respuesta de éxito | Al montar la base de pruebas |
| **H-13** · una sesión caducada deja al usuario sin salida | Revisión adversarial del PR #15 |
| **H-14** · `updatedAt` vale distinto según el endpoint | Revisión adversarial del PR #15 |

**Lo que enseña S3.** Escribir la spec de algo que ya existe es un antipatrón declarado -la propia documentación de OpenSpec lo desaconseja- y aun así encontró H-11. El coste se paga por adelantado; el hallazgo también llega por adelantado.

---

## S4 · Verificación · 2026-08-26 a 2026-09-02

**Qué se hizo.** Trazabilidad requisito a requisito, documentación que se contrasta en vez de regenerarse, y **siete revisiones adversariales seguidas**.

**Qué quedó.** `docs/trazabilidad.md`, `scripts/verificar-docs.mjs` con quince comprobaciones que fallan la build, cuatro ADR, la integración continua, y de 20 a 75 pruebas de backend más 28 de frontend.

**Hallazgos: ocho, y ninguno era funcionalidad nueva.** Todos estaban ya en el código, con la suite en verde.

| | Qué |
|---|---|
| **H-15** | Una tarea hecha con la fecha pasada llegaba marcada como vencida. **El comentario de encima prometía tres condiciones y el código comprobaba dos** |
| **H-16** | Un estado inventado en el filtro devolvía `200` con lista vacía: «no existe» indistinguible de «no hay» |
| **H-17** | La lista filtraba el email del responsable |
| **H-18** | Los changes se archivaron con verificaciones marcadas sin hacer |
| **H-19** | Las respuestas de error devolvían traza, rutas y **el SQL ejecutado** |
| **H-20** | Dos requisitos de la spec viva se contradecían sobre `today` |
| **H-21** | El orden de validación difería entre controladores |
| **H-22** | La tabla que estrenaba la regla de arrastre **la incumplió el mismo día** |

**Lo que enseña S4, y son tres cosas.**

**Una suite en verde no dice nada por sí sola.** H-15, H-16 y H-17 convivieron con 20 pruebas pasando. Lo que los destapó fue contrastar el código contra la spec, no ejecutarlo.

**Un defecto sobrevive por darlo por cerrado, no por difícil.** H-19 cruzó tres módulos y dos cierres. El argumento que lo despriorizó cada vez -«en producción no ocurre»- resultó **falso**, y nadie lo comprobó hasta la quinta revisión: `debug=false` es la configuración de producción, y es con la que se reprodujo la fuga del SQL con el hash de la contraseña dentro.

**Una comprobación cuenta cuando se la ha visto fallar.** Las siete revisiones encontraron el verificador en verde sobre mutaciones reales, siempre por el mismo motivo: la mutación con la que se había probado cada comprobación era la que esa comprobación ya cubría por construcción. De ahí salió la séptima regla de proceso del repositorio.

---

## S5 · Controles y guardarraíles · 2026-09-02 y 03

**La sesión no se ha impartido.** Lo que hay es el prework y el trabajo de llegar con el terreno hecho.

**Qué se hizo.** El prework entero, la auditoría de las catorce reglas de proceso del repositorio, la calibración del revisor, y **portar a `s5/start` los cierres del Módulo 4**.

**Qué quedó.** `docs/auditoria-reglas-de-proceso.md` con la columna de estado deliberadamente sin rellenar, `.github/calibracion-revision.md`, los dos workflows, y la rama del port con 75 pruebas de backend y 28 de frontend donde había 23 y 0.

**Hallazgos: uno nuevo, y nueve que volvieron.**

**H-23** · cuatro rutas de `auth` están fuera del contrato generado. Un generador escribe fielmente lo que hay decorado y **no dice nada de lo que no lo está**: el documento sale bien formado, completo de su parte, y en silencio sobre el resto.

Y lo que más enseña de este módulo: **nueve defectos cerrados volvieron rotos** en la rama del curso, porque llega a la misma funcionalidad por otro camino y nunca tuvo nuestros arreglos.

**Tres de esos nueve no se detectaron leyendo la rama.** Se detectaron al ejecutar las pruebas portadas:

- **H-01** lo encontró `aislamiento.spec.ts` al fallar. La suite habría escrito sobre la base de desarrollo.
- **El runner de frontend** no había cruzado, y nadie lo notó porque **lo que faltaba era la herramienta que lo mediría**.
- **El `.gitignore`** tampoco cruzó, así que lo que no debía subirse quedó sin proteger.

**Lo que enseña S5.** Leer una rama no sustituye a ejecutar sus pruebas en ella. El plan escrito antes de portar contaba seis defectos y eran nueve, y la diferencia son exactamente los que ninguna lectura podía ver.

---

## Lo que queda abierto hoy

| | Qué | Por qué |
|---|---|---|
| **H-23** | Cuatro rutas fuera del contrato generado | Decorarlas exige esquemas que esta rama no tiene. Vigilado con lista cerrada |
| — | Los requisitos que solo se observan en pantalla | No hay runner de navegador. Vitest cubre `lib/api.ts`; falta el que ve la pantalla |
| — | El revisor adversarial en CI | Escrito y sin credencial. Hasta que se le vea encontrar algo, **no cuenta** |
| — | **Dos aproximaciones al contrato conviven** | La generada de `s5/start` y ADR-0004, que la descarta. Es material de la sesión |

Ninguno es deuda olvidada: los cuatro están declarados, y la diferencia entre un hueco conocido y una omisión es todo lo que este recorrido ha tratado de aprender.
