const gameBoard = document.getElementById('gameBoard');
const cells = document.querySelectorAll('.cell');
const playerScoreEl = document.getElementById('playerScore');
const aiScoreEl = document.getElementById('aiScore');
const drawScoreEl = document.getElementById('drawScore');
const resetBtn = document.getElementById('resetBtn');
const resetScoreBtn = document.getElementById('resetScoreBtn');
const aiToggle = document.getElementById('aiToggle');
const gameOverModal = document.getElementById('gameOverModal');
const modalTitle = document.getElementById('modalTitle');
const modalMessage = document.getElementById('modalMessage');
const playAgainBtn = document.getElementById('playAgainBtn');
const themeToggle = document.getElementById('themeToggle');
const confirmResetModal = document.getElementById('confirmResetModal');

// Audio elements
const clickSound = document.getElementById('clickSound');
const winSound = document.getElementById('winSound');
const drawSound = document.getElementById('drawSound');

let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;
let scores = {
    playerX: 0,
    playerO: 0,
    draws: 0
};

init();

function init() {
    const savedScores = localStorage.getItem('tictactoe_scores');
    if (savedScores) {
        scores = JSON.parse(savedScores);
        updateScoreboard();
    }

    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }

    cells.forEach(cell => {
        cell.classList.add('empty');
        cell.setAttribute('data-hover', currentPlayer);
        cell.addEventListener('click', handleCellClick);
    });

    resetBtn.addEventListener('click', resetBoard);
    resetScoreBtn.addEventListener('click', () => {
        confirmResetModal.style.display = 'flex';
    });
    playAgainBtn.addEventListener('click', resetBoard);
    themeToggle.addEventListener('click', toggleTheme);
    updateHoverMarkers();
}

function handleCellClick(e) {
    const cell = e.target;
    const index = parseInt(cell.getAttribute('data-index'));

    if (board[index] !== '' || !gameActive) return;

    makeMove(index, currentPlayer);
    clickSound.play(); // Play click sound on every valid move

    if (checkWin(board, currentPlayer)) {
        endGame(`Player X wins!`);
        updateScores('X');
        winSound.play(); // Play win sound
        return;
    } else if (checkDraw(board)) {
        endGame("It's a draw!");
        updateScores('draw');
        drawSound.play(); // Play draw sound
        return;
    }

    if (aiToggle.checked && currentPlayer === 'X') {
        setTimeout(() => {
            const bestMove = findBestMove(board);
            makeMove(bestMove, 'O');
            clickSound.play(); // Play click sound for AI move
            if (checkWin(board, 'O')) {
                endGame("AI wins!");
                updateScores('O');
                winSound.play(); // Play win sound
            } else if (checkDraw(board)) {
                endGame("It's a draw!");
                updateScores('draw');
                drawSound.play(); // Play draw sound
            }
            currentPlayer = 'X';
            updateHoverMarkers();
        }, 400);
    } else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        updateHoverMarkers();
    }
}

function makeMove(index, player) {
    board[index] = player;
    const cell = cells[index];
    cell.textContent = player;
    cell.classList.add(player.toLowerCase(), 'drop');
    cell.classList.remove('empty');
    updateHoverMarkers();
}

function updateHoverMarkers() {
    cells.forEach((cell, i) => {
        if (board[i] === '') {
            cell.setAttribute('data-hover', currentPlayer);
        } else {
            cell.removeAttribute('data-hover');
        }
    });
}

function checkWin(b, player) {
    const patterns = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ];
    for (let [a,b1,c] of patterns) {
        if (b[a] === player && b[b1] === player && b[c] === player) {
            cells[a].classList.add('winner');
            cells[b1].classList.add('winner');
            cells[c].classList.add('winner');
            return true;
        }
    }
    return false;
}

function checkDraw(b) {
    return b.every(cell => cell !== '');
}

function endGame(message) {
    gameActive = false;
    modalTitle.textContent = 'Game Over';
    modalMessage.textContent = message;
    gameOverModal.style.display = 'flex';

    if (message.includes('wins')) {
        confetti();
    }
}

function resetBoard() {
    board = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    currentPlayer = 'X';

    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'winner', 'drop');
        cell.classList.add('empty');
        cell.setAttribute('data-hover', currentPlayer);
    });

    gameOverModal.style.display = 'none';
    updateHoverMarkers();
}

function updateScores(winner) {
    if (winner === 'X') scores.playerX++;
    else if (winner === 'O') scores.playerO++;
    else if (winner === 'draw') scores.draws++;

    updateScoreboard();
    localStorage.setItem('tictactoe_scores', JSON.stringify(scores));
}

function updateScoreboard() {
    playerScoreEl.textContent = scores.playerX;
    aiScoreEl.textContent = scores.playerO;
    drawScoreEl.textContent = scores.draws;
}

function confirmResetScores() {
    scores = { playerX: 0, playerO: 0, draws: 0 };
    updateScoreboard();
    localStorage.setItem('tictactoe_scores', JSON.stringify(scores));
    confirmResetModal.style.display = 'none';
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.removeItem('theme');
    }
}

// Corrected Minimax with local checks
function findBestMove(currentBoard) {
    let bestScore = -Infinity;
    let move;
    for (let i = 0; i < 9; i++) {
        if (currentBoard[i] === '') {
            currentBoard[i] = 'O';
            let score = minimax(currentBoard, 0, false);
            currentBoard[i] = '';
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

function minimax(b, depth, isMaximizing) {
    if (checkWinLocal(b, 'O')) return 10 - depth;
    if (checkWinLocal(b, 'X')) return depth - 10;
    if (b.every(cell => cell !== '')) return 0;

    if (isMaximizing) {
        let best = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (b[i] === '') {
                b[i] = 'O';
                best = Math.max(best, minimax(b, depth + 1, false));
                b[i] = '';
            }
        }
        return best;
    } else {
        let best = Infinity;
        for (let i = 0; i < 9; i++) {
            if (b[i] === '') {
                b[i] = 'X';
                best = Math.min(best, minimax(b, depth + 1, true));
                b[i] = '';
            }
        }
        return best;
    }
}

function checkWinLocal(b, player) {
    return [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ].some(([a,b1,c]) => b[a] === player && b[b1] === player && b[c] === player);
}
