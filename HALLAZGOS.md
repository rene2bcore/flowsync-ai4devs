# Hallazgos

Aquí van **las tres líneas** del ejercicio, una por cada punto de abajo. Es lo único que hay que
traer hecho: un cambio de motor a medias con estas tres líneas escritas vale más que lo contrario,
porque lo que se discute en el directo es dónde te chocaste.

Escribe **una sola línea por punto**, con tus palabras y con lo que mediste, no con lo que suponías.

## 1. Las filas que cambian y la rama

Cuántas filas cambian de valor en tu cambio de esquema, medido con una consulta, y en qué rama del
árbol de reversibilidad cae. Si tu migración no toca datos, dilo tal cual: también es una respuesta.

- En los datos almacenados cambian 0 filas, porque ninguna migración se tocó y el cambio de motor no convierte nada, así que cae en la rama reversible (deshacer el conector devuelve el comportamiento); pero leídas con el conector nuevo, sobre la copia de producción a fecha 2026-10-02, cambian de forma 122 de 230 tareas (su `dueDate` pasa de `"2026-08-19"` a un instante con hora) y cambian de valor 120 (su `isOverdue` pasa de `true` a `false`, 59 de ellas sin hacer), medido con `count(*) FILTER (WHERE due_date < DATE '2026-10-02')` sobre `tasks`.

## 2. Lo que la batería de pruebas no podía ver

Una cosa que la batería de pruebas no podía ver. Si no encontraste ninguna, escribe qué buscaste y dónde.

- Que una tarea vencida deja de estarlo en cuanto se lee de PostgreSQL: el conector `pg` entrega `due_date` como `Date`, `schema_rules.ts` lo sigue declarando `string` (por eso `schema.ts` sale idéntico y la comprobación de tipos en verde), el comentario de `isOverdueOn` que dice que se compara texto contra texto deja de ser verdad, y ninguna de las 23 pruebas mira `isOverdue`; reproducido con `GET /tasks/:id?today=2026-08-20` sobre una tarea que vence el 2026-08-19, que responde `true` con SQLite y `false` con PostgreSQL.

## 3. Tu duda

De qué dudaste, o qué no pudiste comprobar.

- Dudo de qué hacer con las 22 tareas de INC-0412 cuyo estado está fuera de los tres valores (`Hecho`, `En curso`, `Pendiente`, `DONE` y `done ` con espacio), porque la columna no tiene ningún `CHECK` y el tipo `'pending' | 'in_progress' | 'done'` solo existe en TypeScript: normalizarlas cambia valores y, sin guardar el original, cae en la rama de solo recuperable desde copia; y no comprobé qué día devuelve la fecha en un servidor con huso positivo, porque WSL corre en UTC.
