
document.addEventListener("DOMContentLoaded", function () {

    const messageInput = document.getElementById("message");
    const analyzeBtn = document.getElementById("analyzeBtn");
    const charCount = document.getElementById("charCount");

    const documentFile = document.getElementById("documentFile");
    const extractBtn = document.getElementById("extractBtn");
    const uploadStatus = document.getElementById("uploadStatus");

    const result = document.getElementById("result");
    const riskLevel = document.getElementById("riskLevel");
    const riskScore = document.getElementById("riskScore");
    const riskFactors = document.getElementById("riskFactors");
    const recommendation = document.getElementById("recommendation");
    const aiExplanation = document.getElementById("aiExplanation");
    const status = document.querySelector(".status");

    const languageSection = document.getElementById("languageSection");
    const resultLanguage = document.getElementById("resultLanguage");
    const translationStatus = document.getElementById("translationStatus");
    const languageLabel = document.getElementById("languageLabel");

    let currentAnalysis = null;

    // Update character count
    messageInput.addEventListener("input", function () {
        charCount.textContent = messageInput.value.length + " / 2000";
    });

    // Display analysis result
    function displayResult(data) {

        riskLevel.textContent = "Risk Level: " + data.risk_level;
        riskScore.textContent = "Risk Score: " + data.risk_score + "/100";

        riskFactors.replaceChildren();

        data.risk_factors.forEach(function (factor) {
            const li = document.createElement("li");
            li.textContent = factor;
            riskFactors.appendChild(li);
        });

        recommendation.textContent = data.recommendation;
        aiExplanation.textContent = data.ai_explanation;

        document.getElementById("resultTitle").textContent = "Analysis Result";
        document.getElementById("warningTitle").textContent = "Warning Signs";
        document.getElementById("explanationTitle").textContent = "AI Explanation";
        document.getElementById("recommendationTitle").textContent = "Safety Recommendation";

        languageLabel.textContent = "Choose Result Language:";
    }

    // Analyze message
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
                body: JSON.stringify({
                    message: message
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Analysis failed.");
            }

            currentAnalysis = data;

            displayResult(data);

            languageSection.classList.remove("hidden");
            resultLanguage.value = "English";
            translationStatus.textContent = "";

            result.classList.remove("hidden");

            status.textContent = "● Analysis completed";

        } catch (error) {

            alert("Unable to analyze the message: " + error.message);
            status.textContent = "● Analysis failed";

        } finally {

            analyzeBtn.disabled = false;
            analyzeBtn.textContent = "🛡 Analyze Now";

        }

    });

    // Extract text from uploaded PDF or image
    extractBtn.addEventListener("click", async function () {

        const file = documentFile.files[0];

        if (!file) {
            alert("Please select a PDF or image first.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert("File size must be below 5 MB.");
            return;
        }

        extractBtn.disabled = true;
        extractBtn.textContent = "Extracting...";
        uploadStatus.textContent = "● Reading your document...";

        try {

            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/extract", {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Text extraction failed.");
            }

            const extractedText = data.extracted_text.trim();

            if (!extractedText) {
                throw new Error("No readable text found.");
            }

            if (extractedText.length > 2000) {
                throw new Error(
                    "The extracted text is longer than 2000 characters. " +
                    "Please shorten it in the message box before analyzing."
                );
            }

            messageInput.value = extractedText;
            messageInput.dispatchEvent(new Event("input"));

            uploadStatus.textContent = "● Text extracted successfully. Starting analysis...";

            // Reuse the existing message analysis
            analyzeBtn.click();

        } catch (error) {

            alert("Document error: " + error.message);
            uploadStatus.textContent = "● Document extraction failed.";

        } finally {

            extractBtn.disabled = false;
            extractBtn.textContent = "📄 Extract & Analyze";

        }

    });

    // Change result language
    resultLanguage.addEventListener("change", async function () {

        if (!currentAnalysis) {
            return;
        }

        const selectedLanguage = resultLanguage.value;

        if (selectedLanguage === "English") {
            displayResult(currentAnalysis);
            translationStatus.textContent = "";
            return;
        }

        resultLanguage.disabled = true;
        translationStatus.textContent = "Translating result...";

        try {

            const response = await fetch("/api/translate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    language: selectedLanguage,
                    result: {
                        risk_level: currentAnalysis.risk_level,
                        risk_factors: currentAnalysis.risk_factors,
                        ai_explanation: currentAnalysis.ai_explanation,
                        recommendation: currentAnalysis.recommendation
                    }
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Translation failed.");
            }

            riskLevel.textContent = data.risk_level;
            riskFactors.replaceChildren();

            data.risk_factors.forEach(function (factor) {
                const li = document.createElement("li");
                li.textContent = factor;
                riskFactors.appendChild(li);
            });

            aiExplanation.textContent = data.ai_explanation;
            recommendation.textContent = data.recommendation;

            document.getElementById("resultTitle").textContent = data.result_title;
            document.getElementById("warningTitle").textContent = data.warning_title;
            document.getElementById("explanationTitle").textContent = data.explanation_title;
            document.getElementById("recommendationTitle").textContent = data.recommendation_title;

            const languageLabels = {
                English: "Choose Result Language:",
                Kannada: "ಫಲಿತಾಂಶದ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ:",
                Hindi: "परिणाम की भाषा चुनें:"
            };

            const scoreLabels = {
                English: "Risk Score: ",
                Kannada: "ಅಪಾಯದ ಅಂಕ: ",
                Hindi: "जोखिम स्कोर: "
            };

            const completedLabels = {
                English: "● Translation completed",
                Kannada: "● ಅನುವಾದ ಪೂರ್ಣಗೊಂಡಿದೆ",
                Hindi: "● अनुवाद पूरा हुआ"
            };

            languageLabel.textContent = languageLabels[selectedLanguage];

            riskScore.textContent =
                scoreLabels[selectedLanguage] +
                currentAnalysis.risk_score + "/100";

            translationStatus.textContent = completedLabels[selectedLanguage];

        } catch (error) {

            translationStatus.textContent = "Translation failed: " + error.message;
            displayResult(currentAnalysis);
            resultLanguage.value = "English";

        } finally {

            resultLanguage.disabled = false;

        }

    });

});
