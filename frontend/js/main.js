

const API_URL = "https://opentdb.com/api.php";

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


const timer = document.getElementById("timer");



// console.log(timer);


class Init
{
    static setUpPage() {
        GameUI.hideQuestionSection();
    }
}


class Form
{
    // static toggleForm() {
    //     if (form.style.display == "none") {
    //         Form.showForm();
    //     }
    //     else if (form.style.display == "block") {
    //         Form.HideForm();
    //     }
    //     else {
    //         alert("toggle error");
    //     }
    // }

    // static HideForm() {
    //     form.style.display = "none";
    //     formTogglerIcon.style.transform = "rotate(-90deg)";
    // }

    // static showForm() {
    //     form.style.display = "block";
    //     formTogglerIcon.style.transform = "rotate(90deg)";
    // }

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

        questions.forEach(question => {
            console.log(question);
        })
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

    static prepareQuestion() {

    }

    static writeQuestion() {

    }

    static resetTimer() {

    }


}





class Timer
{

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

        // console.log(APIUrl);

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

// Click event for toggling form
// formToggler.addEventListener("click", Form.toggleForm);

// Click event for fetching questions
form.addEventListener("submit", e => {
    e.preventDefault();

    const parameters = Form.getParameters();

    const APIUrl = QuestionAPI.createAPIUrl(parameters);

    const questions = QuestionAPI.getQuestions(APIUrl);

    
});


