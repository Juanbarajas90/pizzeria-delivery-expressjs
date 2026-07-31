// ============================================
// WRITER — Escribe el reporte en output/report.json
// ============================================

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import type { Report } from './types.js';

export async function writeReport(report: Report): Promise<void> {
  const outputDir = join(import.meta.dirname, '..', 'output');
  await mkdir(outputDir, { recursive: true });

  const outputPath = join(outputDir, 'report.json');
  await writeFile(outputPath, JSON.stringify(report, null, 2), 'utf-8');

  console.log(`Reporte guardado en: ${outputPath}`);
}
