var mysql = require('mysql');
var con;

class mySqlConnector{
    account
    constructor(account){
        this.account=account
    }

    connect(){
        con = mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database : process.env.DB_SCHEMA,
            port:process.env.PORT          
          });
          con.connect(function(err) {
            if (err) throw err;
            console.log("Connected!");
          });
    }

    createTableTransactions(){
        con.connect(function(err) {
            console.log("Connected!");
            var sql = "CREATE TABLE transactions (name VARCHAR(255), address VARCHAR(255))";         
            con.query(sql, function (err, result) {
              if (err) throw err;
              console.log("Table created");
            });
          });        
    }

    create(sql,rowData){
            console.log("Connected!");
            con.query(sql,rowData, function (err, result) {
              // if (err) throw err;
              console.log("1 record inserted");
              return result;
            });
    }

    show(sql){
      return new Promise((resolve, reject) => { 
        console.log("start query!");
        const data = con.query(sql, function (err, result, fields) {
          if (err) throw err;
          // console.log(result)
          return resolve(result);          
        });
      });
}


      updateSql(strSql){
        con.connect(function(err) {
          var sql = strSql;
          con.query(sql, function (err, result) {
            if (err) throw err;
            console.log(result.affectedRows + " record(s) updated");
          });
        });
      }


}

module.exports = mySqlConnector;
