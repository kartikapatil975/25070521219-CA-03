# ReadSphere — Smart Reading Tracker

A full-stack reading tracker and literary analytics web application built for the college **FLEXI Course Project**.

ReadSphere allows avid readers, students, and researchers to organize their personal library, record reading sessions, track reading pace and duration, establish annual/monthly reading targets, and gain deep visual insights into reading habits.

All records are stored directly in a **Local MongoDB Community Server** database (`readsphere`) and can be inspected live in **MongoDB Compass**.

---

## 🌟 Key Features

- **Dashboard & Overview**: Real-time aggregated reading metrics including total books, currently reading, completed books, total pages read, total reading time, and reading progress percentage.
- **Reading Goal Tracking**: Annual completed-book targets, monthly pages-read targets, and weekly duration targets calculated from actual MongoDB records.
- **Personal Library (My Books CRUD)**: Create, view, search, filter, sort, update reading progress, and delete books with cover images, personal ratings, and notes.
- **Reading Sessions Log**: Log sessions with book reference, pages read, duration in minutes, and notes. Automatically synchronizes book progress and prevents double-counting upon edits or deletions.
- **Interactive Analytics & Charts**:
  - 14-day reading activity area chart (pages read and time spent)
  - Monthly completed books bar chart
  - Monthly pages read trend chart
  - Literary genre distribution donut chart
  - Personal 5-star ratings distribution
  - Average session length, throughput (pages/hr), and top authors
- **Local MongoDB Compass Integration**: Built specifically to connect to local MongoDB Community Server at `mongodb://127.0.0.1:27017` with real collections viewable in MongoDB Compass.
- **Resilient Health & Diagnostics**: Dedicated `/api/health` endpoint and in-app connection modal showing live database status and step-by-step troubleshooting.

---

## 🛠️ Technology Stack

### Frontend
- **React.js** (v18) with **Vite**
- **React Router DOM** (v6)
- **Recharts** (Interactive data visualization charts)
- **Lucide React** (Modern iconography)
- **Tailwind CSS** (Editorial reading-inspired design with warm parchment `#FAF7F0` and deep forest emerald `#1B4332`)

### Backend
- **Node.js** & **Express.js** REST API
- **Mongoose** (Object Data Modeling)
- **Cors**, **Morgan**, **Dotenv**
- Centralized error handling and MongoDB ObjectId validation middleware

### Database & Inspection
- **Local MongoDB Community Server** (Localhost: `127.0.0.1:27017`)
- Database name: `readsphere`
- **MongoDB Compass** (Graphical interface for inspecting real collections)
- *No cloud databases, No MongoDB Atlas, No localStorage substitutes.*

---

## 📁 Project Folder Structure

```text
ReadSphere/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── BookModal.jsx
│   │   │   ├── CompassModal.jsx
│   │   │   ├── DeleteConfirmModal.jsx
│   │   │   ├── GoalModal.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── SessionModal.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── ToastContainer.jsx
│   │   ├── context/
│   │   │   └── AppContext.jsx
│   │   ├── layouts/
│   │   │   └── AppLayout.jsx
│   │   ├── pages/
│   │   │   ├── Analytics.jsx
│   │   │   ├── BookDetail.jsx
│   │   │   ├── Books.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Goals.jsx
│   │   │   └── Sessions.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── utils/
│   │   │   └── helpers.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env.example
│   └── .env
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── bookController.js
│   │   ├── dashboardController.js
│   │   ├── goalController.js
│   │   └── sessionController.js
│   ├── middleware/
│   │   ├── dbCheck.js
│   │   ├── errorHandler.js
│   │   └── validateId.js
│   ├── models/
│   │   ├── Book.js
│   │   ├── ReadingGoal.js
│   │   └── ReadingSession.js
│   ├── routes/
│   │   ├── bookRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── goalRoutes.js
│   │   ├── healthRoutes.js
│   │   └── sessionRoutes.js
│   ├── package.json
│   ├── server.js
│   ├── seed.js
│   ├── .env.example
│   └── .env
├── .gitignore
├── package.json
└── README.md
```

---

## 🗄️ MongoDB Community Server & Compass Setup

### 1. Install & Start Local MongoDB Server

The project requires the **Local MongoDB Community Server** running on your computer.

#### On macOS (Using Homebrew):
```bash
# 1. Add MongoDB tap
brew tap mongodb/brew

# 2. Install MongoDB Community Server
brew install mongodb-community

# 3. Start MongoDB local service
brew services start mongodb-community
```

#### Manual start (macOS / Linux):
```bash
mkdir -p ~/data/db
mongod --dbpath ~/data/db
```

#### On Windows:
1. Download and install **MongoDB Community Server** from [mongodb.com](https://www.mongodb.com/try/download/community).
2. Ensure the "Install MongoD as a Service" option is selected during setup.

---

### 2. Connect with MongoDB Compass

**MongoDB Compass** is the graphical desktop client used to view, query, and verify your database records.

1. Launch **MongoDB Compass** from your Applications / Start Menu.
2. In the "New Connection" screen, enter the local connection string:
   ```text
   mongodb://127.0.0.1:27017
   ```
3. Click **Connect**.
4. In the left sidebar, click the database named **`readsphere`**.
5. You will see the three Mongoose collections:
   - **`books`**: Stores book catalogue documents, pages, genre, status, rating, and notes.
   - **`readingsessions`**: Stores individual reading sessions with book references, pages read, date, and duration.
   - **`readinggoals`**: Stores annual and monthly target documents.

---

## ⚙️ Environment Configuration

### Backend Environment (`backend/.env`)

Create or verify `backend/.env`:
```env
PORT=5002
MONGODB_URI=mongodb://127.0.0.1:27017/readsphere
CLIENT_URL=http://localhost:5174
```

### Frontend Environment (`frontend/.env`)

Create or verify `frontend/.env`:
```env
VITE_API_URL=http://localhost:5002/api
```

---

## 🚀 Running the Application

Open two terminal windows:

### Terminal 1 — Backend
```bash
cd backend
npm install
npm run dev
```

*Optional — Populate Sample Data:*
To instantly populate the database with realistic sample books, reading sessions, and goals:
```bash
cd backend
npm run seed
```

### Terminal 2 — Frontend
```bash
cd frontend
npm install
npm run dev
```

Open your browser and navigate to:
```text
http://localhost:5173
```

---

## 📡 REST API Reference

All endpoints return JSON and use standard HTTP response codes (`200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`, `503 Service Unavailable`).

### Health & Diagnostics
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Returns local MongoDB connection state, collections count, and uptime |

### Books
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/books` | Get all books with search (`?search=`), genre, status, and sort filters |
| `GET` | `/api/books/:id` | Get book details and associated reading sessions |
| `POST` | `/api/books` | Create a new book record |
| `PUT` | `/api/books/:id` | Update an existing book record |
| `DELETE` | `/api/books/:id` | Delete a book and cascade delete its sessions |
| `PATCH` | `/api/books/:id/progress` | Quick update current page progress `{ currentPage }` |
| `PATCH` | `/api/books/:id/complete` | Mark a book as completed |

### Reading Sessions
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/sessions` | Get all reading sessions (filter by `?bookId=`) |
| `GET` | `/api/sessions/:id` | Get single session details |
| `POST` | `/api/sessions` | Create a session & auto-advance book progress |
| `PUT` | `/api/sessions/:id` | Update a session & reconcile book progress |
| `DELETE` | `/api/sessions/:id` | Delete a session & roll back book progress |

### Reading Goals
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/goals` | Get all reading goals with calculated progress |
| `POST` | `/api/goals` | Create a reading goal target |
| `PUT` | `/api/goals/:id` | Update reading goal targets |
| `DELETE` | `/api/goals/:id` | Delete a reading goal |

### Dashboard & Analytics
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/dashboard` | Aggregated dashboard stats, activity chart, and genre chart |
| `GET` | `/api/analytics` | Deep insights, monthly trends, ratings distribution, and author stats |

---

## 🧪 Testing & Verification Checklist

1. **Verify Backend Models**:
   ```bash
   node -e "require('./backend/models/Book'); require('./backend/models/ReadingSession'); require('./backend/models/ReadingGoal'); console.log('Models valid');"
   ```
2. **Verify Frontend Build**:
   ```bash
   cd frontend && npm run build
   ```
3. **Verify Seed Script**:
   ```bash
   cd backend && npm run seed
   ```
4. **Verify MongoDB Compass**:
   - Open MongoDB Compass
   - Connect to `mongodb://127.0.0.1:27017`
   - Open database `readsphere`
   - Verify `books`, `readingsessions`, and `readinggoals` collections and their documents.

---

## 🔒 Security & Git Configuration

The `.gitignore` file excludes `node_modules/`, local environment files (`.env`), build directories (`dist/`), and system cache files. Database credentials and personal secrets are never committed to version control.

