const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 4000;

const PROPERTIES_FILE = path.join(__dirname, "data", "properties.json");
const ENQUIRIES_FILE = path.join(__dirname, "data", "enquiries.json");

const allowedOrigin = process.env.ALLOWED_ORIGIN || "*";
app.use(cors({ origin: allowedOrigin }));
app.use(express.json());

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}
function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

/* ---------- properties ---------- */

// GET /api/properties?type=Villa&maxPrice=8000000&sort=price-asc
app.get("/api/properties", (req, res) => {
  let properties = readJSON(PROPERTIES_FILE);
  const { type, maxPrice, sort } = req.query;

  if (type && type !== "All") {
    properties = properties.filter(p => p.type === type);
  }
  if (maxPrice) {
    properties = properties.filter(p => p.price <= Number(maxPrice));
  }
  if (sort === "price-asc") {
    properties = [...properties].sort((a, b) => a.price - b.price);
  } else if (sort === "price-desc") {
    properties = [...properties].sort((a, b) => b.price - a.price);
  }

  res.json(properties);
});

// GET /api/properties/:id
app.get("/api/properties/:id", (req, res) => {
  const properties = readJSON(PROPERTIES_FILE);
  const property = properties.find(p => p.id === Number(req.params.id));
  if (!property) return res.status(404).json({ error: "Property not found" });
  res.json(property);
});

// POST /api/properties  (add a new listing)
app.post("/api/properties", (req, res) => {
  const properties = readJSON(PROPERTIES_FILE);
  const required = ["title", "type", "sector", "area", "unit", "price"];
  for (const field of required) {
    if (!(field in req.body)) {
      return res.status(400).json({ error: `Missing field: ${field}` });
    }
  }
  const newProperty = {
    id: properties.length ? Math.max(...properties.map(p => p.id)) + 1 : 1,
    possession: "Ready to Register",
    facing: "North",
    tag: "New Listing",
    dAirport: 0,
    dExpressway: 0,
    dTata: 0,
    features: [],
    desc: "",
    ...req.body,
  };
  properties.push(newProperty);
  writeJSON(PROPERTIES_FILE, properties);
  res.status(201).json(newProperty);
});

// PUT /api/properties/:id  (edit a listing)
app.put("/api/properties/:id", (req, res) => {
  const properties = readJSON(PROPERTIES_FILE);
  const idx = properties.findIndex(p => p.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: "Property not found" });
  properties[idx] = { ...properties[idx], ...req.body, id: properties[idx].id };
  writeJSON(PROPERTIES_FILE, properties);
  res.json(properties[idx]);
});

// DELETE /api/properties/:id
app.delete("/api/properties/:id", (req, res) => {
  let properties = readJSON(PROPERTIES_FILE);
  const exists = properties.some(p => p.id === Number(req.params.id));
  if (!exists) return res.status(404).json({ error: "Property not found" });
  properties = properties.filter(p => p.id !== Number(req.params.id));
  writeJSON(PROPERTIES_FILE, properties);
  res.status(204).send();
});

/* ---------- enquiries (contact form submissions) ---------- */

// GET /api/enquiries
app.get("/api/enquiries", (req, res) => {
  res.json(readJSON(ENQUIRIES_FILE));
});

// POST /api/enquiries
app.post("/api/enquiries", (req, res) => {
  const { name, phone, interest, message } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: "name and phone are required" });
  }
  const enquiries = readJSON(ENQUIRIES_FILE);
  const newEnquiry = {
    id: enquiries.length ? Math.max(...enquiries.map(e => e.id)) + 1 : 1,
    name,
    phone,
    interest: interest || "Not specified",
    message: message || "",
    submittedAt: new Date().toISOString(),
  };
  enquiries.push(newEnquiry);
  writeJSON(ENQUIRIES_FILE, enquiries);
  res.status(201).json(newEnquiry);
});

app.get("/", (req, res) => {
  res.send("Bhoomi Dholera API is running. Try /api/properties");
});

app.listen(PORT, () => {
  console.log(`Bhoomi Dholera API running at http://localhost:${PORT}`);
});
