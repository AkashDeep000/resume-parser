import { DateTime } from "luxon";

const parseEducation = (data) => {
  const education = [];
  let activeEducation;
  data.forEach((item, i) => {
    if (item.R[0].TS[1] === 15) {
      if (data[i - 1]?.R[0].TS[1] === 15) {
        activeEducation.institutionName += item.R[0].T;
      } else {
        activeEducation = { name: item.R[0].T, index: i };
        education.push({
          institutionName: item.R[0].T,
          course: "",
          dateStart: "",
          dateEnd: "",
        });
      }
    }
    if (item.R[0].TS[1] === 13.5) {
      if (!item.R[0].T.startsWith(" · (")) {
        education[education.length - 1].course += " " + item.R[0].T;
        education[education.length - 1].course =
          education[education.length - 1].course.trim();
      } else {
        const dateArray = item.R[0].T.match(/\(([^)]+)\)/)?.[1].split(" - ");

        education[education.length - 1].dateStart = DateTime.fromFormat(
          dateArray[0],
          "yyyy"
        );
        education[education.length - 1].dateEnd = DateTime.fromFormat(
          dateArray[1],
          "yyyy"
        );
        if (education[education.length - 1].dateStart.invalid) {
          education[education.length - 1].dateStart = DateTime.fromFormat(
            dateArray[0],
            "MMMM yyyy"
          );
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
  });
  return education;
};
export default parseEducation;
