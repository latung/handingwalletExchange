
const port = 8888
const app = require('express')();
const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;
const url = 'mongodb://206.189.82.236:27017/exchange';
const client = new MongoClient(url);
let bodyParser = require('body-parser')
app.use(bodyParser.json())

// Database Name
const dbName = 'exchange';

const io = require("socket.io-client");
let socket = io.connect("http://206.189.82.236:3009");
// let socket = io.connect("http://localhost:3009");

// socket.on("welcome", (data) => {
//     console.log(data);
// })


app.get('/addChart', async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    var type = req.query.type,
        typeTime = req.query.typeTime,
        second = req.query.second;
    second = Number(second)
    let d = Math.floor(Date.now() / 10000) * 10;
    d = d - (d % second);
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('chart');
        const filteredDocs = await collection.find({ typeTime, type }).sort({ created: -1 }).limit(1).toArray();
        let vlua = 1;
        if (filteredDocs.length != 0) {
            vlua = filteredDocs[0].close;
        }
        await collection.insertMany([
            {
                close: vlua,
                high: vlua,
                open: vlua,
                low: vlua,
                time: d,
                totalValue: 0,
                type: type,
                created: Date.now(),
                typeTime
            }
        ]);
        socket.emit('exchange', {
            data: {
                status: 'next',
                data: req.query,
            }
        });
        return res.status(200).send('success');
    } catch (error) {
        console.error("trigger smart contract error", error)
        return res.status(404).send('error');
    }
    // return res.json('lewlewww')
})

app.get('/getChart', async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    var type = req.query.type,
        typeTime = req.query.typeTime,
        limit = req.query.limit;
    limit = Number(limit)
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('chart');
        const filteredDocs = await collection.find({ typeTime, type }).sort({ created: 1 }).limit(limit).toArray();
        // return { time: d[0] / 1000, open: parseFloat(d[1]), high: parseFloat(d[2]), low: parseFloat(d[3]), close: parseFloat(d[4]) }
        let arr = [];
        for (let index = 0; index < filteredDocs.length; index++) {
            const element = filteredDocs[index];
            arr.push([element.time * 1000, element.open, element.high, element.low, element.close, 'none', 'none', 'none', 'none', element.totalValue, 'none', 'none'])
        }
        return res.status(200).send({ status: true, data: arr });
    } catch (error) {
        console.error("trigger smart contract error", error)
        return res.status(404).send('error');
    }
    // return res.json('lewlewww')
})

app.post('/listen_chart', async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST');

    // let { token, amount, to } = req.body;
    console.log('lewlew ', req.query);
    console.log('lewlew ', req.body);
    socket.emit('exchange', { data: req.body });
    return res.send('Hello World')

    // return res.json('lewlewww')
})

// {"currencypairID": "61813152ff7e12d1d19db30b", "arrUser": ["a"], "total_volume": "120", "max": "30", "min": "5"}

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})



