import PDFParser from "pdf2json";
import camelCase from "camelcase";
import parseExperience from "./parseExperience.js";
import parseEducation from "./parseEducation.js";

const scraper = (pdfBuffer) => {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();
    pdfParser.parseBuffer(pdfBuffer);
    // pdfParser.loadPDF("/storage/emulated/0/Download/Steely_M.pdf");

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
            leftData[camelCase(leftActiveSection)] = [];
          } else {
            //console.log(leftTexts[i]);
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
                  type: emailRegex.test(leftTexts[i].R[0].T) ? "Email" : "Unknown",
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

        if (experience?.[0]?.roles[0]?.dateEnd) {
          rightData.currentRole = experience[0].roles[0].name;
          rightData.currentCompany = experience[0].name;
        }

        summaryRelatedTexts.forEach((item, i) => {
          if (!rightData.summary) {
            rightData.summary = "";
          }
          // console.log(item);
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
        reject(new Error(error));
      }
    });
  });
};

export default scraper;
