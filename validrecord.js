
var CronJobManager = require('cron-job-manager');
const axios = require("axios").default;
const dbMysql = require('./task/mysql-connector');
const dotenv = require("dotenv");
require("dotenv/config");

let jobs;
jobs='';
var i;
var arrList=[];
let conMysql=new dbMysql('mysql');
conMysql.connect();




const runProcess=function(){
  //add data block number  
  var tmpData=[];
  let sql =
"  select "
+ "  bt.block_number ,"
+ "  bt.block_hash ,"
+ "  bt.transaction_hash ,"
+ "  bt.token_address ,"
+ "  bt.token_id ,"
+ "  bt.from_address ,"
+ "  bt.to_address ,"
+ "  count(bt.token_address) as count_token_address"
+ "  from block_transaction bt"
+ "  group by "
+ "  bt.block_number ,"
+ "  bt.block_hash ,"
+ "  bt.transaction_hash ,"
+ "  bt.token_address ,"
+ "  bt.token_id ,"
+ "  bt.from_address ,"
+ "  bt.to_address"
+ "  having count_token_address > 1 limit 1"
  var result=conMysql.show(sql);
  Promise.all([result]).then((values) => {
    let countRow=values[0].length;
    let i=1;
    for(let items of values[0]){
      tmpData.push(items);
        i++;
    }
  }).finally(() => {
    console.log('record done table!');
    //cron    
    Task(tmpData);
    //cron    
  });  
}





const Task=function(arrList=[]){
//cron    
manager = new CronJobManager( // this creates a new manager and adds the arguments as a new job.
'a_key_string_to_call_this_job',
'*/30 * * * * *', // the crontab schedule
() => { console.log("tick - what should be executed?") },
{
// extra options.. 
// see https://www.npmjs.com/package/cron for all available
  start:true,
  timeZone:"America/Los_Angeles",
  onComplete: () => {console.log("a_key_string_to_call_this_job has stopped....")}
} 
);

  manager.add('next_job removeduplicate', '*/35 * * * * *', () => {
    var tmpData=[];
    for(let items of arrList){
      // let sql = `select * from block_transaction bt where transaction_hash='${items.transaction_hash}' and block_number='${items.block_number}'`;
      let sql=
`select`
+ ` *`
+ ` from block_transaction bt`
+ ` where`
+ ` bt.block_number='${items.block_number}'`
+ ` and`
+ ` bt.block_hash='${items.block_hash}'`
+ ` and`
+ ` bt.transaction_hash='${items.transaction_hash}'`
+ ` and`
+ ` bt.token_address='${items.token_address}'`
+ ` and`
+ ` bt.token_id='${items.token_id}'`
+ ` and`
+ ` bt.from_address='${items.from_address}'`
+ ` and`
+ ` bt.to_address='${items.to_address}'`
+ `;`
// console.log(sql,'sql delete');
      var result=conMysql.show(sql);
      Promise.all([result]).then((values) => {
        for(let i=0;i<(values[0].length)-1;i++){
          let strDelete = 
          `delete from block_transaction where id=${values[0][i].id}`;
          var resultDelete=conMysql.show(strDelete);
          Promise.all([resultDelete]).then((valuesDelete) => {
            console.log(valuesDelete,valuesDelete.length,'delete');
          }).finally(() => {

            console.log("delete successfully");
            i=0;
            manager.stop('a_key_string_to_call_this_job');
            runProcess();
            console.log('repeat loop');
    
          })
          console.log(values[0][i].id,'datas',values[0].length);
        }
      })
      i++;
    }
    }
    );
  manager.start('next_job removeduplicate');

//cron   

}





runProcess();






