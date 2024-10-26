const Database = require("better-sqlite3");
let db = new Database("./database.sqlite");

const lkMenu = () => {
  const stmt = db.prepare(
    "SELECT * FROM lk_menu where status_code != 'D' ORDER BY menu_id"
  );
  const rows = stmt.all();
  return rows;
};

module.exports = lkMenu;
