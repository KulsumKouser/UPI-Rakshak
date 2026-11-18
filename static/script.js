
document.addEventListener("DOMContentLoaded", function () {

    const messageInput = document.getElementById("message");
    const analyzeBtn = document.getElementById("analyzeBtn");
    const charCount = document.getElementById("charCount");
    const result = document.getElementById("result");
    const riskLevel = document.getElementById("riskLevel");
    const riskScore = document.getElementById("riskScore");
    const riskFactors = document.getElementById("riskFactors");
    const recommendation = document.getElementById("recommendation");
    const aiExplanation = document.getElementById("aiExplanation");
    const status = document.querySelector(".status");

    // History elements
    const historyList = document.getElementById("historyList");
    const refreshHistoryBtn = document.getElementById("refreshHistoryBtn");


    // Update character count
    messageInput.addEventListener("input", function () {
        charCount.textContent = messageInput.value.length + " / 2000";
    });


    // Load saved analysis history
    async function loadHistory() {

        historyList.textContent = "Loading analysis history...";

        try {

            const response = await fetch("/api/history");
            const records = await response.json();

            if (!response.ok) {
                throw new Error("Unable to load history.");
            }

            historyList.replaceChildren();

            if (records.length === 0) {
                historyList.textContent = "No analysis history yet.";
                return;
            }

            records.forEach(function (record) {

                const card = document.createElement("article");
                card.className = "history-item";

                const heading = document.createElement("h3");
                heading.textContent = "Analysis #" + record.id;

                const message = document.createElement("p");
                message.textContent = "Message: " + record.message;

                const risk = document.createElement("p");
                risk.textContent = "Risk Level: " + record.risk_level;
                risk.className = "risk-" + record.risk_level.toLowerCase();

                const score = document.createElement("p");
                score.textContent = "Risk Score: " + record.risk_score + "/100";

                const date = document.createElement("p");
                date.textContent = "Analyzed At: " + record.analyzed_at;

                const explanationHeading = document.createElement("h4");
                explanationHeading.textContent = "AI Explanation";

                const explanation = document.createElement("p");
                explanation.textContent = record.ai_explanation;

                card.appendChild(heading);
                card.appendChild(message);
                card.appendChild(risk);
                card.appendChild(score);
                card.appendChild(date);
                card.appendChild(explanationHeading);
                card.appendChild(explanation);

                historyList.appendChild(card);

            });

        } catch (error) {

            historyList.textContent =
                "Unable to load history. Please try refreshing.";

            console.error("History error:", error);

        }
    }


    // Refresh History button
    refreshHistoryBtn.addEventListener("click", loadHistory);


    // Analyze button
    analyzeBtn.addEventListener("click", async function () {

        const message = messageInput.value.trim();

        if (message === "") {
            alert("Please enter a message to analyze.");
            return;
        }

        analyzeBtn.disabled = true;
        analyzeBtn.textContent = "Analyzing...";
        status.textContent = "● Analyzing message";

        try {

            const response = await fetch("/api/analyze", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ message: message })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Analysis failed.");
            }

            riskLevel.textContent = "Risk Level: " + data.risk_level;
            riskScore.textContent = "Risk Score: " + data.risk_score + "/100";

            riskFactors.innerHTML = "";

            data.risk_factors.forEach(function (factor) {
                const li = document.createElement("li");
                li.textContent = factor;
                riskFactors.appendChild(li);
            });

            recommendation.textContent = data.recommendation;
            aiExplanation.textContent = data.ai_explanation;

            result.classList.remove("hidden");
            status.textContent = "● Analysis completed";

            // Refresh history after saving a new analysis
            await loadHistory();

        } catch (error) {

            alert("Unable to analyze the message: " + error.message);
            status.textContent = "● Analysis failed";

        } finally {

            analyzeBtn.disabled = false;
            analyzeBtn.textContent = "🛡 Analyze Now";

        }

    });


    // Load history when the dashboard opens
    loadHistory();

});
