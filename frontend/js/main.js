
// Configuration variables
const CONFIG = {
    "APIUrl" : "https://opentdb.com/api.php",
    "secondsPerQuestion" : 6,
    "colors" : {
        "green" : "#0c0",
        "red" : "#f22",
    }
};

// UI elements
const form = document.getElementById("question-form");
const formToggler = document.getElementById("form-toggler");
const formTogglerIcon = document.getElementById("form-toggler-icon");
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
const timer = document.getElementById("timer");
const resultsSection = document.getElementById("results-section");
const resultsSummary = document.getElementById("results-summary");
const resultsCorrects = document.getElementById("results-corrects");
const resultsWrongs = document.getElementById("results-wrongs");
const restartButton = document.getElementById("restart-button");



class Init
{
    static setUpPage() {
        GameUI.hideQuestionSection();
        GameUI.hideResultsBox();
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
}


class Game
{
    // Stores configurations for the application
    static configurations = {

    }

    // Stores data about the game to keep track of the state
    static gameData = {
        "stats" : {
            "correct" : 0,
            "wrong" : 0
        },
        "questions" : [],
        "nrOfQuestions" : 0,
        "nrOfQuestionsAnswered" : 0,
        "timer" : {
            "timeRemaining" : 0,
        }
    };

    static init(questions) {
        Game.resetGameData(questions);
        Game.startGame(questions);
    }

    static resetGameData(questions) {
        Game.gameData.stats["correct"] = 0;
        Game.gameData.stats["wrong"] = 0;
        Game.gameData.questions = questions;
        Game.gameData.nrOfQuestions = questions.length;
        Game.gameData.nrOfQuestionsAnswered = 0;
    }

    static startGame(questions) {
        Form.hideFormSection();
        GameUI.showQuestionSection();
        Game.startQuestion(questions[0]);
    }

    static startQuestion(question) {
        let hasAnswered = false;

        // Start qeustions
        Game.showQuestion(question); 
        Game.showAlternativeAnswers(Game.getAlternativeAnswers(question));
        const refreshId = Game.startTimer();

        // Disable answer options if timer reaches zero
        const checkForZero = setInterval(() => {
            if (Game.gameData.timer.timeRemaining == 0) {
                clearInterval(checkForZero);
                Game.gameData.nrOfQuestionsAnswered++;
                Game.gameData.stats["wrong"]++;
                GameUI.makeAnswersRed();
                setTimeout(() => {
                    Game.checkForNextQuestion();
                }, 1000);
            }
        }, 1000);

        answersContainer.addEventListener("click", e => {
            if (e.target.classList.contains("answer")) {
                if (hasAnswered == false) {
                    const userChoice = e.target.innerText;
                    if (userChoice == question["correct_answer"]) {
                        e.target.style.border = `2px solid ${CONFIG.colors.green}`;
                        e.target.style.backgroundColor = `${CONFIG.colors.green}`;
                        Game.gameData.stats.correct++;
                    }
                    else {
                        e.target.style.border = `2px solid ${CONFIG.colors.red}`;
                        e.target.style.backgroundColor = `${CONFIG.colors.red}`;
                        Game.gameData.stats.wrong++;
                    }
                    clearInterval(refreshId);
                    hasAnswered = true;
                    Game.gameData.nrOfQuestionsAnswered++;
                    
                    // Wait 1 sec before presenting next question
                    setTimeout(() => {
                        Game.checkForNextQuestion();
                    }, 1000);
                }
            }
        });
    }

    static showQuestion(question) {
        questionNumber.innerText = `Question ${Game.gameData.nrOfQuestionsAnswered + 1}`;
        questionText.innerText = question["question"]; 
    }

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
        //console.log(answers);
        answers.forEach(answer => {
            const answerDiv = document.createElement("div");
            answerDiv.appendChild(document.createTextNode(answer));
            answerDiv.classList.add("answer");
            answersContainer.appendChild(answerDiv);
        });
    }

    static startTimer() {
        GameUI.makeTimerGreen();
        Game.gameData.timer.timeRemaining = CONFIG.secondsPerQuestion;

        // let currentTime = SECONDS_PER_QUESTION;
        timer.innerText = Game.gameData.timer.timeRemaining;

        const refreshId = setInterval(() => {
            Game.gameData.timer.timeRemaining--;
            if (Game.gameData.timer.timeRemaining == 0) {
                clearInterval(refreshId);
            }
            if (Game.gameData.timer.timeRemaining == 5) {
                GameUI.makeTimerRed();
            }
            timer.innerText = Game.gameData.timer.timeRemaining;
        }, 1000);

        return refreshId;
    }

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
        GameUI.hideQuestionSection();
        GameUI.hideResultsBox();
        Form.showFormSection();
    }
}


class GameUI
{
    static hideQuestionSection() {
        questionSection.style.display = "none";
    }

    static showQuestionSection() {
        questionSection.style.display = "block";
    }

    static hideResultsBox() {
        resultsSection.style.display = "none";
    }

    static showResultsBox() {
        resultsSection.style.display = "block";
    }

    static makeTimerGreen() {
        timer.style.border = `3px solid ${CONFIG.colors.green}`;
        timer.style.backgroundColor = "#f4f4f4";
    }

    static makeTimerRed() {
        timer.style.border = `3px solid ${CONFIG.colors.red}`;
        timer.style.backgroundColor = `${CONFIG.colors.red}`;
    }

    static makeAnswersRed() {
        document.querySelectorAll(".answer").forEach(answer => {
            answer.style.backgroundColor = CONFIG.colors.red;
        })
    }

    static updateResultsBox(results) {
        const correctPercentage = 100 * results.correct / (results.correct + results.wrong);
        resultsSummary.innerText = `You answered ${correctPercentage.toFixed(2)}% of the questions correct`;
        resultsCorrects.innerText = `Correct answers: ${results.correct}`;
        resultsWrongs.innerText = `Wrong answers: ${results.wrong}`; 
    }
}


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
        return fetch(APIUrl)
            .then(res => res.json())
            .then(data => Game.init(data.results));
    }
}






// ========================================================
//                         Events
// ========================================================

// Initializing page on load
window.addEventListener("DOMContentLoaded", Init.setUpPage);

// Click event for fetching questions
form.addEventListener("submit", e => {
    e.preventDefault();

    const parameters = Form.getParameters();
    const APIUrl = QuestionAPI.createAPIUrl(parameters);
    QuestionAPI.getQuestions(APIUrl);
});

// Click event for restarting game
restartButton.addEventListener("click", Game.restartGame);


