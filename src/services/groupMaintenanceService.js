const pino = require("pino");
const logger = pino({
  transport: {
    target: "pino-pretty",
  },
});

const Database = require("better-sqlite3");
let db = new Database("./database.sqlite");
const lkMenu = require("../lookups/lkMenu");
const {
  formatDateTimeFromDB,
  formatDateTimeToDB,
} = require("../utils/formatDate");

const getGroupList = () => {
  let responseCode = "01";
  let responseMessage = "No records found";
  let listOfActiveGroups = [];

  try {
    const stmt = db.prepare("SELECT * FROM mt_group where status_code != 'D'");
    const rows = stmt.all();

    if (rows.length > 0) {
      responseCode = "00";
      responseMessage = "Success";
      rows.forEach((row) => {
        let activeGroup = {
          groupId: row?.group_id,
          groupCode: row?.group_code,
          groupDescription: row?.group_desc,
          statusDesc: row?.status_code === "A" ? "ACTIVE" : "INACTIVE",
          createdBy: row?.created_by,
          createdDateTime: formatDateTimeFromDB(row?.created_datetime),
          editedBy: row?.edited_by,
          editedDateTime: formatDateTimeFromDB(row?.edited_datetime),
        };
        listOfActiveGroups.push(activeGroup);
      });
    }
  } catch (error) {
    throw new Error(error.message);
  }

  return {
    responseCode,
    responseMessage,
    listOfActiveGroups,
  };
};

const getGroupDetailByGroupId = (groupId) => {
  let responseCode = "01";
  let responseMessage = "No records found";
  let groupDto = {};
  let groupAndMenuAccessList = [];

  try {
    let stmt = db.prepare(
      "SELECT * FROM mt_group WHERE status_code != 'D' AND group_id = ?"
    );
    const group = stmt.get(groupId);

    if (group) {
      responseCode = "00";
      responseMessage = "Success";
      groupDto = {
        groupId: group?.group_id,
        groupCode: group?.group_code,
        groupDescription: group?.group_desc,
        statusDesc: group?.status_code === "A" ? "ACTIVE" : "INACTIVE",
        createdBy: group?.created_by,
        createdDateTime: formatDateTimeFromDB(group?.created_datetime),
        editedBy: group?.edited_by,
        editedDateTime: formatDateTimeFromDB(group?.edited_datetime),
      };
    }

    stmt = db.prepare(
      "SELECT * FROM mt_group_menu_access where group_id = ? AND status_code != 'D'"
    );
    const rows = stmt.all(groupId);

    if (rows.length > 0) {
      const lkMenuList = lkMenu();

      rows.forEach((row) => {
        let groupAndMenuAccess = {
          menuId: row?.menu_id,
          menuName: lkMenuList.find((menu) => menu.menu_id === row.menu_id)
            .menu_name,
          rights: [
            {
              name: "add",
              access:
                lkMenuList.find((menu) => menu.menu_id === row.menu_id)
                  .has_add === 1
                  ? true
                  : false,
              checked: row?.is_add_granted === 1 ? true : false,
            },
            {
              name: "edit",
              access:
                lkMenuList.find((menu) => menu.menu_id === row.menu_id)
                  .has_edit === 1
                  ? true
                  : false,
              checked: row?.is_edit_granted === 1 ? true : false,
            },
            {
              name: "delete",
              access:
                lkMenuList.find((menu) => menu.menu_id === row.menu_id)
                  .has_delete === 1
                  ? true
                  : false,
              checked: row?.is_delete_granted === 1 ? true : false,
            },
            {
              name: "view",
              access:
                lkMenuList.find((menu) => menu.menu_id === row.menu_id)
                  .has_view === 1
                  ? true
                  : false,
              checked: row?.is_view_granted === 1 ? true : false,
            },
          ],
        };
        groupAndMenuAccessList.push(groupAndMenuAccess);
      });
    }
  } catch (error) {
    throw new Error(error.message);
  }

  return {
    responseCode,
    responseMessage,
    groupDto,
    groupAndMenuAccessList,
  };
};

const getDefaultMenuList = () => {
  let responseCode = "01";
  let responseMessage = "No records found";
  let listOfActiveMenus = [];

  const lkMenuList = lkMenu();

  try {
    if (lkMenuList.length > 0) {
      responseCode = "00";
      responseMessage = "Success";
      lkMenuList.forEach((menu) => {
        let activeMenu = {
          menuId: menu?.menu_id,
          menuCode: menu?.menu_code,
          menuName: menu?.menu_name,
          rights: [
            {
              name: "add",
              access: menu?.has_add === 1 ? true : false,
              checked: false,
            },
            {
              name: "edit",
              access: menu?.has_edit === 1 ? true : false,
              checked: false,
            },
            {
              name: "delete",
              access: menu?.has_delete === 1 ? true : false,
              checked: false,
            },
            {
              name: "view",
              access: menu?.has_view === 1 ? true : false,
              checked: false,
            },
          ],
        };
        listOfActiveMenus.push(activeMenu);
      });
    }
  } catch (error) {
    throw new Error(error.message);
  }

  return {
    responseCode,
    responseMessage,
    listOfActiveMenus,
  };
};

const createGroup = (reqObj, username) => {
  let responseCode = "01";
  let responseMessage = "Failed to create group";
  const currentDateTime = formatDateTimeToDB(new Date());

  try {
    const stmt = db.prepare(
      "SELECT * FROM mt_group WHERE group_code = ? AND status_code != 'D'"
    );
    const row = stmt.get(reqObj.groupCode);

    if (row) {
      responseMessage = "Group code already exists";
      return {
        responseCode,
        responseMessage,
      };
    }

    db.transaction(() => {
      const grpStmt = db.prepare(
        "INSERT INTO mt_group (group_code, group_desc, status_code, created_by, created_datetime, edited_by, edited_datetime ) " +
          " VALUES (?, ?, ?, ?, ?, ?, ?)"
      );
      const result = grpStmt.run(
        reqObj.groupCode,
        reqObj.groupDescription,
        reqObj.statusDesc === "ACTIVE" ? "A" : "I",
        username,
        currentDateTime,
        username,
        currentDateTime
      );

      const { groupAccessList } = reqObj;

      let grpMenuAccessValues = "";
      groupAccessList.forEach((groupAccess, index) => {
        grpMenuAccessValues += `(${result.lastInsertRowid}, ${
          groupAccess.menuId
        }, ${groupAccess.rights[3].checked ? 1 : 0}, ${
          groupAccess.rights[3].checked ? 1 : 0
        }, ${groupAccess.rights[0].checked ? 1 : 0}, ${
          groupAccess.rights[1].checked ? 1 : 0
        }, ${
          groupAccess.rights[2].checked ? 1 : 0
        }, 1, 'A','${username}','${currentDateTime}', '${username}', '${currentDateTime}')`;

        if (index < groupAccessList.length - 1) {
          grpMenuAccessValues += ",\n";
        }
      });
      const insertString =
        "INSERT INTO mt_group_menu_access (group_id, menu_id, is_page_granted, is_view_granted, " +
        "is_add_granted, is_edit_granted, is_delete_granted, is_export_granted, status_code, " +
        "created_by, created_datetime, edited_by, edited_datetime) VALUES " +
        grpMenuAccessValues;

      const grpMenuAccessStmt = db.prepare(insertString);
      grpMenuAccessStmt.run();

      if (result.changes > 0) {
        responseCode = "00";
        responseMessage = "Group created successfully";
      }
    })();
  } catch (error) {
    throw new Error("Error in createGroup: " + error);
  }

  return {
    responseCode,
    responseMessage,
  };
};

const updateGroup = (reqObj, username) => {
  let responseCode = "01";
  let responseMessage = "Failed to update group";
  const currentDateTime = formatDateTimeToDB(new Date());

  try {
    db.transaction(() => {
      const grpStmt = db.prepare(
        "UPDATE mt_group SET group_code = ?, group_desc = ?, status_code = ?, " +
          "edited_by = ?, edited_datetime = ? WHERE status_code != 'D' AND group_id = ?"
      );
      const result = grpStmt.run(
        reqObj.groupCode,
        reqObj.groupDescription,
        reqObj.statusDesc === "ACTIVE" ? "A" : "I",
        username,
        currentDateTime,
        reqObj.groupId
      );

      const { groupAccessList } = reqObj;

      let updateString = "";
      groupAccessList.forEach((groupAccess, index) => {
        updateString += `UPDATE mt_group_menu_access SET 
          is_view_granted = ${groupAccess.rights[3].checked ? 1 : 0}, 
          is_add_granted = ${groupAccess.rights[0].checked ? 1 : 0}, 
          is_edit_granted = ${groupAccess.rights[1].checked ? 1 : 0}, 
          is_delete_granted = ${groupAccess.rights[2].checked ? 1 : 0}, 
          status_code = 'A', 
          edited_by = '${username}', 
          edited_datetime = '${currentDateTime}' 
          WHERE status_code != 'D' AND group_id = ${
            reqObj.groupId
          } AND menu_id = ${groupAccess.menuId};\n`;
      });

      db.exec(updateString, function (err) {
        if (err) {
          logger.error("Error in updateGroup:", err.message);
          throw new Error("Error in updateGroup: " + err.message);
        }
        logger.info("Group menu access records updated successfully");
      });

      if (result.changes > 0) {
        responseCode = "00";
        responseMessage = "Group updated successfully";
      }
    })();
  } catch (error) {
    throw new Error("Error in updateGroup: " + error);
  }

  return {
    responseCode,
    responseMessage,
  };
};

const deleteGroup = (groupId, username) => {
  let responseCode = "01";
  let responseMessage = "Failed to delete group";
  const currentDateTime = formatDateTimeToDB(new Date());

  try {
    db.transaction(() => {
      const grpStmt = db.prepare(
        "UPDATE mt_group SET status_code = ?, edited_by = ?, edited_datetime = ? WHERE status_code != 'D' AND group_id = ?"
      );
      const result = grpStmt.run("D", username, currentDateTime, groupId);

      const grpMenuAccessStmt = db.prepare(
        "UPDATE mt_group_menu_access SET status_code = ?, edited_by = ?, edited_datetime = ?  WHERE status_code != 'D' AND group_id = ?"
      );
      grpMenuAccessStmt.run("D", username, currentDateTime, groupId);

      if (result.changes > 0) {
        responseCode = "00";
        responseMessage = "Group updated successfully";
      }
    })();
  } catch (error) {
    throw new Error("Error in updateGroup: " + error);
  }

  return {
    responseCode,
    responseMessage,
  };
};

module.exports = {
  getGroupList,
  getGroupDetailByGroupId,
  getDefaultMenuList,
  createGroup,
  updateGroup,
  deleteGroup,
};
