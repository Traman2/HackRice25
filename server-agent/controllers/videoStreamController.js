import { GridFSBucket } from "mongodb";

const videoStreamGet = async (req, res) => {
    try {
        const { filename } = req.params;

        // Find file info in GridFS
        const filesCollection = mongoose.connection.db.collection("tutorialDB.files");
        const file = await filesCollection.findOne({ filename });

        if (!file) {
            return res.status(404).send("File not found");
        }

        const range = req.headers.range;
        if (!range) {
            return res.status(400).send("Requires Range header");
        }

        const videoSize = file.length;
        const chunkSize = 1 * 1e6; // 1MB chunks
        const start = Number(range.replace(/\D/g, ""));
        const end = Math.min(start + chunkSize, videoSize - 1);

        const contentLength = end - start + 1;

        res.writeHead(206, {
            "Content-Range": `bytes ${start}-${end}/${videoSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": contentLength,
            "Content-Type": "video/mp4",
        });

        const downloadStream = bucket.openDownloadStreamByName(filename, {
            start,
            end,
        });

        downloadStream.pipe(res);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error streaming video");
    }
}