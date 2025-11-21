import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

function parseCSV(content: string): any[] {
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];

  const headers = lines[0].split(',');
  const rows: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const row: any = {};

    headers.forEach((header, index) => {
      row[header.trim()] = values[index]?.trim() || null;
    });

    rows.push(row);
  }

  return rows;
}

async function main() {
  console.log('Starting player data import...');

  const csvPath = path.resolve(__dirname, '../engine_data/Player Bios/Skaters/skater_bios.csv');

  if (!fs.existsSync(csvPath)) {
    console.error(`CSV file not found at: ${csvPath}`);
    process.exit(1);
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const players = parseCSV(csvContent);

  console.log(`Found ${players.length} players in CSV`);

  let imported = 0;
  let skipped = 0;

  for (const playerData of players) {
    try {
      const nhlPlayerId = playerData.PlayerID;

      if (!nhlPlayerId || nhlPlayerId === 'null' || nhlPlayerId === '') {
        skipped++;
        continue;
      }

      // Parse numeric fields
      const jerseyNumber = playerData['Jersey Number'] && playerData['Jersey Number'] !== ''
        ? parseInt(playerData['Jersey Number'])
        : null;

      const age = playerData.Age && playerData.Age !== ''
        ? parseInt(playerData.Age)
        : null;

      const height = playerData['Height (in)'] && playerData['Height (in)'] !== ''
        ? parseInt(playerData['Height (in)'])
        : null;

      const weight = playerData['Weight (lbs)'] && playerData['Weight (lbs)'] !== ''
        ? parseInt(playerData['Weight (lbs)'])
        : null;

      const draftYear = playerData['Draft Year'] && playerData['Draft Year'] !== ''
        ? parseInt(playerData['Draft Year'])
        : null;

      const draftRound = playerData['Draft Round'] && playerData['Draft Round'] !== ''
        ? parseInt(playerData['Draft Round'])
        : null;

      const draftPosition = playerData['Overall Draft Position'] && playerData['Overall Draft Position'] !== ''
        ? parseInt(playerData['Overall Draft Position'])
        : null;

      await prisma.player.upsert({
        where: { nhlPlayerId },
        update: {
          name: playerData.Player || 'Unknown',
          team: playerData.Team || null,
          position: playerData.Position || 'F',
          headshotUrl: playerData.Headshot || null,
          teamLogoUrl: playerData['Team Logo'] || null,
          jerseyNumber,
          age,
          dateOfBirth: playerData['Date of Birth'] || null,
          birthCity: playerData['Birth City'] || null,
          birthCountry: playerData['Birth Country'] || null,
          nationality: playerData.Nationality || null,
          height,
          weight,
          draftYear,
          draftTeam: playerData['Draft Team'] || null,
          draftRound,
          draftPosition,
        },
        create: {
          nhlPlayerId,
          name: playerData.Player || 'Unknown',
          team: playerData.Team || null,
          position: playerData.Position || 'F',
          headshotUrl: playerData.Headshot || null,
          teamLogoUrl: playerData['Team Logo'] || null,
          jerseyNumber,
          age,
          dateOfBirth: playerData['Date of Birth'] || null,
          birthCity: playerData['Birth City'] || null,
          birthCountry: playerData['Birth Country'] || null,
          nationality: playerData.Nationality || null,
          height,
          weight,
          draftYear,
          draftTeam: playerData['Draft Team'] || null,
          draftRound,
          draftPosition,
        },
      });

      imported++;

      if (imported % 100 === 0) {
        console.log(`Imported ${imported} players...`);
      }
    } catch (error) {
      console.error(`Error importing player ${playerData.Player}:`, error);
      skipped++;
    }
  }

  console.log(`\nImport complete!`);
  console.log(`Imported: ${imported}`);
  console.log(`Skipped: ${skipped}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
