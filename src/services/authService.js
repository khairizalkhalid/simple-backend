const pino = require("pino");
const logger = pino({
  transport: {
    target: "pino-pretty",
  },
});
const bcrypt = require("bcryptjs");

const { generateToken } = require("../utils/jwtGenerator");
const lkMenu = require("../lookups/lkMenu");
const { formatDateTimeToDB } = require("../utils/formatDate");

const Database = require("better-sqlite3");
let db = new Database("./database.sqlite");

const login = async (username, password) => {
  let query = "";
  let stmt;
  let user;

  let responseCode = "";
  let responseMessage = "";
  let group = {};
  let menuList = [];
  let jwtToken = "";
  let refreshToken = "";
  let loginSessionId = 0;
  let lastLoginDateTime = "";
  let response = {
    responseCode,
    responseMessage,
  };

  try {
    query = `SELECT * FROM mt_user WHERE username = ? and status_code != 'D'`;
    stmt = db.prepare(query);
    user = stmt.get(username);
    let user_id = user?.user_id;

    if (user) {
      const currentDateTime = formatDateTimeToDB(new Date());
      const authenticated = bcrypt.compareSync(password, user?.password);

      if (!authenticated) {
        responseCode = "01";
        responseMessage = "Invalid username or password";

        query = `INSERT INTO lg_login_session (error_msg, is_success, jwt_token, login_datetime, user_id) VALUES (?, ?, ?, ?, ?)`;
        stmt = db.prepare(query);
        stmt.run(
          "Invalid username or password",
          0,
          null,
          currentDateTime,
          user_id
        );

        return {
          responseCode: "01",
          responseMessage: "Invalid username or password",
        };
      }

      jwtToken = generateToken({
        userId: user_id,
        username: username,
        lastLoginDateTim: currentDateTime,
      });
      logger.info("JWT Token: " + jwtToken);

      query = `INSERT INTO lg_login_session (error_msg, is_success, jwt_token, login_datetime, user_id) VALUES (?, ?, ?, ?, ?)`;
      stmt = db.prepare(query);
      stmt.run(null, 1, jwtToken, currentDateTime, user_id);

      query = `SELECT login_session_id FROM lg_login_session WHERE user_id = ? AND is_success = 1  ORDER BY login_datetime DESC LIMIT 1`;
      stmt = db.prepare(query);
      loginSessionId = stmt.get(user_id);
      lastLoginDateTime = currentDateTime;

      query = `SELECT * FROM mt_user_group WHERE user_id = ? and status_code != 'D'`;
      stmt = db.prepare(query);
      const userGroup = stmt.get(user_id);

      query = `SELECT * FROM mt_group WHERE group_id = ? and status_code != 'D'`;
      stmt = db.prepare(query);
      const mtGroup = stmt.get(userGroup.group_id);
      group = {
        groupId: mtGroup.group_id,
        groupCode: mtGroup.group_code,
        groupDescription: mtGroup.group_desc,
      };

      const lkMenuList = lkMenu();

      query = `SELECT * FROM mt_group_menu_access WHERE group_id = ? and status_code != 'D'`;
      stmt = db.prepare(query);
      let rows = stmt.all(userGroup.group_id);

      rows.forEach((row) => {
        let menu = {
          menuCode: lkMenuList.find((menu) => menu.menu_id === row.menu_id)
            .menu_code,
          menuName: lkMenuList.find((menu) => menu.menu_id === row.menu_id)
            .menu_name,
          view: row.is_view_granted === 1 ? true : false,
          add: row.is_add_granted === 1 ? true : false,
          edit: row.is_edit_granted === 1 ? true : false,
          delete: row.is_delete_granted === 1 ? true : false,
        };
        menuList.push(menu);
      });

      response = {
        respStatus: "SUCCESS",
        respCode: "EVS00000",
        respDesc: "Success.",
        respTime: "2024-10-11T21:00:03.266+0800",
        payload: {
          userId: user?.user_id,
          email: user?.username,
          status: "ACTIVE",
          logonId: loginSessionId?.login_session_id,
          token: jwtToken,
          roles: [
            "ROLE_USER"
          ]
        }
      };
    } else {
      return {
        responseCode: "01",
        responseMessage: "Invalid username or password",
      };
    }
  } catch (error) {
    throw new Error(error.message);
  }

  return response;
};

const refreshToken = async (sessionId) => {
  let query = "";
  let stmt;
  let responseCode = "";
  let responseMessage = "";
  let jwtToken;
  let response = {
    responseCode,
    responseMessage,
  };

  try {
    query = `SELECT * FROM lg_login_session WHERE login_session_id = ? and is_success = 1`;
    stmt = db.prepare(query);
    const loginSession = stmt.get(sessionId);
    const { user_id } = loginSession;

    if (loginSession) {
      const currentDateTime = formatDateTimeToDB(new Date());
      jwtToken = generateToken({
        userId: user_id,
        lastLoginDateTim: currentDateTime,
      });

      query = `UPDATE lg_login_session SET jwt_token = ? WHERE login_session_id = ?`;
      stmt = db.prepare(query);
      stmt.run(jwtToken, sessionId);

      response = {
        responseCode: "00",
        responseMessage: "Success",
        jwtToken,
        refreshToken: "",
      };
    } else {
      response = {
        responseCode: "01",
        responseMessage: "Invalid session",
      };
    }
  } catch (error) {
    throw new Error(error.message);
  }

  return response;
};

const logOut = async (sessionId) => {
  let query = "";
  let stmt;
  let responseCode = "";
  let responseMessage = "";
  let response = {
    responseCode,
    responseMessage,
  };

  try {
    query = `SELECT * FROM lg_login_session WHERE login_session_id = ? and is_success = 1`;
    stmt = db.prepare(query);
    const loginSession = stmt.get(sessionId);

    if (loginSession) {
      const currentDateTime = formatDateTimeToDB(new Date());

      query = `UPDATE lg_login_session SET logout_datetime = ? WHERE login_session_id = ?`;
      stmt = db.prepare(query);
      stmt.run(currentDateTime, sessionId);

      response = {
        responseCode: "00",
        responseMessage: "Success",
      };
    } else {
      response = {
        responseCode: "01",
        responseMessage: "Invalid session",
      };
    }
  } catch (error) {
    throw new Error(error.message);
  }

  return response;
};

module.exports = {
  login,
  refreshToken,
  logOut,
};
