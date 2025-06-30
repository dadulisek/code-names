 // Ensure the DOM is fully loaded before running the script
        document.addEventListener('DOMContentLoaded', () => {
            const boardElement = document.getElementById('board');
            const messageBox = document.getElementById('message-box');
            const newGameBtn = document.getElementById('new-game-btn');
            const showAnswerBtn = document.getElementById('show-answer-btn');

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

            let gameBoard = []; // Stores the current game board (word and type)
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
             * Selects 25 random words and assigns types (red, blue, bystander, assassin).
             */
            function initializeBoard() {
                // Shuffle all available words
                const shuffledWords = shuffleArray([...allCodenamesWords]);

                // Select the first 25 words for the current game
                const selectedWords = shuffledWords.slice(0, TOTAL_CARDS_ON_BOARD);

                // Create an array of card types
                const types = [];
                for (let i = 0; i < TOTAL_RED_CARDS; i++) types.push('red');
                for (let i = 0; i < TOTAL_BLUE_CARDS; i++) types.push('blue');
                for (let i = 0; i < TOTAL_BYSTANDER_CARDS; i++) types.push('bystander');
                types.push('assassin');

                // Shuffle the types to randomize their assignment to words
                const shuffledTypes = shuffleArray(types);

                // Combine words with their assigned types
                gameBoard = selectedWords.map((word, index) => ({
                    word: word,
                    type: shuffledTypes[index],
                    revealed: false
                }));

                // Randomly determine starting team
                currentTurn = (Math.random() < 0.5) ? 'red' : 'blue';
                // Adjust card counts based on starting team
                if (currentTurn === 'red') {
                    // Red already has 9, Blue 8. No change needed to totals as defined.
                } else {
                    // If blue starts, they still need 8, red still needs 9.
                    // The "extra" card goes to the starting team.
                    // For simplicity in this basic demo, we'll keep the static 9/8.
                    // A proper implementation would swap one red for one blue if blue starts.
                    // For now, red always has 9 and blue 8, and starting team is just for messaging.
                }

                revealedCardsCount = { red: 0, blue: 0 }; // Reset revealed counts
                displayMessage(`It's the ${currentTurn.toUpperCase()} team's turn!`);
                renderBoard();
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

                    if (card.revealed) {
                        cardElement.classList.add('revealed', card.type);
                    }

                    // Add click listener only if not revealed
                    if (!card.revealed) {
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

                // If card is already revealed, do nothing
                if (card.revealed) {
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
                // Remove all click listeners from cards
                boardElement.querySelectorAll('.card:not(.revealed)').forEach(cardElement => {
                    cardElement.style.pointerEvents = 'none'; // Disable clicks
                });

                if (winner === 'red') {
                    displayMessage('Red team wins! Congratulations!');
                } else if (winner === 'blue') {
                    displayMessage('Blue team wins! Congratulations!');
                } else if (winner === 'assassin') {
                    // The team that revealed the assassin loses.
                    // For simplicity, we just say "Game Over!".
                    displayMessage('Game Over! The Assassin was revealed!');
                }
                showAllCards(); // Reveal all remaining cards for end-game review
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
             */
            function showAllCards() {
                gameBoard.forEach((card, index) => {
                    if (!card.revealed) {
                        const cardElement = boardElement.querySelector(`[data-index="${index}"]`);
                        if (cardElement) {
                            card.revealed = true;
                            cardElement.classList.add('revealed', card.type);
                            cardElement.style.pointerEvents = 'none'; // Disable clicks
                        }
                    }
                });
            }

            // Event Listeners for control buttons
            newGameBtn.addEventListener('click', initializeBoard);
            showAnswerBtn.addEventListener('click', showAllCards);

            // Initial game setup when the page loads
            initializeBoard();
        });