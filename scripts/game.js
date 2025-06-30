 // Ensure the DOM is fully loaded before running the script
        document.addEventListener('DOMContentLoaded', () => {
            const boardElement = document.getElementById('board');
            const messageBox = document.getElementById('message-box');
            const newGameBtn = document.getElementById('new-game-btn');
            const showAnswerBtn = document.getElementById('show-answer-btn');
            const spymasterCodeOutput = document.getElementById('spymaster-code-output');
            const spymasterCodeInput = document.getElementById('spymaster-code-input');
            const loadGameBtn = document.getElementById('load-game-btn');

            // --- Card Data Storage ---
            // This is where all your potential Codenames words are stored.
            // You can expand this list significantly!
            const allCodenamesWords = [
                "Apple", "Bank", "Beach", "Bear", "Bird", "Book", "Boot", "Bottle", "Bow", "Bowl",
                "Branch", "Bridge", "Brush", "Bug", "Car", "Card", "Cat", "Cell", "Centaur", "Chocolate",
                "Church", "Circle", "Cloud", "Clown", "Coat", "Code", "Cold", "Comet", "Compound", "Concert",
                "Cotton", "Country", "Cow", "Crane", "Crown", "Cycle", "Dance", "Date", "Desert", "Diamond",
                "Dice", "Dog", "Doll", "Door", "Dragon", "Dress", "Drill", "Driver", "Drop", "Duck",
                "Dwarf", "Eagle", "Engine", "Europe", "Eye", "Face", "Fair", "Fall", "Fan", "Farm",
                "Feather", "Fence", "Field", "File", "Film", "Fire", "Fish", "Flute", "Fly", "Foot",
                "Force", "Fork", "Fountain", "Frog", "Game", "Gas", "Ghost", "Giant", "Glass", "Glove",
                "Gold", "Graph", "Grass", "Green", "Ground", "Guard", "Hammer", "Hand", "Harp", "Head",
                "Heart", "Hole", "Hook", "Horn", "Horse", "Hospital", "Hotel", "Ice", "Inch", "Index",
                "Iron", "Ivory", "Jam", "Jet", "Jupiter", "Key", "Kid", "King", "Kiss", "Kite",
                "Knight", "Lab", "Ladder", "Laser", "Lawyer", "Lead", "Lemon", "Life", "Light", "Limousine",
                "Line", "Link", "Lion", "Liquid", "Lock", "Log", "London", "Luck", "Magnet", "Man",
                "Map", "Mars", "Match", "Mercury", "Microscope", "Million", "Mine", "Mint", "Missile", "Model",
                "Mole", "Moon", "Moscow", "Mount", "Mouse", "Mouth", "Mug", "Nail", "Needle", "Net",
                "New York", "Night", "Note", "Novel", "Nurse", "Nut", "Oil", "Olive", "Opera", "Orange",
                "Organ", "Palm", "Pan", "Pants", "Paper", "Parade", "Park", "Part", "Pass", "Paste",
                "Penguin", "Phoenix", "Piano", "Pie", "Pilot", "Pine", "Pipe", "Pistol", "Plain", "Plane",
                "Plastic", "Plate", "Play", "Point", "Poison", "Pole", "Police", "Pond", "Pool", "Port",
                "Post", "Press", "Princess", "Pump", "Pupil", "Pyramid", "Queen", "Rabbit", "Radiation", "Rag",
                "Ray", "Revolution", "Ring", "Robot", "Rock", "Rod", "Roll", "Rome", "Root", "Rose",
                "Roulette", "Round", "Row", "Ruler", "Satellite", "Scale", "School", "Scientist", "Scissors", "Screen",
                "Scuba Diver", "Seal", "Server", "Shadow", "Shakespeare", "Shark", "Ship", "Shoe", "Shop", "Shot",
                "Sink", "Ski", "Skyscraper", "Sleigh", "Smoke", "Snow", "Snowman", "Socket", "Soldier", "Soul",
                "Sound", "Space", "Spell", "Spider", "Spine", "Spot", "Spring", "Square", "Stadium", "Star",
                "State", "Stick", "Stock", "Stomach", "Store", "Stream", "Strike", "String", "Sub", "Suit",
                "Sun", "Supernova", "Sweat", "Swing", "Switch", "Table", "Tablet", "Tag", "Tail", "Tap",
                "Tea", "Teacher", "Team", "Telescope", "Temple", "Text", "Thread", "Tide", "Tiger", "Time",
                "Tokyo", "Tongue", "Tooth", "Torch", "Tower", "Track", "Train", "Tree", "Triangle", "Trip",
                "Trunk", "Tube", "Turkey", "Underground", "Uniform", "Unicorn", "Vacuum", "Van", "Vet", "Wake",
                "Wall", "War", "Wash", "Watch", "Water", "Wave", "Web", "Well", "Whale", "Wheel",
                "Whiskey", "Wind", "Window", "Wire", "Wolf", "Wood", "Word", "Worm", "Yard", "Zero"
            ];

            let gameBoard = []; // Stores the current game board (word, type, revealed, originalIndex)
            let currentTurn = ''; // 'red' or 'blue'
            let revealedCardsCount = { red: 0, blue: 0 };
            const TOTAL_RED_CARDS = 9; // Red starts with one more card
            const TOTAL_BLUE_CARDS = 8;
            const TOTAL_BYSTANDER_CARDS = 7;
            const TOTAL_ASSASSIN_CARDS = 1;
            const TOTAL_CARDS_ON_BOARD = 25;

            /**
             * Shuffles an array in place using the Fisher-Yates (Knuth) algorithm.
             * @param {Array} array The array to shuffle.
             * @returns {Array} The shuffled array.
             */
            function shuffleArray(array) {
                let currentIndex = array.length, randomIndex;

                // While there remain elements to shuffle.
                while (currentIndex !== 0) {
                    // Pick a remaining element.
                    randomIndex = Math.floor(Math.random() * currentIndex);
                    currentIndex--;

                    // And swap it with the current element.
                    [array[currentIndex], array[randomIndex]] = [
                        array[randomIndex], array[currentIndex]
                    ];
                }
                return array;
            }

            /**
             * Initializes the Codenames game board.
             * If spymasterCode is provided, it loads the board from the code.
             * Otherwise, it generates a new random board.
             * @param {string} [spymasterCode] Optional code string to load a specific board.
             */
            function initializeBoard(spymasterCode = null) {
                boardElement.innerHTML = ''; // Clear existing cards
                revealedCardsCount = { red: 0, blue: 0 }; // Reset revealed counts

                if (spymasterCode) {
                    try {
                        gameBoard = parseSpymasterCode(spymasterCode);
                        displayMessage("Spymaster View: Board loaded from code.");
                        // For spymaster view, all cards are effectively "revealed" from the start visually
                        // Add spymaster-mode class to disable clicks via CSS
                        boardElement.classList.add('spymaster-mode');
                        showAnswerBtn.style.display = 'none'; // Hide "Show Answer" button in spymaster view
                        spymasterCodeOutput.value = spymasterCode; // Display the loaded code
                    } catch (error) {
                        displayMessage(`Error loading code: ${error.message}. Generating new random game.`);
                        // Fallback to new random game if code is invalid
                        generateNewRandomBoard();
                        boardElement.classList.remove('spymaster-mode'); // Ensure clicks are enabled for normal game
                        showAnswerBtn.style.display = 'inline-block'; // Show "Show Answer" button
                    }
                } else {
                    generateNewRandomBoard();
                    boardElement.classList.remove('spymaster-mode'); // Ensure clicks are enabled for normal game
                    showAnswerBtn.style.display = 'inline-block'; // Show "Show Answer" button
                }
                renderBoard();
            }

            /**
             * Generates a new random Codenames board.
             */
            function generateNewRandomBoard() {
                // Create a copy of all words and shuffle them
                const shuffledWords = shuffleArray([...allCodenamesWords]);
                const selectedWordsWithIndices = [];

                // Select 25 unique words and store their original indices from allCodenamesWords
                for (let i = 0; i < TOTAL_CARDS_ON_BOARD; i++) {
                    const word = shuffledWords[i];
                    const originalIndex = allCodenamesWords.indexOf(word); // Find original index
                    selectedWordsWithIndices.push({ word: word, originalIndex: originalIndex });
                }

                // Create an array of card types based on Codenames rules
                const types = [];
                for (let i = 0; i < TOTAL_RED_CARDS; i++) types.push('red');
                for (let i = 0; i < TOTAL_BLUE_CARDS; i++) types.push('blue');
                for (let i = 0; i < TOTAL_BYSTANDER_CARDS; i++) types.push('bystander');
                types.push('assassin');
                const shuffledTypes = shuffleArray(types);

                // Combine words with their assigned types and original indices
                gameBoard = selectedWordsWithIndices.map((wordObj, index) => ({
                    word: wordObj.word,
                    type: shuffledTypes[index],
                    revealed: false, // Cards start unrevealed in a normal game
                    originalIndex: wordObj.originalIndex // Store original index for code generation
                }));

                // Randomly determine starting team
                currentTurn = (Math.random() < 0.5) ? 'red' : 'blue';
                displayMessage(`It's the ${currentTurn.toUpperCase()} team's turn!`);

                // Generate and display the code for the newly created board
                spymasterCodeOutput.value = generateSpymasterCode();
            }

            /**
             * Generates a compact code string representing the current board layout.
             * Format: "INDEX-TYPECHAR,INDEX-TYPECHAR,..."
             * INDEX is 3 digits padded with leading zeros (e.g., 005, 123).
             * TYPECHAR: R=red, B=blue, Y=bystander, A=assassin.
             * @returns {string} The generated spymaster code.
             */
            function generateSpymasterCode() {
                const typeMap = {
                    'red': 'R',
                    'blue': 'B',
                    'bystander': 'Y',
                    'assassin': 'A'
                };
                return gameBoard.map(card => {
                    // Pad index with leading zeros to ensure consistent length (e.g., 5 -> "005")
                    const indexStr = String(card.originalIndex).padStart(3, '0');
                    const typeChar = typeMap[card.type];
                    return `${indexStr}-${typeChar}`;
                }).join(',');
            }

            /**
             * Parses a spymaster code string into a gameBoard array for spymaster view.
             * @param {string} codeString The code to parse.
             * @returns {Array<Object>} An array of card objects for the gameBoard.
             * @throws {Error} If the code format is invalid or words are out of range.
             */
            function parseSpymasterCode(codeString) {
                const typeMapReverse = {
                    'R': 'red',
                    'B': 'blue',
                    'Y': 'bystander',
                    'A': 'assassin'
                };
                const parsedBoard = [];
                const parts = codeString.split(',');

                if (parts.length !== TOTAL_CARDS_ON_BOARD) {
                    throw new Error(`Invalid code length. Expected ${TOTAL_CARDS_ON_BOARD} cards, got ${parts.length}.`);
                }

                for (const part of parts) {
                    const [indexStr, typeChar] = part.split('-');
                    const originalIndex = parseInt(indexStr, 10);
                    const type = typeMapReverse[typeChar];

                    // Validate parsed data
                    if (isNaN(originalIndex) || originalIndex < 0 || originalIndex >= allCodenamesWords.length || !type) {
                        throw new Error(`Invalid card format in code: "${part}".`);
                    }

                    parsedBoard.push({
                        word: allCodenamesWords[originalIndex],
                        type: type,
                        revealed: true, // Always revealed in spymaster mode
                        originalIndex: originalIndex
                    });
                }
                return parsedBoard;
            }

            /**
             * Renders the game board based on the current gameBoard array.
             */
            function renderBoard() {
                boardElement.innerHTML = ''; // Clear existing cards
                gameBoard.forEach((card, index) => {
                    const cardElement = document.createElement('div');
                    cardElement.classList.add('card');
                    cardElement.dataset.index = index; // Store index to access gameBoard data
                    cardElement.textContent = card.word;

                    // If card is revealed (either by click or because it's spymaster mode)
                    if (card.revealed) {
                        cardElement.classList.add('revealed', card.type);
                    }

                    // Add click listener only if not revealed and not in spymaster mode
                    // The 'spymaster-mode' class on boardElement will handle disabling clicks via CSS
                    if (!card.revealed && !boardElement.classList.contains('spymaster-mode')) {
                        cardElement.addEventListener('click', () => revealCard(cardElement, index));
                    }

                    boardElement.appendChild(cardElement);
                });
            }

            /**
             * Handles the revelation of a card.
             * @param {HTMLElement} cardElement The HTML element of the clicked card.
             * @param {number} index The index of the card in the gameBoard array.
             */
            function revealCard(cardElement, index) {
                const card = gameBoard[index];

                // If card is already revealed or in spymaster mode, do nothing
                if (card.revealed || boardElement.classList.contains('spymaster-mode')) {
                    return;
                }

                card.revealed = true; // Mark as revealed
                cardElement.classList.add('revealed', card.type); // Add revealed class and type class

                switch (card.type) {
                    case 'red':
                        revealedCardsCount.red++;
                        displayMessage(`Red team revealed "${card.word}". Red cards remaining: ${TOTAL_RED_CARDS - revealedCardsCount.red}`);
                        break;
                    case 'blue':
                        revealedCardsCount.blue++;
                        displayMessage(`Blue team revealed "${card.word}". Blue cards remaining: ${TOTAL_BLUE_CARDS - revealedCardsCount.blue}`);
                        break;
                    case 'bystander':
                        displayMessage(`Bystander revealed "${card.word}". Turn ends.`);
                        // In a real game, this would end the turn for the current team.
                        break;
                    case 'assassin':
                        displayMessage(`ASSASSIN revealed! "${card.word}". Game Over!`);
                        endGame('assassin');
                        return; // Stop further game logic if assassin is hit
                }

                checkWinCondition();
            }

            /**
             * Checks if a team has won the game.
             */
            function checkWinCondition() {
                if (revealedCardsCount.red === TOTAL_RED_CARDS) {
                    endGame('red');
                } else if (revealedCardsCount.blue === TOTAL_BLUE_CARDS) {
                    endGame('blue');
                }
            }

            /**
             * Ends the game and displays the winner or game over message.
             * @param {string} winner The winning team ('red', 'blue') or 'assassin'.
             */
            function endGame(winner) {
                // Ensure all cards are shown and not clickable at game end
                showAllCards(); // Reveal any remaining unrevealed cards
                boardElement.classList.add('spymaster-mode'); // Disable further clicks

                if (winner === 'red') {
                    displayMessage('Red team wins! Congratulations!');
                } else if (winner === 'blue') {
                    displayMessage('Blue team wins! Congratulations!');
                } else if (winner === 'assassin') {
                    // The team that revealed the assassin loses.
                    displayMessage('Game Over! The Assassin was revealed!');
                }
            }

            /**
             * Displays a message in the message box.
             * @param {string} message The message to display.
             */
            function displayMessage(message) {
                messageBox.textContent = message;
            }

            /**
             * Reveals all cards on the board, used for the "Show Answer" button or end of game.
             * This function is also called by endGame and in spymaster mode to ensure all are revealed.
             */
            function showAllCards() {
                gameBoard.forEach((card, index) => {
                    if (!card.revealed) { // Only reveal if not already revealed
                        const cardElement = boardElement.querySelector(`[data-index="${index}"]`);
                        if (cardElement) {
                            card.revealed = true; // Update internal state
                            cardElement.classList.add('revealed', card.type); // Apply classes
                        }
                    }
                });
                boardElement.classList.add('spymaster-mode'); // Ensure clicks are disabled after showing answers
            }

            // Event Listeners for control buttons
            newGameBtn.addEventListener('click', () => initializeBoard()); // Call without code for new game
            showAnswerBtn.addEventListener('click', showAllCards); // Show all answers for current game

            // Event Listener for loading game from spymaster code
            loadGameBtn.addEventListener('click', () => {
                const code = spymasterCodeInput.value.trim();
                if (code) {
                    initializeBoard(code); // Initialize board with the provided code
                } else {
                    displayMessage("Please enter a spymaster code to load.");
                }
            });

            // Initial game setup when the page loads
            initializeBoard();
        });