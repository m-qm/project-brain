# Centro de confianza

Si este texto y la versión en inglés difieren, prevalece el inglés.

Cómo pensamos la seguridad y los datos en **agentkbase.com**.

**Quién opera:** la persona que mantiene el proyecto de código abierto; en esta web aún no hay una empresa registrada ([Privacidad](/legal/privacy)).

## Contacto de seguridad

Informa de vulnerabilidades o de abusos:

* **Email:** [hello@agentkbase.com](mailto:hello@agentkbase.com)
* **security.txt:** [/.well-known/security.txt](https://agentkbase.com/.well-known/security.txt)

Incluye los pasos para reproducirlo y el impacto. Intentamos acusar recibo de los avisos de buena fe en unos pocos días laborables.

## Arquitectura de la web pública

| Área | Enfoque |
|------|---------|
| **Contenido del brain** | Se queda en **tu** repo tras exportar; en el tramo gratis no hay una caja fuerte alojada obligatoria |
| **LLM en el Vercel público** | **Apagado** por defecto, para evitar abuso de cuota y el riesgo de una clave compartida |
| **Lista de espera** | Email vía Resend; solo la bandeja de quien opera; véase [Privacidad](/legal/privacy) |
| **Analítica** | Vercel Web Analytics (agregada); véase Privacidad |
| **Dependencias** | Monorepo con lockfile; el despliegue de producción sale de `main` por Vercel |

## Subencargados (web)

El alojamiento y el correo pueden tratar datos para servir la web:

* [Vercel](https://vercel.com/legal/privacy-policy) (alojamiento, analítica)
* [Resend](https://resend.com/legal/privacy-policy) (email transaccional de la lista)

## Tus responsabilidades

* Revisa los hechos exportados antes de que un agente se apoye en ellos. Usa `[CONFIRM]` y las preguntas abiertas para lo que no se sabe.
* Las claves de API se quedan en tu máquina o en un despliegue privado que controlas.
* No subas secretos dentro de `brain/`.

## Documentos

* [Política de privacidad](/legal/privacy)
* [Términos del servicio](/legal/terms)
* [Nivel de servicio](/legal/sla)
* [Agradecimientos](/legal/acknowledgements)

## Estado

Estado del alojamiento: [vercel-status.com](https://www.vercel-status.com/) (plataforma de Vercel).
