# YouAct - Active Video Vision Platform

An interactive video annotation platform where you can synchronize text content and embedded videos with specific timestamps. Perfect for video tutorials, commentary, language learning, and collaborative analysis.

## Features

- 🎥 **YouTube Integration**: Embed any YouTube video by link
- ⏱️ **Timestamp-based Annotations**: Add content at specific moments
- 📝 **Unlimited Content**: Add as many annotations as you want
- 🔄 **Smart Display**: Content appears/stacks based on video playback position
- 🗑️ **Live Deletion**: Remove content while video is playing
- 💾 **Data Persistence**: All projects and annotations saved to MongoDB
- 👤 **User Accounts**: Create and manage multiple projects
- 📱 **Responsive Design**: Works on desktop and mobile
- ⚡ **Real-time Sync**: Video time automatically syncs with content display

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Hosting**: Vercel (frontend) + Railway (backend)

## Project Structure

```
youact/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API services
│   │   ├── styles/          # Global styles
│   │   └── App.jsx
│   ├── public/
│   ├── package.json
│   └── .env.example
│
├── backend/                  # Node.js/Express server
│   ├── routes/              # API endpoints
│   ├── models/              # MongoDB schemas
│   ├── middleware/          # Custom middleware
│   ├── controllers/         # Request handlers
│   ├── config/              # Configuration files
│   ├── server.js            # Entry point
│   ├── package.json
│   └── .env.example
│
├── .gitignore
└── README.md
```

## Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB account (MongoDB Atlas)
- GitHub account

### Backend Setup

1. Navigate to backend folder:
```bash
cd backend
npm install
```

2. Create `.env` file:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

3. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend folder:
```bash
cd frontend
npm install
```

2. Create `.env.local` file:
```env
VITE_API_URL=http://localhost:5000
```

3. Start the dev server:
```bash
npm run dev
```

Visit `http://localhost:5173`

## Environment Variables

### Backend (.env)
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT secret for authentication
- `NODE_ENV` - Environment (development/production)
- `FRONTEND_URL` - Frontend URL for CORS

### Frontend (.env.local)
- `VITE_API_URL` - Backend API URL

## Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables
4. Deploy

### Backend (Railway)
1. Connect GitHub repository to Railway
2. Add MongoDB connection string to environment
3. Add other required env variables
4. Deploy

## API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Projects
- `GET /api/projects` - Get all user projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Annotations
- `POST /api/projects/:id/annotations` - Add annotation
- `DELETE /api/projects/:id/annotations/:annotationId` - Delete annotation
- `PUT /api/projects/:id/annotations/:annotationId` - Update annotation

## Usage

1. **Create an Account** - Sign up with email and password
2. **Create a Project** - Give it a name and description
3. **Add a Video** - Paste a YouTube link
4. **Add Annotations** - Click at a timestamp and add text
5. **Play & View** - Watch the video and see content appear at the right moments
6. **Manage Content** - Delete items as needed while playing

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License - Feel free to use this project however you like.

---

Built with ❤️ for active video learning
