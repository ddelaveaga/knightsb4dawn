# Knights B4 Dawn

A live chess activity tracker for the Reno chess community. This web application allows users to discover and share chess activities happening around Reno, including casual games, tournaments, and lessons.

## Features

- Interactive map showing chess activities around Reno
- User authentication system
- Activity posting with location geocoding
- Filtering activities by type (casual, tournament, lesson)
- Pagination for browsing activities
- Real-time activity updates
- Mobile-responsive design

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: MongoDB
- Authentication: JWT
- Maps: Google Maps API

## Setup

1. Clone the repository:
```bash
git clone https://github.com/ddelaveaga/knightsb4dawn.git
cd knightsb4dawn
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
MONGODB_URI=mongodb://localhost/chess_activities
JWT_SECRET=your-secure-secret-key
PORT=3000
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

4. Start the development server:
```bash
npm run dev
```

5. Open the frontend:
```bash
python3 -m http.server 8080
```

Visit `http://localhost:8080` to view the application.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 