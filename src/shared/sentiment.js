const POS = [
    "great", "good", "excellent", "improve", "success", "faster", "win", "best", "amazing",
    "milestone", "record", "growth", "profit", "secure", "fix", "stable", "optimize", "reliable",
    "breakthrough", "innovative", "advancement", "positive"
];
const NEG = [
    "bad", "bug", "issue", "fail", "failure", "leak", "breach", "hack", "exploit", "vulnerability",
    "risk", "delay", "drop", "lawsuit", "problem", "unstable", "downtime", "error", "negative"
];
export function analyzeSentiment(text) {
    if (!text)
        return "neutral";
    const t = text.toLowerCase();
    let score = 0;
    for (const w of POS)
        if (t.includes(w))
            score++;
    for (const w of NEG)
        if (t.includes(w))
            score--;
    if (score > 0)
        return "positive";
    if (score < 0)
        return "negative";
    return "neutral";
}
