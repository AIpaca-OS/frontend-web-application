# RumboFrontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.10.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Spring Boot integration

Use the matching [backend integration PR](https://github.com/AIpaca-OS/web-services/pull/10) and an empty PostgreSQL test database. In the backend terminal, set `APP_PROFILES_DEMO_ENABLED=true` and start Spring Boot with its Maven wrapper. Run `npm start` here and open `http://localhost:4200`. The browser calls `http://localhost:8080` directly. The development seed creates the fictional driver and tutor used by the role selector. To populate an empty catalog, run the backend's `database/local-demo-billing-plans.sql` against the local `rumbo` database.

GitHub Pages uses `https://rumbo-team-backend.onrender.com` by default. To use a different test backend, set the Actions variable `RUMBO_API_ORIGIN` to its HTTPS origin without `/api/v1` or a trailing path. In the backend set `CORS_ALLOWED_ORIGINS=https://aipaca-os.github.io`. The Pages workflow uses the public origin to generate `runtime-config.js`. For another static host, set `apiOrigin` in that file and configure an Angular fallback to `index.html`.

The public site can read the plan catalog. The protected preview endpoints on Render require the private preview key via Swagger or Postman. The Angular bundle contains only the API origin. Identity and authorization, the tutor's current-trip query, automatic notices and notification preferences are pending.
