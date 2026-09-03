const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CATEGORIES = [
  { key: "bagcharms",  label: "Bag Charms",         folder: "bag-charms", chip: "#2F7A6E", sortOrder: 1 },
  { key: "flowers",    label: "Flowers",            folder: "flowers",    chip: "#E8A33D", sortOrder: 2 },
  { key: "keychains",  label: "Crochet Keychains",  folder: "keychains",  chip: "#E8A33D", sortOrder: 3 },
  { key: "plushies",   label: "Plushies",           folder: "plushies",   chip: "#8B3A62", sortOrder: 4 },
  { key: "caricature", label: "Caricature Drawings", folder: "caricature", chip: "#2F7A6E", sortOrder: 5 },
  { key: "portraits",  label: "Realistic Portraits", folder: "portraits",  chip: "#E8A33D", sortOrder: 6 }
];

const PRODUCTS = [
  // --- Plushies ---
  {
    category: "plushies",
    name: "Pikachu Plushie",
    bn: "পিকাচু",
    badge: "BESTSELLER",
    description: "A round, cheerful little Pikachu, stitched stitch by stitch until it looked ready to spark.",
    images: ["9.jpg", "10.jpg", "11.jpg", "12.jpg"],
    price: 1800,
    sortOrder: 1
  },
  {
    category: "plushies",
    name: "Messi Plushie",
    bn: "মেসি",
    badge: "",
    description: "A cuddly tribute to the GOAT — soft, huggable, and just as beloved on the shelf as on the pitch.",
    images: ["6.jpg", "7.jpg", "8.jpg"],
    price: 1200,
    sortOrder: 2
  },
  {
    category: "plushies",
    name: "Ronaldo CR7 Plushie",
    bn: "রোনালদো",
    badge: "",
    description: "A crocheted CR7, made for fans who want their hero in soft, huggable form.",
    images: ["4.jpg", "5.jpg"],
    price: 2000,
    sortOrder: 3
  },
  {
    category: "plushies",
    name: "Pink Monkey Plushie",
    bn: "বানর",
    badge: "",
    description: "A goofy little pink monkey with a big grin — sweet, silly, and endlessly squeezable.",
    images: ["2.jpg"],
    price: 800,
    sortOrder: 4
  },
  {
    category: "plushies",
    name: "Cute Bunny Plushie",
    bn: "খরগোশ",
    badge: "NEW",
    description: "A soft floppy-eared bunny with a shy little face — the kind you can't put back down.",
    images: ["1.jpg"],
    price: 2000,
    sortOrder: 5
  },
  {
    category: "plushies",
    name: "Frog Plushie",
    bn: "ব্যাঙ",
    badge: "",
    description: "A small, round, perpetually pleased-looking frog — froggy little legs and all.",
    images: ["3.jpg"],
    price: 350,
    sortOrder: 6
  },

  // --- Crochet Keychains ---
  {
    category: "keychains",
    name: "Fish Keychain",
    bn: "মাছ",
    badge: "",
    description: "A tiny crocheted fish on a clip, gently swimming its way onto your keys or bag.",
    images: ["3.jpg"],
    price: 220,
    sortOrder: 7
  },
  {
    category: "keychains",
    name: "Spider Gwen Keychain",
    bn: "",
    badge: "",
    description: "A pint-sized Spider-Gwen keychain, stitched sharp and small enough to swing anywhere.",
    images: ["1.jpg"],
    price: 120,
    sortOrder: 8
  },
  {
    category: "keychains",
    name: "Moomin Keychain",
    bn: "",
    badge: "NEW",
    description: "A soft, round little Moomin, made keyring-sized for daily company.",
    images: ["2.jpg"],
    price: 500,
    sortOrder: 9
  },

  // --- Flowers ---
  {
    category: "flowers",
    name: "Rose and Tulip Bouquet",
    bn: "তোড়া",
    badge: "",
    description: "A mixed bouquet of crocheted roses and tulips, gathered together and never wilting.",
    images: ["2.jpg"],
    price: 450,
    sortOrder: 10
  },
  {
    category: "flowers",
    name: "Single Sunflower",
    bn: "সূর্যমুখী",
    badge: "",
    description: "One cheerful crocheted sunflower on a stem — small, bright, and forever in bloom.",
    images: ["3.jpg"],
    price: 150,
    sortOrder: 11
  },
  {
    category: "flowers",
    name: "Sunflower Plant",
    bn: "সূর্যমুখী গাছ",
    badge: "",
    description: "A little potted sunflower plant, crocheted leaves and all, that never needs watering.",
    images: ["4.jpg"],
    price: 300,
    sortOrder: 12
  },
  {
    category: "flowers",
    name: "Rose Bouquet Table-Mat",
    bn: "গোলাপ",
    badge: "BESTSELLER",
    description: "A crocheted rose bouquet arranged flat as a table mat — equal parts décor and centerpiece.",
    images: ["1.jpg"],
    price: 2500,
    sortOrder: 13
  },

  // --- Bag Charms ---
  {
    category: "bagcharms",
    name: "Spiderman Bag Charm Pair",
    bn: "",
    badge: "",
    description: "A matching pair of tiny crocheted Spider-Man charms, ready to swing off any bag.",
    images: ["11.jpg", "12.jpg", "10.jpg"],
    price: 1000,
    sortOrder: 14
  },
  {
    category: "bagcharms",
    name: "Kuromi Bag Charm (Black)",
    bn: "",
    badge: "",
    description: "A moody little Kuromi charm in classic black, clipped and ready to dangle.",
    images: ["8.jpg", "9.jpg"],
    price: 350,
    sortOrder: 15
  },
  {
    category: "bagcharms",
    name: "Kuromi Bag Charm (Purple)",
    bn: "",
    badge: "",
    description: "The same mischievous Kuromi charm, in a softer purple colourway.",
    images: ["5.jpg", "7.jpg"],
    price: 350,
    sortOrder: 16
  },
  {
    category: "bagcharms",
    name: "Frog Bag Charm",
    bn: "ব্যাঙ",
    badge: "",
    description: "A tiny crocheted frog charm with a permanently pleased little face.",
    images: ["3.jpg", "1.jpg"],
    price: 300,
    sortOrder: 17
  },
  {
    category: "bagcharms",
    name: "Turtle Bag Charm",
    bn: "কচ্ছপ",
    badge: "",
    description: "A small, slow, extremely charming crocheted turtle on a clip.",
    images: ["2.jpg"],
    price: 300,
    sortOrder: 18
  }
];

async function main() {
  console.log('Seeding Shinghorin database...');

  // Create or update categories
  const categoryMap = {};
  for (const cat of CATEGORIES) {
    const upserted = await prisma.category.upsert({
      where: { key: cat.key },
      update: {
        label: cat.label,
        folder: cat.folder,
        chip: cat.chip,
        sortOrder: cat.sortOrder,
      },
      create: {
        key: cat.key,
        label: cat.label,
        folder: cat.folder,
        chip: cat.chip,
        sortOrder: cat.sortOrder,
      }
    });
    categoryMap[cat.key] = upserted.id;
  }

  // Create products
  for (const p of PRODUCTS) {
    const categoryId = categoryMap[p.category];
    if (!categoryId) continue;

    // Check if exists
    const existing = await prisma.product.findFirst({
      where: { name: p.name, categoryId }
    });

    if (!existing) {
      await prisma.product.create({
        data: {
          categoryId,
          name: p.name,
          bn: p.bn || '',
          description: p.description,
          badge: p.badge || '',
          price: p.price,
          variants: p.variants ? JSON.stringify(p.variants) : '[]',
          images: JSON.stringify(p.images),
          isActive: true,
          sortOrder: p.sortOrder || 0,
        }
      });
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
