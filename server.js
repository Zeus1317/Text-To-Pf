const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());
app.set("view engine", "ejs");

app.post("/api/generate-pdf", async (req, res) => {
  const { text } = req.body;
  try {
    const uuid = crypto.randomUUID();
    const filePath = path.join(__dirname, "pdfs", `${uuid}.pdf`);
    const writeStream = fs.createWriteStream(filePath);

    const doc = new PDFDocument();
    doc.pipe(writeStream);
    doc.text(text);
    doc.end();

    writeStream.on("close", async () => {
      const content = await fs.promises.readFile(filePath);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=${uuid}.pdf`);
      res.send(content);
    });
  } catch (error) {
    console.error("PDF Error:", error);
    res.status(500).send("PDF generation failed");
  }
});

// Show all PDFs
app.get("/", (req, res) => {
  fs.readdir(path.join(__dirname, "pdfs"), (err, files) => {
    if (err) return res.status(500).send("Failed to read files");
    res.render("allpdfs", { files });
  });
});

// Serve PDF files
app.get("/pdfs/:filename", (req, res) => {
  const filePath = path.join(__dirname, "pdfs", req.params.filename);
  res.sendFile(filePath);
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
