# Hallazgos

Aquí van **las tres líneas** del ejercicio, una por cada punto de abajo. Es lo único que hay que
traer hecho: una parte del hook a medias con estas tres líneas escritas vale más que lo contrario,
porque lo que se discute en el directo es dónde te chocaste.

Escribe **una sola línea por punto**, con tus palabras, y **sin el dato dentro**: si tu línea
repite el correo o el secreto, eso es otra copia del dato (y también es un hallazgo, de los buenos).

## 1. La regla que saltó

Qué regla saltó en tu prueba, y la línea literal que dejó el registro.

- Saltó la regla 2, un correo con un dominio fuera de la lista, y actuó la pieza 1 y no la 2: el agente intentó el commit del ejemplo de `curl`, el hook lo paró, y solo entonces sustituyó el correo por uno de `example.com`; la línea literal del registro es `2026-10-07T01:34:56Z BLOQUEADO Regla 2 (correo personal) — docs/capabilities/tasks/README.md`, y no lleva el dato.

## 2. Lo que el hook no puede cazar

Un dato personal o un secreto de este proyecto que el hook NO puede cazar, y por qué.

- La contraseña de la cuenta de pruebas entró en el mismo commit que el hook acababa de bloquear, porque ninguna de las tres reglas mira contraseñas en claro: el agente cambió el correo, que era lo único que el hook le nombraba, y dejó la contraseña tal cual; por lo mismo tampoco ve el nombre de una persona (la columna `full_name` de `users`) ni una clave sin prefijo reconocible como la de `OLLAMA_API_KEY`.

## 3. Tu duda

De qué dudaste, o qué no pudiste comprobar.

- Dudo de que el registro sirva de evidencia y de que el hook vigile lo que dice: en la sesión que lo montó, el agente borró el registro dos veces con `rm` y se perdió la primera línea, la del hook bloqueando su propio script, sin que nada lo impidiera; y en pruebas aparte pasaron sin dejar línea un `git commit -am`, un `git -C . commit` y una línea con un correo de `example.com` antes del de fuera, además de cualquier commit hecho desde la terminal, que es por donde entró este `prompts.md`, que lleva el correo literal del prompt de la parte C.
