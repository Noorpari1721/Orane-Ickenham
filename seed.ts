import "dotenv/config";
import { PrismaClient } from "./app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { serviceCategories } from "./data/services";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const techs = [
  {
    techNo: "TECH-001",
    firstName: "Gurpreet",
    lastName: "Kaur",
    role: "Owner, Senior Nail Tech, Senior Eye Lash Tech",
    experience: 10,
    specialties: ["Nail Tech", "Eye Lash Tech"],
  },
  {
    techNo: "TECH-002",
    firstName: "Sneha",
    lastName: "",
    role: "Nail Tech",
    experience: 3,
    specialties: ["Nail Tech"],
  },
  {
    techNo: "TECH-003",
    firstName: "Kavita",
    lastName: "",
    role: "Nail Tech and Beauty Therapist",
    experience: 4,
    specialties: ["Nail Tech", "Beauty Therapist"],
  },
  {
    techNo: "TECH-004",
    firstName: "Muskan",
    lastName: "",
    role: "Beauty Therapist",
    experience: 2,
    specialties: ["Beauty Therapist"],
  },
];

function durationToMinutes(value: string): number {
  const normalized = value.trim().toLowerCase();

  const hours = Number(
    normalized.match(/(\d+(?:\.\d+)?)\s*hr/)?.[1] ?? 0
  );

  const minutes = Number(
    normalized.match(/(\d+)\s*min/)?.[1] ?? 0
  );

  return Math.round(hours * 60 + minutes);
}

const services = serviceCategories.flatMap((category) =>
  category.services.map((service) => [
    `SRV-${String(service.id).padStart(3, "0")}`,
    service.name,
    category.title,
    durationToMinutes(service.duration),
    service.price,
  ] as const)
);

async function main() {
  console.log("🌱 Seeding ORANE ICKENHAM...");

  for (const tech of techs) {
    await prisma.tech.upsert({
      where: { techNo: tech.techNo },
      update: {
        firstName: tech.firstName,
        lastName: tech.lastName,
        role: tech.role,
        experience: tech.experience,
        specialties: tech.specialties,
        status: "AVAILABLE",
      },
      create: {
        ...tech,
        status: "AVAILABLE",
      },
    });
  }

  const currentServiceNos = services.map(
    ([serviceNo]) => serviceNo
  );

  await prisma.service.updateMany({
    where: {
      active: true,
      serviceNo: {
        notIn: currentServiceNos,
      },
    },
    data: {
      active: false,
    },
  });

  for (const [serviceNo, name, category, duration, price] of services) {
    await prisma.service.upsert({
      where: { serviceNo },
      update: {
        name,
        category,
        duration,
        price,
        active: true,
      },
      create: {
        serviceNo,
        name,
        category,
        duration,
        price,
        active: true,
      },
    });
  }

  console.log(`✅ ${techs.length} Techs seeded.`);
  console.log(`✅ ${services.length} Services seeded.`);
  console.log("🎉 Seed complete.");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
