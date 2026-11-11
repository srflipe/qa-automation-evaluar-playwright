# Prueba técnica QA Automation – Evaluar.com

Suite de pruebas automatizadas de extremo a extremo (E2E) sobre la plataforma de candidatos de Evaluar.com, construida con **Playwright + TypeScript** y el patrón **Page Object Model (POM)**.

## Escenarios automatizados

El flujo se ejecuta de forma continua, en una sola sesión de navegador:

| # | Escenario | Qué se valida |
|---|-----------|---------------|
| 1 | **Login** con credenciales válidas | Se muestra el formulario de ingreso, se redirige al área autenticada (`/process/...`) y se ven las pestañas de evaluaciones |
| 2 | **Prueba matricial** (Personalidad) | Se responden las 8 preguntas, se valida que **cada opción quede marcada** y que al finalizar se vuelva al listado con la siguiente evaluación disponible |
| 3 | **Prueba de selección múltiple** (Teletrabajo) | Se responden las 11 preguntas, se valida que **cada opción quede marcada** y que al finalizar se vuelva al listado |
| 4 | **Estado final** | En la pestaña *Finalizadas* aparecen ambas evaluaciones con estado **Finalizada** |

## Tecnologías

- [Playwright](https://playwright.dev) (`@playwright/test`)
- TypeScript
- Node.js (versión LTS)
- dotenv (variables de entorno)

## Estructura del proyecto

```
├── pages/                        # Page Objects
│   ├── LoginPage.ts              # Acceso con "Ingresar con tu usuario"
│   ├── ProcessPage.ts            # Listado de evaluaciones y pestañas
│   ├── PersonalityTestPage.ts    # Prueba matricial
│   └── TeleworkTestPage.ts       # Prueba de selección múltiple
├── tests/
│   └── evaluacion.spec.ts        # Flujo E2E completo
├── .env.example                  # Plantilla de variables de entorno
├── playwright.config.ts
└── package.json
```

## Requisitos previos

- [Node.js](https://nodejs.org) versión LTS (incluye npm)
- [Git](https://git-scm.com)

## Instalación

```bash
git clone https://github.com/TU_USUARIO/qa-automation-evaluar-playwright.git
cd qa-automation-evaluar-playwright
npm install
npx playwright install chromium
```

## Configuración

### 1. Registrar un candidato (paso único y manual)

1. Abrir el enlace de registro de la prueba:
   `https://candidato.evaluar.com/auth/autoregister/controlled/572ff080-da01-4a64-9858-897f5a8d1be9`
2. Completar el formulario con un correo propio y pulsar **Ingresar**.
3. **No abrir ninguna evaluación**, para que queden disponibles para la automatización.

> **Importante:** la plataforma permite completar cada evaluación **una sola vez por candidato**. Para cada ejecución completa del flujo se necesita un candidato que aún no haya iniciado las evaluaciones. Una forma práctica es usar alias del mismo correo (por ejemplo `micorreo+qa1@hotmail.com`, `micorreo+qa2@hotmail.com`).

### 2. Variables de entorno

Copiar la plantilla y completar el correo registrado:

```bash
cp .env.example .env
```

| Variable | Descripción |
|----------|-------------|
| `BASE_URL` | URL base de la plataforma (`https://candidato.evaluar.com`) |
| `PROCESS_ID` | Identificador del proceso de evaluación |
| `CANDIDATE_EMAIL` | Correo del candidato registrado en el paso anterior |

El archivo `.env` está en `.gitignore`, así que no se publica ningún dato personal.

## Ejecución

```bash
# Ejecutar el flujo completo con el navegador visible
npx playwright test --headed

# Ejecutar en modo headless
npx playwright test

# Abrir el reporte HTML de la última ejecución
npx playwright show-report
```

## Decisiones técnicas

- **Page Object Model:** cada pantalla tiene su clase con sus locators y acciones, y los tests solo describen el flujo y las aserciones.
- **Selectores estables:** se priorizan `getByRole` y `getByText` (accesibilidad) y los ids propios de las preguntas (por ejemplo `SER15_Q1_SQ2-SC_ORD_3`, `TEL11_Q1_A1`). Se evitaron los ids autogenerados por React (por ejemplo `_r_13_-form-item`), que cambian en cada carga.
- **Sin esperas fijas:** no se usa `waitForTimeout`. La sincronización se hace con el auto-waiting de Playwright y con aserciones web-first (`expect(...).toBeVisible()`, `not.toHaveId(...)`) que esperan a que cargue la siguiente pregunta.
- **Respuesta genérica de preguntas:** los métodos recorren todas las preguntas hasta que aparece **Finalizar**, sin escribir cada pregunta a mano.
  - *Matricial:* se marca la diagonal (fila 1 → columna 1, fila 2 → columna 2…), porque la plataforma no permite repetir una columna en la misma pregunta.
  - *Selección múltiple:* se marca la primera opción de cada pregunta.
- **Versión de escritorio de la matriz:** cada fila de la matriz tiene una copia oculta para móvil (ids terminados en `-mobile`), que se excluye en el locator.
- **Ejecución serial:** los tests comparten la sesión (`mode: 'serial'`) porque el enunciado pide un flujo continuo. Si un paso falla, los siguientes se omiten.
- **Evidencias automáticas:** ante un fallo se guardan captura de pantalla, video y trace (`test-results/`).

## Limitaciones conocidas

- **Una sola ejecución por candidato:** al finalizar una evaluación, esta pasa a *Finalizadas* y no se puede volver a responder. Para repetir el flujo completo hay que registrar un candidato nuevo (ver *Configuración*).
- **El autorregistro no es repetible:** registrar dos veces el mismo correo muestra el mensaje *"La persona ya existe en el proceso"*. Por eso el registro se documenta como paso previo y el escenario de login usa la opción **"Ingresar con tu usuario"**.
- **Rendimiento de la plataforma:** el inicio de sesión puede tardar varios segundos. Por eso el timeout de las aserciones está en 20 s (`expect.timeout`), sin añadir esperas fijas.

## Autor

Anderson Boyacá
