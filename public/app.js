class FarkleApp {
    constructor() {
        this.currentGame = null;
        this.currentDice = [];
        this.selectedDice = [];
        this.selectedPlayer = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadGames();
    }

    bindEvents() {
        document.getElementById('new-game-form').addEventListener('submit', (e) => this.createGame(e));
        document.getElementById('add-player').addEventListener('click', () => this.addPlayerInput());
        document.getElementById('back-to-menu').addEventListener('click', () => this.showMenu());
        document.getElementById('score-form').addEventListener('submit', (e) => this.addScore(e));
        document.getElementById('roll-dice').addEventListener('click', () => this.rollDice());
        document.getElementById('calculate-score').addEventListener('click', () => this.calculateScore());
    }

    addPlayerInput() {
        const playersList = document.getElementById('players-list');
        const playerCount = playersList.children.length;
        
        if (playerCount < 8) {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'player-input';
            input.placeholder = `Player ${playerCount + 1}`;
            input.required = true;
            
            // Create a delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'delete-player-btn';
            deleteBtn.textContent = 'Delete';
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                this.removePlayerInput(input);
            };
            
            // Create a container for the input and button
            const container = document.createElement('div');
            container.className = 'player-input-container';
            container.appendChild(input);
            container.appendChild(deleteBtn);
            
            playersList.appendChild(container);
        }
    }

    removePlayerInput(input) {
        const container = input.parentElement;
        if (container) {
            container.remove();
        }
    }

    async createGame(e) {
        e.preventDefault();
        
        const name = document.getElementById('game-name').value;
        const targetScore = parseInt(document.getElementById('target-score').value);
        const playerInputs = document.querySelectorAll('.player-input');
        
        const players = Array.from(playerInputs)
            .map(input => ({ name: input.value.trim() }))
            .filter(player => player.name);

        if (players.length < 2) {
            alert('Please enter at least 2 players');
            return;
        }

        try {
            const response = await fetch('/api/games', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, players, targetScore })
            });

            const result = await response.json();
            
            if (response.ok) {
                this.loadGame(result.id);
            } else {
                alert(result.error || 'Error creating game');
            }
        } catch (error) {
            alert('Error creating game: ' + error.message);
        }
    }

    async loadGames() {
        try {
            const response = await fetch('/api/games');
            const games = await response.json();
            
            const container = document.getElementById('games-container');
            container.innerHTML = '';

            games.forEach(game => {
                const gameCard = document.createElement('div');
                gameCard.className = 'game-card';
                
                const finishedText = game.finished_at ? ' (Finished)' : ' (In Progress)';
                
                gameCard.innerHTML = `
                    <div class="game-card-header">
                        <h3>${game.name}${finishedText}</h3>
                        <button class="delete-game-btn" onclick="event.stopPropagation(); farkleApp.deleteGame(${game.id})">Delete</button>
                    </div>
                    <div class="game-info">
                        <div>Players: ${game.player_count}</div>
                        <div>Target: ${game.target_score}</div>
                        <div>Created: ${new Date(game.created_at).toLocaleDateString()}</div>
                    </div>
                `;
                
                gameCard.onclick = () => this.loadGame(game.id);
                container.appendChild(gameCard);
            });
        } catch (error) {
            console.error('Error loading games:', error);
        }
    }

    async loadGame(gameId) {
        try {
            const response = await fetch(`/api/games/${gameId}`);
            const data = await response.json();
            
            if (response.ok) {
                this.currentGame = data;
                this.showGamePlay();
                this.updateGameDisplay();
            } else {
                alert(data.error || 'Error loading game');
            }
        } catch (error) {
            alert('Error loading game: ' + error.message);
        }
    }

    showMenu() {
        document.getElementById('game-setup').classList.remove('hidden');
        document.getElementById('game-list').classList.remove('hidden');
        document.getElementById('game-play').classList.add('hidden');
        this.loadGames();
    }

    showGamePlay() {
        document.getElementById('game-setup').classList.add('hidden');
        document.getElementById('game-list').classList.add('hidden');
        document.getElementById('game-play').classList.remove('hidden');
    }

    updateGameDisplay() {
        if (!this.currentGame) return;

        document.getElementById('current-game-name').textContent = this.currentGame.game.name;
        
        const playersContainer = document.getElementById('players-container');
        playersContainer.innerHTML = '';

        this.currentGame.players.forEach(player => {
            const playerCard = document.createElement('div');
            playerCard.className = 'player-card';
            playerCard.dataset.playerId = player.id;
            
            if (this.currentGame.game.winner_id === player.id) {
                playerCard.classList.add('winner');
            }
            
            playerCard.innerHTML = `
                <div class="player-name">${player.name}</div>
                <div class="player-score">${player.total_score}</div>
            `;
            
            playerCard.addEventListener('click', () => this.selectPlayer(player));
            playersContainer.appendChild(playerCard);
        });

        this.updateScoreHistory();
        this.updateSelectedPlayer();
    }

    updateScoreHistory() {
        const scoresContainer = document.getElementById('scores-container');
        scoresContainer.innerHTML = '';

        this.currentGame.scores.forEach(score => {
            const scoreEntry = document.createElement('div');
            scoreEntry.className = 'score-entry';
            
            scoreEntry.innerHTML = `
                <div><strong>${score.player_name}</strong> scored <strong>${score.score}</strong> points</div>
                ${score.dice_combination ? `<div>Dice: ${score.dice_combination}</div>` : ''}
                <div class="score-meta">${new Date(score.created_at).toLocaleString()}</div>
            `;
            
            scoresContainer.appendChild(scoreEntry);
        });
    }

    rollDice() {
        this.currentDice = [];
        this.selectedDice = [];
        
        for (let i = 0; i < 6; i++) {
            this.currentDice.push(Math.floor(Math.random() * 6) + 1);
        }
        
        const diceContainer = document.getElementById('dice-container');
        diceContainer.innerHTML = '';
        
        this.currentDice.forEach((value, index) => {
            const die = document.createElement('div');
            die.className = 'dice';
            die.dataset.value = value;
            die.dataset.index = index;
            die.textContent = value;
            die.onclick = () => this.toggleDie(index);
            diceContainer.appendChild(die);
        });
        
        document.getElementById('calculate-score').classList.remove('hidden');
    }

    toggleDie(index) {
        const die = document.querySelector(`[data-index="${index}"]`);
        const selectedIndex = this.selectedDice.indexOf(index);
        
        if (selectedIndex > -1) {
            this.selectedDice.splice(selectedIndex, 1);
            die.classList.remove('selected');
        } else {
            this.selectedDice.push(index);
            die.classList.add('selected');
        }
    }

    calculateScore() {
        if (this.selectedDice.length === 0) {
            alert('Please select dice to score');
            return;
        }
        
        const selectedValues = this.selectedDice.map(index => this.currentDice[index]);
        const score = this.calculateFarkleScore(selectedValues);
        
        document.getElementById('score-value').value = score.total;
        document.getElementById('dice-combo').value = score.description;
        
        if (score.total === 0) {
            alert('Farkle! No scoring dice selected.');
        }
    }

    calculateFarkleScore(dice) {
        if (dice.length === 0) return { total: 0, description: 'No dice selected' };
        
        const counts = {};
        dice.forEach(die => {
            counts[die] = (counts[die] || 0) + 1;
        });
        
        let score = 0;
        let descriptions = [];
        
        for (let value = 1; value <= 6; value++) {
            const count = counts[value] || 0;
            
            if (count >= 3) {
                const baseScore = value === 1 ? 1000 : value * 100;
                if (count === 6) {
                    score += 3000;
                    descriptions.push(`Six ${value}s`);
                } else if (count === 5) {
                    score += baseScore * 2;
                    descriptions.push(`Five ${value}s`);
                } else if (count === 4) {
                    score += baseScore * 2;
                    descriptions.push(`Four ${value}s`);
                } else {
                    score += baseScore;
                    descriptions.push(`Three ${value}s`);
                }
                
                const remainingCount = count - (count >= 3 ? 3 : 0);
                if ((value === 1 || value === 5) && remainingCount > 0) {
                    const singleScore = value === 1 ? 100 : 50;
                    score += singleScore * remainingCount;
                    descriptions.push(`${remainingCount} single ${value}${remainingCount > 1 ? 's' : ''}`);
                }
            } else if (value === 1 || value === 5) {
                const singleScore = value === 1 ? 100 : 50;
                score += singleScore * count;
                if (count > 0) {
                    descriptions.push(`${count} single ${value}${count > 1 ? 's' : ''}`);
                }
            }
        }
        
        return {
            total: score,
            description: descriptions.length > 0 ? descriptions.join(', ') : 'Farkle'
        };
    }

    selectPlayer(player) {
        this.selectedPlayer = player;
        this.updateSelectedPlayer();
    }

    updateSelectedPlayer() {
        document.querySelectorAll('.player-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        if (this.selectedPlayer) {
            const selectedCard = document.querySelector(`[data-player-id="${this.selectedPlayer.id}"]`);
            if (selectedCard) {
                selectedCard.classList.add('selected');
            }
            
            document.getElementById('selected-player-name').textContent = this.selectedPlayer.name;
            document.getElementById('selected-player-info').classList.remove('hidden');
            document.getElementById('add-score-btn').disabled = false;
        } else {
            document.getElementById('selected-player-info').classList.add('hidden');
            document.getElementById('add-score-btn').disabled = true;
        }
    }

    async addScore(e) {
        e.preventDefault();
        
        if (!this.selectedPlayer) {
            alert('Please select a player first');
            return;
        }
        
        const score = parseInt(document.getElementById('score-value').value);
        const diceCombination = document.getElementById('dice-combo').value;
        
        try {
            const response = await fetch(`/api/games/${this.currentGame.game.id}/score`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    playerId: this.selectedPlayer.id,
                    score,
                    diceCombination,
                    roundNumber: 1
                })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                if (result.gameWon) {
                    alert(`Game won with ${result.totalScore} points!`);
                }
                
                document.getElementById('score-form').reset();
                document.getElementById('calculate-score').classList.add('hidden');
                document.getElementById('dice-container').innerHTML = '';
                this.selectedPlayer = null;
                
                await this.loadGame(this.currentGame.game.id);
            } else {
                alert(result.error || 'Error adding score');
            }
        } catch (error) {
            alert('Error adding score: ' + error.message);
        }
    }

    async deleteGame(gameId) {
        if (!confirm('Are you sure you want to delete this game? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/games/${gameId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                const result = await response.json();
                this.loadGames();
            } else {
                let errorMessage = 'Error deleting game';
                try {
                    const result = await response.json();
                    errorMessage = result.error || errorMessage;
                } catch (jsonError) {
                    // If response isn't JSON, use status text
                    errorMessage = response.statusText || errorMessage;
                }
                alert(errorMessage);
            }
        } catch (error) {
            alert('Error deleting game: ' + error.message);
        }
    }
}

let farkleApp;

document.addEventListener('DOMContentLoaded', () => {
    farkleApp = new FarkleApp();
});