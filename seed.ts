import "dotenv/config";
import { PrismaClient } from "./app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

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

const services = [
  ["SRV-001", "Hydra Cleanse", "Japanese Head Spa", 30, 50],
  ["SRV-002", "Sakura Head Spa", "Japanese Head Spa", 60, 80],
  ["SRV-003", "Ultimate Indulgence", "Japanese Head Spa", 90, 120],

  ["SRV-004", "Deep Cleansing Facial", "Facials", 30, 45],
  ["SRV-005", "ELEMIS Expert Facial", "Facials", 60, 70],
  ["SRV-006", "Express Facial", "Facials", 30, 30],
  ["SRV-007", "Herbal Facial", "Facials", 60, 60],

  ["SRV-008", "Acrylic Extension Full Set With Gel", "Nails", 60, 45],
  ["SRV-009", "Acrylic Extension Full Set Colour", "Nails", 60, 40],
  ["SRV-010", "Acrylic Infill With Gel", "Nails", 60, 40],
  ["SRV-011", "Acrylic Infill Without Polish", "Nails", 60, 35],
  ["SRV-012", "BIAB Infill With Gel", "Nails", 60, 39],
  ["SRV-013", "BIAB Infill No Polish", "Nails", 60, 34],
  ["SRV-014", "Builder Gel Full Set Extensions", "Nails", 60, 45],
  ["SRV-015", "Builder Gel Full Set Extensions Extra", "Nails", 60, 50],
  ["SRV-016", "Builder Gel Infill No Polish", "Nails", 60, 34],
  ["SRV-017", "Builder Gel Infill With Gel", "Nails", 60, 39],

  ["SRV-018", "Apply Normal Polish", "Hand Additionals", 30, 10],
  ["SRV-019", "Chrome / Glitter / Cat Eye", "Hand Additionals", 30, 8],
  ["SRV-020", "Extension Removal", "Hand Additionals", 30, 15],
  ["SRV-021", "French Tips", "Hand Additionals", 30, 8],
  ["SRV-022", "Nail Art", "Hand Additionals", 30, 2],
  ["SRV-023", "Nail Repair", "Hand Additionals", 30, 3],
  ["SRV-024", "Remove Gel Polish", "Hand Additionals", 30, 10],

  ["SRV-025", "Brow Lamination", "Tint", 60, 55],
  ["SRV-026", "Brow Tint", "Tint", 30, 15],
  ["SRV-027", "Lash Tint", "Tint", 30, 20],

  ["SRV-028", "Classic Lash Extensions", "Lashes", 90, 50],

  ["SRV-029", 'Express "Dry" Manicure', "Manicure", 30, 15],
  ["SRV-030", 'Express "Dry" Manicure + Gel', "Manicure", 30, 25],
  ["SRV-031", 'Express "Dry" Manicure + Normal Polish', "Manicure", 30, 25],
  ["SRV-032", "Classic Manicure", "Manicure", 30, 25],
  ["SRV-033", "Classic Manicure + Gel", "Manicure", 30, 33],
  ["SRV-034", "Classic French Manicure", "Manicure", 60, 32],
  ["SRV-035", "Classic French Manicure + Gel", "Manicure", 60, 38],
  ["SRV-036", "Luxury Manicure", "Manicure", 60, 45],
  ["SRV-037", "Luxury Manicure + Gel", "Manicure", 90, 55],
  ["SRV-038", "Paraffin Wax Manicure", "Manicure", 60, 34],
  ["SRV-039", "Paraffin Wax Manicure + Gel", "Manicure", 60, 40],

  ["SRV-040", "Classic Pedicure", "Pedicure", 30, 45],
  ["SRV-041", "Classic Pedicure + Gel", "Pedicure", 60, 43],
  ["SRV-042", "Express Pedicure", "Pedicure", 30, 20],
  ["SRV-043", "Express Pedicure + Gel", "Pedicure", 30, 30],
  ["SRV-044", "Luxury Pedicure", "Pedicure", 60, 65],
  ["SRV-045", "Luxury Pedicure + Gel", "Pedicure", 60, 70],
  ["SRV-046", "Paraffin Wax Pedicure", "Pedicure", 60, 48],
  ["SRV-047", "Paraffin Wax Pedicure + Gel", "Pedicure", 60, 53],

  ["SRV-048", "Swedish Full Body Massage — 45 Minutes", "Massage", 45, 45],
  ["SRV-049", "Swedish Full Body Massage — 60 Minutes", "Massage", 60, 55],
  ["SRV-050", "Deep Tissue Massage — 45 Minutes", "Massage", 45, 50],
  ["SRV-051", "Deep Tissue Massage — 60 Minutes", "Massage", 60, 60],
  ["SRV-052", "Indian Head Massage — 30 Minutes", "Massage", 30, 30],
  ["SRV-053", "Indian Head Massage — 45 Minutes", "Massage", 45, 40],
  ["SRV-054", "Back, Neck & Shoulder Massage", "Massage", 30, 30],
  ["SRV-055", "Hand & Foot Relaxation Massage", "Massage", 30, 30],
] as const;

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
