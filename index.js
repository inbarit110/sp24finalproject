// Required modules 
const express = require("express");
const app = express();
const dblib = require("./dblib.js");

const multer = require("multer");
const upload = multer();

require('dotenv').config();

// Add middleware to parse default urlencoded form
app.use(express.urlencoded({ extended: false }));
// Setup EJS
app.set("view engine", "ejs");
const path = require("path");
app.set("views", path.join(__dirname, "views")); ''
app.use(express.static(path.join(__dirname, "public")));

// Enable CORS (see https://enable-cors.org/server_expressjs.html)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Application folders
app.use(express.static("public"));
app.use(express.static("views"));
app.use(express.static("css"));
app.use(express.json());

// Add database package and connection string (can remove ssl)
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 2
});


// Start listener
app.listen(process.env.PORT || 3000, () => {
  console.log("Server started (http://localhost:3000/) !");
});


// Setup routes
app.get("/", (req, res) => {
  //res.send("Root resource - Up and running!")
  const sql = "SELECT * FROM CUSTOMER ORDER BY CUSID";
  pool.query(sql, [], (err, result) => {
    let message = "";
    let model = {};
    if (err) {
      message = `Error - ${err.message}`;
    } else {
      message = "success";
      model = result.rows;
    };

    res.render("index", {
      message: message,
      model: model
    });
  });
});



// app.get("/customers", async (req, res) => {
//   try {
//     const totRecs = await dblib.getTotalRecords();
//     // Omitted validation check
//     const cus = await dblib.getAllCustomers();
//     // Handle successful query execution
//     console.log("CUSTOMERS ARE", cus);
//     res.render("customers", {
//       type: "get",
//       totRecs: totRecs.totRecords,
//       cus: cus.cus
//     });
//   } catch (error) {
//     console.error('Error in /customers route:', error);
//     res.status(500).send('Internal Server Error');
//   }
// });


app.get("/customers", async (req, res) => {
  try {
    const totRecs = await dblib.getAllCustomers();
    // Check if totRecs is not iterable or null
    if (!Array.isArray(totRecs) || totRecs.length === 0) {
      res.render("customers", {
        type: "get",
        totRecs: [], // Pass an empty array to the template
      });
      return;
    }
    res.render("customers", {
      type: "get",
      totRecs: totRecs,
    });
  } catch (error) {
    console.error('Error in /customers route:', error);
    res.status(500).send('Internal Server Error');
  }
});



app.post("/customers", async function (req, res) {
  const { cusId, cusFname, cusLname, cusState, cusSalesYTD,
    cusSalesPrev } = req.body;

  let query = 'SELECT * FROM CUSTOMER WHERE TRUE';

  if (cusId) {
    query += `AND cusId = '${cusId}'`;
  }
  if (cusFname) {
    query += `AND cusFname ILIKE = '${cusFname}%'`;
  }
  if (cusLname) {
    query += `AND cusLname ILIKE = '${cusLname}%'`;
  }
  if (cusState) {
    query += `AND cusState = '${cusState}'`;
  }
  if (cusSalesYTD) {
    query += `AND cusSalesYTD >= '${cusSalesYTD}'`;
  }
  if (cusSalesPrev) {
    query += `AND cusSalesPrev >= '${cusSalesPrev}'`;
  }

  try {
    const { rows } = await pool.query(query);
    res.render('customers', { message: "success", model: rows });
  } catch (err) {
    console.error('Error executing query', err);
    res.render('customers', { message: err.message, model: [] });
  }

});



app.get('/create', async (req, res) => {
  // Omitted validation check
  const totRecs = await dblib.getTotalRecords();
  res.render("create", {
    totRecs: totRecs.totRecords,
  });
});


// app.post('/create', async (req, res) => {
//   // Omitted validation check for request body

//   try {
//     // Assuming you have some logic to handle creation of records
//     // For example, creating a new customer record
//     const newRecord = await createNewRecord(req.body); // Assuming createNewRecord is a function to create a new record

//     // Assuming you want to redirect to a different page after successful creation
//     res.redirect('/success');
//   } catch (error) {
//     console.error('Error creating record:', error);
//     res.status(500).send('Internal Server Error');
//   }
// });



app.get('/import', async (req, res) => {
  const totRecs = await dblib.getTotalRecords();
  const cus = {
    cusId: "",
    cusFname: "",
    cusLname: "",
    cusState: "",
    cusSalesYTD: "",
    cusSalesPrev: ""
  };
  res.render("import", {
    type: "get",
    totRecs: totRecs.totRecords,
    cus: cus
  });
});

//
app.post("/import",  upload.single('filename'), (req, res) => {
  if(!req.file || Object.keys(req.file).length === 0) {
      let message = "Error: Import file not uploaded";
      return res.send(message);
  };
  //Read file line by line, inserting records
  const buffer = req.file.buffer; 
  const lines = buffer.toString().split(/\r?\n/);

  lines.forEach(line => {
       //console.log(line);
       let product = line.split(",");
       //console.log(product);
       const sql = "INSERT INTO customer (cusId, cusFname, cusLname, cusState, cusSalesYTD,cusSalesPrev) VALUES ($1, $2, $3, $4)";
       pool.query(sql, product, (err, result) => {
           if (err) {
               console.log(`Insert Error.  Error message: ${err.message}`);
           } else {
               console.log(`Inserted successfully`);
           }
      });
  });
  let message = `Processing Complete - Processed ${lines.length} records`;
  res.send(message);
});


app.get('/export', async (req, res) => {
  const totRecs = await dblib.getTotalRecords();
  const cus = {
    cusId: "",
    cusFname: "",
    cusLname: "",
    cusState: "",
    cusSalesYTD: "",
    cusSalesPrev: ""
  };
  res.render("export", {
    type: "get",
    totRecs: totRecs.totRecords,
    cus: cus
  });
});

//
app.post("/export", (req, res) => {
  const sql = "SELECT * FROM customer ORDER BY cusId";
  pool.query(sql, [], (err, result) => {
    let message = "";
    if (err) {
      message = `Error - ${err.message}`;
      res.render("output", { message: message })
    } else {
      let output = "";
      result.rows.forEach(cus => {
        output += `${cus.cusId},${cus.cusFname},${cus.cusLname},${cus.cusState},${cus.cusSalesYTD},${cus.cusSalesPrev}\r\n`;
      });
      res.header("Content-Type", "text/csv");
      res.attachment("export.csv");
      return res.send(output);
    };
  });
});



app.get("/searchajax", async (req, res) => {
  // Omitted validation check
  const totRecs = await dblib.getTotalRecords();
  res.render("searchajax", {
    totRecs: totRecs.totRecords,
  });
});




app.post("/searchajax", upload.array(), async (req, res) => {
  dblib.findCustomers(req.body)
    .then(result => res.send(result))
    .catch(err => res.send({ trans: "Error", error: err.message }));

}); 


// GET /edit/5
app.get("/edit/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM CUSTOMER WHERE cusId = $1";
  pool.query(sql, [id], (err, result) => {
    // if (err) ...
    res.render("edit", { model: result.rows[0] });
  });
});


// POST /edit/5
app.post("/edit/:id", (req, res) => {
  const id = req.params.id;
  const cus = [req.body.title, req.body.author, req.body.comments, id];
  const sql = "UPDATE CUSTOMER SET Title = $1, Author = $2, Comments = $3 WHERE (cusId = $4)";
  pool.query(sql, cus, (err, result) => {
    // if (err) ...
    res.redirect("/customers");
  });
});


// { cusId, cusFname, cusLname, cusState, cusSalesYTD,
//   cusSalesPrev }



// GET /delete/5
app.get("/delete/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM CUSTOMER WHERE cusId = $1";
  pool.query(sql, [id], (err, result) => {
    // if (err) ...
    res.render("delete", { model: result.rows[0] });
  });
});


// POST /delete/5
app.post("/delete/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM CUSTOMER WHERE cusId = $1";
  pool.query(sql, [id], (err, result) => {
    // if (err) ...
    res.redirect("/customers");
  });
});