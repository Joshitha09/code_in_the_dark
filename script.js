let playerName = "";
let currentRound = 0;
let timer;
let codeHidden = false;
let gameSecondsElapsed = 0;
let gameTimerInterval;
let score = 0;
let selectedLanguage = "python"; // Default language
let tabSwitchCount = 0;
let isInFullscreen = false;
let fullscreenWarningShown = false;


function enterFullscreen() {
    const elem = document.documentElement;
    const requestFs = elem.requestFullscreen || 
                    elem.webkitRequestFullscreen || 
                    elem.msRequestFullscreen;
    
    if (requestFs) {
        requestFs.call(elem).catch(err => {
            console.error("Fullscreen error:", err);
            // Retry aggressively
            setTimeout(() => enterFullscreen(), 500);
        });
    }
    isInFullscreen = true;
}
function skipQuestion() {
    currentRound++;
    if (currentRound >= codeSnippets.length) {
        clearInterval(gameTimerInterval);
        document.getElementById("game-container").innerHTML = `
    <div class="congratulations-screen">
        <h2>🎉 Congratulations, ${playerName}! 🎉</h2>
        <h3>You fixed all the codes in ${formatTime(gameSecondsElapsed)}!</h3>
        <h3>Final score: ${score} points</h3>
        <h3>Tab switches: ${tabSwitchCount}</h3>
    </div>
`;
        
        // Add slight delay before exiting fullscreen
        setTimeout(() => {
            exitFullscreen();
        }, 1000);
        return;
    }
    loadNextCode();
}


// Show warning and re-enter fullscreen
function showExitWarning() {
    // Only show warning if we're actually in the game
    if (isInFullscreen && document.getElementById("game-container").style.display === "block") {
        // Try to re-enter fullscreen first
        enterFullscreen();
        
        // Then show the warning if still not in fullscreen
        setTimeout(() => {
            if (!isInFullscreen) {
                alert(`⚠ Warning! You've switched tabs ${tabSwitchCount} time(s).\nThe game requires fullscreen mode.`);
                enterFullscreen();
            }
        }, 300);
    }
}

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        tabSwitchCount++;
        // Immediately attempt to regain fullscreen
        enterFullscreen();
    }
});

// Prevent context menu
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    alert("Right-click is disabled during the game!");
});

function handleFullscreenChange() {
    isInFullscreen = !!document.fullscreenElement || 
                   !!document.webkitFullscreenElement || 
                   !!document.msFullscreenElement;
    
    // If game is active and not in fullscreen, force it back
    if (!isInFullscreen && document.getElementById("game-container").style.display === "block") {
        // Show brief notification instead of confirm()
        const warning = document.createElement('div');
        warning.textContent = "⚠ Auto-returning to fullscreen mode...";
        warning.style = "position:fixed; top:20px; left:50%; transform:translateX(-50%); background:red; color:white; padding:10px; z-index:9999; border-radius:5px;";
        document.body.appendChild(warning);
        
        setTimeout(() => warning.remove(), 2000);
        
        // Force re-entry without user interaction
        setTimeout(() => enterFullscreen(), 300);
    }
}// Use a single handler for all browser variants
document.addEventListener('fullscreenchange', handleFullscreenChange);
document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
document.addEventListener('msfullscreenchange', handleFullscreenChange);


// Language-specific code snippets
const allCodeSnippets = {
    python: [
        {
            buggy: "def find_max(arr):\n    max_value = arr[0]\n    for i in range(1, len(arr)):\n        if arr[i] > max_value:\n            max_value += arr[i]\n    return max_value",
            correct: "max_value = arr[i]"
        },
        {
            buggy: "def is_armstrong(num):\n    total = 0\n    temp = num\n    n = len(str(num))\n\n    while temp > 0:\n        digit = temp % 10\n        total += digit ** n\n        temp // 10\n    return total == num",
            correct: "temp = temp // 10"
        },
        {
            buggy: "def find_duplicate(arr):\n    for i in range(len(arr)):\n        for j in range(i + 1, len(arr)):\n            if arr[i] = arr[j]:\n                return arr[i]\n    return -1",
            correct: "if arr[i] == arr[j]:"
        },
        {
            buggy: "def column_sums(matrix):\n    m = len(matrix[0]) if matrix else 0  \n    sum_cols = [0] * m  \n    for row in matrix:\n        for j in range(m):\n            sum_cols[j] += row[j]  \n    print(sum_cols )",
            correct: "print(sum_cols)"
        },
        {
            buggy: "def bubble_sort(arr):\n    n = len(arr)\n    for i in range(n):\n        for j in range(n - i - 1):\n            if arr[j] > arr[j + 1]:\n                arr[j], arr[j + 1] == arr[j + 1], arr[j]\n    return arr",
            correct: "arr[j], arr[j + 1] = arr[j + 1], arr[j]"
        },
        {
            buggy: "def factorial(n):\n    fact = 1\n    for i in range(1, n):`\n        fact *= i\n    return fact",
            correct: "for i in range(1, n + 1):"
        },
        {
            buggy: "def reverse_number(n):\n    rev = 0\n    is_negative = n < 0\n    if is_negative:\n        n = -n\n\n    while n > 0:\n        rev = (rev * 10) + (n % 10)\n        n / /10\n    return -rev if is_negative else rev",
            correct: "n = n // 10"
        },
        {
            buggy: "def binary_search(arr, target):\n    left, right = 0, len(arr) - 1\n    \n    while left < right:\n        mid = (left + right) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    \n    return -1",
            correct: "while left <= right:"
        },
        {
            buggy: "def fibonacci(n):\n    if n == 0:\n        return 0\n    if n == 1:\n        return 1\n    return fibonacci(n - 1) + fibonacci(n - 2)",
            correct: "return 1 if n == 1 else fibonacci(n - 1) + fibonacci(n - 2)"
        },
        {
            buggy: "def row_sums(matrix):\n    for row in matrix:\n        sum_row = 0\n        for num in row:\n            sum_row += num  \n        print(sum)\n",
            correct: "print(sum_row)"
        }
    ],
    c: [
        {
            buggy: "#include <stdio.h>\n\nint find_max(int arr[], int size) {\n    int max_value = arr[0];\n    for (int i = 1; i < size; i++) {\n        if (arr[i] > max_value) {\n            max_value += arr[i];\n        }\n    }\n    return max_value;\n}",
            correct: "max_value = arr[i];"
        },
        {
            buggy: "#include <stdio.h>\n\nint is_armstrong(int num) {\n    int total = 0, temp = num, n = 0;\n    for (int t = num; t > 0; t /= 10) n++;\n    while (temp > 0) {\n        int digit = temp % 10;\n        total += pow(digit, n);\n        temp / 10;\n    }\n    return total == num;\n}",
            correct: "temp = temp / 10;"
        },
        {
            buggy: "#include <stdio.h>\n\nint find_duplicate(int arr[], int size) {\n    for (int i = 0; i < size; i++) {\n        for (int j = i + 1; j < size; j++) {\n            if (arr[i] = arr[j]) {\n                return arr[i];\n            }\n        }\n    }\n    return -1;\n}",
            correct: "if (arr[i] == arr[j])"
        },
        {
            buggy: "#include <stdio.h>\n\nvoid column_sums(int matrix[][3], int rows) {\n    int sum_cols[3] = {0};\n    for (int i = 0; i < rows; i++) {\n        for (int j = 0; j < 3; j++) {\n            sum_cols[j] =+ matrix[i][j];\n        }\n    }\n    printf(\"%d %d %d\", sum_cols[0], sum_cols[1], sum_cols[2]);\n}",
            correct: "sum_cols[j] += matrix[i][j];"
        },
        {
            buggy: "#include <stdio.h>\n\nvoid bubble_sort(int arr[], int size) {\n    for (int i = 0; i < size; i++) {\n        for (int j = 0; j < size - i - 1; j++) {\n            if (arr[j] > arr[j + 1]) {\n                arr[j], arr[j + 1] == arr[j + 1], arr[j];\n            }\n        }\n    }\n}",
            correct: "arr[j] = arr[j + 1]; arr[j + 1] = arr[j];"
        },
        {
            buggy: "#include <stdio.h>\n\nint factorial(int n) {\n    int fact = 1;\n    for (int i = 1; i < n; i++) {\n        fact *= i;\n    }\n    return fact;\n}",
            correct: "for (int i = 1; i <= n; i++)"
        },
        {
            buggy: "#include <stdio.h>\n\nint reverse_number(int n) {\n    int rev = 0;\n    int is_negative = n < 0;\n    if (is_negative) n = -n;\n    while (n > 0) {\n        rev = (rev * 10) + (n % 10);\n        n / /10;\n    }\n    return is_negative ? -rev : rev;\n}",
            correct: "n = n / 10;"
        },
        {
            buggy: "#include <stdio.h>\n\nint binary_search(int arr[], int size, int target) {\n    int left = 0, right = size - 1;\n    while (left < right) {\n        int mid = (left + right) / 2;\n        if (arr[mid] == target) return mid;\n        else if (arr[mid] < target) left = mid + 1;\n        else right = mid - 1;\n    }\n    return -1;\n}",
            correct: "while (left <= right)"
        },
        {
            buggy: "#include <stdio.h>\n\nint fibonacci(int n) {\n    if (n == 0) return 0;\n    if (n == 1) return 1;\n    fibonacci(n - 1) + fibonacci(n - 2);\n}",
            correct: "return fibonacci(n - 1) + fibonacci(n - 2);"
        },
        {
            buggy: "#include <stdio.h>\n\nvoid row_sums(int matrix[][3], int rows) {\n    for (int i = 0; i < rows; i++) {\n        int sum_row = 0;\n        for (int j = 0; j < 3; j++) {\n            sum_row += matrix[i][j];\n        }\n        printf(\"%d\n\", sum);\n    }\n}",
            correct: "printf(\"%d\n\", sum_row);"
        }
    ],
    java: [
        {
            buggy: "class FindMax {\n    public static int findMax(int[] arr) {\n        int maxValue = arr[0];\n        for (int i = 1; i < arr.length; i++) {\n            if (arr[i] > maxValue) {\n                maxValue += arr[i];\n            }\n        }\n        return maxValue;\n    }\n}",
            correct: "maxValue = arr[i];"
        },
        {
            buggy: "class ArmstrongNumber {\n    public static boolean isArmstrong(int num) {\n        int total = 0, temp = num;\n        int n = String.valueOf(num).length();\n        \n        while (temp > 0) {\n            int digit = temp % 10;\n            total += Math.pow(digit, n);\n            temp / 10;\n        }\n        return total == num;\n    }\n}",
            correct: "temp = temp / 10;"
        },
        {
            buggy: "class FindDuplicate {\n    public static int findDuplicate(int[] arr) {\n        for (int i = 0; i < arr.length; i++) {\n            for (int j = i + 1; j < arr.length; j++) {\n                if (arr[i] = arr[j]) {\n                    return arr[i];\n                }\n            }\n        }\n        return -1;\n    }\n}",
            correct: "if (arr[i] == arr[j])"
        },
        {
            buggy: "class ColumnSums {\n    public static void columnSums(int[][] matrix) {\n        int cols = matrix[0].length;\n        int[] sumCols = new int[cols];\n        \n        for (int[] row : matrix) {\n            for (int j = 0; j < cols; j++) {\n                sumCols[j] =+ row[j];\n            }\n        }\n        System.out.println(Arrays.toString(sumCols));\n    }\n}",
            correct: "sumCols[j] =+ row[j];"
        },
        {
            buggy: "class BubbleSort {\n    public static void bubbleSort(int[] arr) {\n        int n = arr.length;\n        for (int i = 0; i < n; i++) {\n            for (int j = 0; j < n - i - 1; j++) {\n                if (arr[j] > arr[j + 1]) {\n                    arr[j], arr[j + 1] == arr[j + 1], arr[j];\n                }\n            }\n        }\n    }\n}",
            correct: "arr[j] = arr[j + 1]; arr[j + 1] = temp;"
        },
        {
            buggy: "class Factorial {\n    public static int factorial(int n) {\n        int fact = 1;\n        for (int i = 1; i < n; i++) {\n            fact *= i;\n        }\n        return fact;\n    }\n}",
            correct: "for (int i = 1; i <= n; i++)"
        },
        {
            buggy: "class ReverseNumber {\n    public static int reverseNumber(int n) {\n        int rev = 0;\n        boolean isNegative = n < 0;\n        if (isNegative) n = -n;\n        \n        while (n > 0) {\n            rev = (rev * 10) + (n % 10);\n            n / /10;\n        }\n        return isNegative ? -rev : rev;\n    }\n}",
            correct: "n = n / 10;"
        },
        {
            buggy: "class BinarySearch {\n    public static int binarySearch(int[] arr, int target) {\n        int left = 0, right = arr.length - 1;\n        while (left < right) {\n            int mid = (left + right) / 2;\n            if (arr[mid] == target) return mid;\n            else if (arr[mid] < target) left = mid + 1;\n            else right = mid - 1;\n        }\n        return -1;\n    }\n}",
            correct: "while (left <= right)"
        },
        {
            buggy: "class Fibonacci {\n    public static int fibonacci(int n) {\n        if (n == 0) return 0;\n        if (n == 1) return 1;\n        fibonacci(n - 1) + fibonacci(n - 2);\n    }\n}",
            correct: "return fibonacci(n - 1) + fibonacci(n - 2);"
        },
        {
            buggy: "class RowSums {\n    public static void rowSums(int[][] matrix) {\n        for (int[] row : matrix) {\n            int sumRow = 0;\n            for (int num : row) {\n                sumRow += num;\n            }\n            System.out.println(sum);\n        }\n    }\n}",
            correct: "System.out.println(sumRow);"
        }
    ]

};

let codeSnippets = [];

// Enhanced copy-paste prevention
function disableCopyPaste() {
    // Prevent cut, copy, paste
    document.addEventListener('cut', (e) => {
        e.preventDefault();
        showTemporaryWarning("Cutting is disabled in this game!");
        return false;
    });

    document.addEventListener('copy', (e) => {
        e.preventDefault();
        showTemporaryWarning("Copying is disabled in this game!");
        return false;
    });

    document.addEventListener('paste', (e) => {
        e.preventDefault();
        showTemporaryWarning("Pasting is disabled in this game!");
        return false;
    });

    // Prevent right-click context menu
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showTemporaryWarning("Right-click is disabled in this game!");
        return false;
    });

    // Prevent drag-and-drop
    document.addEventListener('dragstart', (e) => {
        e.preventDefault();
        return false;
    });

    document.addEventListener('drop', (e) => {
        e.preventDefault();
        showTemporaryWarning("Drag-and-drop is disabled in this game!");
        return false;
    });

    // Prevent keyboard shortcuts (Ctrl+C, Ctrl+V, etc.)
    document.addEventListener('keydown', (e) => {
        // Disable Ctrl/CMD + C, V, X
        if ((e.ctrlKey || e.metaKey) && 
            (e.key === 'c' || e.key === 'C' || 
             e.key === 'v' || e.key === 'V' || 
             e.key === 'x' || e.key === 'X')) {
            e.preventDefault();
            showTemporaryWarning("Shortcut keys are disabled in this game!");
            return false;
        }
        
        // Disable Print Screen
        if (e.key === 'PrintScreen') {
            e.preventDefault();
            return false;
        }
    });

    // Prevent text selection
    document.addEventListener('selectstart', (e) => {
        e.preventDefault();
        return false;
    });
}

function showTemporaryWarning(message) {
    const warning = document.createElement('div');
    warning.className = 'copy-warning';
    warning.textContent = message;
    document.body.appendChild(warning);
    
    setTimeout(() => {
        warning.classList.add('fade-out');
        setTimeout(() => warning.remove(), 300);
    }, 2000);
}



// Call this function when the game starts
function startGame() {
    disableCopyPaste();
    playerName = document.getElementById("player-name").value.trim();
    if (playerName === "") {
        showAlert("Please enter your name!", "error");
        return;
    }

    // Update player display
    document.getElementById("player-display").textContent = playerName;
    
    // Get selected language
    const languageRadios = document.getElementsByName("language");
    for (const radio of languageRadios) {
        if (radio.checked) {
            selectedLanguage = radio.value;
            break;
        }
    }

    // Start game
    enterFullscreen();
    codeSnippets = getRandomCodeSnippets(3, selectedLanguage);
    currentRound = 0;
    revealCount = 3;
    score = 0;
    
    document.getElementById("welcome-screen").style.display = "none";
    document.getElementById("game-container").style.display = "block";
    
    gameSecondsElapsed = 0;
    updateGameTimer();
    updateScore();
    gameTimerInterval = setInterval(updateGameTimer, 1000);
    
    loadNextCode();
}

function showAlert(message, type = "info") {
    const alert = document.createElement("div");
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <i class="fas fa-${type === "error" ? "exclamation-circle" : type === "success" ? "check-circle" : "info-circle"}"></i>
        ${message}
    `;
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.classList.add("fade-out");
        setTimeout(() => alert.remove(), 300);
    }, 3000);
}

function getRandomCodeSnippets(count, language) {
    const snippets = allCodeSnippets[language];
    const shuffled = [...snippets].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

document.getElementById("skip-button").addEventListener("click", skipQuestion);

function loadNextCode() {
    if (currentRound >= codeSnippets.length) {
        clearInterval(gameTimerInterval);
        fullscreenWarningShown = true;
        
        // Create falling ribbons
        createRibbons();
        
        document.getElementById("game-container").innerHTML = `
            <div class="congratulations-screen">
                <h2>🎉 Congratulations, ${playerName}! 🎉</h2>
                <h3>You fixed all the codes in ${formatTime(gameSecondsElapsed)}!</h3>
                <h3>Final score: ${score} points</h3>
                <h3>Tab switches: ${tabSwitchCount}</h3>
            </div>
        `;
        exitFullscreen();
        return;
    }

    let currentCode = codeSnippets[currentRound];
    document.getElementById("code-display").innerText = currentCode.buggy;
    document.getElementById("code-box").value = "";
    document.getElementById("result-message").innerText = "";

    // Reset reveal button for new question
    document.getElementById("reveal-btn").innerText = "Reveal Code (3 left)";
    document.getElementById("reveal-btn").disabled = true; // Will be enabled when timer runs out
    
    resetUIForNewRound();
    startTimer();
}

function startTimer() {
    let timeLeft = 20;
    document.getElementById("timer").innerText = `Code disappears in: ${timeLeft} sec`;
    codeHidden = false;

    clearInterval(timer);
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById("timer").innerText = `Code disappears in: ${timeLeft} sec`;

        if (timeLeft <= 0) {
            clearInterval(timer);
            document.getElementById("code-display").innerText = "Code hidden!";
            
            // Enable input and buttons when code disappears
            document.getElementById("code-box").disabled = false;
            document.getElementById("submit-btn").disabled = false;
            document.getElementById("reveal-btn").disabled = false; // Enable reveal button

            codeHidden = true;
        }
    }, 1000);
}

function checkAnswer() {
    let userInput = document.getElementById("code-box").value.trim();
    let correctAnswer = codeSnippets[currentRound].correct.trim();
    let currentCode = codeSnippets[currentRound].buggy;
    
    // Normalize both strings for comparison
    const normalize = (str) => {
        // Standardize line endings
        str = str.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        // Collapse multiple spaces into one
        str = str.replace(/[ \t]+/g, ' ');
        // Remove spaces around operators and brackets
        str = str.replace(/\s*([=+\-*/%!<>]=?|\(|\)|\[|\]|,|;)\s*/g, '$1');
        // Trim start/end
        return str.trim();
    };

    const normalizedInput = normalize(userInput);
    const normalizedCorrect = normalize(correctAnswer);

    const resultMessage = document.getElementById("result-message");
    
    if (normalizedInput === normalizedCorrect) {
        // Get the output of the correct code
        const output = getCodeOutput(selectedLanguage, currentCode.replace(correctAnswer, userInput));
        
        score += 20;
        resultMessage.innerHTML = `
            <i class="fas fa-check-circle"></i> Correct! 
            <div class="output-display">Output: ${output}</div>
            Moving to the next level...`;
        resultMessage.className = "correct";
        updateScore();
        
        setTimeout(() => {
            currentRound++;
            loadNextCode();
        }, 2500); // Increased delay to show output
    } else {
        score -= 2;
        resultMessage.innerHTML = `
            <i class="fas fa-times-circle"></i> Incorrect! Try again.
            <div class="output-display">Expected output: ${getCodeOutput(selectedLanguage, currentCode)}</div>`;
        resultMessage.className = "incorrect";
        updateScore();
    }
}

// Mock function to get code output (in a real app, you'd use a proper execution environment)
function getCodeOutput(language, code) {
    // This is a simplified mock - in reality you'd need a proper code execution environment
    const mockOutputs = {
        python: {
            "find_max": "9",
            "is_armstrong": "True",
            "find_duplicate": "2",
            "column_sums": "[6, 15, 24]",
            "bubble_sort": "[1, 2, 3, 4, 5]",
            "factorial": "120",
            "reverse_number": "54321",
            "binary_search": "4",
            "fibonacci": "5",
            "row_sums": "[6, 15, 24]"
        },
        c: {
            "find_max": "9",
            "is_armstrong": "1",
            "find_duplicate": "2",
            "column_sums": "6 15 24",
            "bubble_sort": "1 2 3 4 5",
            "factorial": "120",
            "reverse_number": "54321",
            "binary_search": "4",
            "fibonacci": "5",
            "row_sums": "6\n15\n24"
        },
        java: {
            "findMax": "9",
            "isArmstrong": "true",
            "findDuplicate": "2",
            "columnSums": "[6, 15, 24]",
            "bubbleSort": "[1, 2, 3, 4, 5]",
            "factorial": "120",
            "reverseNumber": "54321",
            "binarySearch": "4",
            "fibonacci": "5",
            "rowSums": "6\n15\n24"
        }
    };

    // Extract function name from code
    const funcMatch = code.match(/def\s+(\w+)|int\s+(\w+)|boolean\s+(\w+)|void\s+(\w+)/);
    const funcName = funcMatch ? (funcMatch[1] || funcMatch[2] || funcMatch[3] || funcMatch[4]) : "";
    
    return mockOutputs[language][funcName] || "Output not available";
}

function revealCode() {
    let revealBtn = document.getElementById("reveal-btn");
    let currentReveals = parseInt(revealBtn.innerText.match(/\((\d+) left\)/)[1]);
    
    if (currentReveals > 0) {
        document.getElementById("code-display").innerText = codeSnippets[currentRound].buggy;
        currentReveals--;
        revealBtn.innerText = `Reveal Code (${currentReveals} left)`;

        if (currentReveals === 0) {
            revealBtn.disabled = true;
        }

        // Restart the timer when the code is revealed again
        resetUIForNewRound();
        startTimer();
    }
}

function resetUIForNewRound() {
    document.getElementById("code-box").disabled = true;
    document.getElementById("submit-btn").disabled = true;
    document.getElementById("reveal-btn").disabled = true;
}

document.getElementById("code-box").addEventListener("keydown", function(event) {
    if (!codeHidden) {
        event.preventDefault();
        document.getElementById("result-message").innerText = "⚠ You can only type after the code disappears!";
        setTimeout(() => {
            document.getElementById("result-message").innerText = "";
        }, 2000); // Clear message after 2 seconds
    }
});

document.getElementById("code-box").addEventListener('drop', (e) => {
    e.preventDefault();
    document.getElementById("result-message").innerText = "⚠ Dragging text is disabled!";
    setTimeout(() => {
        document.getElementById("result-message").innerText = "";
    }, 2000);
});

document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        document.getElementById("result-message").innerText = "⚠ Pasting is disabled!";
        setTimeout(() => {
            document.getElementById("result-message").innerText = "";
        }, 2000);
    }
});


function updateGameTimer() {
    gameSecondsElapsed++;
    let minutes = Math.floor(gameSecondsElapsed / 60);
    let seconds = gameSecondsElapsed % 60;
    document.getElementById("game-timer").innerText = `Time: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function updateScore() {
    document.getElementById("game-score").innerText = `Score: ${score}`;
}
function skipQuestion() {
    currentRound++;
    if (currentRound >= codeSnippets.length) {
        clearInterval(gameTimerInterval);
        
        // Create celebration effects
        createRibbons();
        createConfettiBurst();
        
        document.getElementById("game-container").innerHTML = `
            <div class="congratulations-screen">
                <div class="dancing-character"></div>
                <h2>🎉 Congratulations, ${playerName}! 🎉</h2>
                <h3>You fixed all the codes in ${formatTime(gameSecondsElapsed)}!</h3>
                <h3>Final score: ${score} points</h3>
                <h3>Tab switches: ${tabSwitchCount}</h3>
            </div>
        `;
        
        // Add floating balloons
        createBalloons();
        
        setTimeout(() => {
            exitFullscreen();
        }, 1000);
        return;
    }
    loadNextCode();
}

function createRibbons() {
    const colors = [
        '#ff3366', '#ff6633', '#ffcc33', '#33cc33',
        '#3399ff', '#cc33ff', '#ff33cc', '#ffcc00',
        '#00ccff', '#ff00cc', '#ccff00', '#00ffcc'
    ];
    
    // Create initial ribbons
    for (let i = 0; i < 30; i++) {
        createConfetti(colors);
    }
    
    // Continue creating ribbons
    const ribbonInterval = setInterval(() => {
        for (let i = 0; i < 10; i++) {
            createConfetti(colors);
        }
    }, 1000);
    
    // Stop after 10 seconds
    setTimeout(() => {
        clearInterval(ribbonInterval);
    }, 10000);
}

function createConfetti(colors) {
    const confetti = document.createElement('div');
    confetti.className = Math.random() > 0.5 ? 'ribbon' : 'confetti';
    
    // Random properties
    const left = Math.random() * 100;
    const animationDuration = 2 + Math.random() * 3;
    const delay = Math.random() * 2;
    const size = 10 + Math.random() * 20;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const shape = Math.random() > 0.5 ? '50%' : '0';
    const rotation = Math.random() * 360;
    
    // Apply styles
    confetti.style.left = `${left}%`;
    confetti.style.width = `${size}px`;
    confetti.style.height = `${size}px`;
    confetti.style.backgroundColor = color;
    confetti.style.borderRadius = shape;
    confetti.style.animationDuration = `${animationDuration}s`;
    confetti.style.animationDelay = `${delay}s`;
    confetti.style.transform = `rotate(${rotation}deg)`;
    
    document.body.appendChild(confetti);
    
    // Remove after animation
    setTimeout(() => {
        confetti.remove();
    }, (animationDuration + delay) * 1000);
}

function createConfettiBurst() {
    const burstContainer = document.createElement('div');
    burstContainer.className = 'confetti-burst';
    burstContainer.style.position = 'fixed';
    burstContainer.style.top = '50%';
    burstContainer.style.left = '50%';
    burstContainer.style.transform = 'translate(-50%, -50%)';
    burstContainer.style.zIndex = '1000';
    
    for (let i = 0; i < 100; i++) {
        const particle = document.createElement('div');
        particle.className = 'confetti-particle';
        particle.style.width = `${8 + Math.random() * 8}px`;
        particle.style.height = particle.style.width;
        particle.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
        particle.style.position = 'absolute';
        particle.style.borderRadius = '50%';
        
        const angle = Math.random() * Math.PI * 2;
        const velocity = 5 + Math.random() * 10;
        const lifetime = 1 + Math.random() * 2;
        
        burstContainer.appendChild(particle);
        
        // Animate particles
        particle.animate([
            { transform: 'translate(0, 0) scale(1)', opacity: 1 },
            { transform: `translate(${Math.cos(angle) * velocity * 100}px, ${Math.sin(angle) * velocity * 100}px) scale(0)`, opacity: 0 }
        ], {
            duration: lifetime * 1000,
            easing: 'cubic-bezier(0.1, 0.8, 0.2, 1)'
        });
        
        // Remove after animation
        setTimeout(() => {
            particle.remove();
        }, lifetime * 1000);
    }
    
    document.body.appendChild(burstContainer);
    setTimeout(() => burstContainer.remove(), 3000);
}

function createBalloons() {
    const colors = ['#ff3366', '#ff9933', '#ffcc00', '#33cc33', '#3399ff', '#9966ff'];
    const container = document.getElementById('game-container');
    
    for (let i = 0; i < 15; i++) {
        const balloon = document.createElement('div');
        balloon.className = 'balloon';
        balloon.style.position = 'absolute';
        balloon.style.width = `${40 + Math.random() * 40}px`;
        balloon.style.height = `${50 + Math.random() * 50}px`;
        balloon.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        balloon.style.borderRadius = '50%';
        balloon.style.left = `${Math.random() * 100}%`;
        balloon.style.bottom = '-100px';
        balloon.style.opacity = '0.8';
        balloon.style.zIndex = '10';
        
        // Balloon tail
        balloon.innerHTML = '<div class="balloon-tail"></div>';
        
        container.appendChild(balloon);
        
        // Animate balloon
        const duration = 8 + Math.random() * 7;
        balloon.animate([
            { bottom: '-100px', opacity: 0 },
            { bottom: '100%', opacity: 0.8 }
        ], {
            duration: duration * 1000,
            easing: 'linear'
        });
        
        // Sway animation
        const sway = 5 + Math.random() * 10;
        balloon.animate([
            { transform: 'translateX(0)' },
            { transform: `translateX(${sway}px)` },
            { transform: 'translateX(0)' },
            { transform: `translateX(-${sway}px)` },
            { transform: 'translateX(0)' }
        ], {
            duration: 3000 + Math.random() * 4000,
            iterations: Infinity
        });
        
        // Remove after animation
        setTimeout(() => {
            balloon.remove();
        }, duration * 1000);
    }
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Disable copy-paste functionality
document.addEventListener('copy', (e) => {
    e.preventDefault();
    alert("Copying is disabled in this game!");
});

document.addEventListener('paste', (e) => {
    e.preventDefault();
    alert("Pasting is disabled in this game!");
});

document.addEventListener('cut', (e) => {
    e.preventDefault();
    alert("Cutting is disabled in this game!");
});

// Disable right-click context menu
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    alert("Right-click menu is disabled in this game!");
});

// Prevent inspecting element
document.onkeydown = function(e) {
    if (e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && e.key === 'I') || 
        (e.ctrlKey && e.shiftKey && e.key === 'J') || 
        (e.ctrlKey && e.key === 'U')) {
        e.preventDefault();
        showTemporaryWarning("Developer tools are disabled during the game!");
        return false;
    }
};

// Prevent taking screenshots (as much as possible)
document.addEventListener('keyup', (e) => {
    if (e.key === 'PrintScreen') {
        navigator.clipboard.writeText('Screenshots are disabled in this game!')
            .catch(err => console.error('Failed to clear clipboard:', err));
    }
});

// Clear clipboard when game starts
function clearClipboard() {
    navigator.clipboard.writeText('Copying is disabled in Code in the Dark')
        .catch(err => console.error('Failed to clear clipboard:', err));
}

// Call this when game starts
clearClipboard();
