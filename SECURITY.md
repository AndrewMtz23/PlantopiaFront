# Dependency exceptions — Sprint1

The backend has no advisories in the verified lockfile audit. The frontend still uses Create React App 5, whose build/development dependency graph has known advisories. This is **not** a clean dependency audit.

On 2026-10-29 the frontend audit reported 36 findings (13 high, 7 moderate, 16 low, zero critical). The high findings come from SVG/CSS processing, webpack statistics/serialization and the development server, rather than the static React application serving orders. The precise high advisory IDs and URLs are recorded in `scripts/audit-exceptions.json`, expiring on **2026-11-12**. `npm run audit:check` fails for new high/critical advisories or expired exceptions and always writes the complete report.

Temporary constraints: use trusted repository assets only; never process uploaded customer SVG/CSS with the build chain; never expose webpack-dev-server publicly or deploy it as the production server. Static production assets must be served separately. Local development tooling still has residual risk; prefer inspecting a static build until the tooling migration is completed. The exception does not certify deployment security.

Follow-up: replace legacy react-scripts with a maintained build chain after compatibility testing, remove redundant direct webpack dependencies, resolve the moderate React Router advisory, and remove these exceptions. Do not use `npm audit fix --force`, which proposes an invalid react-scripts version for part of the graph. No automatic publication is configured.
