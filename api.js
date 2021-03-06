
const port = 8888
const app = require('express')();
const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;
const url = 'mongodb://exchange_app:zkm4Izyi4LLlvv27LP2u@production-mongodb-1:27017/exchange?replicaSet=rs0';
// const url = 'mongodb://206.189.82.236:27017/exchange';
const client = new MongoClient(url);
// const clientId = new MongoClient(url).ObjectID;
const ObjectId = require('mongodb').ObjectID;
let bodyParser = require('body-parser')
app.use(bodyParser.json())

// Database Name
const dbName = 'exchange';

const io = require("socket.io-client");
let socket = io.connect("https://api3.asseasy.com");
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
        const filteredDocs = await collection.find({ typeTime, type }).sort({ created: -1 }).limit(limit).toArray();
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


// base_currency: "61704733facdc35fcd3f87bd"
// created: "2021-11-14T14:56:32.724Z"
// quote_currency: "6181663640c544da93bb0ba2"
// symbol: "ETH-USDT"
// __v: 0
// _id: "618ea2878b2577d511268f0b"
app.get('/ticker', async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    var id = req.query.id,
        base_currency = req.query.base_currency,
        quote_currency = req.query.quote_currency;
    console.log('run');
    try {
        console.log('aaa');
        await client.connect().catch(er => {
            console.log('aa');
        });
        const db = client.db(dbName);
        const idTk = id;
        console.log('a');
        const collection = db.collection('chart');
        const filteredDocs = await collection.find({ typeTime: "1m", type: idTk }).sort({ created: -1 }).limit(1440).toArray();
        // console.log(new ObjectId(quote_currency));
        const infoToken = await db.collection('currencies').find({ _id: { $in: [new ObjectId(quote_currency), new ObjectId(base_currency)] } }).toArray();
        console.log(infoToken);
        let low = filteredDocs[0].low, hight = filteredDocs[0].high, value24h = 0, price_luctuations = 0, rate_luctuations = 0, value24hUsdt = 0, lastPrice = 0;
        price_luctuations = filteredDocs[0].close - filteredDocs[filteredDocs.length - 1].close;
        rate_luctuations = price_luctuations * 100 / filteredDocs[0].close
        let listPriceDay = [];
        lastPrice = filteredDocs[0].close;
        for (let index = 0; index < filteredDocs.length; index++) {
            const element = filteredDocs[index];
            // lastPrice = element.close;
            value24h += (element.totalValue || 0)
            value24hUsdt += ((element.totalValue || 0) * (element.close || 0))
            if (element.low < low) {
                low = element.low
            }
            if (element.high > hight) {
                hight = element.high
            }
            listPriceDay.push(element.close)
        }
        let listFilter;
        if (Number(lastPrice) > 1000) {
            listFilter = [100, 50, 10, , 1, 0.1, 0.01]
        } else if (Number(lastPrice) > 100) {
            listFilter = [10, 1, 0.1, 0.01]
        } else if (Number(lastPrice) > 10) {
            listFilter = [1, 0.1, 0.01, 0.001]
        } else if (Number(lastPrice) > 1) {
            listFilter = [0.1, 0.01, 0.001]
        } else if (Number(lastPrice) > 0.1) {
            listFilter = [0.1, 0.01, 0.001, 0.0001]
        } else if (Number(lastPrice) > 0.01) {
            listFilter = [0.01, 0.001, 0.0001, 0.00001]
        } else if (Number(lastPrice) > 0.001) {
            listFilter = [0.001, 0.0001, 0.00001, 0.000001]
        } else if (Number(lastPrice) > 0.0001) {
            listFilter = [0.0001, 0.00001, 0.000001, 0.0000001]
        } else if (Number(lastPrice) > 0.00001) {
            listFilter = [0.00001, 0.000001, 0.0000001, 0.00000001]
        } else if (Number(lastPrice) > 0.000001) {
            listFilter = [0.000001, 0.0000001, 0.00000001, 0.000000001]
        }
        return res.status(200).send({
            status: true, data: {
                id: idTk, low, high: hight, lastPrice, value24h, price_luctuations, rate_luctuations, value24hUsdt, infoToken: infoToken, listPriceDay, listFilter
            }
        });
    } catch (error) {
        console.error("trigger smart contract error", error)
        return res.status(404).send('error');
    }
    // return res.json('lewlewww')
})

app.get('/listHot', async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    let arrToken = [
        {
            id: '618ea2878b2577d511268f0b',
            base_currency: "61704733facdc35fcd3f87bd",
            quote_currency: "6181663640c544da93bb0ba2",
            symbol: 'ETH-USDT'
        },
        {
            id: '618ea27d8b2577d511268efb',
            base_currency: "61704733facdc35fcd3f87bd",
            quote_currency: "6181663040c544da93bb0b9b",
            symbol: 'TRX-USDT'
        },
        {
            id: '618ea26b8b2577d511268edc',
            base_currency: "61704733facdc35fcd3f87bd",
            quote_currency: "6181663340c544da93bb0b9d",
            symbol: 'BNB-USDT'
        },
        {
            id: '6184274ce2bf4b4597fab2ab',
            quote_currency: "61759c03a261155ef2b0c5e4",
            base_currency: "61704733facdc35fcd3f87bd",
            symbol: 'BTC-USDT'
        }
    ]
    try {
        return res.status(200).send({ status: true, data: arrToken });
    } catch (error) {
        console.error("trigger smart contract error", error)
        return res.status(404).send('error');
    }
})

app.get('/deposit', async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST');

    var address = req.query.address,
        hash = req.query.hash,
        created = req.query.created,
        network = req.query.network,
        amount = req.query.amount;

    try {
        await client.connect();
        const db = client.db(dbName);
        const uid = await db.collection('userwallets').find({ address, network }).toArray();
        await db.collection('userevents').insertMany([
            {
                address,
                hash,
                created,
                network,
                amount,
                user: uid[0]._id,
                status: 'processed'
            }
        ]);
        return res.status(200).send({ status: true, data: 'processed' });
    } catch (error) {
        console.error("trigger smart contract error", error)
        return res.status(404).send('error');
    }
})


app.get('/list-order', async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST');

    var pair = req.query.pair,
        limit = req.query.limit,
        price = req.query.price,
        filter = req.query.filter,
        side = req.query.side;
    // toFidex = req.query.toFidex;
    limit = Number(limit);
    price = Number(price);
    filter = Number(filter);
    // toFidex = Number(toFidex);
    let a = Date.now();
    try {
        await client.connect();
        const db = client.db(dbName);
        let handingBuy = [], handingSell = [], oldBuy = price, oldSell = price, resultBuy = {}, resultSell = {}, priceChuan = oldBuy - (filter >= 1 ? oldBuy % filter : Number((oldBuy % filter).toFixed(filter.toString().length - 1)));
        for (let index = 0; index < limit; index++) {
            let to, toSell;
            if (index == 0) {
                to = oldBuy - (filter >= 1 ? oldBuy % filter : Number((oldBuy % filter).toFixed(filter.toString().length - 1)));
                toSell = oldSell - (filter >= 1 ? oldSell % filter : Number((oldSell % filter).toFixed(filter.toString().length - 1))) + filter;
            } else {
                to = oldBuy - filter;
                toSell = oldSell + filter;
            }
            oldBuy = to;
            oldSell = toSell;

            if (index == 0) {
                handingBuy.push({
                    form: price, to
                })
                handingSell.push({
                    form: price, to: toSell
                })
            } else {
                handingBuy.push({
                    form: to + filter, to: (filter >= 1 ? to : Number(to.toFixed(filter.toString().length - 1)))
                })
                handingSell.push({
                    form: toSell - filter, to: (filter >= 1 ? toSell : Number(toSell.toFixed(filter.toString().length - 1)))
                })
            }
        }
        let dataOrder = await db.collection('orders').find({ currency_pair: new ObjectId(pair), side, status: 'active', price: { '$gt': priceChuan - (limit * filter), '$lt': priceChuan + (limit * filter) } }).toArray()
        // console.log(handingSell);

        for (let index = 0; index < handingBuy.length; index++) {
            const element = handingBuy[index];
            let dataOrderFilter;
            if (index == 0) {
                dataOrderFilter = dataOrder.filter((item) => (item.price >= element.to && item.price <= element.form))
            } else {
                dataOrderFilter = dataOrder.filter((item) => (item.price >= element.to && item.price < element.form))
            }
            resultBuy[element.to] = { totalQuantity: (resultBuy[element.to] == undefined ? 0 : resultBuy[element.to].quantity) + (dataOrderFilter[0] == undefined ? 0 : dataOrderFilter[0].quantity), price: element.to }
        }

        for (let index = 0; index < handingSell.length; index++) {
            const element = handingSell[index];
            let dataOrderFilter;
            if (index == 0) {
                dataOrderFilter = dataOrder.filter((item) => (item.price >= element.form && item.price <= element.to))
            } else {
                dataOrderFilter = dataOrder.filter((item) => (item.price > element.form && item.price <= element.to))
            }
            resultSell[element.to] = { totalQuantity: (resultSell[element.to] == undefined ? 0 : resultSell[element.to].quantity) + (dataOrderFilter[0] == undefined ? 0 : dataOrderFilter[0].quantity), price: element.to }
        }

        let arrResultBuy = [], arrResultSell = [];

        for (const key in resultSell) {
            if (Object.hasOwnProperty.call(resultSell, key)) {
                const element = resultSell[key];
                arrResultSell.push(element)
            }
        }

        for (const key in resultBuy) {
            if (Object.hasOwnProperty.call(resultBuy, key)) {
                const element = resultBuy[key];
                arrResultBuy.push(element)
            }
        }

        // const requestsBuy = handingBuy.map((user) => {
        //     return new Promise(async (resolve, reject) => {
        //         let data = await db.collection('orders').find({ currency_pair: new ObjectId(pair), side, status: 'active', price: { '$gt': user.to, '$lt': user.form } }).toArray()
        //         // console.log(data[0]);
        //         resultBuy[user.to] = { totalQuantity: (resultBuy[user.to] == undefined ? 0 : resultBuy[user.to].quantity) + (data[0] == undefined ? 0 : data[0].quantity), price: user.to }
        //         resolve();
        //     });
        // });

        // const requestsSell = handingSell.map((user) => {
        //     return new Promise(async (resolve, reject) => {
        //         let data = await db.collection('orders').find({ currency_pair: new ObjectId(pair), side, status: 'active', price: { '$gt': user.form, '$lt': user.to } }).toArray()
        //         // console.log(data[0]);
        //         resultSell[user.to] = { totalQuantity: (resultSell[user.to] == undefined ? 0 : resultSell[user.to].quantity) + (data[0] == undefined ? 0 : data[0].quantity), price: user.to }
        //         resolve();
        //     });
        // });

        // let submitBuy = new Promise(async (resolve, reject) => {
        //     Promise.all(requestsBuy).then(() => {
        //         resolve();
        //     }).catch((e) => {
        //         resolve()
        //     });
        // })
        // let submitSell = new Promise(async (resolve, reject) => {
        //     Promise.all(requestsSell).then(() => {
        //         resolve();
        //     }).catch((e) => {
        //         resolve()
        //     });
        // })
        // await Promise.all([submitBuy, submitSell]).catch((e) =>
        //     console.log(`Error in sending email for the batch ${i} - ${e}`)
        // );

        console.log(Date.now() - a);
        resultSell = arrResultSell;
        resultBuy = arrResultBuy;
        return res.status(200).send({ status: true, data: { resultBuy, resultSell } });
    } catch (error) {
        console.error("trigger smart contract error", error)
        return res.status(404).send('error');
    }
})
// {"currencypairID": "61813152ff7e12d1d19db30b", "arrUser": ["a"], "total_volume": "120", "max": "30", "min": "5"}

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})



