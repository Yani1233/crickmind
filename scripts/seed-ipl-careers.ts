import { PrismaClient } from "@prisma/client";
import iplCareers from "./data/ipl-careers.json";

const prisma = new PrismaClient();

interface Stint {
  team: string;
  startYear: number;
  endYear: number;
}

interface CareerEntry {
  playerName: string;
  stints: Stint[];
}

async function seed() {
  const careers = iplCareers as CareerEntry[];
  const multiStint = careers.filter((c) => c.stints.length >= 2);

  console.log(`Seeding ${multiStint.length} IPL careers (filtered from ${careers.length} total)...`);

  let upserted = 0;
  for (const career of multiStint) {
    const distinctTeams = new Set(career.stints.map((s) => s.team));
    await prisma.iplCareer.upsert({
      where: { playerName: career.playerName },
      update: {
        stints: career.stints,
        totalTeams: distinctTeams.size,
      },
      create: {
        playerName: career.playerName,
        stints: career.stints,
        totalTeams: distinctTeams.size,
      },
    });
    upserted++;
  }

  console.log(`Done: ${upserted} careers upserted.`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
