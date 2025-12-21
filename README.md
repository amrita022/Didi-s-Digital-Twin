# Didi's Digital Twin

## Overview
Didi's Digital Twin is a comprehensive digital management platform designed to help small business owners, particularly in the retail and service sectors, to monitor and manage their business operations efficiently. The application provides real-time insights, inventory management, financial tracking, and AI-powered recommendations to optimize business performance.

## Features

### Financial Dashboard
- Real-time income and expense tracking
- Visual representation of financial health
- Savings goal tracking with progress indicators
- Daily, weekly, and monthly financial analytics

### Inventory Management
- Stock level monitoring
- Low stock alerts and notifications
- Product tracking and categorization
- Inventory valuation

### AI-Powered Insights
- Sales predictions and trend analysis
- Inventory optimization recommendations
- Business health scoring
- Seasonal demand forecasting

### Multi-language Support
- English and Hindi language interface
- Dynamic content switching
- Localized number and date formatting

### User Experience
- Responsive design for all devices
- Intuitive dashboard with key metrics
- Interactive charts and visualizations
- Real-time notifications and reminders

## Technology Stack

### Frontend
- React 19 with Vite
- Tailwind CSS for styling
- Recharts for data visualization
- Zustand for state management
- React Router for navigation
- Firebase for authentication

### Backend
- Node.js with Express
- MongoDB for database
- RESTful API architecture
- JWT authentication

### AI/ML Components
- Time-series forecasting models
- Inventory optimization algorithms
- Business health scoring system

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB (v6.0 or higher)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Didi-s-Digital-Twin.git
   cd Didi-s-Digital-Twin
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd ../backend
   npm install
   ```

4. **Environment Setup**
   - Create a `.env` file in the backend directory with the following variables:
     ```
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     PORT=5002
     ```
   - Create a `.env` file in the frontend directory:
     ```
     VITE_API_URL=http://localhost:5002
     ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm start
   ```

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the application**
   Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
Didi-s-Digital-Twin/
├── frontend/               # Frontend React application
│   ├── public/             # Static files
│   ├── src/                # Source files
│   │   ├── assets/         # Images, fonts, etc.
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   ├── store/          # State management
│   │   └── utils/          # Utility functions
│   └── package.json        # Frontend dependencies
├── backend/                # Backend server
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── utils/              # Utility functions
│   └── package.json        # Backend dependencies
└── README.md               # Project documentation
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments
- Built with ❤️ for small business owners
- Special thanks to all contributors

## Support
For support, please open an issue in the GitHub repository or contact the development team.
