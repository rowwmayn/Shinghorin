# Shinghorin — Setup Guide

Everything for the site lives in **one file**: `index.html`. There's no server,
no database, no build step. You edit `index.html` in a text editor, save it,
and push it — that's the whole workflow.

## 1. Folder structure

```
shinghorin/
├── index.html              ← the whole site
├── logo-placeholder.svg    ← swap for your real logo
├── placeholder-product.svg ← don't touch — auto fallback image
├── keychains/                1.jpg, 2.jpg, ...
├── plushies/                 1.jpg, 2.jpg, ...
├── figurines/                1.jpg, 2.jpg, ...
├── flowers/                  1.jpg, 2.jpg, ...
├── wearables/                 1.jpg, 2.jpg, ...
├── caricature/                1.jpg, 2.jpg, ...
└── portraits/                 1.jpg, 2.jpg, ...
```

Each product folder holds **only photos**, numbered `1.jpg`, `2.jpg`, `3.jpg`...
Names, descriptions, and prices live in `index.html`, inside the `PRODUCTS`
list — search for `const PRODUCTS = [` to find it.

**Important:** because this is a plain static site, the page can't "see" what
files are inside a folder on its own — a browser has no way to list a
folder's contents. So adding a photo to a folder alone does nothing by
itself; you also need one small entry in `PRODUCTS` pointing at it (name,
price, description, and which numbered files to use). This is intentional —
it keeps your whole catalog readable in one place instead of scattered
across folders, and it's the one thing to remember when adding items.

### Adding a product
1. Drop the photo(s) into the right folder, named `1.jpg`, `2.jpg`, etc.
   (Don't have the photo yet? Skip this step — a "photo coming soon" image
   shows automatically until the real file exists.)
2. In `index.html`, copy one block inside `PRODUCTS`, give it a unique `id`,
   and fill in the fields.

Most products just need a flat `price`. If an item comes in a few sizes at
different prices — like the `caricature` and `portraits` categories, which
each offer A4 and A3 at different prices — use `variants` instead of
`price`:

```javascript
variants: [ { label:"A4", price:500 }, { label:"A3", price:800 } ]
```

The product page then shows a size picker automatically instead of a
single price. A product should have either `price` or `variants`, never
both.

### Adding a whole new category
1. Make a new folder next to `index.html` (e.g. `bookmarks/`).
2. Add one entry to `CATEGORIES` near the top of the `<script>` section.
3. Add products for it in `PRODUCTS`, using `category: "bookmarks"`.

### Removing a category
1. Delete the folder.
2. Delete its entry from `CATEGORIES`.
3. Delete its products from `PRODUCTS` (otherwise they'll just show
   placeholder photos forever, which is harmless but pointless clutter).

## 2. Replacing the logo

Open `logo-placeholder.svg` — the comment at the top explains it. Simplest
option: export your real logo as `logo.png` (square, ~240×240px or larger,
transparent background), drop it in the root folder, then in `index.html`
find the line:

```html
<img src="logo-placeholder.svg" alt="Shinghorin logo" ...>
```

and change `logo-placeholder.svg` to `logo.png`.

## 3. Setting up the Google Sheet order log

This is optional but recommended — it gives you a running spreadsheet of
every order, separate from WhatsApp. It takes about 5 minutes, whenever
you're ready:

1. Create a new Google Sheet. Add a header row: `Timestamp | Name | Phone |
   Address | Date | Items | Total | Has Custom`.
2. In the Sheet, go to **Extensions → Apps Script**.
3. Delete the placeholder code and paste this:

   ```javascript
   function doPost(e) {
     const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
     const data = JSON.parse(e.postData.contents);
     sheet.appendRow([
       data.timestamp, data.name, data.phone, data.address,
       data.date, data.items, data.total, data.hasCustom
     ]);
     return ContentService.createTextOutput("OK");
   }
   ```

4. Click **Deploy → New deployment → Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click Deploy, authorize it, and copy the **Web app URL** it gives you.
5. In `index.html`, find `sheetWebhookUrl: ""` near the top of the `<script>`
   section and paste the URL between the quotes.

That's it — every WhatsApp order will also silently append a row to your
Sheet. If you skip this step entirely, the site works exactly the same;
orders just won't be logged anywhere but WhatsApp.

*Security note:* this webhook URL will be visible to anyone who views your
page's source code — that's unavoidable for a static site. It's safe to
expose because it can only **add** a row to your Sheet; it can't read,
edit, or delete anything, and it has no access to anything else in your
Google account.

## 4. Deploying — Cloudflare Pages from a private GitHub repo

1. **Create a private GitHub repo** and push this whole folder to it
   (GitHub Desktop is the easiest way if you're not comfortable with the
   command line).
2. Go to [pages.cloudflare.com](https://pages.cloudflare.com), sign up free,
   and choose **Create a project → Connect to Git**.
3. Select your `shinghorin` repo. Framework preset: **None**. Build command:
   leave blank. Output directory: `/` (or leave default — there's no build
   step, it just serves the files as-is).
4. Deploy. Cloudflare gives you a free `*.pages.dev` URL immediately, with
   HTTPS. You can later point a custom domain at it for free (domain
   registration itself isn't free, but connecting it to Cloudflare Pages is).

Every time you push a change to the repo (new product, new photo, price
edit), Cloudflare rebuilds the live site automatically within a minute or
two — no extra steps.

## 5. Updating your WhatsApp number or currency

Both live at the very top of the `<script>` section in `index.html`, inside
`const CONFIG = { ... }`.

## 6. A note on the right-click protection

Right-clicking on the page (and dragging images) is quietly disabled to
raise the bar against casual photo-saving. There's no popup or message —
it just doesn't do anything when someone tries. Worth knowing: this can't
stop someone determined to save an image (screenshots always work, for
example) — nothing running in a browser truly can. It's a mild deterrent,
not a lock.
