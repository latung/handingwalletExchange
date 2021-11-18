const request = require('request');

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});
let auther, retime = 15;

readline.question('time', time => {
    readline.question('token', tokens => {
        auther = tokens;
        retime = Number(time);
        bnb()
        trx()
        btc()
        eth()
        console.log('okk! bắt đầu trade nào!!');
        readline.close();
    });
});


async function bnb() {

    let step_percent_of_old_price = 0.001
    let current_price = 50.35
    let timeSendEmail = 0;
    let rateT = 0.6;
    let pt = 0.1;
    let type = 'sideway_percent';
    let asyrequest = require('async-request');
    let token = 'BNBUSDT';
    let currency_pairId = '618ea26b8b2577d511268edc';



    function getPrice() {
        return current_price
    }

    function exchanges(args) {
        let { type, quantity, price, stt } = args

        return new Promise((resolve, reject) => {
            let options = {
                uri: 'http://159.223.93.120/order',
                method: 'POST',
                headers: {
                    'Authorization': auther,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    currency_pair: currency_pairId,
                    price: Number(price.toFixed(6)),
                    quantity: Number(quantity),
                    side: type
                })
            };

            return new Promise(async (resolve, reject) => {
                request(options, async (err, resp, body) => {
                    if (err !== null) {
                        console.log(err);
                        resolve('error')
                    }
                    // console.log('thành công', body);
                    return resolve(JSON.parse(body))
                })
            });
        })
    }

    async function getPriceTOken() {
        const resHash = await asyrequest(`https://api.binance.com/api/v3/ticker/price?symbol=${token}`);

        const resChange = JSON.parse(resHash.body);
        return Number(resChange.price)
    }

    async function buy_then_sell(args) {
        let { quantity } = args
        let price = await getPriceTOken();
        exchanges({ type: "buy", quantity, price, stt: 0 })
        setTimeout(() => {
            exchanges({ type: "sell", quantity, price: price - (price * 0.1), stt: 1 })
        }, 1000);
        current_price = price
    }

    async function sell_then_buy(args) {
        let { quantity } = args;
        let price = await getPriceTOken();
        exchanges({ type: "sell", quantity, price, stt: 0 })
        setTimeout(() => {
            exchanges({ type: "buy", quantity, price: price + (price * 0.1), stt: 1 })
        }, 1000);
        current_price = price
    }

    function sleep(n) {
        return new Promise(res => setTimeout(res, n))
    }

    function random_quantity() {
        return Math.floor(Math.random() * 10000) / 10
    }


    function getRandomStep(step) {
        let rand = Math.random() / 5
        let up_down = Math.floor(Math.random() * 2) % 2 == 1
        if (up_down) {
            return step + rand * step
        } else return step - rand * step
    }

    async function doExchangeToTargetByPrice(oldPrice, targetPrice) {
        let step = oldPrice * step_percent_of_old_price
        _doExchangeToTargetByPrice = async function () {
            let price = getPrice()
            let random_step = getRandomStep(step) * ((targetPrice - price) > 0 ? 1 : -1)

            random_step = Math.random() <= rateT ? random_step : -random_step

            let alterPrice = price + random_step

            if (random_step > 0) {
                buy_then_sell({ quantity: random_quantity(), price: alterPrice })
            }
            else {
                sell_then_buy({ quantity: random_quantity(), price: alterPrice })
            }
        }

        while (true) {
            await _doExchangeToTargetByPrice()
            // console.log(Current price: ${getPrice()})
            await sleep(retime * 1000)
        }
    }


    async function doExchangeToTargetByRange(oldPrice, start, end) {
        let targetPrice = start + (end - start) / 2
        let step = oldPrice * step_percent_of_old_price
        if (step == 0) step = oldPrice / 50
        _doExchangeToTargetByRange = async function () {
            let price = getPrice()
            let random_step = getRandomStep(step) * ((targetPrice - price) > 0 ? 1 : -1)
            let random_direction = (price > start && price < end) ? 0.5 : rateT

            random_step = Math.random() <= random_direction ? random_step : -random_step
            let alterPrice = price + random_step

            if (random_step > 0) {
                buy_then_sell({ quantity: random_quantity(), price: alterPrice })
            }
            else {
                sell_then_buy({ quantity: random_quantity(), price: alterPrice })
            }
        }

        while (true) {
            await _doExchangeToTargetByRange()
            // console.log(Current price: ${getPrice()})
            await sleep(retime * 1000)
        }
    }

    async function doExchangeToTarget(type, args) {
        type = type.toString()
        let _price = getPrice()
        if (type === "increase" || type === "decrease") {
            let percent = args

            let targetPrice = type === "increase" ? _price + _price * (percent / 100) : _price - _price * (percent / 100)

            await doExchangeToTargetByPrice(_price, targetPrice)
        } else if (type === "sideway_percent") {
            let percent = args

            //parse to start,end
            let start = _price - _price * (percent / 100)
            let end = _price + _price * (percent / 100)

            doExchangeToTargetByRange(_price, start, end)
        } else if (type === "side_range") {
            let { start, end } = args
            doExchangeToTargetByRange(_price, start, end)
        }

    }

    await doExchangeToTarget(type, pt)
}


async function trx() {

    let step_percent_of_old_price = 0.001
    let current_price = 50.35
    let timeSendEmail = 0;
    let rateT = 0.6;
    let pt = 0.1;
    let type = 'sideway_percent';
    let asyrequest = require('async-request');
    let token = 'TRXUSDT';
    let currency_pairId = '618ea27d8b2577d511268efb';



    function getPrice() {
        return current_price
    }

    function exchanges(args) {
        let { type, quantity, price, stt } = args

        return new Promise((resolve, reject) => {
            let options = {
                uri: 'http://159.223.93.120/order',
                method: 'POST',
                headers: {
                    'Authorization': auther,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    currency_pair: currency_pairId,
                    price: Number(price.toFixed(6)),
                    quantity: Number(quantity),
                    side: type
                })
            };

            return new Promise(async (resolve, reject) => {
                request(options, async (err, resp, body) => {
                    if (err !== null) {
                        console.log(err);
                        resolve('error')
                    }
                    // console.log('thành công', body);
                    return resolve(JSON.parse(body))
                })
            });
        })
    }

    async function getPriceTOken() {
        const resHash = await asyrequest(`https://api.binance.com/api/v3/ticker/price?symbol=${token}`);

        const resChange = JSON.parse(resHash.body);
        return Number(resChange.price)
    }

    async function buy_then_sell(args) {
        let { quantity } = args
        let price = await getPriceTOken();
        exchanges({ type: "buy", quantity, price, stt: 0 })
        setTimeout(() => {
            exchanges({ type: "sell", quantity, price, stt: 1 })
        }, 1000);
        current_price = price
    }

    async function sell_then_buy(args) {
        let { quantity } = args;
        let price = await getPriceTOken();
        exchanges({ type: "sell", quantity, price, stt: 0 })
        setTimeout(() => {
            exchanges({ type: "buy", quantity, price, stt: 1 })
        }, 1000);
        current_price = price
    }

    function sleep(n) {
        return new Promise(res => setTimeout(res, n))
    }

    function random_quantity() {
        return Math.floor(Math.random() * 10000) / 10
    }


    function getRandomStep(step) {
        let rand = Math.random() / 5
        let up_down = Math.floor(Math.random() * 2) % 2 == 1
        if (up_down) {
            return step + rand * step
        } else return step - rand * step
    }

    async function doExchangeToTargetByPrice(oldPrice, targetPrice) {
        let step = oldPrice * step_percent_of_old_price
        _doExchangeToTargetByPrice = async function () {
            let price = getPrice()
            let random_step = getRandomStep(step) * ((targetPrice - price) > 0 ? 1 : -1)

            random_step = Math.random() <= rateT ? random_step : -random_step

            let alterPrice = price + random_step

            if (random_step > 0) {
                buy_then_sell({ quantity: random_quantity(), price: alterPrice })
            }
            else {
                sell_then_buy({ quantity: random_quantity(), price: alterPrice })
            }
        }

        while (true) {
            await _doExchangeToTargetByPrice()
            // console.log(Current price: ${getPrice()})
            await sleep(retime * 1000)
        }
    }


    async function doExchangeToTargetByRange(oldPrice, start, end) {
        let targetPrice = start + (end - start) / 2
        let step = oldPrice * step_percent_of_old_price
        if (step == 0) step = oldPrice / 50
        _doExchangeToTargetByRange = async function () {
            let price = getPrice()
            let random_step = getRandomStep(step) * ((targetPrice - price) > 0 ? 1 : -1)
            let random_direction = (price > start && price < end) ? 0.5 : rateT

            random_step = Math.random() <= random_direction ? random_step : -random_step
            let alterPrice = price + random_step

            if (random_step > 0) {
                buy_then_sell({ quantity: random_quantity(), price: alterPrice })
            }
            else {
                sell_then_buy({ quantity: random_quantity(), price: alterPrice })
            }
        }

        while (true) {
            await _doExchangeToTargetByRange()
            // console.log(Current price: ${getPrice()})
            await sleep(retime * 1000)
        }
    }

    async function doExchangeToTarget(type, args) {
        type = type.toString()
        let _price = getPrice()
        if (type === "increase" || type === "decrease") {
            let percent = args

            let targetPrice = type === "increase" ? _price + _price * (percent / 100) : _price - _price * (percent / 100)

            await doExchangeToTargetByPrice(_price, targetPrice)
        } else if (type === "sideway_percent") {
            let percent = args

            //parse to start,end
            let start = _price - _price * (percent / 100)
            let end = _price + _price * (percent / 100)

            doExchangeToTargetByRange(_price, start, end)
        } else if (type === "side_range") {
            let { start, end } = args
            doExchangeToTargetByRange(_price, start, end)
        }

    }

    await doExchangeToTarget(type, pt)
}


async function btc() {

    let step_percent_of_old_price = 0.001
    let current_price = 50.35
    let timeSendEmail = 0;
    let rateT = 0.6;
    let pt = 0.1;
    let type = 'sideway_percent';
    let asyrequest = require('async-request');
    let token = 'BTCUSDT';
    let currency_pairId = '6184274ce2bf4b4597fab2ab';


    function getPrice() {
        return current_price
    }

    function exchanges(args) {
        let { type, quantity, price, stt } = args

        return new Promise((resolve, reject) => {
            let options = {
                uri: 'http://159.223.93.120/order',
                method: 'POST',
                headers: {
                    'Authorization': auther,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    currency_pair: currency_pairId,
                    price: Number(price.toFixed(6)),
                    quantity: Number(quantity),
                    side: type
                })
            };

            return new Promise(async (resolve, reject) => {
                request(options, async (err, resp, body) => {
                    if (err !== null) {
                        console.log(err);
                        resolve('error')
                    }
                    // console.log('thành công', body);
                    return resolve(JSON.parse(body))
                })
            });
        })
    }

    async function getPriceTOken() {
        const resHash = await asyrequest(`https://api.binance.com/api/v3/ticker/price?symbol=${token}`);

        const resChange = JSON.parse(resHash.body);
        return Number(resChange.price)
    }

    async function buy_then_sell(args) {
        let { quantity } = args
        let price = await getPriceTOken();
        exchanges({ type: "buy", quantity, price, stt: 0 })
        setTimeout(() => {
            exchanges({ type: "sell", quantity, price, stt: 1 })
        }, 1000);
        current_price = price
    }

    async function sell_then_buy(args) {
        let { quantity } = args;
        let price = await getPriceTOken();
        exchanges({ type: "sell", quantity, price, stt: 0 })
        setTimeout(() => {
            exchanges({ type: "buy", quantity, price, stt: 1 })
        }, 1000);
        current_price = price
    }

    function sleep(n) {
        return new Promise(res => setTimeout(res, n))
    }

    function random_quantity() {
        return Math.floor(Math.random() * 10000) / 10
    }


    function getRandomStep(step) {
        let rand = Math.random() / 5
        let up_down = Math.floor(Math.random() * 2) % 2 == 1
        if (up_down) {
            return step + rand * step
        } else return step - rand * step
    }

    async function doExchangeToTargetByPrice(oldPrice, targetPrice) {
        let step = oldPrice * step_percent_of_old_price
        _doExchangeToTargetByPrice = async function () {
            let price = getPrice()
            let random_step = getRandomStep(step) * ((targetPrice - price) > 0 ? 1 : -1)

            random_step = Math.random() <= rateT ? random_step : -random_step

            let alterPrice = price + random_step

            if (random_step > 0) {
                buy_then_sell({ quantity: random_quantity(), price: alterPrice })
            }
            else {
                sell_then_buy({ quantity: random_quantity(), price: alterPrice })
            }
        }

        while (true) {
            await _doExchangeToTargetByPrice()
            // console.log(Current price: ${getPrice()})
            await sleep(retime * 1000)
        }
    }


    async function doExchangeToTargetByRange(oldPrice, start, end) {
        let targetPrice = start + (end - start) / 2
        let step = oldPrice * step_percent_of_old_price
        if (step == 0) step = oldPrice / 50
        _doExchangeToTargetByRange = async function () {
            let price = getPrice()
            let random_step = getRandomStep(step) * ((targetPrice - price) > 0 ? 1 : -1)
            let random_direction = (price > start && price < end) ? 0.5 : rateT

            random_step = Math.random() <= random_direction ? random_step : -random_step
            let alterPrice = price + random_step

            if (random_step > 0) {
                buy_then_sell({ quantity: random_quantity(), price: alterPrice })
            }
            else {
                sell_then_buy({ quantity: random_quantity(), price: alterPrice })
            }
        }

        while (true) {
            await _doExchangeToTargetByRange()
            // console.log(Current price: ${getPrice()})
            await sleep(retime * 1000)
        }
    }

    async function doExchangeToTarget(type, args) {
        type = type.toString()
        let _price = getPrice()
        if (type === "increase" || type === "decrease") {
            let percent = args

            let targetPrice = type === "increase" ? _price + _price * (percent / 100) : _price - _price * (percent / 100)

            await doExchangeToTargetByPrice(_price, targetPrice)
        } else if (type === "sideway_percent") {
            let percent = args

            //parse to start,end
            let start = _price - _price * (percent / 100)
            let end = _price + _price * (percent / 100)

            doExchangeToTargetByRange(_price, start, end)
        } else if (type === "side_range") {
            let { start, end } = args
            doExchangeToTargetByRange(_price, start, end)
        }

    }

    await doExchangeToTarget(type, pt)
}


async function eth() {

    let step_percent_of_old_price = 0.001
    let current_price = 50.35
    let timeSendEmail = 0;
    let rateT = 0.6;
    let pt = 0.1;
    let type = 'sideway_percent';
    let asyrequest = require('async-request');
    let token = 'ETHUSDT';
    let currency_pairId = '618ea2878b2577d511268f0b';

    function getPrice() {
        return current_price
    }

    function exchanges(args) {
        let { type, quantity, price, stt } = args

        return new Promise((resolve, reject) => {
            let options = {
                uri: 'http://159.223.93.120/order',
                method: 'POST',
                headers: {
                    'Authorization': auther,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    currency_pair: currency_pairId,
                    price: Number(price.toFixed(6)),
                    quantity: Number(quantity),
                    side: type
                })
            };

            return new Promise(async (resolve, reject) => {
                request(options, async (err, resp, body) => {
                    if (err !== null) {
                        console.log(err);
                        resolve('error')
                    }
                    // console.log('thành công', body);
                    return resolve(JSON.parse(body))
                })
            });
        })
    }

    async function getPriceTOken() {
        const resHash = await asyrequest(`https://api.binance.com/api/v3/ticker/price?symbol=${token}`);

        const resChange = JSON.parse(resHash.body);
        return Number(resChange.price)
    }

    async function buy_then_sell(args) {
        let { quantity } = args
        let price = await getPriceTOken();
        exchanges({ type: "buy", quantity, price, stt: 0 })
        setTimeout(() => {
            exchanges({ type: "sell", quantity, price, stt: 1 })
        }, 1000);
        current_price = price
    }

    async function sell_then_buy(args) {
        let { quantity } = args;
        let price = await getPriceTOken();
        exchanges({ type: "sell", quantity, price, stt: 0 })
        setTimeout(() => {
            exchanges({ type: "buy", quantity, price, stt: 1 })
        }, 1000);
        current_price = price
    }

    function sleep(n) {
        return new Promise(res => setTimeout(res, n))
    }

    function random_quantity() {
        return Math.floor(Math.random() * 10000) / 10
    }


    function getRandomStep(step) {
        let rand = Math.random() / 5
        let up_down = Math.floor(Math.random() * 2) % 2 == 1
        if (up_down) {
            return step + rand * step
        } else return step - rand * step
    }

    async function doExchangeToTargetByPrice(oldPrice, targetPrice) {
        let step = oldPrice * step_percent_of_old_price
        _doExchangeToTargetByPrice = async function () {
            let price = getPrice()
            let random_step = getRandomStep(step) * ((targetPrice - price) > 0 ? 1 : -1)

            random_step = Math.random() <= rateT ? random_step : -random_step

            let alterPrice = price + random_step

            if (random_step > 0) {
                buy_then_sell({ quantity: random_quantity(), price: alterPrice })
            }
            else {
                sell_then_buy({ quantity: random_quantity(), price: alterPrice })
            }
        }

        while (true) {
            await _doExchangeToTargetByPrice()
            // console.log(Current price: ${getPrice()})
            await sleep(retime * 1000)
        }
    }


    async function doExchangeToTargetByRange(oldPrice, start, end) {
        let targetPrice = start + (end - start) / 2
        let step = oldPrice * step_percent_of_old_price
        if (step == 0) step = oldPrice / 50
        _doExchangeToTargetByRange = async function () {
            let price = getPrice()
            let random_step = getRandomStep(step) * ((targetPrice - price) > 0 ? 1 : -1)
            let random_direction = (price > start && price < end) ? 0.5 : rateT

            random_step = Math.random() <= random_direction ? random_step : -random_step
            let alterPrice = price + random_step

            if (random_step > 0) {
                buy_then_sell({ quantity: random_quantity(), price: alterPrice })
            }
            else {
                sell_then_buy({ quantity: random_quantity(), price: alterPrice })
            }
        }

        while (true) {
            await _doExchangeToTargetByRange()
            // console.log(Current price: ${getPrice()})
            await sleep(retime * 1000)
        }
    }

    async function doExchangeToTarget(type, args) {
        type = type.toString()
        let _price = getPrice()
        if (type === "increase" || type === "decrease") {
            let percent = args

            let targetPrice = type === "increase" ? _price + _price * (percent / 100) : _price - _price * (percent / 100)

            await doExchangeToTargetByPrice(_price, targetPrice)
        } else if (type === "sideway_percent") {
            let percent = args

            //parse to start,end
            let start = _price - _price * (percent / 100)
            let end = _price + _price * (percent / 100)

            doExchangeToTargetByRange(_price, start, end)
        } else if (type === "side_range") {
            let { start, end } = args
            doExchangeToTargetByRange(_price, start, end)
        }

    }


    doExchangeToTarget(type, pt)
}