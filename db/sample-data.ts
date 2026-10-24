import type { ProductInput } from "@/types";

type SampleUser = {
  name: string;
  email: string;
  password?: string; // kosong = diambil dari SEED_ADMIN_PASSWORD di .env
  role: "admin" | "user";
};

const sampleData: {
  products: ProductInput[];
  users: SampleUser[];
} = {
  products: [
    {
      name: "Kemeja Polo Stretch Sporty",
      slug: "kemeja-polo-stretch-sporty",
      category: "Kemeja Pria",
      description: "Gaya polo klasik dengan kenyamanan modern",
      images: [
        "/images/sample-products/p1-1.jpg",
        "/images/sample-products/p1-2.jpg",
      ],
      price: 249000,
      brand: "Sandang Original",
      rating: 4.5,
      numReviews: 10,
      stock: 5,
      isFeatured: true,
      banner: "banner-1.jpg",
    },
    {
      name: "Kemeja Lengan Panjang Katun Premium",
      slug: "kemeja-lengan-panjang-katun-premium",
      category: "Kemeja Pria",
      description: "Gaya abadi dengan kenyamanan premium",
      images: [
        "/images/sample-products/p2-1.jpg",
        "/images/sample-products/p2-2.jpg",
      ],
      price: 349000,
      brand: "Kriya Busana",
      rating: 4.2,
      numReviews: 8,
      stock: 10,
      isFeatured: true,
      banner: "banner-2.jpg",
    },
    {
      name: "Kemeja Formal Classic Fit",
      slug: "kemeja-formal-classic-fit",
      category: "Kemeja Pria",
      description: "Perpaduan elegan antara kesan formal dan kenyamanan",
      images: [
        "/images/sample-products/p3-1.jpg",
        "/images/sample-products/p3-2.jpg",
      ],
      price: 399000,
      brand: "Lurik Nusa",
      rating: 4.9,
      numReviews: 3,
      stock: 0,
      isFeatured: false,
      banner: null,
    },
    {
      name: "Kemeja Slim Fit Stretch",
      slug: "kemeja-slim-fit-stretch",
      category: "Kemeja Pria",
      description: "Potongan ramping dengan kain stretch yang fleksibel",
      images: [
        "/images/sample-products/p4-1.jpg",
        "/images/sample-products/p4-2.jpg",
      ],
      price: 169000,
      brand: "Sandang Original",
      rating: 3.6,
      numReviews: 5,
      stock: 10,
      isFeatured: false,
      banner: null,
    },
    {
      name: "Kemeja Oxford Katun",
      slug: "kemeja-oxford-katun",
      category: "Kemeja Pria",
      description: "Desain klasik dengan kain oxford yang rapi",
      images: [
        "/images/sample-products/p5-1.jpg",
        "/images/sample-products/p5-2.jpg",
      ],
      price: 319000,
      brand: "Bumi Tenun",
      rating: 4.7,
      numReviews: 18,
      stock: 6,
      isFeatured: false,
      banner: null,
    },
    {
      name: "Hoodie Pink Klasik",
      slug: "hoodie-pink-klasik",
      category: "Sweater & Hoodie Pria",
      description: "Lembut, bergaya, dan pas untuk hari-hari santai",
      images: [
        "/images/sample-products/p6-1.jpg",
        "/images/sample-products/p6-2.jpg",
      ],
      price: 399000,
      brand: "Sandang Original",
      rating: 4.6,
      numReviews: 12,
      stock: 8,
      isFeatured: true,
      banner: null,
    },
  ],
  users: [
    {
      name: "Admin Sandang",
      email: "admin@example.com",
      role: "admin",
    },
    {
      name: "Budi Santoso",
      email: "budi@example.com",
      password: "demo12345",
      role: "user",
    },
    {
      name: "Siti Rahayu",
      email: "siti@example.com",
      password: "demo12345",
      role: "user",
    },
  ],
};

export default sampleData;
