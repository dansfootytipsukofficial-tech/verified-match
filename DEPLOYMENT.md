# Verified Match - Deployment Guide

## Live Demo
The frontend pages are immediately available at:
https://dansfootytipsukofficial-tech.github.io/verified-match/pages/

## Backend Deployment

To make the full application functional, the Node.js/Express backend needs to be deployed.

### Option 1: Deploy to Heroku (Free Tier)

#### Prerequisites:
- Heroku account (create at https://www.heroku.com)
- Heroku CLI installed
- MySQL database (we recommend ClearDB or similar)

#### Steps:

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create a new Heroku app**
   ```bash
   heroku create your-app-name
   ```

4. **Add environment variables**
   ```bash
   heroku config:set JWT_SECRET="your-secret-key"
   heroku config:set DB_HOST="your-db-host"
   heroku config:set DB_USER="your-db-user"
   heroku config:set DB_PASSWORD="your-db-password"
   heroku config:set DB_NAME="verified_match"
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

### Option 2: Deploy to Railway.app

#### Prerequisites:
- Railway account (create at https://railway.app)
- GitHub connected to Railway

#### Steps:

1. Visit https://railway.app and sign up
2. Create new project from GitHub
3. Select this repository
4. Add MySQL plugin
5. Set environment variables in project settings
6. Deploy automatically from main branch

### Option 3: Local Development

#### Prerequisites:
- Node.js 14+ installed
- MySQL server running

#### Steps:

1. **Install dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

2. **Create .env file**
   ```bash
   cp server/.env.example server/.env
   # Edit .env with your database credentials
   ```

3. **Setup database**
   ```bash
   mysql -u your_user -p < DATABASE_SCHEMA.sql
   ```

4. **Start the server**
   ```bash
   npm --prefix server start
   ```
   Server runs on http://localhost:5000

5. **Update API endpoint**
   In `js/api.js`, update the BASE_URL:
   ```javascript
   BASE_URL: 'http://localhost:5000/api'
   ```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify/:token` - Verify email

### Profile Endpoints
- `GET /api/profiles/:userId` - Get user profile
- `PUT /api/profiles/update` - Update profile
- `GET /api/profiles/search/query` - Search users
- `GET /api/profiles/:userId/stats` - Get user statistics

### Matching Endpoints
- `GET /api/matches/potential` - Get potential matches
- `POST /api/matches/create` - Like or pass on user
- `GET /api/matches/my-matches` - Get mutual matches
- `DELETE /api/matches/:matchId` - Remove a match

### Messaging Endpoints
- `POST /api/messages/send` - Send message
- `GET /api/messages/conversation/:userId` - Get conversation
- `GET /api/messages/conversations` - Get all conversations
- `PUT /api/messages/:messageId/read` - Mark message as read

## Database Setup

The database schema is defined in `DATABASE_SCHEMA.sql`. Key tables:
- `users` - User profiles and authentication
- `matches` - Match history (likes/passes)
- `messages` - User messages
- `user_visits` - Profile visit tracking
- `user_blocks` - User blocking functionality

## Frontend Integration

All frontend pages are pre-configured to use the API. Simply:
1. Update `js/api.js` with your deployed backend URL
2. Test endpoints in browser console:
   ```javascript
   await API.auth.login('email@example.com', 'password')
   await API.matches.getPotentialMatches()
   ```

## Troubleshooting

- **CORS errors**: Add origin to CORS whitelist in server.js
- **Database connection fails**: Check DB credentials in .env
- **401 Unauthorized**: Ensure JWT token is in localStorage
- **Frontend won't load**: Check API BASE_URL in api.js

## Next Steps

1. Add email verification (Nodemailer/SendGrid)
2. Implement photo uploads (Cloudinary/S3)
3. Add real-time notifications (Socket.io)
4. Set up payment processing (Stripe)
5. Implement advanced analytics

## Support

For issues or questions, check the GitHub issues or contact the development team.
