const fs = require('fs');
const path = require('path');

// Resolve paths relative to the project root (one level up from scripts/)
const projectRoot = path.join(__dirname, '..');
const dataPath = path.join(projectRoot, 'src', 'data', 'properties.json');
const imagesBaseDir = path.join(projectRoot, 'public', 'images');

const validTypesMapping = {
    'House': 'Home',
    'Unit': 'Unit',
    'Townhouse': 'Townhouse',
    'Land': 'Land'
};
const validTypes = Object.keys(validTypesMapping);

// Keywords that mark interior/inside photos
const interiorKeywords = ['inside', 'interior', 'bathroom', 'bedroom', 'kitchen'];

function isInterior(filename) {
    const lower = filename.toLowerCase();
    return interiorKeywords.some(kw => lower.includes(kw));
}

function getImages(type) {
    const folderName = validTypesMapping[type];
    const dir = path.join(imagesBaseDir, folderName);
    if (!fs.existsSync(dir)) {
        console.error(`  [ERROR] Folder not found: ${dir}`);
        return { exterior: [], interior: [] };
    }

    const all = fs.readdirSync(dir).filter(f => /\.(jpeg|jpg|png|webp|avif)$/i.test(f));
    const exterior = all.filter(f => !isInterior(f)).map(f => `/images/${folderName}/${f}`);
    const interior = all.filter(f =>  isInterior(f)).map(f => `/images/${folderName}/${f}`);

    console.log(`  [${type}] ${exterior.length} exterior, ${interior.length} interior`);
    return { exterior, interior };
}

function randomPick(arr, exclude = null) {
    if (arr.length === 0) return null;
    let pool = exclude ? arr.filter(x => x !== exclude) : arr;
    if (pool.length === 0) pool = arr;
    return pool[Math.floor(Math.random() * pool.length)];
}

// Pre-load all image sets
console.log('\nLoading image folders...');
const cache = {};
for (const type of validTypes) {
    cache[type] = getImages(type);
}

let properties = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
const stats = {};
let warnings = 0;

for (let prop of properties) {
    if (!validTypes.includes(prop.type)) {
        console.warn(`  [WARN] Unknown property type: "${prop.type}" (id ${prop.id}), skipping.`);
        warnings++;
        continue;
    }

    stats[prop.type] = (stats[prop.type] || 0) + 1;

    const { exterior, interior } = cache[prop.type];
    const allImages = [...exterior, ...interior];

    // Main card image: always exterior; fallback to any image if none available
    if (exterior.length > 0) {
        prop.image = randomPick(exterior);
    } else if (allImages.length > 0) {
        prop.image = randomPick(allImages);
        console.warn(`  [WARN] No exterior images for "${prop.type}" (id ${prop.id}), used fallback.`);
        warnings++;
    }

    // Land has no interior images — single image on detail page
    if (prop.type === 'Land') {
        prop.gallery = [];
    } else {
        // Gallery: main image first, then 2 interior shots
        prop.gallery = [prop.image];
        for (let i = 0; i < 2; i++) {
            const pic = randomPick(interior) || randomPick(exterior, prop.image);
            if (pic) prop.gallery.push(pic);
        }
        // Top up to 3 if needed
        while (prop.gallery.length < 3 && allImages.length > 0) {
            prop.gallery.push(randomPick(allImages));
        }
    }

    // Agent avatar placeholder
    if (prop.agent) {
        prop.agent.image = `https://ui-avatars.com/api/?name=${encodeURIComponent(prop.agent.name)}&background=1a2e4a&color=d4a853&size=200`;
    }
}

fs.writeFileSync(dataPath, JSON.stringify(properties, null, 2), 'utf-8');

console.log('\n--- Results ---');
for (const type of validTypes) {
    const count = stats[type] || 0;
    const ext = cache[type]?.exterior.length || 0;
    console.log(`  ${type.padEnd(12)} | ${count} properties, ${ext} exterior images available`);
}
console.log(`\nTotal: ${properties.length} properties updated.`);
if (warnings > 0) {
    console.log(`${warnings} warnings (see above).`);
} else {
    console.log('All card images are type-specific exterior shots ✓');
}
