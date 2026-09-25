# Helpdesk — система заявок в IT-поддержку

Небольшое fullstack-приложение: список заявок с поиском и фильтрами, создание, редактирование и удаление.

## Стек

| Слой | Технологии |
|---|---|
| Frontend | Angular 18 (standalone components), Angular Material, Reactive Forms, RxJS, signals |
| Backend | ASP.NET Core 8 Web API, Entity Framework Core 8 + Npgsql, Swagger |
| БД | PostgreSQL 16 |
| DevOps | Docker, docker-compose, nginx |

## Быстрый старт (Docker)

Нужен только Docker с Compose v2.

```bash
docker compose up --build
```

После запуска:

| Что | Адрес |
|---|---|
| Фронтенд | http://localhost:4200 |
| API | http://localhost:5000/api/tickets |
| Swagger | http://localhost:5000/swagger |
| Health | http://localhost:5000/health |
| PostgreSQL | localhost:5432 |

- Миграции и seed-данные (16 заявок) применяются автоматически при старте API.
- Данные лежат в docker volume `pgdata` и переживают перезапуск. Полный сброс: `docker compose down -v`.
- Настройки БД можно поменять: `cp .env.example .env` и отредактировать значения.

## Запуск без Docker

Понадобятся: .NET SDK 8, Node.js 20+, PostgreSQL 16 (можно поднять только БД: `docker compose up db`).

**Backend**

```bash
cd backend/Helpdesk.Api
dotnet run
```

API стартует на http://localhost:5000, строка подключения берётся из `appsettings.Development.json`
(`ConnectionStrings:Default`, окружение `Development` используется по умолчанию при `dotnet run`
без явного `ASPNETCORE_ENVIRONMENT`). Миграции применятся сами.

**Frontend**

```bash
cd web
npm install
npm start
```

Приложение откроется на http://localhost:4200. Адрес API задаётся в
`web/src/environments/environment.development.ts`.

## API

| Метод | Путь | Описание |
|---|---|---|
| GET | `/api/tickets?search=&status=&priority=` | список; поиск (без учёта регистра) по Title и Description, фильтры комбинируются |
| GET | `/api/tickets/{id}` | одна заявка |
| POST | `/api/tickets` | создание (статус ставится сервером: `New`) |
| PUT | `/api/tickets/{id}` | обновление полей заявки (title/description/userEmail/category/priority; статус не меняет) |
| PATCH | `/api/tickets/{id}/status` | смена статуса, с проверкой допустимости перехода |
| DELETE | `/api/tickets/{id}` | удаление (204) |

Правила переходов статуса (`Domain/TicketStatusRules.cs`, продублированы на фронте в `STATUS_TRANSITIONS`):

```
New        → InProgress, Closed
InProgress → Resolved, Closed, New
Resolved   → Closed, InProgress
Closed     → InProgress
```

Пример:

```bash
curl -X POST http://localhost:5000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{"title":"Не работает принтер","userEmail":"user@company.kz","category":"Hardware","priority":"High"}'

curl -X PATCH http://localhost:5000/api/tickets/{id}/status \
  -H "Content-Type: application/json" \
  -d '{"status":"InProgress"}'
```

Коды ответов: `200/201/204` — успех, `400` — ошибка валидации или недопустимый переход статуса
(`ValidationProblemDetails`/`ProblemDetails`), `404` — заявка не найдена, `500` — внутренняя ошибка.
Все ошибки в формате `ProblemDetails`. Enum'ы в JSON и в БД — строки (`"InProgress"`), не числа.

## Структура

```
.
├── docker-compose.yml
├── .env.example
├── backend/
│   ├── Dockerfile
│   └── Helpdesk.Api/
│       ├── Controllers/    # тонкие контроллеры
│       ├── Services/       # TicketService (запросы к БД), TicketMapper (entity → DTO), ITicketService
│       ├── Dtos/           # CreateTicketDto, UpdateTicketDto, ChangeTicketStatusDto, TicketDto
│       ├── Domain/         # сущность Ticket, enum'ы, TicketStatusRules (допустимые переходы)
│       ├── Data/           # AppDbContext, SeedData
│       ├── Middleware/     # GlobalExceptionHandler (IExceptionHandler)
│       ├── Exceptions/
│       ├── Migrations/
│       ├── appsettings.json              # общие настройки (Seed, Logging), без адресов и паролей
│       └── appsettings.Development.json  # ConnectionStrings и CORS для локального запуска без Docker
└── web/
    ├── Dockerfile, nginx.conf   # nginx также проксирует /api/ на контейнер api (см. ниже)
    └── src/app/
        ├── tickets/
        │   ├── data-access/          # ticket.model.ts (типы + shared-интерфейс TicketBase), ticket.service.ts (HTTP), ticket.store.ts (state)
        │   ├── features/
        │   │   ├── ticket-list/      # список, поиск, фильтры, смена статуса на карточке
        │   │   └── ticket-form/      # форма создания/редактирования (модальное окно)
        │   └── tickets.module.ts     # роутинг фичи (lazy-loaded из app.routes.ts)
        └── shared/
            └── confirm-dialog/       # диалог подтверждения удаления
```

## Принятые решения и допущения

- **Один backend-проект с папками по слоям** (Controllers → Services → Data). Для такого объёма отдельные
  проекты Domain/Application/Infrastructure были бы избыточны.
- **Поиск и фильтры на сервере**: `ILIKE` в PostgreSQL, спецсимволы `%` и `_` экранируются.
  Индексы на `Status`, `Priority`, `CreatedAt`. Сортировка стабильна (`CreatedAt DESC, Id`).
- **Debounce 300 мс только на поиске**, фильтры срабатывают сразу; предыдущий запрос отменяется вручную
  через сохранённую `Subscription` при каждом новом.
- **Статус при создании не передаётся**, всегда `New`. `PUT` меняет только бизнес-поля заявки и не трогает
  статус — для этого отдельный `PATCH /api/tickets/{id}/status` с проверкой допустимого перехода
  (`TicketStatusRules`). Правила переходов продублированы на фронте (`STATUS_TRANSITIONS`) только для UX
  (чтобы не предлагать недопустимые пункты в селекте) — источник истины всегда бэкенд.
- **Валидация полей дублируется** на клиенте (только `required`/`email`, для удобства) и на сервере
  (DataAnnotations в DTO — источник истины). Ограничения длины (`maxLength`) не дублируются валидаторами
  формы, только HTML-атрибутом `maxlength` на инпуте.
- **Seed** выполняется, только если таблица пуста, и управляется флагом `Seed:Enabled` в конфигурации
  (по умолчанию `true`). Чтобы отключить в реальном продакшене, передайте `Seed__Enabled=false`.
- **Даты хранятся в UTC** (`timestamp with time zone`), на фронте отображаются в локальном времени.
- **Конфигурация разделена по окружениям**: `appsettings.json` содержит только окружение-независимые
  настройки, `appsettings.Development.json` — адрес БД и CORS для локального запуска (`dotnet run`),
  Docker/Production получает их полностью через переменные окружения в `docker-compose.yml`.
- **Frontend обращается к API по относительному пути `/api`** (не зашит хост), nginx внутри контейнера
  `web` проксирует `/api/` на контейнер `api` по имени сервиса в сети Docker. Это тот же frontend-бандл
  будет работать при любом хосте деплоя, а не только на `localhost`. Для локального запуска без Docker
  (`ng serve`) используется прямой адрес `http://localhost:5000/api` из `environment.development.ts`,
  там CORS всё ещё нужен.
- Swagger включён и в Production — это учебный проект.
- Файл миграции написан вручную. Чтобы пересоздать его штатно:
  `dotnet ef migrations remove` → `dotnet ef migrations add InitialCreate` (нужен `dotnet-ef`).

## Что улучшил бы при наличии времени

- Пагинация и сортировка на сервере (сейчас список возвращается целиком).
- Unit- и integration-тесты: xUnit для `TicketService` и `TicketStatusRules` (InMemory/Testcontainers),
  Jest для компонентов.
- Единый API-контракт: enum'ы (`TicketStatus`, `TicketPriority`, `TicketCategory`) сейчас продублированы
  вручную на фронте и бэке (в том числе таблица переходов статусов). Правильное решение — генерировать
  TypeScript-модели из Swagger/OpenAPI (например, NSwag) вместо ручной синхронизации.
- Serilog и структурные логи, GitHub Actions (сборка + тесты).
- Optimistic concurrency (Postgres `xmin` как concurrency token) для защиты от перезаписи при
  одновременном редактировании — сейчас, если два пользователя одновременно открыли одну заявку, второе
  сохранение молча перезапишет первое.
- Тёмная тема, локализация.
