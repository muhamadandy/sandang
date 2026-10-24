import "dotenv/config";
import { prisma } from "../lib/prisma";
import { insertProductSchema } from "../lib/validator";
import sampleData from "./sample-data";

async function main() {
  const products = insertProductSchema.array().parse(sampleData.products);

  await prisma.product.deleteMany();
  const result = await prisma.product.createMany({ data: products });

  console.log(`Seed selesai: ${result.count} produk ditambahkan.`);
}

main()
  .catch((error) => {
    console.error("Seed gagal:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
