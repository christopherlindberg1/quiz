
// Configuration variables
const API_URL = "https://opentdb.com/api.php";
const SECONDS_PER_QUESTION = 30;

// Game variable
const game = {
    "colors" : {
        "green" : "#0c0",
        "red" : "#f22",
    }
}

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

const questionText = document.getElementById("question-text");
const answersContainer = document.getElementById("answers");
const timer = document.getElementById("timer");



// console.log(answers);


class Init
{
    static setUpPage() {
        GameUI.hideQuestionSection();
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
    static start(questions) {
        Form.hideFormSection();
        GameUI.showQuestionSection();

        let questionIndex = 0;

        Game.presentQuestion(questions[questionIndex]);
    }

    static presentQuestion(question) {
        console.log(question);

        let hasAnswered = false;

        const answers = [question["correct_answer"], ...question["incorrect_answers"]];

        // Randomize order of answers
        answers.sort(function(a, b) {
            return 0.5 - Math.random()
        });

        // Start qeustions
        Game.showQuestion(question); 
        Game.showAlternativeAnswers(answers);  
        Game.startTimer();

        answersContainer.addEventListener("click", e => {
            if (e.target.classList.contains("answer")) {
                if (hasAnswered == false) {
                    const userChoice = e.target.innerText;
                    if (userChoice == question["correct_answer"]) {
                        e.target.style.border = `2px solid ${game["colors"]["green"]}`;
                        e.target.style.backgroundColor = `${game["colors"]["green"]}`;
                    }
                    else {
                        e.target.style.border = `2px solid ${game["colors"]["red"]}`;
                        e.target.style.backgroundColor = `${game["colors"]["red"]}`;
                    }
                }
                hasAnswered = true;
            }
        });
    }

    static showQuestion(question) {
        questionText.innerText = question["question"]; 
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

        let currentTime = SECONDS_PER_QUESTION;
        timer.innerText = currentTime;

        const refreshId = setInterval(() => {
            currentTime--;
            if (currentTime == 0) {
                clearInterval(refreshId);
            }
            if (currentTime == 5) {
                GameUI.makeTimerRed();
            }
            timer.innerText = currentTime;
        }, 1000);
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

    static makeTimerGreen() {
        timer.style.border = `3px solid ${game["colors"]["green"]}`;
        timer.style.backgroundColor = "#f4f4f4";
    }

    static makeTimerRed() {
        timer.style.border = `3px solid ${game["colors"]["red"]}`;
        timer.style.backgroundColor = `${game["colors"]["red"]}`;
    }
}


class QuestionAPI
{
    static createAPIUrl(parameters) {
        let APIUrl = `${API_URL}?amount=${parameters["amount"]}`;

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
            .then(data => Game.start(data.results));
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

    const questions = QuestionAPI.getQuestions(APIUrl);
});




