
// Configuration variables
const CONFIG = {
    "APIUrl" : "https://opentdb.com/api.php",
    "secondsPerQuestion" : 20,
    "delayBetweenQuestions" : 1500,
    "colors" : {
        "green" : "#0c0",
        "red" : "#f22",
    }
};

// UI elements
const flashMessage = document.getElementById("flash-message");
const dialogMessageContainer = document.getElementById("dialog-message-container");
const dialogMessageHeading = document.getElementById("dialog-message-heading");
const dialogMessageText = document.getElementById("dialog-message-text");
const dialogMessageOkBtn = document.getElementById("dialog-message-ok-btn");
const dialogMessageCancelBtn = document.getElementById("dialog-message-cancel-btn");

const startBtn = document.getElementById("start-btn");
const inputNrOfQuestions = document.getElementById("input-amount"); 
const inputCategory = document.getElementById("input-category"); 
const inputDifficulty = document.getElementById("input-difficulty"); 
const inputType = document.getElementById("input-type"); 

const formSection = document.getElementById("form-section");
const questionSection = document.getElementById("question-section");
const questionContainer = document.getElementById("questions-container");

const questionNumber = document.getElementById("question-number");
const questionText = document.getElementById("question-text");
const answersContainer = document.getElementById("answers");
const exitBtn = document.getElementById("exit-btn");
const timer = document.getElementById("timer");
const progressBar = document.getElementById("progress-bar");
const resultsSection = document.getElementById("results-section");
const resultsSummary = document.getElementById("results-summary");
const restartButton = document.getElementById("restart-button");



class Init
{
    static setUpPage() {
        GameUI.hideQuestionSection();
        GameUI.hideResultsBox();
    }
}


/*
  Handles error messages
*/
class Error
{
    static errors = [];

    static addErrorMessage(message) {
        this.errors.push(message);
    }

    static showErrorMessage() {
        if (this.errors.length == 0) {
            return;
        }

        let errorMessage = "";
        this.errors.forEach((message, index) => {
            errorMessage += (message + "\n"); 
        });

        FlashMessage.showMessage(errorMessage);
        Error.clearErrorList();
    }

    static clearErrorList() {
        this.errors = [];
    }
}

/*
  Class for handling flash messages displayed at the top of the screen.
  Fades away after a certain amount of time.
*/
class FlashMessage
{  
    static data = {
        "timeoutId" : 0,
        "duration" : 4000,
    }

    static showMessage(message) {
        clearTimeout(FlashMessage.data.timeoutId);

        flashMessage.innerText = message;
        flashMessage.style.opacity = 1;
        FlashMessage.data.timeoutId = setTimeout(() => {
            FlashMessage.hideFlashMessage();
        }, FlashMessage.data.duration);
    }

    static hideFlashMessage() {
        flashMessage.style.opacity = 0;
    }
}

/*
  Class for handling dialog messages
*/ 
class DialogMessage
{
    static data = {
        "active" : false,
        "callback" : null,
    }

    static showDialogMessage(heading, text, callback) {
        DialogMessage.data.active = true;
        DialogMessage.data.callback = callback;

        dialogMessageHeading.innerText = heading;
        dialogMessageText.innerText = text;
        dialogMessageContainer.style.display = "flex";
    }

    static closeDialogMessage() {
        dialogMessageContainer.style.display = "none";
        DialogMessage.data.active = false;
    }

    static handleKeyInput(e) {
        if (DialogMessage.data.active == false) {
            return;
        }

        // Esc key
        if (e.keyCode == 27) {
            DialogMessage.closeDialogMessage();
        }
        // Enter key
        else if (e.keyCode == 13) {
            DialogMessage.data.callback();
            DialogMessage.closeDialogMessage();
        }
    }
}


class Form
{
    static hideFormSection() {
        formSection.style.display = "none";
    }

    static showFormSection() {
        formSection.style.display = "block";
    }

    static getParameters() {
        const parameters = {
            "amount" : 1,
            "category" : "any",
            "difficulty" : "any",
            "type" : "any"
        };

        if (inputNrOfQuestions.value != "") {
           parameters["amount"] = inputNrOfQuestions.value;
        }
        if (inputCategory.value != "any") {
            parameters["category"] = inputCategory.value;
        }
        if (inputDifficulty.value != "any") {
            parameters["difficulty"] = inputDifficulty.value;
        }
        if (inputType.value != "any") {
            parameters["type"] = inputType.value;
        }

        return parameters;
    }

    /*
      Returns boolean showing if input validated or not
    */
    static validateInput(parameters) {
        let inputOk = true;

        if (parameters.amount < 1) {
            Error.addErrorMessage("You must have at least 1 question.");
            inputOk = false;
        }
        else if (parameters.amount > 50) {
            Error.addErrorMessage("You cannot have more than 50 questions.");
            inputOk = false;
        }

        return inputOk;
    }
}

/*
  Main class for controlling the game
*/
class Game
{
    // Stores data about the game to keep track of the state
    static gameData = {
        "stats" : {
            "correct" : 0,
            "wrong" : 0
        },
        "questions" : [],
        "currentQuestion" : {},
        "nrOfQuestions" : 0,
        "nrOfQuestionsAnswered" : 0,
        "questionIsActive" : true,
        "timeRemaining" : 0,
        "timerIntervalsIds" : {
            "countDown" : 0,
            "checkForZero" : 0,
        },
    };

    /*
      Starts the game with data passed in (fetched from API).
    */
    static init(APIData) {
        // If there aren't as many questions as requested
        if (APIData.response_code == 1) {
            FlashMessage.showMessage("There are not enough questions to match your search.");
        }
        // Different invalid (internal) errors
        if (APIData.response_code >= 2) {

        }
        // If everything went OK
        if (APIData.response_code == 0) {
            const questions = APIData.results;
            Game.initializeGameData(questions);
            Game.startGame(questions);
        }
    }

    /*
      Initializes the game data to the data fetched from the API.
    */
    static initializeGameData(questions) {
        Game.gameData.stats["correct"] = 0;
        Game.gameData.stats["wrong"] = 0;
        Game.gameData.questions = questions;
        Game.gameData.currentQuestion = questions[0];
        Game.gameData.nrOfQuestions = questions.length;
        Game.gameData.nrOfQuestionsAnswered = 0;
    }

    /*
      Resets the game data
    */
    static resetGameData() {
        Game.gameData.stats["correct"] = 0;
        Game.gameData.stats["wrong"] = 0;
        Game.gameData.questions = [];
        Game.gameData.currentQuestion = {};
        Game.gameData.nrOfQuestions = 0;
        Game.gameData.nrOfQuestionsAnswered = 0;
    }

    static startGame(questions) {
        Form.hideFormSection();
        GameUI.showQuestionSection();
        Game.startQuestion(Game.gameData.currentQuestion);
        GameUI.createProgressBar(Game.gameData.nrOfQuestions);
    }

    /*
      Starts a question and handles the answer.
      This function is recursive and calls itself if there are more questions.
    */
    static startQuestion(question) {
        Game.gameData.currentQuestion = question;
        Game.gameData.questionIsActive = true;

        // Start qeustions
        Game.showQuestion(question); 
        Game.showAlternativeAnswers(Game.getAlternativeAnswers(question));
        Game.gameData.timerIntervalsIds.countDown = Game.startTimer();

        // Disable answer options if timer reaches zero
        Game.gameData.timerIntervalsIds.checkForZero = setInterval(() => {
            if (Game.gameData.timeRemaining == 0) {
                Game.resetTimer();
                // clearInterval(Game.gameData.timerIntervalsIds.countDown);
                // clearInterval(Game.gameData.timerIntervalsIds.checkForZero);

                GameUI.updateProgressBar(Game.gameData.nrOfQuestionsAnswered, "wrong");
                Game.gameData.nrOfQuestionsAnswered++;
                Game.gameData.stats["wrong"]++;
                GameUI.makeAnswersRed();
                setTimeout(() => {
                    Game.checkForNextQuestion();
                }, CONFIG.delayBetweenQuestions);
            }
        }, 1000);

        answersContainer.addEventListener("click", e => {
            if (e.target.classList.contains("answer")) {
                Game.resetTimer();
                // clearInterval(Game.gameData.timerIntervalsIds.countDown);
                // clearInterval(Game.gameData.timerIntervalsIds.checkForZero);

                if (Game.gameData.questionIsActive == true) {
                    const userChoice = e.target.innerHTML;

                    if (userChoice == Game.gameData.currentQuestion.correct_answer) {
                        e.target.style.border = `2px solid ${CONFIG.colors.green}`;
                        e.target.style.backgroundColor = `${CONFIG.colors.green}`;
                        Game.gameData.stats.correct++;
                        GameUI.updateProgressBar(Game.gameData.nrOfQuestionsAnswered, "correct");
                    }
                    else {
                        e.target.style.border = `2px solid ${CONFIG.colors.red}`;
                        e.target.style.backgroundColor = `${CONFIG.colors.red}`;
                        Game.gameData.stats.wrong++;
                        GameUI.updateProgressBar(Game.gameData.nrOfQuestionsAnswered, "wrong");
                    }
                    
                    Game.gameData.questionIsActive = false;
                    Game.gameData.nrOfQuestionsAnswered++;
                    
                    // Wait 1 sec before presenting next question
                    setTimeout(() => {
                        Game.checkForNextQuestion();
                    }, CONFIG.delayBetweenQuestions);
                }
            }
        });
    }

    static showQuestion(question) {
        questionNumber.innerHTML = `Question ${Game.gameData.nrOfQuestionsAnswered + 1}`;
        questionText.innerHTML = question["question"]; 
    }

    /*
      Returns an array with all alternative answers for a question.
    */
    static getAlternativeAnswers(question) {
        const answers = [question["correct_answer"], ...question["incorrect_answers"]];

        // Randomize order of answers
        answers.sort(function(a, b) {
            return 0.5 - Math.random()
        });

        return answers;
    }

    static showAlternativeAnswers(answers) {
        answersContainer.innerHTML = "";

        answers.forEach(answer => {
            const answerDiv = document.createElement("div");
            answerDiv.innerHTML = answer;
            answerDiv.classList.add("answer");
            answersContainer.appendChild(answerDiv);
        });
    }

    /*
      Starts the timer that keeps track of the time for each question.
    */
    static startTimer() {
        GameUI.makeTimerGreen();
        Game.gameData.timeRemaining = CONFIG.secondsPerQuestion;

        // let currentTime = SECONDS_PER_QUESTION;
        timer.innerHTML = Game.gameData.timeRemaining;

        const refreshId = setInterval(() => {
            Game.gameData.timeRemaining--;
            if (Game.gameData.timeRemaining == 0) {
                clearInterval(refreshId);
            }
            if (Game.gameData.timeRemaining == 5) {
                GameUI.makeTimerRed();
            }
            timer.innerHTML = Game.gameData.timeRemaining;
        }, 1000);

        return refreshId;
    }

    /*
      Clears all timeIntervals that has been set.
    */
    static resetTimer() {
        clearInterval(Game.gameData.timerIntervalsIds.countDown);
        clearInterval(Game.gameData.timerIntervalsIds.checkForZero);
    }

    /*
      Using the stored game data to check if there are more questions to be answered.
    */
    static checkForNextQuestion() {
        if (Game.gameData.nrOfQuestions > Game.gameData.nrOfQuestionsAnswered) {
            Game.startQuestion(Game.gameData.questions[Game.gameData.nrOfQuestionsAnswered]);
        }
        else {
            Game.showResults();
        }
    }

    static showResults() {
        GameUI.hideQuestionSection();
        GameUI.updateResultsBox(Game.gameData.stats);
        GameUI.showResultsBox();
    }

    static restartGame() {
        Game.resetTimer();
        GameUI.hideQuestionSection();
        GameUI.hideResultsBox();
        Form.showFormSection();
    }

    /*
      Method for restarting / stopping the game if the user
      confirms their choice in a dialoge box.
    */
    static confirmStopGame() {
        DialogMessage.showDialogMessage("Caution", "Are you sure you want to stop the game?", Game.restartGame);
    }
}


/*
  Class used to handle game activities that only has to do with the UI.
*/
class GameUI
{
    static hideQuestionSection() {
        questionSection.style.display = "none";
    }

    static showQuestionSection() {
        questionSection.style.display = "block";
    }

    static makeTimerGreen() {
        timer.style.border = `3px solid ${CONFIG.colors.green}`;
        timer.style.backgroundColor = "#f4f4f4";
    }

    static makeTimerRed() {
        timer.style.border = `3px solid ${CONFIG.colors.red}`;
        timer.style.backgroundColor = `${CONFIG.colors.red}`;
    }

    /*
      Gives all answer boxes a red background color and red border.
    */
    static makeAnswersRed() {
        document.querySelectorAll(".answer").forEach(answer => {
            answer.style.backgroundColor = CONFIG.colors.red;
            answer.style.border = `3px solid ${CONFIG.colors.red}`;
        });
    }

    static hideResultsBox() {
        resultsSection.style.display = "none";
    }

    static showResultsBox() {
        resultsSection.style.display = "block";
    }

    /*
      Changes the text content in the results box based on how the user
      performed on the quiz.
    */
    static updateResultsBox(results) {
        const correctPercentage = 100 * results.correct / (results.correct + results.wrong);
        resultsSummary.innerHTML = `You answered ${correctPercentage.toFixed()}% of the questions correct (${results.correct}/${Game.gameData.nrOfQuestions})`;
    }

    /*
      Creates a progressbar based on how many questions there are.
    */
    static createProgressBar(nrOfQuestions) {
        progressBar.innerHTML = "";

        if (nrOfQuestions < 2) {
            return;
        }
        
        for (let i = 0; i < nrOfQuestions; i++) {
            const progressBarElement = document.createElement("div");
            progressBarElement.className = "progress-bar-element";
            progressBar.appendChild(progressBarElement);
        }
    }

    /*
        Answer is either correct or wrong
    */
    static updateProgressBar(index, answer) {
        try
        {
            if (answer == "correct") {
                progressBar.children[index].style.backgroundColor = "#0c0";
            }
            else {
                progressBar.children[index].style.backgroundColor = "#f22";
            }
        }
        catch (ex) {}
    }
}


/*
  Class used to handle API-related activities
*/
class QuestionAPI
{
    static createAPIUrl(parameters) {
        let APIUrl = `${CONFIG.APIUrl}?amount=${parameters["amount"]}`;

        if (parameters["category"] != "any") {
            APIUrl += `&category=${parameters["category"]}`;
        }

        if (parameters["difficulty"] != "any") {
            APIUrl += `&difficulty=${parameters["difficulty"]}`;
        }

        if (parameters["type"] != "any") {
            APIUrl += `&type=${parameters["type"]}`;
        }

        return APIUrl;
    }

    static getQuestions(APIUrl) {
        fetch(APIUrl)
            .then(res => res.json())
            .then(data => Game.init(data))
    }
}






// ========================================================
//                         Events
// ========================================================

// Initializing page on load
window.addEventListener("DOMContentLoaded", Init.setUpPage);

// Click event for fetching questions
startBtn.addEventListener("click", e => {
    e.preventDefault();

    const parameters = Form.getParameters();
    
    // Validate input
    if (Form.validateInput(parameters)) {
        const APIUrl = QuestionAPI.createAPIUrl(parameters);
        QuestionAPI.getQuestions(APIUrl);
    }
    else {
        Error.showErrorMessage();
    }
});

// Click event for restarting game
restartButton.addEventListener("click", Game.restartGame);

// Click event for stopping game
exitBtn.addEventListener("click", Game.confirmStopGame);

// Click event for dialog box ok btn
dialogMessageOkBtn.addEventListener("click", () => {
    DialogMessage.data.callback();
    DialogMessage.closeDialogMessage();
});

// Click event for dialog box cancel btn
dialogMessageCancelBtn.addEventListener("click", () => {
    DialogMessage.closeDialogMessage();
});

// Global keyup event. Runs all methods that should be ran when a user uses a key
document.body.addEventListener("keyup", e => {
    DialogMessage.handleKeyInput(e);
});
