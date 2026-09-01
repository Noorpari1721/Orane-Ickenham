import "dotenv/config";

import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { serviceCategories } from "../data/services";

function getDurationMinutes(value: string): number {
  const text = value.toLowerCase().trim();

  let minutes = 0;

  const hourMatch = text.match(/(\d+)\s*hr/);
  const minuteMatch = text.match(/(\d+)\s*min/);

  if (hourMatch) {
    minutes += Number(hourMatch[1]) * 60;
  }

  if (minuteMatch) {
    minutes += Number(minuteMatch[1]);
  }

  if (minutes <= 0) {
    throw new Error(
      `Unable to convert duration "${value}" into minutes.`
    );
  }

  return minutes;
}

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not configured. Check your .env or .env.local file."
    );
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({
      connectionString,
    }),
  });

  try {
    console.log("\n==============================================");
    console.log("SYNCING WEBSITE SERVICES TO DATABASE");
    console.log("==============================================");

    const existingServices = await prisma.service.findMany({
      select: {
        id: true,
        serviceNo: true,
        name: true,
        category: true,
      },
    });

    const existingKeys = new Set(
      existingServices.map(
        (service) =>
          `${service.category.trim().toLowerCase()}::${service.name
            .trim()
            .toLowerCase()}`
      )
    );

    let highestNumber = 0;

    for (const service of existingServices) {
      const match = service.serviceNo.match(/^SRV-(\d+)$/i);

      if (match) {
        highestNumber = Math.max(
          highestNumber,
          Number(match[1])
        );
      }
    }

    let nextNumber = highestNumber + 1;

    let added = 0;
    let skipped = 0;

    for (const category of serviceCategories) {
      console.log(`\nCATEGORY: ${category.title}`);

      for (const treatment of category.services) {
        const key =
          `${category.title.trim().toLowerCase()}::${treatment.name
            .trim()
            .toLowerCase()}`;

        if (existingKeys.has(key)) {
          console.log(`  SKIPPED: ${treatment.name}`);
          skipped++;
          continue;
        }

        let serviceNo = `SRV-${String(nextNumber).padStart(3, "0")}`;

        while (
          existingServices.some(
            (service) => service.serviceNo === serviceNo
          )
        ) {
          nextNumber++;

          serviceNo = `SRV-${String(nextNumber).padStart(3, "0")}`;
        }

        await prisma.service.create({
          data: {
            serviceNo,
            name: treatment.name,
            category: category.title,
            description: treatment.description ?? null,
            duration: getDurationMinutes(treatment.duration),
            price: treatment.price,
            active: true,
          },
        });

        existingKeys.add(key);

        existingServices.push({
          id: "",
          serviceNo,
          name: treatment.name,
          category: category.title,
        });

        console.log(
          `  ADDED: ${treatment.name} | £${treatment.price} | ${treatment.duration}`
        );

        added++;
        nextNumber++;
      }
    }

    const finalCount = await prisma.service.count();

    console.log("\n==============================================");
    console.log("SYNC COMPLETE");
    console.log("==============================================");
    console.log(`Added: ${added}`);
    console.log(`Already existed: ${skipped}`);
    console.log(`Database total: ${finalCount}`);
    console.log("==============================================\n");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("\nSYNC FAILED:\n", error);
  process.exit(1);
});