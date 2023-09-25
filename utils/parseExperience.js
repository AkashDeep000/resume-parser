import { DateTime } from "luxon";

const parseExperience = (data) => {
  const companies = [];
  let activeCompany;
  let activeRole;
  let insideDesc = false;
  data.forEach((item, i) => {
    if (item.R[0].TS[1] === 15) {
      if (data[i - 1]?.R[0].TS[1] === 15) {
        companies[companies.length - 1].companyName += " " + item.R[0].T;
        activeCompany.index = i;
      } else {
        activeCompany = { companyName: item.R[0].T, index: i };
        companies.push({
          companyName: item.R[0].T,
          roles: [],
        });
      }
    }

    if (item.R[0].TS[1] === 14.5) {
      if (data[i - 1]?.R[0].TS[1] === 14.5) {
        companies[companies.length - 1].roles[
          companies[companies.length - 1].roles.length - 1
        ].title += " " + item.R[0].T;
        activeRole.index = i;
      } else {
        activeRole = { title: item.R[0].T, index: i };
        insideDesc = false;
        companies[companies.length - 1].roles.push({
          title: item.R[0].T,
          dateStart: "",
          dateEnd: "",
          duration: "",
          location: "",
          desc: "",
        });
      }
    }
    if (item.R[0].TS[1] === 13.5 && i === activeRole?.index + 1) {
      const roles = companies[companies.length - 1].roles;
      
      const dateArray = item.R[0].T.trim().split(" - ");
      if (!dateArray?.[0]) {
        dateArray[1] = "Not Present";
      }
      if (!dateArray?.[1]) {
        dateArray[1] = "Not Present";
      }

      roles[roles.length - 1].dateStart = DateTime.fromFormat(
        dateArray[0],
        "MMMM yyyy"
      );
      roles[roles.length - 1].dateEnd = DateTime.fromFormat(
        dateArray[1],
        "MMMM yyyy"
      );

      if (roles[roles.length - 1].dateStart.invalid) {
        roles[roles.length - 1].dateStart = DateTime.fromFormat(
          dateArray[0],
          "yyyy"
        );
        roles[roles.length - 1].dateEnd = DateTime.fromFormat(
          dateArray[1],
          "yyyy"
        );
      }
      roles[roles.length - 1].dateStart =
        roles[roles.length - 1].dateStart.toISODate();
      roles[roles.length - 1].dateEnd =
        roles[roles.length - 1].dateEnd.toISODate();
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
      i > activeRole?.index &&
      item.oc === "#b0b0b0"
    ) {
      const roles = companies[companies.length - 1].roles;
      roles[roles.length - 1].location += " " + item.R[0].T;
      roles[roles.length - 1].location =
        roles[roles.length - 1].location.trim();
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
