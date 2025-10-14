# Grimdank Database - Wargame Administration Backend (WAB)

A comprehensive full-stack application for managing wargame data entities, built with Go (Golang) backend and React frontend.

## Architecture

- **Backend**: Go (Golang) RESTful API with MongoDB
- **Frontend**: React Single Page Application (SPA)
- **Database**: MongoDB (NoSQL)
- **Architecture**: Three-tier (Data, API, Presentation)

## Features

### Core Entities
- **Rules**: Game rules and special abilities
- **Weapons**: Weapons with stats and abilities
- **WarGear**: Equipment with embedded rules and weapons
- **Units**: Game units with complex nested data
- **Army Books**: Faction-specific collections
- **Army Lists**: Player army compositions

### Backend Features
- RESTful API endpoints for all entities
- MongoDB integration with proper BSON handling
- Repository/Service pattern for clean architecture
- Data validation and error handling
- CORS support for frontend integration
- Environment-based configuration

### Frontend Features
- Modern React SPA with routing
- Complex nested forms for Units and WarGear
- Search and filter functionality
- Modal-based entity selection
- Responsive design
- Real-time CRUD operations

## Prerequisites

- Go 1.21 or higher
- Node.js 16 or higher
- MongoDB 4.4 or higher
- Git

## Installation & Setup

### Option 1: Docker (Recommended)

#### Prerequisites
- Docker and Docker Compose installed

#### Quick Start with Docker

```bash
# Clone the repository
git clone <repository-url>
cd grimdank-database

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

This will start:
- **MongoDB** on port 27017
- **Backend API** on port 8080
- **Frontend** on port 3000

#### Development Mode

For development with hot reloading:

```bash
# Start only MongoDB and backend
docker-compose -f docker-compose.dev.yml up -d

# Run frontend locally
cd frontend
npm install
npm start
```

### Option 2: Manual Setup

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd grimdank-database
```

#### 2. Backend Setup

##### Install Go Dependencies

```bash
go mod tidy
```

##### Environment Configuration

Create a `.env` file in the root directory:

```env
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=grimdank_db
SERVER_PORT=8080
```

##### Start MongoDB

Make sure MongoDB is running on your system:

```bash
# On Windows
net start MongoDB

# On macOS with Homebrew
brew services start mongodb-community

# On Linux
sudo systemctl start mongod
```

##### Run the Backend

```bash
go run main.go
```

The API will be available at `http://localhost:8080`

#### 3. Frontend Setup

##### Navigate to Frontend Directory

```bash
cd frontend
```

##### Install Dependencies

```bash
npm install
```

##### Start the Development Server

```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## API Endpoints

### Base URL: `http://localhost:8080/api/v1`

### Rules
- `GET /rules` - Get all rules (with optional name filter)
- `GET /rules/{id}` - Get rule by ID
- `POST /rules` - Create new rule
- `PUT /rules/{id}` - Update rule
- `DELETE /rules/{id}` - Delete rule

### Weapons
- `GET /weapons` - Get all weapons (with optional name filter)
- `GET /weapons/{id}` - Get weapon by ID
- `POST /weapons` - Create new weapon
- `PUT /weapons/{id}` - Update weapon
- `DELETE /weapons/{id}` - Delete weapon

### WarGear
- `GET /wargear` - Get all wargear (with optional name filter)
- `GET /wargear/{id}` - Get wargear by ID
- `POST /wargear` - Create new wargear
- `PUT /wargear/{id}` - Update wargear
- `DELETE /wargear/{id}` - Delete wargear

### Units
- `GET /units` - Get all units (with optional name filter)
- `GET /units/{id}` - Get unit by ID
- `POST /units` - Create new unit
- `PUT /units/{id}` - Update unit
- `DELETE /units/{id}` - Delete unit

### Army Books
- `GET /armybooks` - Get all army books (with optional name filter)
- `GET /armybooks/{id}` - Get army book by ID
- `POST /armybooks` - Create new army book
- `PUT /armybooks/{id}` - Update army book
- `DELETE /armybooks/{id}` - Delete army book

### Army Lists
- `GET /armylists` - Get all army lists (with optional name filter)
- `GET /armylists/{id}` - Get army list by ID
- `POST /armylists` - Create new army list
- `PUT /armylists/{id}` - Update army list
- `DELETE /armylists/{id}` - Delete army list

## Usage

### Backend

The Go backend provides a RESTful API with the following features:

- **Repository Pattern**: Clean separation of data access logic
- **Service Layer**: Business logic and validation
- **Error Handling**: Comprehensive error responses
- **Data Validation**: Server-side validation for required fields
- **CORS Support**: Cross-origin requests for frontend integration

### Frontend

The React frontend provides:

- **Navigation**: Easy access to all entity management pages
- **Search & Filter**: Find entities by name
- **Complex Forms**: Nested forms for Units with embedded Rules, Weapons, and WarGear
- **Modal Selection**: Choose from existing entities when building complex relationships
- **Real-time Updates**: Immediate reflection of changes

### Complex Entity Management

#### Units
Units support complex nested relationships:
- **Rules**: Add/remove embedded rules
- **Available Weapons**: Select from existing weapons
- **Available WarGear**: Select from existing wargear

#### WarGear
WarGear can contain:
- **Rules**: Embedded rule documents
- **Weapons**: Embedded weapon documents

## Data Models

### Rule
```json
{
  "id": "ObjectId",
  "name": "string",
  "description": "string",
  "type": "string",
  "points": "number"
}
```

### Weapon
```json
{
  "id": "ObjectId",
  "name": "string",
  "type": "string",
  "range": "string",
  "strength": "string",
  "ap": "string",
  "damage": "string",
  "abilities": "string",
  "points": "number"
}
```

### WarGear
```json
{
  "id": "ObjectId",
  "name": "string",
  "type": "string",
  "description": "string",
  "points": "number",
  "rules": ["Rule"],
  "weapons": ["Weapon"]
}
```

### Unit
```json
{
  "id": "ObjectId",
  "name": "string",
  "type": "string",
  "movement": "string",
  "weaponSkill": "string",
  "ballisticSkill": "string",
  "strength": "string",
  "toughness": "string",
  "wounds": "string",
  "initiative": "string",
  "attacks": "string",
  "leadership": "string",
  "save": "string",
  "points": "number",
  "rules": ["Rule"],
  "availableWeapons": ["Weapon"],
  "availableWarGear": ["WarGear"]
}
```

### Army Book
```json
{
  "id": "ObjectId",
  "name": "string",
  "faction": "string",
  "description": "string",
  "units": ["Unit"],
  "rules": ["Rule"]
}
```

### Army List
```json
{
  "id": "ObjectId",
  "name": "string",
  "player": "string",
  "faction": "string",
  "points": "number",
  "units": ["Unit"],
  "description": "string"
}
```

## Docker Commands

### Production

```bash
# Build and start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild and restart
docker-compose up -d --build
```

### Development

```bash
# Start MongoDB and backend only
docker-compose -f docker-compose.dev.yml up -d

# Stop development services
docker-compose -f docker-compose.dev.yml down

# View development logs
docker-compose -f docker-compose.dev.yml logs -f
```

### Individual Services

```bash
# Build backend only
docker build -f Dockerfile.backend -t grimdank-backend .

# Build frontend only
docker build -f frontend/Dockerfile -t grimdank-frontend ./frontend

# Run MongoDB only
docker run -d --name mongodb -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=password mongo:7.0
```

## Development

### Backend Development

The backend follows a clean architecture pattern:

```
├── config/          # Configuration management
├── database/        # Database connection
├── models/          # Data models
├── repositories/    # Data access layer
├── services/        # Business logic
├── handlers/        # HTTP handlers
└── main.go         # Application entry point
```

### Frontend Development

The frontend is organized as follows:

```
frontend/
├── public/          # Static assets
├── src/
│   ├── components/  # React components
│   ├── services/    # API services
│   ├── App.js      # Main application
│   └── index.js    # Entry point
└── package.json    # Dependencies
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check the connection string in `.env`
   - Verify the database name

2. **CORS Issues**
   - The backend includes CORS middleware
   - Ensure the frontend is running on the correct port

3. **Port Conflicts**
   - Backend runs on port 8080 by default
   - Frontend runs on port 3000 by default
   - Update ports in configuration if needed

### Logs

- Backend logs are displayed in the terminal
- Frontend logs are available in the browser console
- MongoDB logs depend on your installation method

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Create an issue in the repository
