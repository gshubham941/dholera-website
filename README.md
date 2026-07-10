# Bhoomi Dholera — Local Backend

A small Express API serving the property listings and handling contact-form enquiries.
No database server required — data is stored in JSON files under `data/`.

## Setup

```bash
cd dholera-backend
npm install
npm start
```

The API will run at **http://localhost:4000**.

For auto-restart on file changes during development:
```bash
npm run dev
```

## Endpoints

| Method | Route                  | Description                                   |
|--------|------------------------|------------------------------------------------|
| GET    | `/api/properties`      | List properties. Query params: `type`, `maxPrice`, `sort` (`price-asc`/`price-desc`) |
| GET    | `/api/properties/:id`  | Get a single property                          |
| POST   | `/api/properties`      | Add a new listing                              |
| PUT    | `/api/properties/:id`  | Edit a listing                                 |
| DELETE | `/api/properties/:id`  | Remove a listing                               |
| GET    | `/api/enquiries`       | List all contact-form submissions              |
| POST   | `/api/enquiries`       | Submit an enquiry (`name`, `phone` required; `interest`, `message` optional) |

### Example: filter listings
```
GET http://localhost:4000/api/properties?type=Villa&maxPrice=8000000&sort=price-asc
```

### Example: submit an enquiry
```bash
curl -X POST http://localhost:4000/api/enquiries \
  -H "Content-Type: application/json" \
  -d '{"name":"Asha Patel","phone":"9876543210","interest":"Residential Plot"}'
```

## Connecting the frontend

The React site currently uses a hardcoded `PROPERTIES` array so it works standalone as an
artifact preview. To have it pull real data from this API instead, replace that array with
a `fetch` call once the frontend is running on your machine, e.g.:

```js
useEffect(() => {
  fetch("http://localhost:4000/api/properties")
    .then(r => r.json())
    .then(setProperties);
}, []);
```

and point the contact form's `onSubmit` at `POST /api/enquiries`.

## Editing listings

`data/properties.json` is a plain JSON array — open it directly to add, edit, or remove
listings by hand, or use the POST/PUT/DELETE endpoints above.

## Going live

This is set up for local development. To make the site reachable by others:
- Deploy this API to a small host (Render, Railway, Fly.io) — set `PORT` via their env config
- Deploy the frontend (Vercel/Netlify) and point its API calls at the deployed backend URL instead of `localhost`
- Swap the JSON file storage for a real database (SQLite, Postgres) once you have more than a handful of listings or need concurrent writes
