import "dotenv/config";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../lib/prisma";
import { passwordConfig } from "../lib/auth-password";
import { insertProductSchema } from "../lib/validator";
import sampleData from "./sample-data";

// Instance khusus seed (tanpa plugin Next.js), memakai aturan kata sandi yang sama
const seedAuth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true, password: passwordConfig },
});

function getPassword(user: (typeof sampleData.users)[number]) {
  const password = user.password ?? process.env.SEED_ADMIN_PASSWORD;
  if (!password || password.length < 8) {
    throw new Error(
      `Kata sandi untuk ${user.email} belum diisi (minimal 8 karakter). ` +
        `Isi SEED_ADMIN_PASSWORD di .env atau tulis password di sample-data.`,
    );
  }
  return password;
}

async function seedProducts() {
  // Rating dan jumlah ulasan selalu mulai dari 0: angka aslinya dihitung dari
  // tabel Review (jalankan npm run seed:reviews untuk ulasan demo)
  const products = insertProductSchema
    .array()
    .parse(sampleData.products)
    .map((product) => ({ ...product, rating: 0, numReviews: 0 }));

  await prisma.product.deleteMany();
  const result = await prisma.product.createMany({ data: products });

  console.log(`${result.count} produk ditambahkan.`);
}

async function seedUsers() {
  const emails = sampleData.users.map((user) => user.email);

  // Hapus hanya pengguna contoh, akun asli Anda tidak tersentuh
  await prisma.user.deleteMany({ where: { email: { in: emails } } });

  for (const user of sampleData.users) {
    await seedAuth.api.signUpEmail({
      body: {
        name: user.name,
        email: user.email,
        password: getPassword(user),
      },
    });

    // role tidak bisa dikirim lewat sign-up (input: false), jadi diatur langsung
    await prisma.user.update({
      where: { email: user.email },
      data: { role: user.role },
    });
  }

  console.log(`${sampleData.users.length} pengguna ditambahkan.`);
}

async function main() {
  // Periksa semua kata sandi dulu sebelum ada data yang dihapus
  sampleData.users.forEach(getPassword);

  await seedProducts();
  await seedUsers();
  console.log("Seed selesai.");
}

main()
  .catch((error) => {
    console.error("Seed gagal:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
