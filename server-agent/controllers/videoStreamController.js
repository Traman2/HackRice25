import { GridFSBucket } from "mongodb";

let bucket;

export const initializeVideoStream = (db) => {
  bucket = new GridFSBucket(db, {
    bucketName: "tutorialDB",
  });
};

export const videoStreamGet = async (req, res) => {
    try {
      const { filename } = req.params;
  
      const files = await bucket.find({ filename }).toArray();
      if (!files || files.length === 0) {
        return res.status(404).send("File not found");
      }
  
      const file = files[0];
      const range = req.headers.range;
      if (!range) {
        return res.status(400).send("Requires Range header");
      }
  
      const videoSize = file.length;
  
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : videoSize - 1;
  
      if (start >= videoSize || end >= videoSize) {
        return res.status(416).send(`Requested range not satisfiable: ${start}-${end}`);
      }
  
      const contentLength = end - start + 1;

      console.log(`Streaming file: ${filename}, videoSize: ${videoSize}, range: ${start}-${end}, contentLength: ${contentLength}`);

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
      });
  
      const downloadStream = bucket.openDownloadStreamByName(filename, { start, end });
  
      downloadStream.pipe(res);
  
      downloadStream.on("error", (err) => {
        console.error("Stream error:", err);
        res.sendStatus(500);
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("Error streaming video");
    }
  };
  