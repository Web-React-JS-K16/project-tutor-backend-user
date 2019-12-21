
    const uuidv1 = require('uuid/v1');
    const https = require('https');
    const crypto = require('crypto');



    exports.payment = () => {
        console.log("on test payment utils")
    //parameters send to MoMo get get payUrl
        var endpoint = "https://test-payment.momo.vn/gw_payment/transactionProcessor"
        // var endpoint = "https://test-payment.momo.vn/gw_payment/"
    var hostname = "https://test-payment.momo.vn"
    var path = "/gw_payment/transactionProcessor"

        // var partnerCode = "MOMOIQA420180417"
        // var accessKey = "SvDmj2cOTYZmQQ3H"
        // var serectkey = "PPuDXq1KowPT1ftR8DvlQTHhC03aul17"

        var partnerCode = "MOMOBKUN20180529"
        var accessKey = "klm05TvNBzhg7h7"
        var serectkey = "PPuDXq1KowPT1ftR8DvlQTHhC03aul17"

    var orderInfo = "paywithMoMo"
        var returnUrl = "https://momo.vn/return"
        var notifyurl = "https://callback.url/notify"
    // var returnUrl = "http://localhost:3000/404"
    // var notifyurl = "http://localhost:4500/contract/payment/notify"
    var amount = "456000"
    var orderId = uuidv1()
    var requestId = uuidv1()
    var requestType = "captureMoMoWallet"
    var extraData = "merchantName=;merchantId=" //pass empty value if your merchant does not have stores else merchantName=[storeName]; merchantId=[storeId] to identify a transaction map with a physical store
    // var extraData = "merchantName=tutor-project;merchantId=tutor-project" //pass empty value if your merchant does not have stores else merchantName=[storeName]; merchantId=[storeId] to identify a transaction map with a physical store
        
        
        //https://test-payment.momo.vn/gw_payment/payment/qr?partnerCode=MOMOBKUN20180529&accessKey=klm05TvNBzhg7h7j&requestId=1576903732&amount=10000&orderId=1576903732&signature=d8dce8a43e06c0dc6e6e0f5163c817605f983ca403b2f0f2ab393b01455199a7&requestType=captureMoMoWallet

        // var extraData = "merchantName=Payment" //pass empty value if your merchant does not have stores else merchantName=[storeName]; merchantId=[storeId] to identify a transaction map with a physical store

    //before sign HMAC SHA256 with format
    //partnerCode=$partnerCode&accessKey=$accessKey&requestId=$requestId&amount=$amount&orderId=$oderId&orderInfo=$orderInfo&returnUrl=$returnUrl&notifyUrl=$notifyUrl&extraData=$extraData
        var rawSignature = "partnerCode=" + partnerCode + "&accessKey=" + accessKey + "&requestId=" + requestId + "&amount=" + amount + "&orderId=" + orderId + "&orderInfo=" + orderInfo + "&returnUrl=" + returnUrl + "&notifyUrl=" + notifyurl + "&extraData=" + extraData


        //https://momo.vn/?partnerCode=MOMOBKUN20180529&accessKey=klm05TvNBzhg7h7j&requestId=1576904417&amount=10000&orderId=1576904417&orderInfo=test%20thanh%20toan&orderType=momo_wallet&transId=2309431778&message=Success&localMessage=Th%C3%A0nh%20c%C3%B4ng&responseTime=2019-12-21%2012:00:48&errorCode=0&payType=qr&extraData=merchantName=Payment&signature=4190b8d10d4df77cad1322cef39b516287138fbdb0d5cb9e4b82ddaeeefa8d8d

    //puts raw signature
    console.log("--------------------RAW SIGNATURE----------------")
    console.log(rawSignature)
    //signature
    var signature = crypto.createHmac('sha256', serectkey)
        .update(rawSignature)
        .digest('hex');
    console.log("--------------------SIGNATURE----------------")
    console.log(signature)

    //json object send to MoMo endpoint
    var body = JSON.stringify({
        partnerCode: partnerCode,
        accessKey: accessKey,
        requestId: requestId,
        amount: amount,
        orderId: orderId,
        orderInfo: orderInfo,
        returnUrl: returnUrl,
        notifyUrl: notifyurl,
        extraData: extraData,
        requestType: requestType,
        signature: signature,
        // payUrl: rawSignature
    })
    //Create the HTTPS objects
    var options = {
        hostname: 'test-payment.momo.vn',
        // port: 443,
        // path: '/gw_payment/transactionProcessor',

        // hostname: 'payment.momo.vn',
        // port: 18081,
        path: '/gw_payment/transactionProcessor',
        method: 'POST',
        body: body,
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body)
        },
    };

        console.log("before sending .....\n", Buffer.byteLength(body))

    //Send the request and get the response
    console.log("Sending....")
    var req = https.request(options, (res) => {
        console.log("on send req")
        console.log(`Status: ${res.statusCode}`);
        console.log(`Headers: ${JSON.stringify(res.headers)}`);
        res.setEncoding('utf8');
        res.on('data', (body) => {
            console.log('Body');
            console.log(body);
            console.log('payURL');
            console.log(JSON.parse(body).payUrl);
            console.log('error');
            console.log(JSON.parse(body).error);
        });
        res.on('end', () => {
            console.log('No more data in response.');
        });
    });

    req.on('error', (e) => {
        console.log(`problem with request: ${e.message}`);
    });

    // write data to request body
    req.write(body);
    req.end();
}