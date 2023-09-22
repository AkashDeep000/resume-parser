import { DateTime } from "luxon";

const parseExperience = (data) => {
  const companies = [];
  let activeCompany;
  let activeRole;
  let insideDesc = false;
  data.forEach((item, i) => {
    //console.log(item.R);
    if (item.R[0].TS[1] === 15) {
      activeCompany = { name: item.R[0].T, index: i };
      companies.push({
        name: item.R[0].T,
        roles: [],
      });
    }

    if (item.R[0].TS[1] === 14.5) {
      activeRole = { name: item.R[0].T, index: i };
      insideDesc = false;
      companies[companies.length - 1].roles.push({
        name: item.R[0].T,
        dateStart: "",
        dateEnd: "",
        duration: "",
        location: "",
        desc: "",
      });
    }
    if (item.R[0].TS[1] === 13.5 && i === activeRole?.index + 1) {
      const roles = companies[companies.length - 1].roles;

      roles[roles.length - 1].dateStart = DateTime.fromFormat(
        item.R[0].T.trim().split(" - ")[0],
        "MMMM yyyy"
      );
      roles[roles.length - 1].dateEnd = DateTime.fromFormat(
        item.R[0].T.trim().split(" - ")[1],
        "MMMM yyyy"
      );
    }
    if (item.R[0].TS[1] === 13.5 && i === activeRole?.index + 2) {
      const roles = companies[companies.length - 1].roles;
      roles[roles.length - 1].duration = item.R[0].T.replace("(", "").replace(
        ")",
        ""
      );
    }
    if (
      item.R[0].TS[1] === 13.5 &&
      i === activeRole?.index + 3 &&
      item.oc === "#b0b0b0"
    ) {
      const roles = companies[companies.length - 1].roles;
      roles[roles.length - 1].location = item.R[0].T;
    }
    if (
      companies[companies.length - 1].roles.length > 0 &&
      item.R[0].TS[1] === 13.5 &&
      i > activeRole.index + 1 &&
      (item.y - data[i - 1].y > 1.2 || insideDesc)
    ) {
      insideDesc = true;
      const roles = companies[companies.length - 1].roles;
      if (item.y - data[i - 1]?.y > 1.8) {
        roles[roles.length - 1].desc += "\n\n";
      } else if (item.y - data[i - 1].y > 1.2 || /^-|^•|^ /.test(item.R[0].T)) {
        roles[roles.length - 1].desc += "\n";
      } else {
        roles[roles.length - 1].desc += " ";
      }

      roles[roles.length - 1].desc += item.R[0].T;

      roles[roles.length - 1].desc = roles[roles.length - 1].desc.trim();
    }
  });
  return companies;
};
export default parseExperience;
