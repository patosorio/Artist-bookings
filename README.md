# Artist Booking App

A modern web application for managing artist bookings and agency operations. Built with Django REST Framework backend and Next.js frontend with Firebase authentication.

## Features

- **Authentication**: Firebase-based authentication system
- **Agency Management**: Complete agency setup and management
- **Artist Management**: Add, edit, and manage artist profiles
- **Dashboard**: Comprehensive dashboard for agencies
- **Modern UI**: Built with Tailwind CSS and Radix UI components
- **Type Safety**: Full TypeScript support

## Tech Stack

### Backend
- **Django 5.2.4** - Web framework
- **Django REST Framework** - API development
- **Firebase Admin SDK** - Authentication
- **SQLite** - Database (development)
- **Django Debug Toolbar** - Performance monitoring

### Frontend
- **Next.js 15.3.4** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible components
- **Firebase** - Authentication
- **Axios** - HTTP client

## Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **Firebase Project** - For authentication
- **Git**

## Quick Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd artist-booking-app
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your Firebase configuration

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

The backend will be available at `http://localhost:8000`

### 3. Frontend Setup

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Firebase configuration

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

## 🔧 Environment Variables

### Backend (.env)
```env
DJANGO_SECRET_KEY=your-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=your-cert-url
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

## 📁 Project Structure

```
artist-booking-app/
├── backend/                 # Django backend
│   ├── agencies/           # Agency management app
│   ├── artists/            # Artist management app
│   ├── authentication/     # Firebase auth app
│   ├── config/            # Django settings
│   └── manage.py
├── client/                 # Next.js frontend
│   ├── src/
│   │   ├── app/           # Next.js app router
│   │   ├── components/    # React components
│   │   ├── lib/           # Utilities and API
│   │   └── types/         # TypeScript types
│   └── package.json
└── README.md
```

## Available Scripts

### Backend
```bash
python manage.py runserver     # Start development server
python manage.py migrate       # Run database migrations
python manage.py makemigrations # Create new migrations
python manage.py collectstatic # Collect static files
```

### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Development Tools

- **Django Debug Toolbar**: Available at `http://localhost:8000/__debug__/` when DEBUG=True
- **Django Admin**: Available at `http://localhost:8000/admin/`
- **API Endpoints**: Available at `http://localhost:8000/api/`

## Deployment

### Backend Deployment
1. Set up a production database (PostgreSQL recommended)
2. Configure production settings in `config/settings/production.py`
3. Set up environment variables
4. Run `python manage.py collectstatic`
5. Deploy using your preferred hosting service

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy the `.next` folder to your hosting service
3. Configure environment variables in production

<!-- ## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request -->

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please open an issue on the repository. 