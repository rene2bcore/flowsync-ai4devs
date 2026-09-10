# AGENTS.md

Las instrucciones de este repositorio viven en **[`CLAUDE.md`](CLAUDE.md)**, en la raíz. Ábrelo: ahí están los comandos, la arquitectura y las reglas de proceso.

---

**Este fichero era un symlink a `CLAUDE.md` y ha dejado de serlo el 2026-09-09.** Era [H-08](docs/hallazgos.md).

Un symlink en el índice de git -modo `120000`- solo se materializa donde el sistema lo permite. En Windows, con `core.symlinks=false`, git escribe un fichero de texto de nueve bytes cuyo contenido es la cadena `CLAUDE.md`. Quien abriera `AGENTS.md` en esa máquina no encontraba las instrucciones ni un aviso: encontraba un nombre de fichero suelto, sin contexto.

Un puntero escrito funciona en los dos sitios y **no puede desincronizarse**, porque no duplica ni una línea de las instrucciones. Es menos elegante que un symlink y es lo que se lee igual en todas partes.
