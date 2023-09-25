import { DateTime } from "luxon";

const parseEducation = (data) => {
  const education = [];
  let activeEducation;
  let activeEducationDesc = "";
  data.forEach((item, i) => {
    if (item.R[0].TS[1] === 15) {
      if (data[i - 1]?.R[0].TS[1] === 15) {
        activeEducation.institutionName += item.R[0].T;
      } else {
        activeEducation = { name: item.R[0].T, index: i };
        activeEducationDesc = "";
        education.push({
          institutionName: item.R[0].T,
          course: "",
          dateStart: null,
          dateEnd: null,
        });
      }
    }
    if (item.R[0].TS[1] === 13.5) {
      activeEducationDesc += " " + item.R[0].T;
      activeEducationDesc.trim();
      if (data[i + 1]?.R[0].TS[1] === 15 || i === data.length - 1) {
        education[education.length - 1].course =
          activeEducationDesc.split(" · ")[0];
        const dateText = activeEducationDesc.split(" · ")[1];
        if (dateText) {
          const dateArray = dateText.match(/\(([^)]+)\)/)?.[1].split(" - ");
          if (!dateArray?.[0]) {
            dateArray[1] = "Not Present";
          }
          if (!dateArray?.[1]) {
            dateArray[1] = "Not Present";
          }

          education[education.length - 1].dateStart = DateTime.fromFormat(
            dateArray?.[0],
            "yyyy"
          );
          education[education.length - 1].dateEnd = DateTime.fromFormat(
            dateArray?.[1],
            "yyyy"
          );
          if (education[education.length - 1].dateStart.invalid) {
            education[education.length - 1].dateStart = DateTime.fromFormat(
              dateArray[0],
              "MMMM yyyy"
            );
          }
          if (education[education.length - 1].dateEnd.invalid) {
            education[education.length - 1].dateEnd = DateTime.fromFormat(
              dateArray[1],
              "MMMM yyyy"
            );
          }
          education[education.length - 1].dateStart =
            education[education.length - 1].dateStart.toISODate();
          education[education.length - 1].dateEnd =
            education[education.length - 1].dateEnd.toISODate();
        }
      }
    }
  });
  return education;
};
export default parseEducation;
