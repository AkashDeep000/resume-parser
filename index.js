import fs from "fs";
import PDFParser from "pdf2json";
import express from "express";
import parseExperience from "./utils/parseExperience.js";
import parseEducation from "./utils/parseEducation.js";

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  const demo = req.query.demo;
  console.log(demo);
  if (!demo) {
    res.send("View demo by adding '?demo=1' at the end of the url");
  }
  if (demo > 10 || demo < 1) {
    res.send("Only 10 demo available (must be between 1 to 10)");
  }
  const pdfParser = new PDFParser();
  pdfParser.loadPDF(`cv/${demo}.pdf`);

  pdfParser.on("pdfParser_dataError", (errData) =>
    console.error(errData.parserError)
  );
  pdfParser.on("pdfParser_dataReady", (pdfData) => {
    const pages = JSON.parse(decodeURIComponent(JSON.stringify(pdfData.Pages)));
    const leftTexts = [];
    const rightTexts = [];

    for (let i = 0; i < pages.length; i++) {
      const texts = pages[i].Texts;
      for (let j = 0; j < texts.length; j++) {
        if (texts[j].x < 13) {
          leftTexts.push(texts[j]);
        } else if (texts[j].y < 47) {
          rightTexts.push(texts[j]);
          //console.log(texts[j].R);
        }
      }
    }
    //console.log({ leftTexts, rightTexts });
    const leftData = {};
    let leftActiveSection;
    for (let i = 0; i < leftTexts.length; i++) {
      //console.log(leftTexts[i]);
      if (leftTexts[i].R[0].TS[1] === 16) {
        leftActiveSection = leftTexts[i].R[0].T;
        leftData[leftActiveSection] = [];
      } else {
        //console.log(leftTexts[i]);
        if (
          leftData[leftActiveSection].length === 0 ||
          leftTexts[i - 1].oc === "#a8b0b5" ||
          leftTexts[i].y - leftTexts[i - 1]?.y > 1
        ) {
          leftData[leftActiveSection].push(leftTexts[i].R[0].T);
        } else {
          leftData[leftActiveSection][leftData[leftActiveSection].length - 1] +=
            isValidUrl(
              leftData[leftActiveSection][
                leftData[leftActiveSection].length - 1
              ]
            ) && leftTexts[i].oc !== "#a8b0b5"
              ? ""
              : " ";
          leftData[leftActiveSection][leftData[leftActiveSection].length - 1] +=
            leftTexts[i].R[0].T.trim();
        }
      }
    }

    const rightData = {};
    rightData.name = rightTexts[0].R[0].T;
    rightData.tagline = rightTexts[1].R[0].T;
    rightData.location = rightTexts[2].R[0].T;
    const summaryRelatedTexts = [];
    const experienceRelatedTexts = [];
    const educationRelatedTexts = [];
    let rightActiveSection;
    for (let i = 0; i < rightTexts.length; i++) {
      //console.log(rightTexts[i]);
      if (rightTexts[i].R[0].TS[1] === 18.75) {
        rightActiveSection = rightTexts[i].R[0].T;
      } else {
        if (rightActiveSection === "Summary") {
          summaryRelatedTexts.push(rightTexts[i]);
        }
        if (rightActiveSection === "Experience") {
          experienceRelatedTexts.push(rightTexts[i]);
        }
        if (rightActiveSection === "Education") {
          educationRelatedTexts.push(rightTexts[i]);
        }
      }
    }

    const experience = parseExperience(experienceRelatedTexts);
    const education = parseEducation(educationRelatedTexts);

    summaryRelatedTexts.forEach((item, i) => {
      // console.log(item);
      if (item.y - summaryRelatedTexts[i - 1]?.y > 1.8) {
        rightData.Summary += "\n\n";
      } else if (
        item.y - summaryRelatedTexts[i - 1]?.y > 1.2 ||
        /^-|^•|^ /.test(item.R[0].T)
      ) {
        rightData.Summary += "\n";
      } else {
        rightData.Summary += " ";
      }
      rightData.Summary += item.R[0].T;
      rightData.Summary = rightData.Summary.trim();
    });

    if (experience[0].roles[0].timeframe.includes("Present")) {
      rightData.currentRole = experience[0].roles[0].name;
      rightData.currentCompany = experience[0].name;
    }

    rightData.Experience = experience;
    rightData.Education = education;

    const data = { ...rightData, ...leftData };
    res.json(data);
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

function isValidUrl(str) {
  const pattern = new RegExp(
    "^([a-zA-Z]+:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR IP (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$", // fragment locator
    "i"
  );
  return pattern.test(str);
}
