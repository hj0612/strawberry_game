document.addEventListener('DOMContentLoaded', () => {
    // 화면 요소
    const startScreen = document.getElementById('start-screen');
    const gameContainer = document.getElementById('game-container');
    const nicknameInput = document.getElementById('nickname-input');
    const startButton = document.getElementById('start-button');

    // 게임 요소
    const gameBoard = document.getElementById('game-board');
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('high-score');
    const timerElement = document.getElementById('timer');
    const resetButton = document.getElementById('reset-button');

    // 게임 변수
    let score = 0;
    let highScoreData = JSON.parse(localStorage.getItem('highScoreData')) || { name: '-', score: 0 };
    let nickname = '익명';
    let timer;
    let timeLeft = 60;
    const gameTime = 60;
    const boardSize = 400;
    const strawberrySize = 50;
    const maxStrawberries = 15;
    let strawberries = [];

    // --- 이벤트 리스너 ---
    startButton.addEventListener('click', () => {
        nickname = nicknameInput.value || '익명';
        startScreen.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        initGame();
    });

    resetButton.addEventListener('click', initGame);

    // --- 게임 초기화 및 진행 ---
    function initGame() {
        score = 0;
        updateScore();
        loadHighScore();
        gameBoard.innerHTML = '';
        strawberries = [];
        gameBoard.style.pointerEvents = 'auto';

        timeLeft = gameTime;
        timerElement.textContent = timeLeft;
        clearInterval(timer);
        timer = setInterval(updateTimer, 1000);

        generateStrawberries();
    }

    function updateTimer() {
        timeLeft--;
        timerElement.textContent = timeLeft;
        if (timeLeft <= 0) {
            gameOver();
        }
    }

    function gameOver() {
        clearInterval(timer);
        gameBoard.style.pointerEvents = 'none';
        alert(`시간 종료!\n${nickname}님의 점수는 ${score}점 입니다.`);
        // 최고 점수 확인 및 갱신
        if (score > highScoreData.score) {
            alert(`축하합니다! 최고 기록을 갱신했습니다!`);
            highScoreData = { name: nickname, score: score };
            saveHighScore();
            loadHighScore();
        }
    }

    // --- 점수 관련 함수 ---
    function updateScore() {
        scoreElement.textContent = score;
    }

    function loadHighScore() {
        highScoreElement.textContent = `${highScoreData.name}: ${highScoreData.score}`;
    }

    function saveHighScore() {
        localStorage.setItem('highScoreData', JSON.stringify(highScoreData));
    }

    // --- 딸기 생성 ---
    function generateStrawberries() {
        for (let i = 0; i < maxStrawberries; i++) {
            createStrawberry();
        }
    }

    function createStrawberry() {
        const strawberry = document.createElement('div');
        strawberry.classList.add('strawberry');
        strawberry.textContent = Math.floor(Math.random() * 9) + 1;

        let posX, posY, overlap;
        do {
            posX = Math.random() * (boardSize - strawberrySize);
            posY = Math.random() * (boardSize - strawberrySize);
            overlap = strawberries.some(s => {
                const dx = posX - s.x;
                const dy = posY - s.y;
                return Math.sqrt(dx * dx + dy * dy) < strawberrySize;
            });
        } while (overlap);

        strawberry.style.left = `${posX}px`;
        strawberry.style.top = `${posY}px`;
        
        const strawberryData = { element: strawberry, x: posX, y: posY, value: parseInt(strawberry.textContent) };
        strawberries.push(strawberryData);
        gameBoard.appendChild(strawberry);
    }

    // --- 드래그 로직 ---
    let isDragging = false;
    let selectedStrawberries = [];

    gameBoard.addEventListener('mousedown', (e) => {
        if (timeLeft <= 0) return;
        if (e.target.classList.contains('strawberry')) {
            isDragging = true;
            selectedStrawberries = [];
            toggleSelect(e.target);
        }
    });

    gameBoard.addEventListener('mouseover', (e) => {
        if (isDragging && e.target.classList.contains('strawberry')) {
            toggleSelect(e.target);
        }
    });

    window.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            const sum = selectedStrawberries.reduce((total, s) => total + s.value, 0);

            if (sum === 10) {
                score += 10;
                updateScore();
                selectedStrawberries.forEach(s => {
                    s.element.remove();
                    strawberries = strawberries.filter(berry => berry !== s);
                });
                const amountToRemove = selectedStrawberries.length;
                for(let i=0; i<amountToRemove; i++){
                    createStrawberry();
                }
            } 

            selectedStrawberries.forEach(s => s.element.classList.remove('selected'));
            selectedStrawberries = [];
        }
    });

    function toggleSelect(strawberryElement) {
        const selected = strawberries.find(s => s.element === strawberryElement);
        if (selected && !selectedStrawberries.includes(selected)) {
            selected.element.classList.add('selected');
            selectedStrawberries.push(selected);
        }
    }

    // 초기 최고 점수 표시
    loadHighScore();
});