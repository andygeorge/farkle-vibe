const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const db = new sqlite3.Database('./farkle.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(255) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      finished_at DATETIME,
      winner_id INTEGER,
      target_score INTEGER DEFAULT 10000
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id INTEGER,
      name VARCHAR(255) NOT NULL,
      total_score INTEGER DEFAULT 0,
      turn_order INTEGER,
      FOREIGN KEY (game_id) REFERENCES games (id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER,
      game_id INTEGER,
      round_number INTEGER,
      score INTEGER,
      dice_combination TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (player_id) REFERENCES players (id),
      FOREIGN KEY (game_id) REFERENCES games (id)
    )`);
  });
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/games', (req, res) => {
  db.all(`SELECT g.*, COUNT(p.id) as player_count 
          FROM games g 
          LEFT JOIN players p ON g.id = p.game_id 
          GROUP BY g.id 
          ORDER BY g.created_at DESC`, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/games', (req, res) => {
  const { name, players, targetScore = 10000 } = req.body;
  
  if (!name || !players || players.length < 2) {
    return res.status(400).json({ error: 'Game name and at least 2 players required' });
  }

  db.run('INSERT INTO games (name, target_score) VALUES (?, ?)', [name, targetScore], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    const gameId = this.lastID;
    const playerInserts = players.map((player, index) => {
      return new Promise((resolve, reject) => {
        db.run('INSERT INTO players (game_id, name, turn_order) VALUES (?, ?, ?)', 
               [gameId, player.name, index], function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        });
      });
    });

    Promise.all(playerInserts)
      .then(() => {
        res.json({ id: gameId, message: 'Game created successfully' });
      })
      .catch(err => {
        res.status(500).json({ error: err.message });
      });
  });
});

app.get('/api/games/:id', (req, res) => {
  const gameId = req.params.id;
  
  db.get('SELECT * FROM games WHERE id = ?', [gameId], (err, game) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!game) {
      res.status(404).json({ error: 'Game not found' });
      return;
    }

    db.all('SELECT * FROM players WHERE game_id = ? ORDER BY turn_order', [gameId], (err, players) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      db.all(`SELECT s.*, p.name as player_name 
              FROM scores s 
              JOIN players p ON s.player_id = p.id 
              WHERE s.game_id = ? 
              ORDER BY s.created_at DESC`, [gameId], (err, scores) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }

        res.json({ game, players, scores });
      });
    });
  });
});

app.delete('/api/games/:id', (req, res) => {
  const gameId = req.params.id;

  db.serialize(() => {
    db.run('DELETE FROM scores WHERE game_id = ?', [gameId], (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      db.run('DELETE FROM players WHERE game_id = ?', [gameId], (err) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }

        db.run('DELETE FROM games WHERE id = ?', [gameId], function(err) {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }

          if (this.changes === 0) {
            res.status(404).json({ error: 'Game not found' });
            return;
          }

          res.json({ message: 'Game deleted successfully' });
        });
      });
    });
  });
});

app.post('/api/games/:id/score', (req, res) => {
  const gameId = req.params.id;
  const { playerId, score, diceCombination, roundNumber } = req.body;

  if (!playerId || score === undefined) {
    return res.status(400).json({ error: 'Player ID and score are required' });
  }

  db.run('INSERT INTO scores (player_id, game_id, score, dice_combination, round_number) VALUES (?, ?, ?, ?, ?)',
         [playerId, gameId, score, diceCombination || '', roundNumber || 1], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    db.run('UPDATE players SET total_score = total_score + ? WHERE id = ?', [score, playerId], (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      db.get('SELECT total_score FROM players WHERE id = ?', [playerId], (err, player) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }

        db.get('SELECT target_score FROM games WHERE id = ?', [gameId], (err, game) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }

          if (player.total_score >= game.target_score) {
            db.run('UPDATE games SET finished_at = CURRENT_TIMESTAMP, winner_id = ? WHERE id = ?', 
                   [playerId, gameId], (err) => {
              if (err) console.error('Error updating game winner:', err);
            });
          }

          res.json({ 
            id: this.lastID, 
            message: 'Score added successfully',
            totalScore: player.total_score,
            gameWon: player.total_score >= game.target_score
          });
        });
      });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Farkle scoring app running on port ${PORT}`);
});

process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Database connection closed.');
    process.exit(0);
  });
});