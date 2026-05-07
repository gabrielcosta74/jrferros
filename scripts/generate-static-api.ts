import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { staticCatalog, staticServices } from '../src/lib/staticApiData';

const apiDir = path.resolve(process.cwd(), 'public/api');

mkdirSync(apiDir, { recursive: true });

const catalogPayload = `${JSON.stringify({ data: staticCatalog(), source: 'static' })}\n`;
const servicesPayload = `${JSON.stringify({ data: staticServices(), source: 'static' })}\n`;

writeFileSync(path.join(apiDir, 'catalog.json'), catalogPayload, 'utf8');
writeFileSync(path.join(apiDir, 'services.json'), servicesPayload, 'utf8');
