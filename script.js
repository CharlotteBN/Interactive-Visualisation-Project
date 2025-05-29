//SETUP

const unpack = (data, key) => data.map(row => row[key]); // unpacking .csv rows

let data = []; // defining data here so it is accessible for the slider & custom graph

function loadData() {
    Promise.all([d3.csv("daily_data.csv")]).then(([daily_data]) => { // loading daily_data csv
        data = daily_data; // thank you Joel
        makePlot1(daily_data);
        makePlotCustom(daily_data);
        makePlot3(daily_data);
        makePlot4(daily_data);
        makePlot5(daily_data);
    });

    Promise.all([d3.csv("month_data.csv")]).then(([month_data]) => { // loading month_data csv
        makePlot2(month_data);
    });
};

//SLIDER

// edited from w3schools's range slider example: https://www.w3schools.com/howto/howto_js_rangeslider.asp
// with help from Copilot AI: https://copilot.microsoft.com/shares/mthv8BMhyakB7mMGGPpRE

const slider = document.getElementById("myRange");
const output = document.getElementById("demo");
const submitButton = document.getElementById("submit");

let customValue = slider.value;
output.innerHTML = customValue; // inner content of output (paragraph with "demo" id) = current value of slider

slider.oninput = function () { // oninput means the event triggers when the slider moves (it is an eventlistener)
    customValue = this.value; // in this case, this.value refers to the current slider value
    output.innerHTML = customValue;
};

submitButton.onclick = function () { // executes on click
    console.log(customValue); // retrieves current slider value; testing
    alert(customValue + " submitted! Scroll down to the next section"); // gives user feedback so they know they've submitted
    makePlotCustom(data); // custom graph updated
    customised_message(customValue); // custom message updated
};

// SLIDER LABELS
// Based on solutions posted here: https://stackoverflow.com/questions/10224856/jquery-ui-slider-labels-under-slider
// with help from Copilot AI: https://copilot.microsoft.com/shares/3hGVkEyHwUcTvdMAyJDqn 

const labelContainer = document.getElementById("sliderlabel");

const minVal = parseInt(slider.min);
const maxVal = parseInt(slider.max);
const sliderWidth = slider.offsetWidth; // Get actual slider width

labelContainer.innerHTML = ""; // Clear existing labels

for (let i = minVal; i <= maxVal; i++) {
    const label = document.createElement("span");
    label.className = "slider-label";
    label.innerText = i;

    // Correct label positioning
    const position = ((i - minVal) / (maxVal - minVal)) * sliderWidth;
    label.style.position = "absolute";
    label.style.left = `${position}px`; // Align labels precisely
    label.style.transform = "translateX(-50%)"; // Center align text

    labelContainer.appendChild(label);
}

// edited from https://copilot.microsoft.com/shares/D8oAzEVxbtEFT138avarj 

const labelContainerTwo = document.getElementById("sliderlabeltwo");

const labelPositions = [-3, 0, 3]; // Specific locations
const labelDescriptions = {
    "-3": "<span class='emoji'>🥶</span><br>Too Cold",
    "0": "<span class='emoji'>☺️</span><br>Just Right",
    "3": "<span class='emoji'>🥵</span><br>Too Hot",
};

labelContainerTwo.innerHTML = ""; // Clear existing labels

labelPositions.forEach(value => {
    const label = document.createElement("span");
    label.className = "slider-label";

    // Use custom text if available, inner html so <br> will register as a break
    label.innerHTML = labelDescriptions[value] || value;

    // Correct label positioning using percentage-based placement
    const positionPercentage = ((value - slider.min) / (slider.max - slider.min)) * 100;
    label.style.position = "absolute";
    label.style.left = `${positionPercentage}%`;
    label.style.transform = "translateX(-50%)";

    labelContainerTwo.appendChild(label);
});

//GRAPHS:

// GRAPH 1
function makePlot1(data) {

    const date = unpack(data, "Date");
    //console.log(date); // test for if data is loading in correctly
    const ta = unpack(data, "ta");
    const ideal_ta = unpack(data, "ideal_ta");
    const pmv = unpack(data, "pmv");

    let ta_trace = {
        x: date,
        y: ta,
        name: "Air Temperature (°C)",
        mode: "lines",

        hovertemplate:
            '<b>Factor: </b>Air Temperature<br>' +
            '<b>Date: </b>%{x}<br>' + // hovertemplate variables are structured like %{x}
            '<b>Temperature: </b>%{y}°C<extra></extra>', // <extra></extra> hides the trace number
        // I repeat variations of this hover template for consequent traces / graphs

        line: {
            color: "#799FCB",
        },

        yaxis: 'y2', //denotes this trace is on the second y axis (which is located on the left)
    };

    let ideal_ta_trace = {
        x: date,
        y: ideal_ta,
        name: "Ideal Temperature (°C)",
        mode: "lines",

        hovertemplate:
            '<b>Ideal Temperature</b><br>' +
            '<b>Temperature: </b>%{y}°C<extra></extra>',

        line: {
            color: "#1D2E57",
        },

        yaxis: 'y2', //denotes this trace is on the second y axis (which is located on the left)
    };

    let pmv_trace = {
        x: date,
        y: pmv,
        name: "Predicted Mean Vote (PMV)",
        type: "bar",

        hovertemplate:
            '<b>Predicted Mean Vote</b><br>' +
            '%{y}<extra></extra>',

        marker: {
            color: "#F7A6A4",
        },

    }

    let plotlyData = [ta_trace, ideal_ta_trace, pmv_trace];

    let layout = {

        title: {
            text: 'Air Temperature & PMV - Daily',
            font: {
                color: "#1D2E57",
                family: "Outfit",
            }
        },
        xaxis: {
            tickfont: {
                color: "#1D2E57",
                family: "Outfit",
            },
            automargin: true // ensures the x axis doesn't get cut off (since padding is added to the graph)
        },
        yaxis: {
            title: {
                text: 'PMV',
                font: {
                    color: "#F9665E",
                    family: "Outfit",
                }
            },
            tickfont: {
                color: "#F9665E",
                family: "Outfit",
            },
            side: 'right', // moves the 1st y axis to the right side
            range: [-1,3], // specified range to align the 0 PMV and 22 ideal air temperature
        },
        yaxis2: {
            title: {
                text: 'Temperature (°C)',
                font: {
                    color: "#799FCB",
                    family: "Outfit",
                },
            },
            tickfont: {
                color: "#799FCB",
                family: "Outfit",
            },
            overlaying: 'y', // allows multiple y-axis to overlap; without it the columns will not appear
            side: 'left', // moves the 2nd y axis to the left
            // By default, the 1st y-axis is on the left. However, by default, it also is ordered underneath the second y-axis and its trace,
            // rendering the 1st y axis invisible. Hence, I manually changed which side the y-axis is on for consistency and visibility.
            range: [20.3,27], // specified range to align the 0 PMV and 22 ideal air temperature
        },
        legend: {
            x: 1.15, // moving the legend so it won't overlap the graph
            font: {
                color: "#1D2E57",
                family: "Outfit",
            },
        },
        plot_bgcolor: "#FAF3EE",
        margin: {
            pad: 20,
        },
    };

    Plotly.newPlot("airtemp_pmv_graph", plotlyData, layout);

};

// CUSTOMISED GRAPH
function makePlotCustom(data) {

    const date = unpack(data, "Date");
    //console.log(date); // test for if data is loading in correctly
    const ta = unpack(data, "ta");
    const ideal_ta = unpack(data, "ideal_ta");
    const pmv = unpack(data, "pmv");
    const custom = date.map(() => customValue); // iterates for all dates

    let ta_trace = {
        x: date,
        y: ta,
        name: "Air Temperature (°C)",
        mode: "lines",

        hovertemplate:
            '<b>Factor: </b>Air Temperature<br>' +
            '<b>Date: </b>%{x}<br>' + // hovertemplate variables are structured like %{x}
            '<b>Temperature: </b>%{y}°C<extra></extra>', // <extra></extra> hides the trace number
        // I repeat variations of this hover template for consequent traces / graphs

        line: {
            color: "#799FCB",
        },

        yaxis: 'y2', //denotes this trace is on the second y axis (which is located on the left)
    };

    let ideal_ta_trace = {
        x: date,
        y: ideal_ta,
        name: "Ideal Temperature (°C)",
        mode: "lines",

        hovertemplate:
            '<b>Ideal Temperature</b><br>' +
            '<b>Temperature: </b>%{y}°C<extra></extra>',

        line: {
            color: "#1D2E57",
        },

        yaxis: 'y2', //denotes this trace is on the second y axis (which is located on the left)
    };

    let pmv_trace = {
        x: date,
        y: pmv,
        name: "Predicted Mean Vote (PMV)",
        type: "bar",

        hovertemplate:
            '<b>Predicted Mean Vote</b><br>' +
            '%{y}<extra></extra>',

        marker: {
            color: "#F7A6A4",
        },
    }

    let custom_trace = {
        x: date,
        y: custom,
        name: "Your PMV",
        mode: "lines",

        hovertemplate:
            '<b>Your PMV:</b><br>' +
            '%{y}<extra></extra>',

        line: {
            color: "#F9665E",
            width: 5, // thicker than the other lines so it'll stand out
        },
    }

    let plotlyData = [ta_trace, ideal_ta_trace, pmv_trace, custom_trace];

    let layout = {

        title: {
            text: 'Air Temperature & PMV - Daily',
            font: {
                color: "#1D2E57",
                family: "Outfit",
            }
        },
        xaxis: {
            tickfont: {
                color: "#1D2E57",
                family: "Outfit",
            },
            automargin: true // ensures the x axis doesn't get cut off (since padding is added to the graph)
        },
        yaxis: {
            title: {
                text: 'PMV',
                font: {
                    color: "#F9665E",
                    family: "Outfit",
                },
            },
            tickfont: {
                color: "#F9665E",
                family: "Outfit",
            },
            side: 'right', // moves the 1st y axis to the right side
            range: [-3, 3], // specified range to align the 0 PMV and 22 ideal air temperature
        },
        yaxis2: {
            title: {
                text: 'Temperature (°C)',
                font: {
                    color: "#799FCB",
                    family: "Outfit",
                },
            },
            tickfont: {
                color: "#799FCB",
                family: "Outfit",
            },
            overlaying: 'y', // allows multiple y-axis to overlap; without it the columns will not appear
            side: 'left', // moves the 2nd y axis to the left
            // By default, the 1st y-axis is on the left. However, by default, it also is ordered underneath the second y-axis and its trace,
            // rendering the 1st y axis invisible. Hence, I manually changed which side the y-axis is on for consistency and visibility.

            range: [16.5, 27.5], // without this, any negative custom_trace value overlaps with ideal_ta_trace
        },
        legend: {
            x: 1.15, // moving the legend so it won't overlap the graph
            font: {
                color: "#1D2E57",
                family: "Outfit",
            },
        },
        plot_bgcolor: "#FAF3EE",
        margin: {
            pad: 20,
        },
    };

    Plotly.newPlot("custom_graph", plotlyData, layout);

};

// GRAPH 2
function makePlot2(data) {
    const month = unpack(data, "month");
    //console.log(month); // test for if data is loading in correctly
    const ta = unpack(data, "ta");
    const ideal_ta = unpack(data, "ideal_ta");
    const outdoor_temp = unpack(data, "outdoor_temp");

    let ta_trace = {
        x: month,
        y: ta,
        name: "Air Temperature (°C)",
        mode: "lines",

        hovertemplate:
            '<b>Factor: </b>Air Temperature<br>' +
            '<b>Month: </b>%{x}<br>' +
            '<b>Temperature: </b>%{y}°C<extra></extra>',

        line: {
            color: "#799FCB",
        },
    };

    let ideal_ta_trace = {
        x: month,
        y: ideal_ta,
        name: "Ideal Temperature (°C)",
        mode: "lines",

        hovertemplate:
            '<b>Ideal Temperature</b><br>' +
            '<b>Temperature: </b>%{y}°C<extra></extra>',

        line: {
            color: "#1D2E57",
        },
    };

    let outdoor_temp_trace = {
        x: month,
        y: outdoor_temp,
        name: "Outdoor Temperature (°C)",
        mode: "lines",

        hovertemplate:
            '<b>Outdoor Temperature</b><br>' +
            '<b>Month: </b>%{x}<br>' +
            '<b>Temperature: </b>%{y}°C<extra></extra>',

        line: {
            color: "#F7A6A4",
        },

    }

    let plotlyData = [ta_trace, ideal_ta_trace, outdoor_temp_trace];

    let layout = {
        title: {
            text: 'Indoor (Air Temperature) & Outdoor Temperature - Monthly',
            font: {
                color: "#1D2E57",
                family: "Outfit",
            }
        },
        xaxis: {
            tickfont: {
                color: "#1D2E57",
                family: "Outfit",
            },
            automargin: true // ensures the x axis doesn't get cut off (since padding is added to the graph)
        },
        yaxis: {
            title: {
                text: 'Temperature (°C)',
                font: {
                    color: "#799FCB",
                    family: "Outfit",
                },
            },
            tickfont: {
                color: "#799FCB",
                family: "Outfit",
            },
        },
        legend: {
            x: 1.15, // moving the legend so it won't overlap the graph
            font: {
                color: "#1D2E57",
                family: "Outfit",
            },
        },
        plot_bgcolor: "#FAF3EE",
        margin: {
            pad: 20,
        },
    };

    Plotly.newPlot("indoor_outdoor_graph", plotlyData, layout);

};

// GRAPH 3
function makePlot3(data) {

    const date = unpack(data, "Date");
    //console.log(date); // test for if data is loading in correctly
    const ta = unpack(data, "ta");
    const ideal_ta = unpack(data, "ideal_ta");
    const tmrt = unpack(data, "tmrt");

    let ta_trace = {
        x: date,
        y: ta,
        name: "Air Temperature (°C)",
        mode: "lines",

        hovertemplate:
            '<b>Factor: </b>Air Temperature<br>' +
            '<b>Date: </b>%{x}<br>' +
            '<b>Temperature: </b>%{y}°C<extra></extra>',
    };

    let ideal_ta_trace = {
        x: date,
        y: ideal_ta,
        name: "Ideal Temperature (°C)",
        mode: "lines",

        hovertemplate:
            '<b>Ideal Temperature</b><br>' +
            '<b>Temperature: </b>%{y}°C<extra></extra>',
    };

    let tmrt_trace = {
        x: date,
        y: tmrt,
        name: "Mean Radiant Temperature",
        mode: "lines",

        hovertemplate:
            '<b>Factor: </b>Mean Radiant Temperature<br>' +
            '<b>Temperature: </b>%{y}°C<extra></extra>',
    }

    let plotlyData = [ta_trace, ideal_ta_trace, tmrt_trace];

    let layout = {

        title: {
            text: 'Air Temperature & Mean Radiant Temperature - Daily',
            font: {
                color: "#1D2E57",
                family: "Outfit",
            }
        },
        xaxis: {
            tickfont: {
                color: "#1D2E57",
                family: "Outfit",
            },
            automargin: true // ensures the x axis doesn't get cut off (since padding is added to the graph)
        },
        yaxis: {
            title: {
                text: 'Temperature (°C)',
                font: {
                    color: "#799FCB",
                    family: "Outfit",
                },
            },
            tickfont: {
                color: "#799FCB",
                family: "Outfit",
            },
        },
        legend: {
            x: 1.15, // moving the legend so it won't overlap the graph
            font: {
                color: "#1D2E57",
                family: "Outfit",
            },
        },
        plot_bgcolor: "#FAF3EE",
        margin: {
            pad: 20,
        },
        colorway: ["#799FCB", "#1D2E57", "#F7A6A4"], // I switched over to using colorway instead of line:{color:""} because it's more reusable
    };

    Plotly.newPlot("airtemp_tmrt_graph", plotlyData, layout);

};

// GRAPH 4
function makePlot4(data) {

    const date = unpack(data, "Date");
    //console.log(date); // test for if data is loading in correctly
    const as = unpack(data, "as");
    const ideal_as = unpack(data, "ideal_as");
    const pmv = unpack(data, "pmv");

    let as_trace = {
        x: date,
        y: as,
        name: "Air Speed (m/s)",
        mode: "lines",

        hovertemplate:
            '<b>Factor: </b>Air Speed<br>' +
            '<b>Date: </b>%{x}<br>' +
            '<b>m/s: </b>%{y}<extra></extra>',

        yaxis: 'y2', //denotes this trace is on the second y axis (which is located on the left)
    };

    let ideal_as_trace = {
        x: date,
        y: ideal_as,
        name: "Ideal Air Speed (m/s)",
        mode: "lines",

        hovertemplate:
            '<b>Ideal Air Speed</b><br>' +
            '<b>m/s: </b>%{y}<extra></extra>',

        yaxis: 'y2', //denotes this trace is on the second y axis (which is located on the left)
    };

    let pmv_trace = {
        x: date,
        y: pmv,
        name: "Predicted Mean Vote (PMV)",
        type: "bar",

        hovertemplate:
            '<b>Predicted Mean Vote</b><br>' +
            '%{y}<extra></extra>',
    }

    let plotlyData = [as_trace, ideal_as_trace, pmv_trace];

    let layout = {

        title: {
            text: 'Air Speed & PMV - Daily',
            font: {
                color: "#1D2E57",
                family: "Outfit",
            }
        },
        xaxis: {
            tickfont: {
                color: "#1D2E57",
                family: "Outfit",
            },
            automargin: true // ensures the x axis doesn't get cut off (since padding is added to the graph)
        },
        yaxis: {
            title: {
                text: 'PMV',
                font: {
                    color: "#F9665E",
                    family: "Outfit",
                }
            },
            tickfont: {
                color: "#F9665E",
                family: "Outfit",
            },
            side: 'right', // moves the 1st y axis to the right side
        },
        yaxis2: {
            title: {
                text: 'Air Speed (m/s)',
                font: {
                    color: "#799FCB",
                    family: "Outfit",
                },
            },
            tickfont: {
                color: "#799FCB",
                family: "Outfit",
            },
            overlaying: 'y', // allows multiple y-axis to overlap; without it the columns will not appear
            side: 'left', // moves the 2nd y axis to the left
            // By default, the 1st y-axis is on the left. However, by default, it also is ordered underneath the second y-axis and its trace,
            // rendering the 1st y axis invisible. Hence, I manually changed which side the y-axis is on for consistency and visibility.
        },
        legend: {
            x: 1.15, // moving the legend so it won't overlap the graph
            font: {
                color: "#1D2E57",
                family: "Outfit",
            },
        },
        plot_bgcolor: "#FAF3EE",
        margin: {
            pad: 20,
        },
        colorway: ["#799FCB", "#1D2E57", "#F7A6A4"],
    };

    Plotly.newPlot("airspeed_pmv_graph", plotlyData, layout);

};

// GRAPH 5
function makePlot5(data) {

    const date = unpack(data, "Date");
    //console.log(date); // test for if data is loading in correctly
    const rh = unpack(data, "rh");
    const ideal_rh = unpack(data, "ideal_rh");
    const pmv = unpack(data, "pmv");

    let rh_trace = {
        x: date,
        y: rh,
        name: "Humidity (%)",
        mode: "lines",

        hovertemplate:
            '<b>Factor: </b>Humidity<br>' +
            '<b>Date: </b>%{x}<br>' +
            '<b>%: </b>%{y}<extra></extra>',

        yaxis: 'y2', //denotes this trace is on the second y axis (which is located on the left)
    };

    let ideal_rh_trace = {
        x: date,
        y: ideal_rh,
        name: "Ideal Humidity (%)",
        mode: "lines",

        hovertemplate:
            '<b>Ideal Air Speed</b><br>' +
            '<b>%: </b>%{y}<extra></extra>',

        yaxis: 'y2', //denotes this trace is on the second y axis (which is located on the left)
    };

    let pmv_trace = {
        x: date,
        y: pmv,
        name: "Predicted Mean Vote (PMV)",
        mode: "lines", // not a bar graph as per my original justificiations in A1

        hovertemplate:
            '<b>Predicted Mean Vote</b><br>' +
            '%{y}<extra></extra>',
    }

    let plotlyData = [rh_trace, ideal_rh_trace, pmv_trace];

    let layout = {
        title: {
            text: 'Humidity & PMV - Daily',
            font: {
                color: "#1D2E57",
                family: "Outfit",
            }
        },
        xaxis: {
            tickfont: {
                color: "#1D2E57",
                family: "Outfit",
            },
            automargin: true // ensures the x axis doesn't get cut off (since padding is added to the graph)
        },
        yaxis: {
            title: {
                text: 'PMV',
                font: {
                    color: "#F9665E",
                    family: "Outfit",
                }
            },
            tickfont: {
                color: "#F9665E",
                family: "Outfit",
            },
            side: 'right', // moves the 1st y axis to the right side
        },
        yaxis2: {
            title: {
                text: 'Humidity (%)',
                font: {
                    color: "#799FCB",
                    family: "Outfit",
                },
            },
            tickfont: {
                color: "#799FCB",
                family: "Outfit",
            },
            overlaying: 'y', // allows multiple y-axis to overlap; without it the columns will not appear
            side: 'left', // moves the 2nd y axis to the left
            // By default, the 1st y-axis is on the left. However, by default, it also is ordered underneath the second y-axis and its trace,
            // rendering the 1st y axis invisible. Hence, I manually changed which side the y-axis is on for consistency and visibility.
        },
        legend: {
            x: 1.15, // moving the legend so it won't overlap the graph
            font: {
                color: "#1D2E57",
                family: "Outfit",
            },
        },
        plot_bgcolor: "#FAF3EE",
        margin: {
            pad: 20,
        },
        colorway: ["#799FCB", "#1D2E57", "#F7A6A4"],
    };

    Plotly.newPlot("humidity_pmv_graph", plotlyData, layout);

};

loadData();

// CUSTOM MESSAGE FOR CUSTOM GRAPH

const custom_message = document.getElementById("custom_effect");

function customised_message(customValue) {
    if (customValue <= -2) {
        custom_message.innerHTML = "Oh no! Looks like you feel too cold. This means you’ll experience great productivity loss of up to 15%, feelings of fatigue and reduced fine motor control.";
    } else if (customValue <= -0.6 && customValue >= -1.9) {
        custom_message.innerHTML = "Looks like you feel a bit cold. This means you’ll experience some productivity loss of up to 9%, and feelings of fatigue.";
    } else if (customValue >= -0.5 && customValue <= 0.5) {
        custom_message.innerHTML = "Great, looks like you feel just right! This means your productivity is maximised and you aren’t at risk of heat-related illnesses or injuries.";
    } else if (customValue >= 0.6 && customValue <= 1.9) {
        custom_message.innerHTML = "Looks like you feel too warm. This means you’ll experience some productivity loss. More specifically, up to 25.7% loss in thinking and up to 33.4% loss in typing.";
    } else {
        custom_message.innerHTML = "Oh no! Looks like you feel too hot. This means you’ll experience great productivity loss. More specifically, 30-70% loss in thinking and typing.";
    }
    return custom_message.innerHTML;
};

//QUIZ

// Edited from CodePicker's article: https://medium.com/@codepicker57/building-an-interactive-quiz-with-html-css-and-javascript-efe9bd8129e2

const quizData = [ // array of questions (in this case, just one question), where each is an object has the properties question, options and answer.
    // I maintained the format just in case I needed to add more questions after the user testing stage.
    {
        question: "<h2>Which of these do you think impacts PMV the most?</h2>",
        options: ["Radiant Air Temperature", "Air Speed", "Humidity"],
        answer: "Humidity"
    },
];

const questionElement = document.getElementById("question");
const optionsElement = document.getElementById("options");

let currentQuestion = 0;
let score = 0;

function showQuestion() {
    const question = quizData[currentQuestion]; // refers to one of the question objects in quizData (again, only 1 question though)
    questionElement.innerHTML = question.question; // questionElement's innerhtml is updated to display the question property of the above question

    optionsElement.innerHTML = ""; // clears all existing options buttons (there aren't any existing in this case)

    question.options.forEach(function (option) { // loop through each option and execute for each option
        const button = document.createElement("button"); // button for each option
        button.innerHTML = option; // button labelled based on options
        optionsElement.appendChild(button); // adds the buttons to the option div
        button.addEventListener("click", selectAnswer); // event triggers on clicking button
    });
}

function selectAnswer(e) {
    const selectedButton = e.target; // identifies button clicked and stores it
    const answer = quizData[currentQuestion].answer; // refers to the answer property of quizData

    if (selectedButton.innerText === answer) {
        score++;
    }

    currentQuestion++;

    if (currentQuestion < quizData.length) {
        showQuestion();
    } else {
        showResult();
    }
}

function showResult() {
    let resultMessage = "";

    if (score === quizData.length) { //if the score is the same as the length of the quizData, aka 1/1:
        resultMessage = "<p>Great job, you’re right! It’s<br><br><span class='button'>Humidity.</span><br><br>Let’s dive into why.</p>";
    } else {
        resultMessage = "<p>Good try, but you were wrong! It’s actually<br><br><span class='button'>Humidity.</span><br><br>Let’s dive into why.</p>";
    }

    quiz.innerHTML = resultMessage; // update  quiz div
}

showQuestion();
