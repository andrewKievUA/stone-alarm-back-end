import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue } from'firebase-admin/firestore';
import configFirebase from "./alarmstonelight-firebase-adminsdk-5xepb-392c32cf1e.js"
import mysql from "mysql"
import {CronJob} from  'cron'  

initializeApp({
  credential: cert(configFirebase)
});

const db = getFirestore();

// const snapshot = await db.collection('message').get();
// snapshot.forEach((doc) => {
//   console.log(doc.id, '=>', doc.data());
// });

const  con = mysql.createConnection({
    host: '192.168.10.254',
    user: 'firebaseServer11',
    password: "1234",
    database: 'stat',
    timezone: 'utc'
  })
  


  const addDataToFirebase  =(clearNumberMaxId)=>{
      console.log(clearNumberMaxId)
  let statKubs = new Promise (function(resolve, reject){
    con.query(`SELECT * FROM stat.alarm_sborshik_form  order by id`, 
    function(error, result){
        if (error) {console.log(error)} else {
        //con.end()
        (async function() {
            async function addingData() {
            const data2 = {addd:JSON.parse(JSON.stringify(result))}
            const res = await db.collection('alarms').doc("main").set(data2); 
            console.log("Data was sended") 
            lastMaxId = clearNumberMaxId
                  
           }
           addingData()
           async function getData() {
            const docRef = db.collection('alarms').doc('main');
            const doc = await docRef.get();
            if (!doc.exists) {
                console.log('No such document!');
              } else {
                console.log('Document data:', doc.data());
              }
           }
           //getData()

        })()
    }
      })
})

}

//addDataToFirebase()




function checkForAnewRowsInMySQl() {
    con.query('SELECT max(id) FROM stat.alarm_sborshik_form', function (error, results, fields) {
        if (error) {console.log(error)}else{
            const jsonArray = JSON.parse(JSON.stringify(results)) 
            const clearNumberMaxId = Object.values(jsonArray[0])[0] 
            const valueNew = clearNumberMaxId-400
            console.log(clearNumberMaxId,"DELETE FROM stat.alarm_sborshik_form WHERE (id <",valueNew)
            con.query(`DELETE FROM stat.alarm_sborshik_form WHERE (id < ${valueNew})`, 
                function (error, results, fields) {
                if (error) {console.log(error)}else{
                    console.log('Rows MySQL were Deleted');
                    //con.end()
                }
            })
        }
    });   
}

let lastMaxId = 0
var checkingMaxIdEvery20Seconds = new CronJob('20,40,0 * * * * *', function() {
    //console.log('You will see this message every 20 seconds ');
    con.query('SELECT max(id) FROM stat.alarm_sborshik_form', function (error, results, fields) {
        if (error) {console.log(error)}else{
            const jsonArray = JSON.parse(JSON.stringify(results)) 
            const clearNumberMaxId = Object.values(jsonArray[0])[0] 
            if (lastMaxId === clearNumberMaxId){}else{
                console.log("adding data to firebase ","lastMaxId",lastMaxId,"clearNumberMaxId",clearNumberMaxId)
                addDataToFirebase(clearNumberMaxId)
            }
        }
    });   
}, null, true, 'America/Los_Angeles');
  
checkingMaxIdEvery20Seconds.start();


var pudDataOfDayToMysq = new CronJob('5 0 0 * * *', function() {
    console.log('transfer daily Data Of Day have been started ');
    const cT =  new Date
    const week = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
    const months = ['Января', 'Февраля', 'Марта', 'Апреля','Мая', 'Июня', 'Июля', 'Фвгуста','Сентября', 'Октября', 'Ноября', 'Декабря'];
    let strOfDay = week[cT.getDay()-1]+" "+cT.getDate()+" "+months[cT.getMonth()]
    console.log(strOfDay)

con.query(`INSERT INTO stat.alarm_sborshik_form (type,comment) VALUES (9,'${strOfDay}')`, function (error, results, fields) {
    if (error) {console.log(error)}else{
        console.log("daily Data added")
        checkForAnewRowsInMySQl()
    }
}); 
}, null, true, 'America/Los_Angeles');
  pudDataOfDayToMysq.start();









