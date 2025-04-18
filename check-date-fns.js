import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if date-fns is in node_modules
const dateFnsPath = path.join(__dirname, 'node_modules', 'date-fns');
if (fs.existsSync(dateFnsPath)) {
  console.warn('date-fns is installed at:', dateFnsPath);

  // Check if package.json exists
  const packageJsonPath = path.join(dateFnsPath, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    console.warn('date-fns version:', packageJson.version);
    console.warn('date-fns has types:', !!packageJson.types);
  }
} else {
  console.error('date-fns is not installed');
}
