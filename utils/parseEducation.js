const parseEducation = (data) => {
  const education = [];
  let activeEducation;
  data.forEach((item, i) => {
    //console.log(item.R[0]);
    if (item.R[0].TS[1] === 15) {
      if (data[i - 1]?.R[0].TS[1] === 15) {
        activeEducation.institutionName += item.R[0].T;
      } else {
        activeEducation = { name: item.R[0].T, index: i };
        education.push({
          institutionName: item.R[0].T,
          course: "",
          timeframe: "",
        });
      }
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
  });
  return education;
};
export default parseEducation;
