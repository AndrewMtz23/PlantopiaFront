# Plantopia · Frontend

**A plant-shopping experience with tools for the team behind the store.**

Plantopia brings product discovery, shopping and order tracking into one web application. Customers explore the catalog and manage their purchases, while administrators, staff and couriers use dedicated views to operate the store.

[![Frontend CI](https://github.com/AndrewMtz23/PlantopiaFront/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/AndrewMtz23/PlantopiaFront/actions/workflows/ci.yml)

[Backend repository](https://github.com/AndrewMtz23/PlantopiaBack) · [Getting started](#getting-started) · [Project structure](#project-structure) · [Development commands](#development-commands)

## Explore Plantopia

### Customer storefront

- **Discover plants:** browse collections, explore the catalog and view product details.
- **Save favorites:** build a wishlist and manage a personal shopping cart.
- **Place an order:** review server-calculated totals and provide delivery details.
- **Track purchases:** view order history, payment status and delivery progress.
- **Manage an account:** update profile information, delivery details and a profile image.
- **Learn about the store:** access care guides, shipping information and store locations.

### Store management

- Manage products, categories, suppliers and branches.
- Review inventory and stock availability by branch.
- Manage customer and staff accounts according to role permissions.
- Review orders, confirm cash collection and coordinate deliveries.
- View activity logs, sales charts and profitability reports.

Navigation adapts to the signed-in user's role. The backend independently authorizes protected operations.

## Technology

| Area | Stack |
| --- | --- |
| User interface | React 18 |
| Routing | React Router 6 |
| Build tooling | Create React App 5 |
| Components and styling | React Bootstrap, Bootstrap and custom CSS |
| API communication | Axios and Fetch |
| Maps | Leaflet / React Leaflet; Google Maps in selected components |
| Charts | Chart.js and Highcharts |
| PDF receipts | pdfMake |
| Tests | Jest and React Testing Library |
| CI | GitHub Actions |

## Getting started

### 1. Install

Use Node.js **22.21.0**, as specified in [`.nvmrc`](.nvmrc).

~~~bash
git clone https://github.com/AndrewMtz23/PlantopiaFront.git
cd PlantopiaFront
npm ci
~~~

### 2. Connect the API

Copy [`.env.example`](.env.example) to `.env` and set the backend URL:

~~~dotenv
REACT_APP_API_URL=http://localhost:3001
~~~

Start the [Plantopia backend](https://github.com/AndrewMtz23/PlantopiaBack#readme) before using features that load or save data.

| Variable | Purpose |
| --- | --- |
| `REACT_APP_API_URL` | Required base URL of the Plantopia API |
| `REACT_APP_GOOGLE_MAPS_API_KEY` | Optional browser key for Google Maps components; restrict it to approved origins |

Variables prefixed with `REACT_APP_` are included in the browser bundle and must not contain server secrets. The legacy PayPal variable in `.env.example` is not used by the current checkout.

### 3. Start development

~~~bash
npm run dev
~~~

Open `http://localhost:3000`. React's development server reloads the application after source changes. Restart it after changing `.env`.

## Shopping and fulfillment

~~~text
Browse products → Add to cart → Review quote → Place order → Track delivery
~~~

The current checkout supports **cash orders pending collection**. The API determines prices, tax and shipping; the browser displays those totals. An administrator confirms payment separately after cash is received.

If checkout times out, the application retains the pending submission for that account and can retry it with the same idempotency key. This helps recover an uncertain request without creating a duplicate order.

Customers can download a PDF order receipt containing the saved totals and payment status. These are order receipts, not fiscal invoices. Online payment processing is not enabled in this version.

## Project structure

~~~text
public/             Static assets and the HTML entry point
src/
  app/              Page components grouped by route
  components/
    admin/          Store management and logistics
    auth/           Sign-in and registration
    profile/        Customer profile management
    public/         Storefront content and layouts
    shop/           Catalog, cart, wishlist and purchase flows
    shared/         Reusable UI and route guards
    pdf/            PDF receipts and reports
  config/           API configuration and HTTP client setup
  services/         API calls for shopping operations
  utils/            Session, delivery and image helpers
  App.js            Application routes
  index.js          React entry point
scripts/            Dependency audit tooling
~~~

The `src/app` directory organizes React page components. The application uses Create React App and React Router.

## Development commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm start` | Alias for the development server |
| `npm test -- --watchAll=false --runInBand` | Run automated tests once |
| `npm run build` | Create the production bundle in `build/` |
| `npm run audit:check` | Check dependencies against the documented security policy |

Tests cover application startup, home-page rendering, cart totals, checkout recovery, delivery actions and receipt content. They use mocked API responses; a full storefront-to-backend walkthrough should also be performed before release.

## Production build

Set `REACT_APP_API_URL` to the intended API endpoint **before** building:

~~~bash
npm run build
~~~

Serve `build/` through a static web server configured to fall back to `index.html` for application routes. Environment values are embedded at build time, so changing the API URL requires a new build.

Use HTTPS for both the storefront and API. `npm start` and `npm run dev` are development commands, not production hosting commands.

## Project status and security

Plantopia is under active development. The storefront and management views are implemented, while usability, architecture and operational hardening continue to evolve.

The current build toolchain has known dependency advisories with temporary, documented exceptions. See [SECURITY.md](SECURITY.md) for scope, restrictions and expiration dates. The audit command rejects unexpected high/critical advisories and expired exceptions.

GitHub Actions checks clean installation, automated tests, production compilation and dependency policy. Application deployment is managed separately.
