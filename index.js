import fs from "fs/promises";
import express from "express";
import fileUpload from "express-fileupload";
import scraper from "./utils/scraper.js";

const app = express();
app.use(fileUpload());
const port = 3000;

app.all("/", async (req, res) => {
  const demo = req.query.demo;

  if (!(req.files?.pdf || demo)) {
    return res
      .status(400)
      .send(
        "No PDF files is provided.\n\nView demo by adding '?demo=1' at the end of the url"
      );
  }

  let pdfBuffer;
  if (demo) {
    if (demo > 10 || demo < 1) {
      return res
        .status(400)
        .send("Only 10 demo available (must be between 1 to 10)");
    }
    pdfBuffer = await fs.readFile(`cv/${demo}.pdf`);
  } else {
    pdfBuffer = req.files.pdf.data;
  }
  try {
    const data = await scraper(pdfBuffer);
    return res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
