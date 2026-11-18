
document.addEventListener("DOMContentLoaded", function () {

    const historyList = document.getElementById("historyList");
    const refreshHistoryBtn = document.getElementById("refreshHistoryBtn");

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

    // Refresh history button
    refreshHistoryBtn.addEventListener("click", loadHistory);

    // Load history when the page opens
    loadHistory();

});
