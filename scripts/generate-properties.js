import fs from 'fs';
import path from 'path';

const targetPath = './src/data/properties.json';

// Scaled down counts for faster dev/testing
const quantities = {
  House: 15,
  Unit: 10,
  Townhouse: 5,
  Land: 3,
};

const locations = [
  { city: 'Sydney, NSW', coords: [-33.8688, 151.2093] },
  { city: 'Melbourne, VIC', coords: [-37.8136, 144.9631] },
  { city: 'Brisbane, QLD', coords: [-27.4698, 153.0251] },
  { city: 'Perth, WA', coords: [-31.9505, 115.8605] },
  { city: 'Adelaide, SA', coords: [-34.9285, 138.6007] },
  { city: 'Gold Coast, QLD', coords: [-28.0167, 153.4000] },
];

const features = [
  'Pool', 'Gym', 'Balcony', 'Air Conditioning', 'Dishwasher', 'Built-in Wardrobes', 
  'Secure Parking', 'Close to Schools', 'Ocean View', 'Smart Home System', 
  'Fireplace', 'Garden', 'Tennis Court', 'Wine Cellar'
];

const agents = [
  { name: 'Sarah Jenkins', phone: '+61 400 123 456', email: 'sarah@listedhomes.com' },
  { name: 'Michael Chen', phone: '+61 411 987 654', email: 'michael@listedhomes.com' },
  { name: 'Emma Thompson', phone: '+61 422 333 444', email: 'emma@listedhomes.com' }
];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomFeatures() {
  const numFeatures = getRandomInt(3, 6);
  const shuffled = [...features].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numFeatures);
}

const properties = [];
let idCounter = 1;

for (const [type, count] of Object.entries(quantities)) {
  for (let i = 0; i < count; i++) {
    const location = getRandomItem(locations);
    const agent = getRandomItem(agents);
    
    // Vary coords slightly
    const lat = location.coords[0] + (Math.random() * 0.1 - 0.05);
    const lng = location.coords[1] + (Math.random() * 0.1 - 0.05);
    
    // Price logic
    let price;
    if (type === 'House') price = getRandomInt(800000, 5000000);
    else if (type === 'Unit') price = getRandomInt(400000, 2000000);
    else if (type === 'Townhouse') price = getRandomInt(600000, 2500000);
    else price = getRandomInt(200000, 1500000);

    const beds = type === 'Land' ? 0 : getRandomInt(1, 6);
    const baths = type === 'Land' ? 0 : getRandomInt(1, 4);
    const parking = type === 'Land' ? 0 : getRandomInt(0, 4);
    const area = type === 'Land' ? getRandomInt(400, 5000) : getRandomInt(60, 500);
    
    const status = Math.random() > 0.8 ? 'rent' : 'sale';
    if (status === 'rent') {
      price = getRandomInt(400, 2500);
    }

    const title = `Beautiful ${type} in ${location.city.split(',')[0]}`;
    const description = `A stunning ${type.toLowerCase()} located in the heart of ${location.city}. Features include spacious living areas and modern amenities. Perfect for those looking for luxury and convenience.`;

    const property = {
      id: idCounter.toString(),
      title,
      price,
      location: location.city,
      status,
      coordinates: [lat, lng],
      type,
      beds,
      baths,
      parking,
      area,
      image: "", // Handled by map-images.cjs
      gallery: [],   // Handled by map-images.cjs
      featured: Math.random() > 0.9,
      description,
      features: getRandomFeatures(),
      agent
    };
    
    properties.push(property);
    idCounter++;
  }
}

fs.writeFileSync(targetPath, JSON.stringify(properties, null, 2), 'utf-8');
console.log(`Generated ${properties.length} properties to ${targetPath}`);
