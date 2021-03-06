

// /*
//     collection ~ table
//     db ~ db
// */

// async function main() {
//     await client.connect();
//     console.log('Connected successfully to server');
//     const db = client.db(dbName);


//     const testcoll = db.collection('test1');
//     const insertResult = await testcoll.insertMany([{ a: 1 }, { a: 2 }, { a: 3 }]);
//     console.log('Inserted documents =>', insertResult);
//     //   await testcoll.updateMany({a: 1}, {$set: {b: 5}});


//     return 'done.';
// }

// main()
//     .then(console.log)
//     .catch(console.error)
//     .finally(() => client.close());

const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;
const url = 'mongodb://exchange_app:zkm4Izyi4LLlvv27LP2u@production-mongodb-1:27017/exchange?replicaSet=rs0';
const client = new MongoClient(url);

// Database Name
const dbName = 'exchange';

const express = require("express");
const app = express();
const port = 3009;
const http = require("http").createServer();

const io = require("socket.io")(http);

let arrHanding = [];

let sttHanding = false;
setInterval(async () => {
    if (!sttHanding && arrHanding.length > 0) {
        sttHanding = true
        handing()
    }
}, 50);
async function handing() {
    let msg = arrHanding[0];
    for (let index = 0; index < msg.data.arrUser.length; index++) {
        const element = msg.data.arrUser[index];
        console.log(element);
        io.to(element).emit('dataUsers', element);
    }
    let { total_volume, max, min, price } = msg.data;
    if (total_volume == undefined || total_volume == null) {
        arrHanding = arrHanding.slice(1)
        sttHanding = false;
        return;
    }
    total_volume = Number(total_volume);
    max = Number(max);
    min = Number(min);
    price = Number(price)
    await client.connect();
    console.log('Connected successfully to server');
    const db = client.db(dbName);


    const collection = db.collection('chart');
    // await collection.updateOne({ type: msg.data.currencypairID, typeTime: '1m' }, { $set: { b: 1 } });
    const filteredDocs = await collection.find({ type: msg.data.currencypairID, typeTime: '1m' }).sort({ created: -1 }).limit(1).toArray();
    let objUpdate = {};
    if (max > Number(filteredDocs[0].high)) {
        objUpdate.high = max
    }
    if (min < Number(filteredDocs[0].low)) {
        objUpdate.low = min
    }
    objUpdate.totalValue = Number(filteredDocs[0].totalValue) + total_volume;
    objUpdate.close = price;
    console.log(objUpdate);
    await collection.updateOne({ created: filteredDocs[0].created, type: msg.data.currencypairID, typeTime: '1m' }, { $set: objUpdate });
    // arrHanding[0].status = 'success'
    arrHanding = arrHanding.slice(1)
    sttHanding = false;
}
io.on("connection", (socket) => {
    // socket.emit("welcome", "lewlew")
    socket.on('join', function (data) {
        socket.join(data.id);
        console.log('???? c?? th???ng ', data.id);
    });
    socket.on('exchange', async (msg) => {
        console.log('msg s', msg.data.status !== 'next');
        // msg.status = 'new';
        io.emit('exchangeListen', { data: msg.data });
        if (msg.data.status !== 'next') {
            arrHanding.push(msg)
        }

        // io.emit('exchange', msg);
    });
})

http.listen(port, () => {
    console.log(port);
})