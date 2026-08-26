# Molly Bakers — Admin Dashboard

React + TypeScript + Material UI admin dashboard for managing users,
cakes, special offers, client feedback, and orders.

## Setup

```
npm install
npm run dev
```

The app runs on the Vite development server, usually at
`http://localhost:5173`.

## What's here

- `/users` — table + create/edit dialog for users
- `/cakes` — cake table with name, description, flavour, price, size,
  image, create/edit, delete, and image upload support
- `/offers` — table of special offers, with an active/paused toggle
  and delete
- `/feedback` — reviews with reply support
- `/orders` — order table with payment and processing statuses

## API integration

Requests are centralized in `src/api/client.ts` and use:

- Base URL: `http://localhost:8000` by default
- Authorization: the signed-in Supabase access token
- JSON response envelope: `{ "response": ... }`

Set these variables in the deployment environment:

```env
VITE_API_URL=https://your-backend.example.com
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUB_KEY=your-supabase-publishable-key
```

The admin user must already exist in Supabase Auth and have a matching row in
`customers` with `role` set to `admin`. The backend validates both the access
token and this role before serving admin endpoints.

Google admin sign-in must be started from the admin deployment URL. Configure
that URL as a Supabase redirect URL; the client app's Google button redirects
back to the client app by design.

Configured endpoints include:

- `GET /allCakes`
- `POST /addCake`
- `PATCH /editCake`
- `DELETE /deleteCake`
- `POST /createOffer`
- `PATCH /replyReviews`
- `GET /allOrders`

Cake creation sends multipart form data with the image in the `img`
field. The backend generates `cake_id`. Cake responses use
`cake_price`, `cake_size`, and `cake_url`. Review responses use
`reviewId`, `reviewReply`, `review_content`, and `created_at`.

The TypeScript models for these response shapes are in
`src/types/index.ts`.

## Scripts

```bash
npm run dev       # Start the development server
npm run build     # Type-check and create a production build
npm run lint      # Run ESLint
npm run preview   # Preview the production build
```
