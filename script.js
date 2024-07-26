const choices = document.querySelectorAll('.choice');
const resultDiv = document.getElementById('result');
const scoreDiv = document.getElementById('score');
const playerChoiceSpan = document.getElementById('player-choice');
const computerChoiceSpan = document.getElementById('computer-choice');
const countdownDiv = document.getElementById('countdown');
let playerScore = 0;
let computerScore = 0;

choices.forEach(choice => choice.addEventListener('click', startRound));

function startRound(event) {
    const playerChoice = event.target.id;
    countdown(3, playerChoice);
}

function countdown(seconds, playerChoice) {
    countdownDiv.textContent = seconds;
    const countdownInterval = setInterval(() => {
        seconds--;
        if (seconds > 0) {
            countdownDiv.textContent = seconds;
        } else {
            clearInterval(countdownInterval);
            countdownDiv.textContent = '';
            playRound(playerChoice);
        }
    }, 1000);
}

function playRound(playerChoice) {
    const computerChoice = getComputerChoice();
    const winner = determineWinner(playerChoice, computerChoice);
    displayChoices(playerChoice, computerChoice);
    displayResult(playerChoice, computerChoice, winner);
    updateScore(winner);
}

function getComputerChoice() {
    const choices = ['rock', 'paper', 'scissors'];
    const randomIndex = Math.floor(Math.random() * choices.length);
    return choices[randomIndex];
}

function determineWinner(player, computer) {
    if (player === computer) {
        return 'draw';
    }
    if ((player === 'rock' && computer === 'scissors') ||
        (player === 'scissors' && computer === 'paper') ||
        (player === 'paper' && computer === 'rock')) {
        return 'player';
    }
    return 'computer';
}

function displayChoices(player, computer) {
    playerChoiceSpan.textContent = player.charAt(0).toUpperCase() + player.slice(1);
    computerChoiceSpan.textContent = computer.charAt(0).toUpperCase() + computer.slice(1);
}

function displayResult(player, computer, winner) {
    let resultText;
    if (winner === 'draw') {
        resultText = `It's a draw! You both chose ${player}.`;
    } else if (winner === 'player') {
        resultText = `You win! ${player} beats ${computer}.`;
    } else {
        resultText = `You lose! ${computer} beats ${player}.`;
    }
    resultDiv.textContent = resultText;
}

function updateScore(winner) {
    if (winner === 'player') {
        playerScore++;
    } else if (winner === 'computer') {
        computerScore++;
    }
    scoreDiv.textContent = `Player: ${playerScore} | Computer: ${computerScore}`;
}
