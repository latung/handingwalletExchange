async function handing() {
    // let listUserOrder = await Promise.all([dataOrders()]);
    // console.log(listUserOrder);
    // let orders = listUserOrder[0];
    // console.log('doness', Date.now() - a);
    let orders = [
        {
            "amount":
                20,
            "created":
                1618683467204,
            "fee":
                0.2,
            "price":
                10,
            "residual":
                2,
            "status":
                "pending",
            "symbolBelow":
                "balanceUsdt",
            "symbolBalance":
                "balanceAfd",
            "tokenBelow":
                "USDT",
            "tokenTo":
                "AFD",
            "total":
                20,
            "type":
                "buy",
            "typeJoint":
                "limit",
            "uid":
                "TWTsX3WPauoLn4HDScdm6Fgy4RRfQt5MCt"
        },
        {
            "amount":
                20,
            "created":
                1618683467204,
            "fee":
                0.2,
            "price":
                10,
            "residual":
                2,
            "status":
                "pending",
            "symbolBelow":
                "balanceUsdt",
            "symbolBalance":
                "balanceAfd",
            "tokenBelow":
                "USDT",
            "tokenTo":
                "AFD",
            "total":
                20,
            "type":
                "sell",
            "typeJoint":
                "limit",
            "uid":
                "TWTsX3WPauoLn4HDScdm6Fgy4RRfQt5MCt"
        }
    ]

    let buyOrders = orders.filter(e => e.type.toString() === "buy")
    let sellOrders = orders.filter(e => e.type.toString() === "sell")

    buyOrders.sort((a, b) => a.created - b.created)

    let changes = {}

    let coinStatistic = {}

    sellOrders.map((e, indx) => {
        console.log(indx);
        e.index = indx
        return e
    })
    console.log(sellOrders);

    for (let buyOrder of buyOrders) {
        let symbolSellOrders = sellOrders.filter(e => e.amount > 0).filter(e => e.symbolBalance.toString() === buyOrder.symbolBalance.toString()).filter(e => e.price <= buyOrder.price)

        symbolSellOrders.sort((a, b) => a.price - b.price || a.created - b.created)
        // console.log(symbolSellOrders)

        for (let symbolSellOrder of symbolSellOrders) {
            if (symbolSellOrder.amount == 0) continue
            let symbol = symbolSellOrder.symbolBalance
            // update pricing
            coinStatistic[symbol] = coinStatistic[symbol] ? coinStatistic[symbol] : {}
            coinStatistic[symbol]["total_volume"] = coinStatistic[symbol]["total_volume"] ? coinStatistic[symbol]["total_volume"] : 0

            if (coinStatistic[symbol]["max"]) {
                //compare max
                if (symbolSellOrder.price > coinStatistic[symbol]["max"]) coinStatistic[symbol]["max"] = symbolSellOrder.price
            } else {
                coinStatistic[symbol]["max"] = symbolSellOrder.price
            }

            if (coinStatistic[symbol]["min"]) {
                //compare min
                if (symbolSellOrder.price < coinStatistic[symbol]["min"]) coinStatistic[symbol]["min"] = symbolSellOrder.price
            } else {
                coinStatistic[symbol]["min"] = symbolSellOrder.price
            }

            if (symbolSellOrder.amount < buyOrder.amount) {
                let symbol = symbolSellOrder.symbolBalance
                // not enough
                buyOrder.amount = buyOrder.amount - symbolSellOrder.amount

                coinStatistic[symbol]["total_volume"] += symbolSellOrder.amount

                // check money inout
                // update money for seller
                changes[symbolSellOrder.uid] = changes[symbolSellOrder.uid] ? changes[symbolSellOrder.uid] : {}
                changes[symbolSellOrder.uid].balanceUsdt = changes[symbolSellOrder.uid].balanceUsdt ? changes[symbolSellOrder.uid].balanceUsdt
                    + symbolSellOrder.price * symbolSellOrder.amount : symbolSellOrder.price * symbolSellOrder.amount

                // no update money for buyer

                changes[buyOrder.uid] = changes[buyOrder.uid] ? changes[buyOrder.uid] : {}
                //update coin for buyer
                changes[buyOrder.uid][symbol] = changes[buyOrder.uid][symbol] ? changes[buyOrder.uid][symbol] + symbolSellOrder.amount : symbolSellOrder.amount
                // console.log(symbolSellOrder.amount)
                // console.log(changes)

                //refund money for buyer
                changes[buyOrder.uid].balanceUsdt = changes[buyOrder.uid].balanceUsdt ?
                    changes[buyOrder.uid].balanceUsdt + symbolSellOrder.amount * (buyOrder.price - symbolSellOrder.price) : symbolSellOrder.amount * (buyOrder.price - symbolSellOrder.price)

                //mark sell order as done
                symbolSellOrder.amount = 0;
                console.log(symbolSellOrder.index);
                sellOrders[symbolSellOrder.index].amount = 0
                sellOrders[symbolSellOrder.index].status = "Done"

                sellOrders[symbolSellOrder.index].markAsChanged = true
                buyOrder.markAsChanged = true
                // console.log(changes)

            } else {
                let symbol = symbolSellOrder.symbolBalance
                sellOrders[symbolSellOrder.index].amount = sellOrders[symbolSellOrder.index].amount - buyOrder.amount

                coinStatistic[symbol]["total_volume"] += buyOrder.amount

                if (sellOrders[symbolSellOrder.index].amount == 0) sellOrders[symbolSellOrder.index].status = "Done"

                // check money inout
                // update money for seller
                changes[symbolSellOrder.uid] = changes[symbolSellOrder.uid] ? changes[symbolSellOrder.uid] : {}
                changes[symbolSellOrder.uid].balanceUsdt = changes[symbolSellOrder.uid].balanceUsdt ? changes[symbolSellOrder.uid].balanceUsdt
                    + symbolSellOrder.price * buyOrder.amount : symbolSellOrder.price * buyOrder.amount

                changes[buyOrder.uid] = changes[buyOrder.uid] ? changes[buyOrder.uid] : {}
                //update coin for buyer
                changes[buyOrder.uid][symbol] = changes[buyOrder.uid][symbol] ? changes[buyOrder.uid][symbol] + buyOrder.amount : buyOrder.amount

                //refund money for buyer
                changes[buyOrder.uid].balanceUsdt = changes[buyOrder.uid].balanceUsdt ?
                    changes[buyOrder.uid].balanceUsdt + buyOrder.amount * (buyOrder.price - symbolSellOrder.price) : buyOrder.amount * (buyOrder.price - symbolSellOrder.price)

                sellOrders[symbolSellOrder.index].markAsChanged = true

                // sellOrders[symbolSellOrder.index].amount = sellOrders[symbolSellOrder.index].amount - buyOrder.amount
                // if (sellOrders[symbolSellOrder.index].amount == 0) sellOrders[symbolSellOrder.index].status = "Done"
                buyOrder.amount = 0
                buyOrder.status = "Done"

                buyOrder.markAsChanged = true

                break
            }
        }

    }
    let changed_users = [];
    for (const key in changes) {
        if (Object.hasOwnProperty.call(changes, key)) {
            const element = changes[key];
            // console.log(element);
            element.uid = key;
            changed_users.push(element)
        }
    }

    sellOrders = sellOrders.filter(e => e.markAsChanged).map(e => {
        delete e.index
        delete e.markAsChanged
        return e
    })

    buyOrders = buyOrders.filter(e => e.markAsChanged).map(e => {
        delete e.markAsChanged
        return e
    })
    const changed_orders = [...buyOrders, ...sellOrders];
    console.log(changed_orders, changed_users, coinStatistic);
}
handing()