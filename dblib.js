// Add packages
require("dotenv").config();
// Add database package and connection string
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
    max: 2
});


// 
const getTotalRecords = () => {
    const sql = "SELECT COUNT(*) FROM customer";
    return pool.query(sql)
        .then(result => result.rows[0].count)
        .catch(err => {
            throw new Error(`Error: ${err.message}`);
        });
};

module.exports.getTotalRecords = getTotalRecords;


const getAllCustomers = () => {
    const sql = "SELECT * FROM customer";
    return pool.query(sql)
        .then(result => result.rows)
        .catch(err => {
            throw new Error(`Error: ${err.message}`);
        });
};

module.exports.getAllCustomers = getAllCustomers;
// const getTotalRecords = () => {
//     const sql = "SELECT COUNT(*) FROM customer";
//     return pool.query(sql)
//         .then(result => {
//             return {
//                 msg: "success",
//                 totRecords: result.rows[0].count
//             }
//         })
//         .catch(err => {
//             return {
//                 msg: `Error: ${err.message}`
//             }
//         });
// };

// module.exports.getTotalRecords = getTotalRecords;


// const getAllCustomers = () => {
//     const sql = "SELECT * FROM customer";
//     return pool.query(sql)
//         .then(result => {
//             return {
//                 msg: "success",
//                 cus: result.rows
//             }
//         })
//         .catch(err => {
//             return {
//                 msg: `Error: ${err.message}`
//             }
//         });
// };

// module.exports.getAllCustomers = getAllCustomers;

const insertCustomer = (customer) => {
    // Will accept either a customer array or customer object
    if (customer instanceof Array) {
        params = customer;
    } else {
        params = Object.values(customer);
    };

    const sql = `INSERT INTO customer (cusId, cusFname, cusLname, cusState, cusSalesYTD, cusSalesPrev)
               VALUES (101, 'Alfred', 'Alexander', 'NV', 1500, 900),
               (102, 'Cynthia', 'Chase', 'CA', 900, 1200),
               (103, 'Ernie', 'Ellis', 'CA', 3500, 4000),
               (104, 'Hubert', 'Hughes', 'CA', 4500, 2000),
               (105, 'Kathryn', 'King', 'NV', 850, 500),
               (106, 'Nicholas', 'Niles', 'NV', 500, 400),
               (107, 'Patricia', 'Pullman', 'AZ', 1000, 1100),
               (108, 'Sally', 'Smith', 'NV', 1000, 1100),
               (109, 'Shelly', 'Smith', 'NV', 2500, 0),
               (110, 'Terrance', 'Thomson', 'CA', 5000, 6000),
               (111, 'Valarie', 'Vega', 'AZ', 0, 3000),
               (112, 'Xavier', 'Xerox', 'AZ', 600, 250);
               `;

    return pool.query(sql, params)
        .then(res => {
            return {
                trans: "success",
                msg: `Customer id ${params[0]} successfully inserted`
            };
        })
        .catch(err => {
            return {
                trans: "fail",
                msg: `Error on insert of customer id ${params[0]}.  ${err.message}`
            };
        });
};

// Add this at the bottom
module.exports.insertCustomer = insertCustomer;


const findCustomers = (customer) => {
    // Will build the query based on data provided in the form
    //  Use parameters to avoid sql injection

    // Declare variables
    let i = 1;
    const params = [];
    let sql = "SELECT * FROM customer WHERE true";

    // Check data provided and build the query as necessary
    if (customer.cusId !== "") {
        params.push(parseInt(customer.cusId));
        sql += ` AND cusId = $${i}`;
        i++;
    };
    if (customer.cusFname !== "") {
        params.push(`${customer.cusFname}%`);
        sql += ` AND UPPER(cusFname) LIKE UPPER($${i})`;
        i++;
    };
    if (customer.cusLname !== "") {
        params.push(`${customer.cusLname}%`);
        sql += ` AND UPPER(cusLname) LIKE UPPER($${i})`;
        i++;
    };
    if (customer.cusStatee !== "") {
        params.push(`${customer.cusState}%`);
        sql += ` AND UPPER(cusState) LIKE UPPER($${i})`;
        i++;
    };
    if (customer.cusSalesYTD !== "") {
        params.push(parseFloat(customer.cusSalesYTD));
        sql += ` AND cusSalesYTD >= $${i}`;
        i++;
    };
    if (customer.cusSalesPrev !== "") {
        params.push(parseFloat(customer.cusSalesPrev));
        sql += ` AND cusSalesPrev >= $${i}`;
        i++;
    };

    sql += ` ORDER BY cusId`;
    // for debugging
    console.log("sql: " + sql);
    console.log("params: " + params);

    return pool.query(sql, params)
        .then(result => {
            return {
                trans: "success",
                rows: result.rows
            }
        })
        .catch(err => {
            return {
                trans: "Error",
                error: `Error: ${err.message}`
            }
        });
};

// Add towards the bottom of the page
module.exports.findCustomers = findCustomers;