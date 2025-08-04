# Farkle Vibe - A Web-Based Farkle Game

Farkle Vibe is a web application that brings the classic dice game Farkle to life with modern web technologies. This application allows players to create games, track scores, and enjoy the strategic dice-rolling gameplay.

## Game Overview

Farkle is a dice game where players roll six dice and score points based on specific combinations. The goal is to reach a target score (default: 10,000 points) before other players.

### Core Rules

- **Scoring Combinations**:
  - **Straight (1-2-3-4-5-6)**: 1,500 points
  - **Three Pairs**: 1,500 points
  - **Six of a Kind**: 3,000 points
  - **Five of a Kind**: 2,000 points (multiplier)
  - **Four of a Kind**: 2,000 points (multiplier)
  - **Three of a Kind**: 100-600 points depending on the value
  - **Single 1s**: 100 points each
  - **Single 5s**: 50 points each

- **Farkle**: When no dice score, the player loses their turn and gains no points.

- **Continuing to Roll**: Players can choose to roll again with the remaining dice after scoring, but if they farkle, they lose all points accumulated in that turn.

## Features

- Create and manage multiple Farkle games
- Add players to games with custom names
- Track scores for each player and round
- Set custom target scores for games
- View game history and statistics
- Real-time score updates
- Persistent game data stored in SQLite database

## Technical Stack

- **Backend**: Node.js with Express.js
- **Database**: SQLite (farkle.db)
- **Frontend**: HTML, CSS, and JavaScript (client-side logic in public/app.js)
- **API**: RESTful JSON API for game management
- **Containerization**: Docker support via Dockerfile and docker-compose.yml

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)
- SQLite (included with Node.js)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/farkle-vibe.git
   cd farkle-vibe
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. Access the application in your browser at `http://localhost:3000`

### Using Docker

1. Build the Docker image:
   ```bash
   docker build -t farkle-vibe .
   ```

2. Run the container:
   ```bash
   docker run -p 3000:3000 farkle-vibe
   ```

3. Access the application in your browser at `http://localhost:3000`

### API Endpoints

- `GET /api/games` - Get all games
- `POST /api/games` - Create a new game
- `GET /api/games/:id` - Get a specific game with players and scores
- `DELETE /api/games/:id` - Delete a game
- `POST /api/games/:id/score` - Add a score to a game

## Database Structure

The application uses an SQLite database (`farkle.db`) with the following tables:

- **games**: Stores game metadata (name, target score, creation date, winner)
- **players**: Stores player information (name, game association, turn order)
- **scores**: Stores individual score entries (player, game, round, score, dice combination)

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request with your changes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by the classic Farkle dice game
- Built with Node.js and Express.js for a modern web experience
- Uses SQLite for simple, persistent data storage

---

*Farkle Vibe - Roll the dice, score the points, and win the game!*