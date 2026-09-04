# 🌿 Shinghorin (শিংহরিণ) — Complete Setup & Hosting User Guide

Welcome to your official e-commerce web application for **Shinghorin**!

This website is built with **Next.js 15**, **Tailwind CSS**, and a **free, file-based SQLite database** managed through **Prisma ORM**. You pay **$0 for database hosting**, keeping your running costs strictly limited to your domain and basic hosting.

---

## 📑 Table of Contents
1. [Overview & Project Structure](#1-overview--project-structure)
2. [Local Setup & Development](#2-local-setup--development)
3. [The Hidden Admin Portal (`/admin`)](#3-the-hidden-admin-portal-admin)
4. [Customizing Store Configuration](#4-customizing-store-configuration)
5. [Step-by-Step Hosting Guide](#5-step-by-step-hosting-guide)
   - [Option A (Recommended): VPS Hosting (DigitalOcean / Hetzner)](#option-a-recommended-vps-hosting)
   - [Option B: Railway (One-Click Cloud with SQLite Volume)](#option-b-railway)
   - [Option C: Vercel + Turso (Free Serverless SQLite)](#option-c-vercel--turso)
6. [Domain & SSL Setup](#6-domain--ssl-setup)
7. [Footer Credit & Developer Info](#7-footer-credit--developer-info)

---

## 1. Overview & Project Structure

- **Public Storefront (`/`)**: A reproduction of your sketchbook-page design with:
  - Bengali watermark typography and parallax hero banner
  - Scrolling announcement ticker
  - Hand-drawn SVG chain stitch dividers
  - Six categories with chip badges ("Wander the Shelves")
  - Live product catalog with search, category filtering, and specimen cards
  - Product detail modal with image carousel, size variant picker, and quantity stepper
  - Slide-out basket drawer with subtotal calculation
  - Direct Cash on Delivery (COD) checkout with **two customer options**:
    - **Option 1: Order directly on Website (COD)**: Customer enters name, phone, address, and confirms on-site. Receives an instant on-screen order receipt with their unique Order # (e.g. `SH-2026-0001`).
    - **Option 2: Order via WhatsApp (COD)**: Opens WhatsApp with pre-filled items, customer info, and order number to chat directly.
  - Custom order request CTA ("Dream Up Something Odd")
  - 4-step ordering guide explaining both website and WhatsApp options
  - Full footer with Roman's developer attribution and GitHub link
- **Hidden Admin Panel (`/admin`)**:
  - Hidden from all public links (accessible only by navigating directly to `/admin`)
  - Password protected with secure JWT cookies
  - Real-time dashboard with page view counters, order counters, and 7-day traffic chart
  - Product catalog manager: Add new crafts, upload photos, set fixed prices or multi-size variants (e.g. A4 / A3), delete items, toggle visibility
  - Category manager: Add/edit shelves, configure folder names and color chips
  - Customer orders manager: View order details with a channel badge (`🌐 Website` or `💬 WhatsApp`), change statuses (`PENDING`, `CONFIRMED`, `SHIPPED`, `DELIVERED`, `CANCELLED`), and 1-click WhatsApp customer reply
- **Data Persistence**:
  - **Yes, all data stays permanently in your database!** Every product added, price updated, category modified, and order placed is written directly to the SQLite file (`dev.db`).
  - Even if you restart the computer, reboot the server, or close the browser, all your data remains safely stored.

---

## 2. Local Setup & Development

### Prerequisites
- Node.js (v18.18 or v20+)
- npm

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env` (or edit the existing `.env`):
```env
# Database
DATABASE_URL="file:./dev.db"

# Admin Authentication
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="adminpassword123"
ADMIN_JWT_SECRET="shinghorin-super-secret-jwt-key-2026-arts-crafts-dhaka"

# Store Settings
NEXT_PUBLIC_SHOP_NAME="Shinghorin"
NEXT_PUBLIC_WHATSAPP_NUMBER="8801848335770"
NEXT_PUBLIC_CURRENCY="৳"
NEXT_PUBLIC_SHEET_WEBHOOK_URL=""
```

### Step 3: Initialize the SQLite Database & Seed Data
```bash
# Push Prisma schema to SQLite
npx prisma db push

# Populate the default 6 categories and 18 products from your design
node scripts/seed.js
```

### Step 4: Run the Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your web browser.

### Step 5: Build for Production
```bash
npm run build
npm start
```

---

## 3. The Hidden Admin Portal (`/admin`)

The administration area is intentionally unlinked on the storefront to keep it completely private.

1. In your browser address bar, visit:
   ```
   http://localhost:3000/admin
   ```
2. Enter your administrator credentials:
   - **Username**: `admin`
   - **Password**: `adminpassword123` *(Change this in your `.env` file before going live!)*
3. **Admin Features**:
   - **Dashboard & Analytics (`/admin`)**: See total views, today's views, orders count, total revenue, and a visual 7-day visitor traffic graph.
   - **Products (`/admin/products`)**:
     - Click **"+ Add New Product"** to list a new craft.
     - Upload product photos directly from your computer, or enter existing filenames.
     - Select between **Single Price** (e.g. ৳ 1,800) or **Sizes / Variants** (e.g. A4 Size = ৳ 1,500, A3 Size = ৳ 2,500).
     - Add badges like `BESTSELLER` or `NEW`.
     - Click **Edit** to adjust pricing or descriptions anytime.
     - Click **Delete** to remove a product.
     - Click **"📸 Card"** to launch the **Polaroid Social Card Studio**: Generate instant, beautiful social media cards styled like authentic Polaroid film with your product photo, name, Bengali text, price, and custom captions. Free instant high-res PNG download ready for Instagram, Facebook, and WhatsApp (completely private to admin; nothing stored on the server).
   - **Categories (`/admin/categories`)**: Create new collections (e.g., Clay Figurines, Bookmarks) and customize their tag chip accent colors.
   - **Orders (`/admin/orders`)**: View orders placed via WhatsApp COD, update their status, and click **"💬 WhatsApp Customer"** to message the buyer directly.

---

## 4. Customizing Store Configuration

All primary store settings are managed in your `.env` file:

- **WhatsApp Number**: Change `NEXT_PUBLIC_WHATSAPP_NUMBER` to your phone number in international format without `+` or spaces (e.g., `8801848335770` for Bangladesh).
- **Currency Symbol**: By default set to `৳` (Bangladeshi Taka).
- **Google Sheets Integration (Optional)**: If you set up a Google Apps Script Web App to log orders into Google Sheets, simply paste the Web App URL into `NEXT_PUBLIC_SHEET_WEBHOOK_URL`. If left empty, orders are still permanently saved in your SQLite database.

---

## 5. Step-by-Step Hosting Guide

Since you are using SQLite, the database lives directly inside a single file (`dev.db`). This makes hosting remarkably simple and **100% free of database subscription fees**.

### Option A (Recommended): VPS Hosting ($4–$5/month)
*Providers: DigitalOcean Droplet ($4/mo), Hetzner Cloud (~$4/mo), or Linode ($5/mo)*

This option is the cleanest, fastest, and gives you total control with zero external database fees.

#### 1. Create your VPS
1. Sign up on **DigitalOcean** or **Hetzner**.
2. Create a basic Ubuntu 24.04 droplet/server ($4–$5/month).
3. Connect to your VPS via SSH:
   ```bash
   ssh root@YOUR_SERVER_IP
   ```

#### 2. Install Node.js, Git, and PM2
```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git

# Install PM2 (Process Manager) and Caddy (Automatic Free SSL Web Server)
sudo npm install -g pm2
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy -y
```

#### 3. Clone & Setup Shinghorin
```bash
# Clone your repository or copy project files
cd /var/www
git clone https://github.com/rowwmayn/Shinghorin.git shinghorin
cd shinghorin

# Install dependencies
npm install

# Create .env file with your production password
nano .env
```
Paste your production settings:
```env
DATABASE_URL="file:./dev.db"
ADMIN_USERNAME="your_admin_name"
ADMIN_PASSWORD="your_strong_secret_password"
ADMIN_JWT_SECRET="generate_a_random_32_character_string"
NEXT_PUBLIC_SHOP_NAME="Shinghorin"
NEXT_PUBLIC_WHATSAPP_NUMBER="8801848335770"
NEXT_PUBLIC_CURRENCY="৳"
```
Save and exit (`Ctrl+O`, `Enter`, `Ctrl+X`).

#### 4. Push Database & Build
```bash
npx prisma db push
node scripts/seed.js
npm run build
```

#### 5. Start with PM2
```bash
pm2 start npm --name "shinghorin" -- start
pm2 save
pm2 startup
```

#### 6. Configure Domain & Free SSL with Caddy
Edit `/etc/caddy/Caddyfile`:
```bash
sudo nano /etc/caddy/Caddyfile
```
Replace its contents with:
```caddy
yourdomain.com, www.yourdomain.com {
    reverse_proxy localhost:3000
}
```
Reload Caddy:
```bash
sudo systemctl reload caddy
```
🎉 **Your site is now live at `https://yourdomain.com` with automatic, free HTTPS encryption!**

---

### Option B: Railway (One-Click Cloud with SQLite Volume)

If you prefer not to manage Linux servers via SSH:
1. Push your code to your GitHub repository: `https://github.com/rowwmayn/Shinghorin`.
2. Go to [railway.app](https://railway.app) and sign in with GitHub.
3. Click **"New Project"** -> **"Deploy from GitHub repo"** -> select `Shinghorin`.
4. In the Railway dashboard:
   - Go to **Variables** and add your environment variables (`ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_JWT_SECRET`, `DATABASE_URL="file:/data/shinghorin.db"`).
   - Go to **Settings** -> **Volumes** -> Click **"Add Volume"** and set the mount path to `/data`.
     - *Why this is important*: This ensures both your SQLite database (`/data/shinghorin.db`) AND all uploaded product photos (`/data/uploads`) remain permanently preserved across git pushes, container restarts, and redeployments!
     - *Automatic Photo Serving*: The website automatically detects the `/data` volume, saves uploaded product photos to `/data/uploads`, and streams them through the built-in `/uploads` route handler so your photos display immediately with zero broken images or "coming soon" placeholders.
5. In **Settings** -> **Networking**, click **"Generate Domain"** or add your custom domain.
6. Done!

---

### Option C: Vercel + Turso (Free Cloud SQLite)

If you specifically want to use Vercel's free serverless tier:
- Standard SQLite files reset on Vercel because serverless functions are ephemeral.
- To use Vercel for free, create a free account at [turso.tech](https://turso.tech) (free hosted SQLite).
- Copy your Turso database URL (`libsql://...`) and token into your Vercel environment variables as `DATABASE_URL`.

---

## 6. Domain & SSL Setup

When you purchase a domain name (from Namecheap, GoDaddy, Cloudflare, etc.):
1. Go to your domain registrar's **DNS Management** page.
2. Add an **A Record**:
   - **Host / Name**: `@`
   - **Points to / Value**: `YOUR_SERVER_IP` (your VPS IP address)
   - **TTL**: Auto or 3600
3. Add a **CNAME Record**:
   - **Host / Name**: `www`
   - **Points to / Value**: `yourdomain.com`
4. If using Caddy (Option A), Caddy automatically detects the domain, requests an official certificate from Let's Encrypt, and auto-renews it forever at no cost.

---

## 7. Footer Credit & Developer Info

As requested, the footer of the site features:
```
Developed by Roman • github.com/rowwmayn
```
Clicking the credit links directly to:
👉 [https://www.github.com/rowwmayn](https://www.github.com/rowwmayn)

---

### 🎨 Congratulations!
Your **Shinghorin** arts & crafts boutique website is ready for the world!
If you ever want to add new categories, update photos, or track customer orders, simply visit:
`https://yourdomain.com/admin`
