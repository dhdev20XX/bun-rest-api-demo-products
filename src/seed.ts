import { db } from "./db/connection";

const dummyProducts = [
  {
    id: crypto.randomUUID(),
    name: "iPhone 15 Pro",
    image: "iphone15.jpg",
    category: "smartphones",
    detail: "Latest flagship from Apple with titanium design."
  },
  {
    id: crypto.randomUUID(),
    name: "Sony WH-1000XM5",
    image: "sony-xm5.png",
    category: "headphones",
    detail: "Industry leading noise cancelling headphones."
  },
  {
    id: crypto.randomUUID(),
    name: "MacBook Pro M3",
    image: "macbook-m3.webp",
    category: "laptops",
    detail: "Powerful laptop for professionals."
  },
  {
    id: crypto.randomUUID(),
    name: "Samsung Galaxy S24 Ultra",
    image: "s24-ultra.jpg",
    category: "smartphones",
    detail: "AI-powered smartphone with integrated S-Pen."
  },
  {
    id: crypto.randomUUID(),
    name: "AirPods Max",
    image: "airpods-max.png",
    category: "headphones",
    detail: "High fidelity audio and active noise cancellation."
  }
];

const stmt = db.prepare("INSERT INTO products (id, name, image, category, detail) VALUES (?, ?, ?, ?, ?)");

const transaction = db.transaction((products) => {
  for (const p of products) {
    stmt.run(p.id, p.name, p.image, p.category, p.detail);
  }
});

transaction(dummyProducts);
console.log("Database seeded successfully with dummy products.");
