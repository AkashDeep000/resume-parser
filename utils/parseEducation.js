const parseEducation = (data) => {
  const education = [];
  let activeEducation;
  data.forEach((item, i) => {
    //console.log(item.R[0]);
    if (item.R[0].TS[1] === 15) {
      activeEducation = { name: item.R[0].T, index: i };
      education.push({
        institutionName: item.R[0].T,
        course: "",
        timeframe: "",
      });
    }
    if (item.R[0].TS[1] === 13.5) {
      if (!item.R[0].T.startsWith(" · (")) {
        education[education.length - 1].course += " " + item.R[0].T;
        education[education.length - 1].course =
          education[education.length - 1].course.trim();
      } else {
        education[education.length - 1].timeframe =
          item.R[0].T.match(/\(([^)]+)\)/)?.[1];
      }
    }

    /*   if (item.R[0].TS[1] === 13.5 && i === activeEducation.index + 1) {
      education[education.length - 1].course = item.R[0].T;
    }
    if (item.R[0].TS[1] === 13.5 && i === activeEducation.index + 2) {
      console.log(item.R[0].T);
      education[education.length - 1].timeframe =
        item.R[0].T.match(/\(([^)]+)\)/)[1];
    }
    */
  });
  return education;
};
export default parseEducation;
