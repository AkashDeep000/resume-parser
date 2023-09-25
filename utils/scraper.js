import PDFParser from "pdf2json";
import camelCase from "camelcase";
import { DateTime } from "luxon";
import parseExperience from "./parseExperience.js";
import parseEducation from "./parseEducation.js";

const scraper = (pdfBuffer) => {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();
    pdfParser.parseBuffer(pdfBuffer);

    pdfParser.on("pdfParser_dataError", (errData) => {
      console.error(errData.parserError);
      reject(new Error(errData));
    });

    pdfParser.on("pdfParser_dataReady", (pdfData) => {
      try {
        //converting URI encoding to normal text
        for (var i = 0; i < pdfData.Pages.length; i++) {
          for (var j = 0; j < pdfData.Pages[i].Texts.length; j++) {
            pdfData.Pages[i].Texts[j].R[0].T = decodeURIComponent(
              pdfData.Pages[i].Texts[j].R[0].T
            );
          }
        }

        //staring scraping
        const pages = pdfData.Pages;

        const leftTexts = [];
        const rightTexts = [];

        for (let i = 0; i < pages.length; i++) {
          const texts = pages[i].Texts;
          for (let j = 0; j < texts.length; j++) {
            if (texts[j].x < 13) {
              leftTexts.push(texts[j]);
            } else if (texts[j].y < 47.5) {
              rightTexts.push(texts[j]);
            }
          }
        }

        const leftData = {};
        let leftActiveSection;
        for (let i = 0; i < leftTexts.length; i++) {
          if (leftTexts[i].R[0].TS[1] === 16) {
            leftActiveSection = leftTexts[i].R[0].T;
            leftData[camelCase(leftActiveSection)] = [];
          } else {
            const leftActiveSectionData =
              leftData[camelCase(leftActiveSection)];
            if (
              !leftActiveSectionData ||
              leftTexts[i - 1].oc === "#a8b0b5" ||
              leftTexts[i].y - leftTexts[i - 1]?.y > 1
            ) {
              if (leftActiveSection === "Contact") {
                let emailRegex = new RegExp("[a-z0-9]+@[a-z]+.[a-z]{2,3}");

                leftActiveSectionData.push({
                  info: leftTexts[i].R[0].T,
                  type: emailRegex.test(leftTexts[i].R[0].T)
                    ? "Email"
                    : "Unknown",
                });
              } else if (leftActiveSection === "Languages") {
                leftActiveSectionData.push({
                  name: leftTexts[i].R[0].T,
                  proficiency: "",
                });
              } else {
                leftActiveSectionData.push(leftTexts[i].R[0].T);
              }
            } else {
              if (leftActiveSection === "Contact") {
                if (leftTexts[i].R[0].T.trim().startsWith("(")) {
                  leftActiveSectionData[leftActiveSectionData.length - 1].type =
                    leftTexts[i].R[0].T.trim().replace(/[()]/g, "");
                } else {
                  leftActiveSectionData[
                    leftActiveSectionData.length - 1
                  ].info += leftTexts[i].R[0].T.trim();
                }
              } else if (leftActiveSection === "Languages") {
                if (leftTexts[i].R[0].T.trim().startsWith("(")) {
                  leftActiveSectionData[
                    leftActiveSectionData.length - 1
                  ].proficiency = leftTexts[i].R[0].T.trim().replace(
                    /[()]/g,
                    ""
                  );
                } else {
                  leftActiveSectionData[
                    leftActiveSectionData.length - 1
                  ].name += leftTexts[i].R[0].T.trim();
                }
              } else {
                leftActiveSectionData[leftActiveSectionData.length - 1] +=
                  " " + leftTexts[i].R[0].T.trim();
              }
            }
          }
        }
        // renaming the languages to language
        leftData["language"] = leftData["languages"];
        delete leftData["languages"];

        const rightData = {
          name: "",
          tagline: "",
          location: "",
        };
        rightData.createdAt = DateTime.fromISO(
          pdfData.Meta.Metadata["xmp:createdate"]
        ).toISODate();

        let gotLocation = false;
        for (let i = 0; i < rightTexts.length; i++) {
          if (!gotLocation) {
            if (rightTexts[i].R[0].TS[1] === 29) {
              rightData.name += " " + rightTexts[i].R[0].T;
            }
            if (
              rightTexts[i].R[0].TS[1] === 15 &&
              rightTexts[i].oc !== "#b0b0b0"
            ) {
              rightData.tagline += " " + rightTexts[i].R[0].T;
            }
            if (
              rightTexts[i].R[0].TS[1] === 15 &&
              rightTexts[i].oc === "#b0b0b0"
            ) {
              rightData.location += " " + rightTexts[i].R[0].T;
            }
            if (rightTexts[i].R[0].TS[1] === 18.75) {
              gotLocation = true;
            }
          }
        }

        const summaryRelatedTexts = [];
        const experienceRelatedTexts = [];
        const educationRelatedTexts = [];
        let rightActiveSection;
        for (let i = 0; i < rightTexts.length; i++) {
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

        if (
          !experience?.[0]?.roles[0]?.dateEnd &&
          experience?.[0]?.roles[0]?.dateStart
        ) {
          rightData.currentRole = experience[0].roles[0].name;
          rightData.currentCompany = experience[0].name;
        }

        summaryRelatedTexts.forEach((item, i) => {
          if (!rightData.summary) {
            rightData.summary = "";
          }
          if (item.y - summaryRelatedTexts[i - 1]?.y > 1.8) {
            rightData.summary += "\n\n";
          } else if (
            item.y - summaryRelatedTexts[i - 1]?.y > 1.2 ||
            /^-|^•|^ /.test(item.R[0].T)
          ) {
            rightData.summary += "\n";
          } else {
            rightData.summary += " ";
          }
          rightData.summary += item.R[0].T;
          rightData.summary = rightData.summary.trim();
        });

        rightData.experience = experience;
        rightData.education = education;

        const finalData = { ...rightData, ...leftData };
        resolve(finalData);
      } catch (error) {
        console.log(error);
        reject(new Error(error));
      }
    });
  });
};

export default scraper;
