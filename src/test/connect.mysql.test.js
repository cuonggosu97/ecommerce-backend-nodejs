const mysql = require("mysql2");

// create connection to pool server
const pool = mysql.createPool({
  host: "localhost",
  port: "8811",
  user: "root",
  password: "cuongpham",
  database: "test",
});

const batchSize = 100000;
const totalSize = 10_000_000;

let currentId = 1;
console.time("insertBatch");
const insertBatch = async () => {
  const values = [];
  for (let i = 0; i < batchSize && currentId <= totalSize; i++) {
    const id = currentId;
    const name = `name_${currentId}`;
    const age = currentId;
    const address = `address_${currentId}`;
    values.push([id, name, age, address]);
    currentId++;
  }
  if (!values.length) {
    console.timeEnd("insertBatch");
    pool.end((err) => {
      if (err) {
        console.log("Error occurred while running batch");
      } else {
        console.log("Connection pool");
      }
    });
    return;
  }

  const sql = `INSERT INTO  test_table (id, name, age, address) VALUES ?`;

  pool.query(sql, [values], async (err, results) => {
    if (err) throw err;

    console.log(`Inserted ${results.affectedRows} records`);
    await insertBatch();
  });
};

insertBatch().catch(console.error);
