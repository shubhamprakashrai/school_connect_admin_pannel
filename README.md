# School Connect Admin Panel

A clean and modern admin panel for managing schools and users, built with React, TypeScript, and Tailwind CSS.

## Features

- **Responsive Design**: Works on all device sizes
- **Modern UI**: Built with Tailwind CSS for a clean, professional look
- **Type Safety**: Written in TypeScript for better developer experience
- **Authentication**: Secure login/logout flow
- **Dashboard**: Clean and intuitive interface for managing schools

## Tech Stack

- React 18
- TypeScript
- React Router 6
- Tailwind CSS
- Lucide Icons
- Vite (Build Tool)

## Project Structure

```
src/
├── components/           # Reusable UI components
├── contexts/            # React context providers
├── layouts/             # Layout components
├── pages/               # Page components
│   └── SuperAdmin/      # Super admin specific pages
│       ├── components/  # Reusable components for super admin
│       └── pages/       # Page components for super admin
├── types/               # TypeScript type definitions
├── App.tsx              # Main application component
└── main.tsx             # Application entry point
```

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd school_connect_admin_pannel
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint
- `npm run type-check` - Check TypeScript types

## Authentication

The application uses a simple authentication flow:

1. User logs in with credentials
2. On successful login, they are redirected to the dashboard
3. The dashboard is protected and requires authentication
4. Users can log out using the logout button in the drawer

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
