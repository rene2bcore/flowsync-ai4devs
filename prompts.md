# Prompts

Aquí van **todos los prompts que lanzaste** para hacer el ejercicio, en el orden en que los
lanzaste, con el modelo y la herramienta de cada uno.

Esto no es papeleo. Lo que se revisa es **cómo pediste las cosas**, no solo lo que salió: un
resultado flojo con un prompt bueno y un resultado flojo con un prompt vago necesitan feedback
distinto, y sin este archivo no se distinguen.

## Cómo rellenarlo

- Un apartado `## Prompt N` por cada prompt.
- **Pega el prompt tal cual lo lanzaste**, dentro del bloque de código, aunque ocupe diez líneas
  y aunque tenga faltas. No lo reescribas para que quede bien: el que arreglaste mentalmente
  después no es el que lanzaste.
- Incluye también los que **no funcionaron**. Suelen ser los más útiles de leer.
- `Modelo` y `Herramienta` en todos. Si cambiaste de una a otra a mitad, se nota aquí.

---

## Prompt 1 · las instrucciones al agente que orquestó el ejercicio

**Modelo:** Opus 5.5 (`claude-opus-5-5`)
**Herramienta:** Claude Code Desktop en Windows, sesión abierta en otro repositorio y operando sobre WSL, con la suscripción de Claude

```
Te paso la información de la s10, antes de ejecutar dime que harás y que necesitas:
```

```
Te doy mis respuestas, recuerda que el agente usa el token de claude por suscripción:

1. La opción 1
2. La primera
3. Si ok para las tres cosas.
```

**Qué salió:** el primer mensaje llevaba adjunto el texto de las dos lecciones del módulo. Antes de ejecutar nada, el agente comprobó la máquina y el proyecto, y vio que `s10/start` trae una copia de producción (`backups/produccion-2026-10-02.dump`) con datos personales, versionada y sin nada que impida leerla. Con las respuestas, acordamos tratarla solo con consultas que devuelven números, en un contenedor desechable publicado en `127.0.0.1`, y prohibírsela al agente de la parte A. Las partes B y C las hizo ese mismo agente con comandos, no con prompts: la comprobación de tipos, el diff de `schema.ts`, la lectura de `isOverdueOn`, la reproducción de punta a punta contra las dos bases y las consultas sobre la copia.

---

## Prompt 2 · Parte A, el cambio de motor

**Modelo:** Sonnet 5 (`claude-sonnet-5`), con Haiku 4.5 (`claude-haiku-4-5`) en subtareas
**Herramienta:** Claude Code CLI 2.1.272 en WSL, sin interfaz (`claude -p`, con la suscripción de Claude y los permisos concedidos de antemano), sesión nueva lanzada desde la raíz del repositorio en la rama `motor-RLL`, con `Read(backups/**)`, `pg_restore`, `git push` y `gh` denegados en la invocación

```
Migra este proyecto de SQLite a PostgreSQL corriendo en Docker, con dos bases de datos: una de desarrollo y otra de pruebas. Estas restricciones no se negocian:

- El fichero de Compose se llama `compose.yaml` y los dos servicios se llaman `db` y `db-test`.
- La imagen es `pgvector/pgvector:pg17`.
- Los puertos son 54410 para desarrollo y 54411 para pruebas. No el 5432.
- La base de pruebas va en memoria, sin volumen: es efímera a propósito.
- Los dos servicios llevan comprobación de salud, y el arranque espera a que estén sanos.
- Sin la clave `version:` en el fichero de Compose.
- La batería de pruebas apunta a la otra base por su propio fichero de entorno, que el framework carga solo cuando el entorno es de pruebas.
- Deja atajos en el Makefile para levantar las bases, pararlas, migrar las dos y correr las pruebas.
- Ninguna migración existente se toca. Si crees que hay que cambiar una, para y dímelo en vez de hacerlo.
- No abras, no restaures ni leas nada de `backups/`: lleva datos personales reales y no se le enseña a ninguna herramienta externa.

Cuando termines, levanta las dos bases, migra las dos y corre la batería de pruebas contra la de pruebas. Dime qué archivos cambiaste.
```

**Qué salió:** sesión `b318d818`, 34 turnos, unos 5 minutos. Escribió `compose.yaml` con `db-test` en `tmpfs`, cambió la conexión a `pg` y los atajos del Makefile (`db-up` con `--wait`, `db-down`, `migrate` de las dos bases, `test`), y dejó las 23 pruebas en verde. No tocó ninguna migración ni el dump. Renombró el bloque de SQLite en su sitio en vez de sustituirlo por el de PostgreSQL que venía comentado, y por eso conservó `schemaGeneration` y sus reglas: `schema.ts` salió idéntico. No commiteó; los cambios se commitearon después desde la terminal.
