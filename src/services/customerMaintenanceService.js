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

const getCustomerList = () => {
  let responseCode = "01";
  let responseMessage = "No records found";
  let listOfActiveCustomers = [];

  try {
    const stmt = db.prepare(
      "SELECT * FROM mt_customer where status_code != 'D'"
    );
    const rows = stmt.all();

    if (rows.length > 0) {
      rows.forEach((row) => {
        let activeCustomer = {
          customerId: row?.customer_id,
          companyName: row?.company_name,
          address: row?.address,
          postalCode: row?.postal_code,
          telephone: row?.telephone,
          fax: row?.fax,
          statusDesc: row?.status_code === "A" ? "ACTIVE" : "INACTIVE",
          createdBy: row?.created_by,
          createdDateTime: formatDateTimeFromDB(row?.created_datetime),
          editedBy: row?.edited_by,
          editedDateTime: formatDateTimeFromDB(row?.edited_datetime),
        };
        listOfActiveCustomers.push(activeCustomer);
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
    listOfActiveCustomers,
  };
};

const createCustomer = (customer, username) => {
  let responseCode = "01";
  let responseMessage = "Failed to create customer";
  const currentDateTime = formatDateTimeToDB(new Date());

  try {
    db.transaction(() => {
      const stmt = db.prepare(
        "INSERT INTO mt_customer (company_name, address, postal_code, telephone, fax, " +
          "status_code, created_by, created_datetime, edited_by, edited_datetime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      );

      const result = stmt.run(
        customer.companyName,
        customer.address,
        customer.postalCode,
        customer.telephone,
        customer.fax,
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

const updateCustomer = (customer, username) => {
  let responseCode = "01";
  let responseMessage = "Failed to update customer";
  const currentDateTime = formatDateTimeToDB(new Date());

  try {
    db.transaction(() => {
      const stmt = db.prepare(
        "UPDATE mt_customer SET company_name = ?, address = ?, postal_code = ?, telephone = ?, fax = ?, " +
          "status_code = ?, edited_by = ?, edited_datetime = ? WHERE customer_id = ? AND status_code != 'D'"
      );

      const result = stmt.run(
        customer.companyName,
        customer.address,
        customer.postalCode,
        customer.telephone,
        customer.fax,
        customer.statusDesc === "ACTIVE" ? "A" : "I",
        username,
        currentDateTime,
        customer.customerId
      );

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

const deleteCustomer = (customerId, username) => {
  let responseCode = "01";
  let responseMessage = "Failed to delete customer";
  const currentDateTime = formatDateTimeToDB(new Date());

  try {
    db.transaction(() => {
      const stmt = db.prepare(
        "UPDATE mt_customer SET status_code = 'D', edited_by = ?, edited_datetime = ? WHERE customer_id = ? AND status_code != 'D'"
      );
      const result = stmt.run(username, currentDateTime, customerId);

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
  getCustomerList,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
