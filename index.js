import fs from "fs";
import PDFParser from "pdf2json";

const pdfParser = new PDFParser();
pdfParser.loadPDF("/storage/emulated/0/Download/cv.pdf");

pdfParser.on("pdfParser_dataError", (errData) =>
  console.error(errData.parserError)
);
pdfParser.on("pdfParser_dataReady", (pdfData) => {
  const pages = pdfData.Pages;
  for (let i = 0; i < pages.length; i++) {
    const texts = pages[i].Texts;
    for (let j = 0; j < texts.length; j++) {
      console.log(texts[j]);
    }
  }
  console.log(pdfData.Meta);
});
