// MongoDB initialization script
db = db.getSiblingDB('grimdank_db');

// Create collections
db.createCollection('rules');
db.createCollection('weapons');
db.createCollection('wargear');
db.createCollection('units');
db.createCollection('armybooks');
db.createCollection('armylists');

// Create indexes for better performance
db.rules.createIndex({ "name": 1 });
db.weapons.createIndex({ "name": 1 });
db.wargear.createIndex({ "name": 1 });
db.units.createIndex({ "name": 1 });
db.armybooks.createIndex({ "name": 1 });
db.armylists.createIndex({ "name": 1 });

// Insert some sample data
db.rules.insertMany([
  {
    name: "Feel No Pain",
    description: "Each time this model would lose a wound, roll one D6: on a 5+, that wound is not lost.",
    type: "Special Rule",
    points: 0
  },
  {
    name: "Deep Strike",
    description: "During deployment, you can set up this unit in the teleportarium chamber instead of setting it up on the battlefield.",
    type: "Special Rule",
    points: 0
  }
]);

db.weapons.insertMany([
  {
    name: "Boltgun",
    type: "Rapid Fire",
    range: "24\"",
    strength: "4",
    ap: "0",
    damage: "1",
    rules: [],
    points: 0
  },
  {
    name: "Plasma Gun",
    type: "Assault",
    range: "24\"",
    strength: "7",
    ap: "-3",
    damage: "1",
    rules: [],
    points: 5
  }
]);

print('Database initialized successfully!');
