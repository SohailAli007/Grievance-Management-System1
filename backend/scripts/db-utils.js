
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKUP_DIR = path.join(__dirname, '../backups');
const DB_NAME = 'DEMO';

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

export const exportCollection = (collection) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${collection}_${timestamp}.json`;
    const filePath = path.join(BACKUP_DIR, fileName);

    console.log(`Exporting ${collection} to ${fileName}...`);

    // Using mongoexport (requires MongoDB Database Tools installed)
    const cmd = `mongoexport --db=${DB_NAME} --collection=${collection} --out="${filePath}" --jsonArray`;

    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error exporting ${collection}:`, error.message);
            return;
        }
        console.log(`✓ ${collection} exported successfully.`);
    });
};

export const restoreCollection = (collection, fileName) => {
    const filePath = path.join(BACKUP_DIR, fileName);

    if (!fs.existsSync(filePath)) {
        console.error(`Backup file not found: ${filePath}`);
        return;
    }

    console.log(`Restoring ${collection} from ${fileName}...`);

    // Using mongoimport
    const cmd = `mongoimport --db=${DB_NAME} --collection=${collection} --file="${filePath}" --jsonArray --drop`;

    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error restoring ${collection}:`, error.message);
            return;
        }
        console.log(`✓ ${collection} restored successfully.`);
    });
};

const action = process.argv[2];
const coll = process.argv[3];
const file = process.argv[4];

if (action === 'backup') {
    const collections = coll ? [coll] : ['citizens', 'officers', 'admins', 'complaints', 'departments', 'users'];
    collections.forEach(exportCollection);
} else if (action === 'restore') {
    if (!coll || !file) {
        console.error('Usage: node db-utils.js restore <collection> <filename>');
    } else {
        restoreCollection(coll, file);
    }
}
