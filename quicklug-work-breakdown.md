# Logistics Platform: Work Breakdown

Derived from `USER_STORY_FOR_LOGISTICS_PLATFORM.pdf`.

## Stack

| Layer | Tech |
|---|---|
| Mobile app (Customers + Drivers) | React Native + Expo |
| Web dashboard (Admin) | Next.js |
| Backend API | NestJS |
| Database | PostgreSQL + Prisma |
| Auth | JWT (access + refresh tokens) |

## Conventions

- `feat(scope)`: delivers user-visible behaviour traced to a user story. The story reference (e.g. `U-1.1.5`) points to the PDF section.
- `chore(scope)`: supporting work with no user story of its own (setup, infra, schema, tooling).
- Scopes: `api`, `db`, `web`, `mobile`, `infra`.
- Story references: `U-` = Users (customers), `D-` = Drivers, `A-` = Admin.
- Size: **S** (under half a day), **M** (about 1 to 2 days), **L** (3+ days).
- Items marked **(inferred)** are not written in the PDF but are required for the written stories to work. Confirm them with whoever owns the spec.

## Assumptions

1. The **mobile app** serves two roles (Customer and Driver) from one Expo codebase, with the UI switching by role after login.
2. The **web dashboard** is for Admins only.
3. All clients talk to one NestJS API with role-based guards (`CUSTOMER`, `DRIVER`, `ADMIN`).
4. "Place Order" is the MVP (per the PDF), so it and everything it depends on should be built first.
5. The PDF does not specify a payment provider, map provider, SMS/email provider or AI model. See [Open Questions](#open-questions).

## Suggested Build Order

1. **Phase 0:** Setup and database chores
2. **Phase 1:** Auth (all roles)
3. **Phase 2 (MVP):** Place order, driver accepts order, order status updates, basic live tracking
4. **Phase 3:** Home screens, history, earnings, notifications, ratings
5. **Phase 4:** Admin dashboard
6. **Phase 5:** Help center and AI chat, leaderboard, 2FA and device management, polish

---

## 1. Project Setup (Chores)

- [ ] `chore(infra)`: Initialise monorepo (`apps/mobile`, `apps/web`, `apps/api`, `packages/shared` for shared types/enums). (S)
- [ ] `chore(api)`: Scaffold NestJS app with config module, global validation pipe (class-validator), exception filter, Swagger docs. (S)
- [ ] `chore(web)`: Scaffold Next.js app (App Router, TypeScript, Tailwind, UI component library, API client). (S)
- [ ] `chore(mobile)`: Scaffold Expo app (TypeScript, Expo Router, theme, API client with axios or fetch wrapper). (S)
- [ ] `chore(infra)`: ESLint, Prettier, Husky, commitlint (Conventional Commits). (S)
- [ ] `chore(infra)`: Docker Compose for local PostgreSQL; `.env.example` for all apps. (S)
- [ ] `chore(infra)`: CI pipeline (lint, typecheck, test, build) via GitHub Actions. (M)
- [ ] `chore(mobile)`: EAS Build config, app icon, splash screen, environment profiles (dev/staging/prod). (M)
- [ ] `chore(infra)`: Set up third-party accounts and keys: maps, payment gateway, SMS/email, push (Expo), file storage. (M)
- [ ] `chore(api)`: File upload module with S3/Cloudinary storage adapter (needed for driver documents and chat attachments). (M)

## 2. Database (Prisma)

- [ ] `chore(db)`: Init Prisma, connect to PostgreSQL, set up migration workflow and seed script. (S)
- [ ] `chore(db)`: `User` model: id, email, phone (unique), passwordHash, name, address, role enum (`CUSTOMER | DRIVER | ADMIN`), 2FA fields, timestamps. (S)
- [ ] `chore(db)`: `DriverProfile` model: userId, vehicleType, isAvailable, current lat/lng, verification status, average rating. (S)
- [ ] `chore(db)`: `DriverDocument` model: type (NIN, driver's licence, other ID), file URL, status. (S)
- [ ] `chore(db)`: `Order` model: pickup/dropoff (address + lat/lng), cargo type, cargo details, weight, vehicle type, amount, payment method, status enum (`PENDING | ACCEPTED | IN_TRANSIT | COMPLETED | CANCELLED | DISPUTED`), customerId, driverId. (M)
- [ ] `chore(db)`: `Transaction` model: orderId, userId, amount, status enum (`PENDING | ACCEPTED | DECLINED`), payment method, reference. (S)
- [ ] `chore(db)`: `PaymentMethod` model (customer cards as provider tokens only, never raw card data) and `DriverBankAccount` model (account number, bank name). (S)
- [ ] `chore(db)`: `Rating` model: orderId, customerId, driverId, score, comment. (S)
- [ ] `chore(db)`: `Notification` and `PushToken` models. (S)
- [ ] `chore(db)`: `LoginSession`/device model for "most recent logged-in devices". (S)
- [ ] `chore(db)`: `Vehicle` model for admin inventory: type, plate/identifier, value, status. (S)
- [ ] `chore(db)`: `Faq` and `ChatMessage` models for the help center. (S)
- [ ] `chore(db)`: Indexes on order status, driver availability, timestamps (for live tables and leaderboard queries). (S)

## 3. Authentication

### Backend (NestJS)

- [ ] `feat(api)`: Customer and driver sign-up with email, phone and password (hashed with argon2/bcrypt). (U-1.0, D-1.0) (M)
- [ ] `feat(api)`: Sign-in using email **or** phone number plus password; return access and refresh JWTs. (U-1.0, D-1.0) (M)
- [ ] `feat(api)`: JWT auth guard, `RolesGuard` and `@Roles()` decorator. (M)
- [ ] `feat(api)`: Refresh token rotation and logout (token revocation). (inferred) (M)
- [ ] `feat(api)`: Reset password flow (request OTP/link by email or SMS, verify, set new password). (U-1.0, D-1.0) (M)
- [ ] `feat(api)`: Admin sign-in with email and password. (A-1.0) (S)
- [ ] `feat(api)`: Admin sign-up. The PDF says admin "should be able to sign up". Recommend invite-only or seeded admins rather than open sign-up. (A-1.0) (S)
- [ ] `feat(api)`: 2FA enable/disable and verify at login (OTP or TOTP). (U-1.1.7, D-1.1.6.1) (L)
- [ ] `feat(api)`: Record login sessions/devices; endpoint to list the most recent devices. (U-1.1.7) (M)
- [ ] `feat(api)`: Change password (authenticated). (U-1.1.7, D-1.1.6.1) (S)

### Mobile (Expo)

- [ ] `feat(mobile)`: Auth screens: sign-up (with role choice), sign-in, reset password; email and phone input. (U-1.0, D-1.0) (M)
- [ ] `chore(mobile)`: Secure token storage (`expo-secure-store`), auth context, request interceptor with auto-refresh, role-based navigation. (M)

### Web (Next.js)

- [ ] `feat(web)`: Admin login (and sign-up if kept) page. (A-1.0) (S)
- [ ] `chore(web)`: Auth session handling (httpOnly cookie or token store), route protection middleware, logout. (A-1.1.6) (M)

## 4. Backend Domain Modules (NestJS)

### Orders (MVP)

- [ ] `feat(api)`: Create order (name, email, phone, pickup, dropoff, cargo details, vehicle type, payment method) with validation. (U-1.1.5) (M)
- [ ] `feat(api)`: Pricing/amount calculation for an order (distance and vehicle type based). (inferred; drivers see an "amount") (M)
- [ ] `feat(api)`: List open orders for drivers with proximity (km) from the driver's location, cargo type, delivery location and amount. (D-1.1.1) (M)
- [ ] `feat(api)`: Driver accepts or declines an order; accepting assigns the driver and moves status to `ACCEPTED` (guard against two drivers accepting the same order). (D-1.1.1) (M)
- [ ] `feat(api)`: Driver updates delivery status (picked up, in transit, delivered). (inferred) (M)
- [ ] `feat(api)`: Cancel order and raise dispute with a message. (U-1.1.6) (M)
- [ ] `feat(api)`: Live transactions endpoint (orders currently active) for customers, drivers (all couriers) and admin. (U-1.1.3, D-1.1.4, A-1.1) (M)
- [ ] `feat(api)`: Customer transaction history (shipment ID, pickup, dropoff, vehicle type, cargo details, status, payment method). (U-1.1.4) (S)

### Drivers and Tracking

- [ ] `feat(api)`: Available-drivers endpoint: count plus breakdown by vehicle type (truck, dispatch rider, etc.). (U-1.1.1) (S)
- [ ] `feat(api)`: Driver availability toggle (actively looking for jobs). (inferred from U-1.1.1) (S)
- [ ] `feat(api)`: Driver location updates and customer-facing live tracking (WebSocket gateway, e.g. Socket.IO). (U-1.1.2) (L)
- [ ] `feat(api)`: Update customer's current location (stored preference or session). (U-1.1.2) (S)
- [ ] `feat(api)`: Driver documents: upload, list, replace (NIN, driver's licence or other ID). (D-1.1.6.1) (M)
- [ ] `feat(api)`: Driver earnings summary and earnings/transaction history. (D-1.1.2) (M)
- [ ] `feat(api)`: Driver total deliveries count and delivery history. (D-1.1.3) (S)
- [ ] `feat(api)`: Weekly leaderboard: top 20 couriers by amount earned this week; resets weekly (scheduled job or computed by week window). (D-1.1.5) (M)
- [ ] `feat(api)`: Driver bank account details (account number, bank name) for payouts. (D-1.1.6) (S)

### Payments, Ratings, Notifications

- [ ] `feat(api)`: Payment integration (checkout, webhook, status updates to `PENDING/ACCEPTED/DECLINED`). Provider TBD. (U-1.1.5, A-1.1.4) (L)
- [ ] `feat(api)`: Customer payment methods (cards via provider tokens, bank details if needed). (U-1.1.7) (M)
- [ ] `feat(api)`: Rate driver after a completed order; update driver's average rating. (U-1.1.5, D-1.1.6.1) (S)
- [ ] `feat(api)`: Notifications: create on order events (pending, completed, cancelled, dispute); list; mark as read. (U-1.1.6) (M)
- [ ] `feat(api)`: Push notification delivery via Expo Push (works when the app is closed); register/unregister device tokens. (U-1.1.6) (M)
- [ ] `feat(api)`: Push new open orders to nearby available drivers. (inferred) (M)

### Help Center

- [ ] `feat(api)`: FAQ store and FAQ lookup endpoint (pre-installed FAQs). (U-1.1.8) (S)
- [ ] `feat(api)`: AI chat endpoint: answer from FAQs, support attachments, and a "further help" handoff (e.g. flag to support team). (U-1.1.8) (L)

### Admin

- [ ] `feat(api)`: Dashboard stats: total money earned, total users (drivers and customers), total sales. (A-1.1) (M)
- [ ] `feat(api)`: Earnings time series (weekly/monthly) for the graph. (A-1.1) (M)
- [ ] `feat(api)`: Users list (drivers and customers) with filters, plus per-user history. (A-1.1.2) (M)
- [ ] `feat(api)`: Orders list with filters/pagination. (A-1.1.3) (S)
- [ ] `feat(api)`: Transactions list and transaction detail (payment details). (A-1.1.4) (M)
- [ ] `feat(api)`: Inventory (vehicles) CRUD limited to create, list, delete; totals for inventory value and vehicle count; availability summary. (A-1.1.5) (M)
- [ ] `feat(api)`: Admin review and approval of driver documents. (inferred; documents exist "to verify legitimacy") (M)

## 5. Mobile: Customer Experience

- [ ] `feat(mobile)`: Customer Home screen layout with the sections below. (U-1.1) (M)
- [ ] `feat(mobile)`: Available Drivers card/screen: number of available drivers and vehicle types. (U-1.1.1) (S)
- [ ] `feat(mobile)`: Live Location indicator on a map; tap to change location. (U-1.1.2) (L)
- [ ] `feat(mobile)`: Live Transactions list with name, weight, pickup, dropoff, order status, date, cargo details, transaction ID, cargo type, payment method and action button. (U-1.1.3) (M)
- [ ] `feat(mobile)`: Shipment status and live map tracking of an active shipment. (U-1.1) (L)
- [ ] `feat(mobile)`: Transaction History screen. (U-1.1.4) (S)
- [ ] `feat(mobile)`: **Place Order** (MVP): form with name, email, phone, pickup, dropoff (with location autocomplete), cargo details (fragile, bulky, frozen, etc.), vehicle type, and a checkout button. (U-1.1.5) (L)
- [ ] `feat(mobile)`: Checkout and payment flow. (U-1.1.5) (M)
- [ ] `feat(mobile)`: Rate driver screen after a successful order. (U-1.1.5) (S)
- [ ] `feat(mobile)`: Notifications screen (bell icon) with cancelled, pending, completed and dispute messages. (U-1.1.6) (M)
- [ ] `chore(mobile)`: Expo Notifications setup (permissions, token registration, foreground/background handling). (M)
- [ ] `feat(mobile)`: Profile/Settings: account info (name, email, phone, address, change password). (U-1.1.7) (M)
- [ ] `feat(mobile)`: Profile/Settings: payment methods (cards, bank details). (U-1.1.7) (M)
- [ ] `feat(mobile)`: Profile/Settings: security (recent devices, 2FA setup). (U-1.1.7) (M)
- [ ] `feat(mobile)`: Help Center AI chat UI: sender/receiver message bubbles, send icon, attach icon, further-help flow. (U-1.1.8) (L)

## 6. Mobile: Driver Experience

- [ ] `feat(mobile)`: Driver Home screen layout (available orders, total earnings, total deliveries, live deliveries, leaderboard, settings). (D-1.1) (M)
- [ ] `feat(mobile)`: Available Orders table: user ID, name, location, proximity (km), cargo type, delivery location, amount, with Accept and Decline actions. (D-1.1.1) (M)
- [ ] `feat(mobile)`: Availability toggle (online/offline). (inferred) (S)
- [ ] `feat(mobile)`: Active delivery screen: navigate to pickup/dropoff, update status, share live location. (inferred) (L)
- [ ] `feat(mobile)`: Total Earnings card; tap to open transaction history. (D-1.1.2) (S)
- [ ] `feat(mobile)`: Total Deliveries card; tap to open delivery history. (D-1.1.3) (S)
- [ ] `feat(mobile)`: Live Deliveries table: transaction ID, timestamp, status, delivery location, cargo type, courier name. (D-1.1.4) (M)
- [ ] `feat(mobile)`: Leaderboard: top 20 couriers with user ID and amount earned this week. (D-1.1.5) (S)
- [ ] `feat(mobile)`: Settings hub: profile, security, payments, log out. (D-1.1.6) (S)
- [ ] `feat(mobile)`: Profile: personal information (name, address, email, phone) and current ratings from users. (D-1.1.6.1) (M)
- [ ] `feat(mobile)`: Security and preference: 2FA, password, change password. (D-1.1.6.1) (M)
- [ ] `feat(mobile)`: Documents: upload NIN, driver's licence or other ID; show verification status. (D-1.1.6.1) (M)
- [ ] `feat(mobile)`: Payments: add bank account details (account number, bank name). (D-1.1.6) (S)
- [ ] `feat(mobile)`: Push notification for new nearby orders and order updates. (inferred) (S)

## 7. Web: Admin Dashboard (Next.js)

- [ ] `chore(web)`: Dashboard layout with navigation sidebar (Home, Users, Orders, Transactions, Inventory Management, Logout); reusable table component with filtering and pagination; chart library setup. (M)
- [ ] `feat(web)`: Home: summary cards for total money earned, total users (drivers and customers) and total sales. (A-1.1) (M)
- [ ] `feat(web)`: Home: live transactions table. (A-1.1) (M)
- [ ] `feat(web)`: Home: earnings graph with weekly/monthly toggle. (A-1.1) (M)
- [ ] `feat(web)`: Home: inventory availability widget. (A-1.1) (S)
- [ ] `feat(web)`: Home: floating chat button. The PDF doesn't say who it chats with. Confirm before building. (A-1.1) (M)
- [ ] `feat(web)`: Users page: table of drivers and customers (user ID, email, phone, type), filters, and an action to view user history. (A-1.1.2) (M)
- [ ] `feat(web)`: Orders page: transaction ID, timestamp, status, delivery location, pickup location, cargo type, courier name. (A-1.1.3) (M)
- [ ] `feat(web)`: Transactions page: transaction ID, user ID, timestamp, status, payment method (declined, accepted, pending); click a row for payment details. (A-1.1.4) (M)
- [ ] `feat(web)`: Inventory Management: list vehicles, add and delete items, show total inventory value and total vehicles. (A-1.1.5) (M)
- [ ] `feat(web)`: Driver verification screen: review uploaded documents and approve or reject. (inferred) (M)
- [ ] `feat(web)`: Logout. (A-1.1.6) (S)

## 8. Cross-Cutting

- [ ] `chore(api)`: Real-time infrastructure (WebSocket gateway, auth on socket connections, rooms per order/driver) powering live transactions, tracking and live deliveries. (L)
- [ ] `chore(api)`: Scheduled jobs (weekly leaderboard reset or snapshot, stale order clean-up). (S)
- [ ] `chore(api)`: Security hardening: rate limiting, helmet, CORS, input sanitisation, audit logging for admin actions. (M)
- [ ] `chore(api)`: Unit/e2e test setup (Jest + Supertest) and tests for auth, orders and payments. (L)
- [ ] `chore(mobile)`: Reusable UI kit, loading/empty/error states, offline handling. (M)
- [ ] `chore(web)`: Reusable UI kit, loading/empty/error states, toast/notifications. (M)
- [ ] `chore(infra)`: Deployment: API and DB hosting, Next.js hosting, EAS submit to Play Store/App Store, environment secrets. (L)
- [ ] `chore(api)`: Publish final Swagger/OpenAPI docs and keep them in sync for the three clients. (S)

---

## Open Questions

1. **Payments:** Which provider (e.g. Paystack, Flutterwave, Stripe)? Are card payments, bank transfer, cash and wallet all in scope? The PDF lists "payment method" but doesn't name options.
2. **Pricing:** How is an order's amount calculated (distance, weight, vehicle type, fixed rates)?
3. **Maps:** Which provider for maps, geocoding and place autocomplete (Google Maps, Mapbox)?
4. **Admin sign-up:** Should admins be able to self-register, or only be created by an existing admin or seeded?
5. **Admin floating chat button:** Chat with whom (customers, drivers, support team, AI)?
6. **AI chat box:** Is it a real LLM or a scripted FAQ flow? What does "further help flow" hand off to?
7. **Driver verification:** Must admin approve documents before a driver can accept orders?
8. **Order matching:** Do drivers pick from an open list (as written), or should the system also auto-assign?
9. **Leaderboard visibility:** The PDF places it on the driver home only. Confirm it is hidden from customers and admin.
10. **Shipment status vs live transactions:** Confirm these are two views of the same order data (assumed yes).
11. **SMS/OTP provider:** Needed for phone verification, password reset and 2FA.
