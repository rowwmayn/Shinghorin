# 🌿 Shinghorin (শিংহরিণ) — Handmade Arts & Crafts E-Commerce

> *"Half lion, half deer, entirely hand-stitched."*

An arts & crafts e-commerce web platform for **Shinghorin**, featuring a sketchbook aesthetic inspired by Bengali children's nonsense verse.

Developed with **Next.js 15 (App Router)**, **Tailwind CSS**, and **SQLite (via Prisma)**.

---

## ✨ Features

- 🎨 **Sketchbook Aesthetic**: Warm rice paper, deep ink linework, and marigold, plum & teal storybook accents.
- 🛍️ **Category Browsing & Filter**: Segregated shelves for Bag Charms, Flowers, Keychains, Plushies, Caricature, and Portraits.
- 🔍 **Interactive Product Modal**: Multi-image carousel, variant/size picker, quantity stepper, and live price recalculation.
- 🛒 **Basket Drawer & COD WhatsApp Checkout**: Slide-out cart with Cash on Delivery form that triggers pre-formatted WhatsApp orders while logging orders locally to the database.
- 🔒 **Hidden Admin Portal (`/admin`)**:
  - No public links — accessible only directly at `/admin`.
  - Password protected with JWT sessions.
  - **Product Manager**: Add crafts, upload photos, set single prices or size variants, and edit/delete anytime.
  - **Category Manager**: Add shelves and customize accent chip colors.
  - **Order Manager**: View customer details, update status, and 1-click WhatsApp customer reply.
  - **Simple Analytics**: 7-day visitor traffic graph, revenue summary, and inventory counts.
- 💸 **$0 Database Hosting**: Powered by SQLite file database (`dev.db`). No recurring database hosting fees.
- 👨‍💻 **Developer Credit**: Developed by Roman ([github.com/rowwmayn](https://www.github.com/rowwmayn)).

---

## 🚀 Quick Start

### 1. Install & Setup
```bash
npm install
npx prisma db push
node scripts/seed.js
```

### 2. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

### 3. Access Admin Panel
Navigate to [http://localhost:3000/admin](http://localhost:3000/admin).
- **Default Username**: `admin`
- **Default Password**: `adminpassword123`

---

## 📖 Deployment & Hosting Guide
See [USER_GUIDE.md](USER_GUIDE.md) for full step-by-step instructions on hosting with VPS (DigitalOcean / Hetzner), Railway, or Vercel, along with domain and SSL configuration.
