// ==========================================
// CONFIGURATION
// ==========================================

// Because the frontend and FastAPI are served
// by the same application:
//
// http://localhost:8000
//
// the API endpoint can simply be:
//
// /predict

const API_URL = "/predict";


// ==========================================
// DOM ELEMENTS
// ==========================================

const textInput =
    document.getElementById("textInput");

const charCount =
    document.getElementById("charCount");

const predictBtn =
    document.getElementById("predictBtn");

const btnText =
    document.getElementById("btnText");

const loader =
    document.getElementById("loader");

const emptyState =
    document.getElementById("emptyState");

const resultContent =
    document.getElementById("resultContent");

const predictedEmotion =
    document.getElementById("predictedEmotion");

const confidenceValue =
    document.getElementById("confidenceValue");

const probabilityList =
    document.getElementById("probabilityList");

const errorMessage =
    document.getElementById("errorMessage");

const historySection =
    document.getElementById("historySection");

const historyList =
    document.getElementById("historyList");

const clearHistoryBtn =
    document.getElementById("clearHistoryBtn");


// ==========================================
// CHARACTER COUNTER
// ==========================================

textInput.addEventListener("input", () => {

    const length =
        textInput.value.length;

    charCount.textContent =
        `${length} / 2000`;

});


// ==========================================
// EXAMPLE BUTTONS
// ==========================================

const exampleButtons =
    document.querySelectorAll(".example-btn");


exampleButtons.forEach(button => {

    button.addEventListener("click", () => {

        const exampleText =
            button.dataset.text;

        textInput.value =
            exampleText;

        textInput.dispatchEvent(
            new Event("input")
        );

        textInput.focus();

    });

});


// ==========================================
// PREDICT BUTTON
// ==========================================

predictBtn.addEventListener(
    "click",
    predictEmotion
);


// ==========================================
// KEYBOARD SHORTCUT
// ==========================================

textInput.addEventListener(
    "keydown",
    event => {

        if (
            event.ctrlKey &&
            event.key === "Enter"
        ) {

            predictEmotion();

        }

    }
);


// ==========================================
// MAIN PREDICTION FUNCTION
// ==========================================

async function predictEmotion() {

    const text =
        textInput.value.trim();


    // --------------------------------------
    // Validate input
    // --------------------------------------

    if (!text) {

        showError(
            "Please enter some text first."
        );

        textInput.focus();

        return;

    }


    hideError();

    setLoading(true);


    try {

        // ----------------------------------
        // Send request to FastAPI
        // ----------------------------------

        const response =
            await fetch(
                API_URL,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        text: text
                    })

                }
            );


        // ----------------------------------
        // Handle HTTP errors
        // ----------------------------------

        if (!response.ok) {

            let message =
                "Prediction request failed.";

            try {

                const errorData =
                    await response.json();

                if (errorData.detail) {

                    message =
                        errorData.detail;

                }

            } catch {

                // Ignore JSON parsing errors

            }

            throw new Error(message);

        }


        // ----------------------------------
        // Convert response to JSON
        // ----------------------------------

        const data =
            await response.json();


        // ----------------------------------
        // Display result
        // ----------------------------------

        displayPrediction(data);


        // ----------------------------------
        // Add to history
        // ----------------------------------

        addToHistory(data);


    } catch (error) {

        console.error(
            "Prediction error:",
            error
        );

        showError(
            error.message ||
            "Unable to connect to the API."
        );

    } finally {

        setLoading(false);

    }

}


// ==========================================
// DISPLAY PREDICTION
// ==========================================

function displayPrediction(data) {

    // Hide empty state
    emptyState.classList.add("hidden");

    // Show result
    resultContent.classList.remove("hidden");


    // --------------------------------------
    // Emotion
    // --------------------------------------

    predictedEmotion.textContent =
        data.predicted_emotion;


    // --------------------------------------
    // Confidence
    // --------------------------------------

    const confidence =
        data.confidence * 100;

    confidenceValue.textContent =
        `${confidence.toFixed(1)}%`;


    // --------------------------------------
    // Probability distribution
    // --------------------------------------

    probabilityList.innerHTML = "";


    const probabilities =
        Object.entries(
            data.all_probabilities
        );


    // Sort from highest to lowest
    probabilities.sort(
        (a, b) => b[1] - a[1]
    );


    probabilities.forEach(
        ([emotion, probability]) => {

            const percentage =
                probability * 100;


            // Create row
            const row =
                document.createElement(
                    "div"
                );

            row.className =
                "probability-row";


            // Create label/value
            const info =
                document.createElement(
                    "div"
                );

            info.className =
                "probability-info";


            const name =
                document.createElement(
                    "span"
                );

            name.className =
                "probability-name";

            name.textContent =
                emotion;


            const value =
                document.createElement(
                    "span"
                );

            value.className =
                "probability-value";

            value.textContent =
                `${percentage.toFixed(1)}%`;


            info.appendChild(name);

            info.appendChild(value);


            // Progress track
            const track =
                document.createElement(
                    "div"
                );

            track.className =
                "progress-track";


            // Progress bar
            const bar =
                document.createElement(
                    "div"
                );

            bar.className =
                "progress-bar";


            bar.style.width =
                `${percentage}%`;


            track.appendChild(bar);


            row.appendChild(info);

            row.appendChild(track);


            probabilityList.appendChild(row);

        }
    );

}


// ==========================================
// LOADING STATE
// ==========================================

function setLoading(isLoading) {

    predictBtn.disabled =
        isLoading;


    if (isLoading) {

        btnText.textContent =
            "Analyzing...";

        loader.classList.remove(
            "hidden"
        );

    } else {

        btnText.textContent =
            "Analyze emotion";

        loader.classList.add(
            "hidden"
        );

    }

}


// ==========================================
// ERROR HANDLING
// ==========================================

function showError(message) {

    errorMessage.textContent =
        message;

    errorMessage.classList.remove(
        "hidden"
    );

}


function hideError() {

    errorMessage.classList.add(
        "hidden"
    );

}


// ==========================================
// PREDICTION HISTORY
// ==========================================

let predictionHistory = [];


// ------------------------------------------
// Add prediction
// ------------------------------------------

function addToHistory(data) {

    const item = {

        text: data.text,

        emotion:
            data.predicted_emotion,

        confidence:
            data.confidence

    };


    predictionHistory.unshift(item);


    // Keep only the last 5
    predictionHistory =
        predictionHistory.slice(0, 5);


    renderHistory();

}


// ------------------------------------------
// Render history
// ------------------------------------------

function renderHistory() {

    historyList.innerHTML = "";


    if (
        predictionHistory.length === 0
    ) {

        historySection.classList.add(
            "hidden"
        );

        return;

    }


    historySection.classList.remove(
        "hidden"
    );


    predictionHistory.forEach(
        item => {

            const row =
                document.createElement(
                    "div"
                );

            row.className =
                "history-item";


            const text =
                document.createElement(
                    "div"
                );

            text.className =
                "history-text";

            text.textContent =
                item.text;


            const meta =
                document.createElement(
                    "div"
                );

            meta.className =
                "history-meta";


            const emotion =
                document.createElement(
                    "div"
                );

            emotion.className =
                "history-emotion";

            emotion.textContent =
                item.emotion;


            const confidence =
                document.createElement(
                    "div"
                );

            confidence.className =
                "history-confidence";

            confidence.textContent =
                `${(
                    item.confidence * 100
                ).toFixed(1)}%`;


            meta.appendChild(
                emotion
            );

            meta.appendChild(
                confidence
            );


            row.appendChild(text);

            row.appendChild(meta);


            historyList.appendChild(row);

        }
    );

}


// ==========================================
// CLEAR HISTORY
// ==========================================

clearHistoryBtn.addEventListener(
    "click",
    () => {

        predictionHistory = [];

        renderHistory();

    }
);