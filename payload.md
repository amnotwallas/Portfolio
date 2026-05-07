# Chat API Payload Documentation

Este documento detalla el esquema de datos utilizado para la comunicación entre el frontend y el backend (Neural Core).

## 1. Request Payload (Entrada)

Este es el objeto JSON que el frontend envía al endpoint `/chat/stream` mediante un método `POST`.

### Ejemplo de Payload:
```json
{
  "query": "resalta walter ai",
  "session_id": "4bced5f9-2b94-43d7-87d8-32ea4eff1124",
  "action": "chat",
  "context": {
    "url": "/home",
    "page": "home",
    "project_slug": null
  }
}
```

### Descripción de los campos:

- **`query`** (string): La pregunta o comando textual que el usuario escribió en el chat.
- **`session_id`** (uuid): Un identificador único generado por sesión (normalmente con `crypto.randomUUID()`). Permite al backend mantener el hilo de la conversación y recordar el historial previo.
- **`action`** (string): Define el tipo de operación. Por defecto es `"chat"`, indicando una interacción conversacional estándar.
- **`context`** (object): Proporciona información adicional sobre el estado actual del frontend para que el asistente tenga "ojos" sobre lo que el usuario está viendo.
  - **`url`**: La ruta actual del navegador (ej: `/home` o `/project/walter-ai`).
  - **`page`**: Un identificador simplificado de la página (`home` o `project_details`).
  - **`project_slug`**: Si el usuario está viendo un proyecto específico, se envía su identificador (ej: `walter-ai`). Si no, es `null`.

---

## 2. Response Schema (Salida)

Cada fragmento enviado por el stream de la API sigue esta estructura JSON:

```json
{
  "message": "Texto parcial o completo de la respuesta",
  "actions": [
    {
      "type": "navigation | highlight",
      "target": "PROJECTS | EXPERIENCE | HOME (opcional)",
      "element_type": "PROJECT | EXPERIENCE (opcional)",
      "item_id": "slug-del-item (opcional)"
    }
  ]
}
```

### Campos

- **`message`** (string): Contiene el contenido de texto que se mostrará al usuario. Durante el streaming, suele contener fragmentos de la respuesta.
- **`actions`** (array): Una lista de acciones que el frontend debe ejecutar.
  - **`type`**: El tipo de acción (`navigation` para cambiar de página, `highlight` para resaltar un elemento).
  - **`target`**: El destino de la navegación (`PROJECTS`, `HOME`, etc.).
  - **`element_type`**: El tipo de elemento a resaltar (`PROJECT` o `EXPERIENCE`).
  - **`item_id`**: El identificador único del elemento (slug del proyecto o nombre/id de la empresa).

---

## 3. Ejemplo Detallado de Flujo (Stream)

### Caso A: Resaltar un Proyecto
Si el usuario dice "Muestra Walter AI", el flujo es el que vimos anteriormente.

### Caso B: Resaltar Experiencia Laboral
Si el usuario pregunta "¿Dónde has trabajado?" o "Resalta tu experiencia en X", el servidor puede enviar:

```text
data: {"message": "He trabajado en varias empresas increíbles. Aquí puedes ver mi rol en Google.", "actions": []}
data: {
  "message": "",
  "actions": [
    {
      "type": "highlight",
      "element_type": "EXPERIENCE",
      "item_id": "google"
    }
  ]
}
```

### 1. Inicio de la respuesta (Texto)
```text
data: {"message": "Claro, ", "actions": []}
```

### 2. Continuación del texto
```text
data: {"message": "con gusto te muestro ", "actions": []}
```

### 3. Más texto
```text
data: {"message": "Walter AI. Es uno de mis favoritos.", "actions": []}
```

### 4. Ejecución de Acciones (Fin del stream)
En este punto, el asistente decide que debe llevar al usuario a la página de proyectos y resaltar el proyecto específico.

```text
data: {
  "message": "",
  "actions": [
    {
      "type": "navigation",
      "target": "PROJECTS"
    },
    {
      "type": "highlight",
      "element_type": "PROJECT",
      "item_id": "walter-ai"
    }
  ]
}
```

## Ventajas de este Formato

1. **Seguridad**: Al usar JSON estructurado, el frontend ya no depende de buscar strings mágicos (como `[NAV:X]`) dentro del texto, evitando ejecuciones accidentales o malintencionadas.
2. **Atomicidad**: Se pueden enviar múltiples comandos (Navegar + Resaltar) en un solo paquete de datos.
3. **Consistencia**: El manejo de errores es más robusto ya que si un JSON falla al parsear, simplemente se ignora ese fragmento sin romper toda la lógica de visualización.
