import twelveLabsProcessor from "../services/twelveLabsAnalysis.ts";

export const queryTwelveLabs = async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) {
            return res.status(400).json({ message: "Query text is required." });
        }
        const results = await twelveLabsProcessor(query);
        res.status(200).json(results);
    } catch (error) {
        console.error("Error querying Twelve Labs:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};
