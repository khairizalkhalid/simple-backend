const pino = require("pino");
const logger = pino({
  transport: {
    target: "pino-pretty",
  },
});

const Database = require("better-sqlite3");
let db = new Database("./database.sqlite");
const {
  formatDateTimeFromDB,
  formatDateTimeToDB,
} = require("../utils/formatDate");
const bcrypt = require("bcryptjs");

const getUserList = () => {
  let responseCode = "01";
  let responseMessage = "No records found";
  let listOfActiveUsers = [];

  try {
    const stmt = db.prepare("SELECT * FROM mt_user where status_code != 'D'");
    const rows = stmt.all();

    if (rows.length > 0) {
      const userGroupStmt = db.prepare(
        "SELECT ug.group_id,ug.user_id,g.group_desc as group_desc  FROM mt_user_group as ug, mt_group as g WHERE ug.group_id = g.group_id AND g.status_code != 'D' AND ug.status_code != 'D'"
      );
      const userGroup = userGroupStmt.all();

      rows.forEach((row) => {
        let activeUser = {
          userId: row?.user_id,
          pfNo: row?.username,
          firstName: row?.first_name,
          lastName: row?.last_name,
          contact: row?.contact,
          groupId: userGroup.find((ug) => ug.user_id === row?.user_id)
            ?.group_id,
          groupDesc: userGroup.find((ug) => ug.user_id === row?.user_id)
            ?.group_desc,
          statusDesc: row?.status_code === "A" ? "ACTIVE" : "INACTIVE",
          createdBy: row?.created_by,
          createdDateTime: formatDateTimeFromDB(row?.created_datetime),
          editedBy: row?.edited_by,
          editedDateTime: formatDateTimeFromDB(row?.edited_datetime),
          lastLoginDateTime: formatDateTimeFromDB(row?.last_login_datetime),
        };
        listOfActiveUsers.push(activeUser);
      });
      responseCode = "00";
      responseMessage = "Success";
    }
  } catch (error) {
    throw new Error(error.message);
  }

  return {
    responseCode,
    responseMessage,
    listOfActiveUsers,
  };
};

const getUserDetailByPfNumber = (pfNumber) => {
  let responseCode = "01";
  let responseMessage = "No records found";
  let user = {};

  try {
    const stmt = db.prepare(
      "SELECT * FROM mt_user where username = ? and status_code != 'D'"
    );
    const row = stmt.get(pfNumber);

    if (row) {
      user = {
        pfNo: row?.username,
        firstName: row?.first_name,
        lastName: row?.last_name,
        contact: row?.contact,
        telephone: row?.telephone,
      };
      responseCode = "00";
      responseMessage = "Success";
    }
  } catch (error) {
    throw new Error(error.message);
  }

  return {
    user,
    responseCode,
    responseMessage,
  };
};

const getUserDetailByUserId = (userId) => {
  let responseCode = "01";
  let responseMessage = "No records found";
  let userDto = {};

  try {
    let stmt = db.prepare(
      "SELECT * FROM mt_user where user_id = ? and status_code != 'D' limit 1"
    );
    const row = stmt.get(userId);

    stmt = db.prepare(
      "SELECT * FROM mt_user_group WHERE user_id = ? and status_code != 'D'"
    );
    const userGroup = stmt.get(userId);

    stmt = db.prepare(
      "SELECT * FROM mt_group WHERE group_id = ? and status_code != 'D'"
    );

    const mtGroup = stmt.get(userGroup?.group_id);

    if (row) {
      userDto = {
        userId: row?.user_id,
        pfNo: row?.username,
        firstName: row?.first_name,
        lastName: row?.last_name,
        contact: row?.contact,
        groupId: mtGroup?.group_id,
        groupDesc: mtGroup?.group_desc,
        statusDesc: row?.status_code === "A" ? "ACTIVE" : "INACTIVE",
        createdBy: row?.created_by,
        createdDateTime: formatDateTimeFromDB(row?.created_datetime),
        editedBy: row?.edited_by,
        editedDateTime: formatDateTimeFromDB(row?.edited_datetime),
        lastLoginDateTime: formatDateTimeFromDB(row?.last_login_datetime),
      };
      responseCode = "00";
      responseMessage = "Success";
    }
  } catch (error) {
    throw new Error(error.message);
  }

  return {
    responseCode,
    responseMessage,
    userDto,
  };
};

const createUser = (user, username) => {
  let responseCode = "01";
  let responseMessage = "Failed to create user";
  const currentDateTime = formatDateTimeToDB(new Date());

  try {
    const stmt = db.prepare(
      "SELECT * FROM mt_user WHERE username = ? AND status_code != 'D'"
    );
    const row = stmt.get(user.pfNo);
    logger.info("user" + user.pfNo);

    if (row) {
      return {
        responseCode: "01",
        responseMessage: "User already exists",
      };
    }

    db.transaction(() => {
      const stmt = db.prepare(
        "INSERT INTO mt_user (username, first_name, last_name, contact, " +
          "status_code, created_by, created_datetime, edited_by, edited_datetime, " +
          "password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      );
      const hashedPassword = bcrypt.hashSync(user.newPassword, 10);

      const result = stmt.run(
        user.pfNo,
        user.firstName,
        user.lastName,
        user.contact,
        "A",
        username,
        currentDateTime,
        username,
        currentDateTime,
        hashedPassword
      );

      const userGroupStmt = db.prepare(
        "INSERT INTO mt_user_group (user_id, group_id, status_code, created_by, " +
          "created_datetime, edited_by, edited_datetime) VALUES (?, ?, ?, ?, ?, ?, ?)"
      );
      userGroupStmt.run(
        result.lastInsertRowid,
        user.groupId,
        "A",
        username,
        currentDateTime,
        username,
        currentDateTime
      );

      if (result.changes > 0) {
        responseCode = "00";
        responseMessage = "Successfully Saved";
      }
    })();
  } catch (error) {
    throw new Error(error.message);
  }

  return {
    responseCode,
    responseMessage,
  };
};

const updateUser = (user, userId, username) => {
  let responseCode = "01";
  let responseMessage = "Failed to update user";
  let stmt;
  const currentDateTime = formatDateTimeToDB(new Date());
  try {
    if (user.currentPassword && user.newPassword) {
      if (user.userId !== userId) {
        return {
          responseCode: "01",
          responseMessage: "Invalid user id",
        };
      }

      stmt = db.prepare(
        "SELECT password FROM mt_user WHERE user_id = ? AND status_code != 'D'"
      );
      const row = stmt.get(user.userId);

      const isValidPassword = bcrypt.compareSync(
        user.currentPassword,
        row.password
      );

      if (!isValidPassword) {
        return {
          responseCode: "01",
          responseMessage: "Invalid current password",
        };
      }
    }

    db.transaction(() => {
      if (user.currentPassword && user.newPassword) {
        const hashedPassword = bcrypt.hashSync(user.newPassword, 10);

        stmt = db.prepare("UPDATE mt_user SET password = ? WHERE user_id = ?");
        stmt.run(hashedPassword, user.userId);
      }

      stmt = db.prepare(
        "UPDATE mt_user SET first_name = ?, last_name = ?, contact = ?, " +
          "status_code = ?, edited_by = ?, edited_datetime = ?" +
          "WHERE user_id = ? AND status_code != 'D'"
      );
      const result = stmt.run(
        user.firstName,
        user.lastName,
        user.contact,
        user.statusDesc === "ACTIVE" ? "A" : "I",
        username,
        currentDateTime,
        user.userId
      );

      stmt = db.prepare(
        "UPDATE mt_user_group SET group_id = ?, edited_by = ?, edited_datetime = ? " +
          "WHERE user_id = ? AND status_code != 'D'"
      );
      stmt.run(user.groupId, username, currentDateTime, user.userId);

      if (result.changes > 0) {
        responseCode = "00";
        responseMessage = "Successfully Updated";
      }
    })();
  } catch (error) {
    throw new Error(error.message);
  }

  return {
    responseCode,
    responseMessage,
  };
};

const deleteUser = (userId, username) => {
  let responseCode = "01";
  let responseMessage = "Failed to delete user";
  const currentDateTime = formatDateTimeToDB(new Date());

  try {
    db.transaction(() => {
      let stmt = db.prepare(
        "UPDATE mt_user SET status_code = 'D', edited_by = ?, edited_datetime = ? WHERE user_id = ? AND status_code != 'D'"
      );
      const result = stmt.run(username, currentDateTime, userId);

      stmt = db.prepare(
        "UPDATE mt_user_group SET status_code = 'D', edited_by = ?, edited_datetime = ? WHERE user_id = ? AND status_code != 'D'"
      );
      stmt.run(username, currentDateTime, userId);
      if (result.changes > 0) {
        responseCode = "00";
        responseMessage = "Successfully Deleted";
      }
    })();
  } catch (error) {
    throw new Error(error.message);
  }

  return {
    responseCode,
    responseMessage,
  };
};

module.exports = {
  getUserList,
  getUserDetailByPfNumber,
  getUserDetailByUserId,
  createUser,
  updateUser,
  deleteUser,
};
