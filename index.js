import fs from "fs";
import PDFParser from "pdf2json";

const pdfParser = new PDFParser();

pdfParser.loadPDF("./cv.pdf");
pdfParser.on("pdfParser_dataReady", (json) => {
  const texts = json.Pages[0].Texts;
  for (let i = 0; i < texts.length; i++) {
    console.log(texts[i]);
  }
});
