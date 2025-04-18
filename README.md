# ClientFlow

ClientFlow is a modern, secure client management system built with Next.js, Express, and PostgreSQL. It provides robust user authentication, role-based access control, and comprehensive login history tracking.

![ClientFlow Dashboard](https://via.placeholder.com/800x400?text=ClientFlow+Dashboard)

## Features

- **Secure Authentication**: JWT-based authentication with bcrypt password hashing
- **Role-Based Access Control**: Different permission levels for admin and regular users
- **Login History Tracking**: Detailed logs of user login activities including IP and device information
- **Responsive Dashboard**: Modern UI that works on desktop and mobile devices
- **API Key Protection**: Secure API endpoints with key validation
- **Database Integration**: PostgreSQL database with Prisma ORM for type-safe queries

## Tech Stack

### Frontend

- **Next.js**: React framework for server-rendered applications
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **React Icons**: Icon library

### Backend

- **Express.js**: Node.js web application framework
- **Prisma**: Next-generation ORM for Node.js and TypeScript
- **PostgreSQL**: Relational database
- **JWT**: JSON Web Tokens for authentication
- **bcrypt**: Password hashing

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/huy58501/ClientFlowDemo_client.git
   cd clientflow
   ```

2. Install dependencies for both client and server:

   ```bash
   # Install client dependencies
   cd client
   npm install

   # Install server dependencies
   cd ../server
   npm install
   ```

3. Set up environment variables:

   - Create `.env` files in both client and server directories
   - See `.env.example` files for required variables

4. Set up the database:

   ```bash
   cd server
   npx prisma migrate dev
   ```

5. Start the development servers:

   ```bash
   # Start the server
   cd server
   npm run dev

   # Start the client (in a new terminal)
   cd client
   npm run dev
   ```

6. Access the application at `http://localhost:3000`

## Project Structure

```
clientflow/
├── client/                 # Next.js frontend
│   ├── public/             # Static assets
│   │   ├── components/     # React components
│   │   ├── pages/          # Next.js pages
│   │   ├── styles/         # CSS styles
│   │   └── utils/          # Utility functions
│   └── package.json        # Frontend dependencies
│
├── server/                 # Express backend
│   ├── controllers/        # Route controllers
│   ├── lib/                # Utility libraries
│   ├── middleware/         # Express middleware
│   ├── prisma/             # Prisma schema and migrations
│   ├── routes/             # API routes
│   └── package.json        # Backend dependencies
│
└── README.md               # Project documentation
```

## API Documentation

### Authentication Endpoints

- `POST /api/auth/login`: User login
- `POST /api/auth/logout`: User logout

### User Management Endpoints

- `GET /api/get-users`: Get all users (admin only)
- `POST /api/create-user`: Create a new user (admin only)
- `PUT /api/update-user/:id`: Update user information (admin only)
- `DELETE /api/delete-user/:id`: Delete a user (admin only)

## Security Features

- **API Key Validation**: All API requests require a valid API key
- **Password Hashing**: Passwords are securely hashed using bcrypt
- **JWT Authentication**: Secure token-based authentication
- **CORS Protection**: Cross-Origin Resource Sharing protection
- **Input Validation**: Server-side validation of all inputs

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Express](https://expressjs.com/)
- [Prisma](https://www.prisma.io/)
- [Tailwind CSS](https://tailwindcss.com/) # ClientFlowDemo_client

updating README.md
# tablettopcafe_client
# tablettopcafe_client
