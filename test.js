var pdu = require('node-pdu');

var testNum;
var cntTotal = 0;
var cntOk = 0;

function makeLogPrefix(testType, testNum, testName)
{
    var str = '';

    if (testType !== undefined)
        str += testType;
    if (testNum !== undefined)
        str += '#' + testNum;
    if (testName !== undefined)
        str += str == '' ? testName : ' (' + testName + ')';
    if (str == '')
        str = 'Unknown';

    return str + ': ';
}

function verifyPduValue(logPrefix, valName, pdu, expr, expVal)
{
    if (expVal === undefined)
        return true;

    var val = eval('pdu.' + expr);

    if (val === expVal)
        return true;

    console.log(logPrefix + 'fail: unexpected ' + valName + ' value (expected: "' + expVal + '", got: "' + val + '")');

    return false;
}

function verifyResultPdu(logPrefix, res, expRes, err)
{
    if (err) {
        console.log(logPrefix + 'fail: got an error: ' + err);
        return false;
    } else if (expRes) {
        if (expRes.sca !== undefined) {
            if (!verifyPduValue(logPrefix, 'SCA address attribute', res, 'getSca().isAddress()', expRes.sca.isAddress))
                return false;
            if (!verifyPduValue(logPrefix, 'SCA', res, 'getSca().getPhone()', expRes.sca.phone))
                return false;
        }
        if (expRes.address !== undefined) {
            if (!verifyPduValue(logPrefix, 'OA/DA address attribute', res, 'getAddress().isAddress()', expRes.address.isAddress))
                return false;
            if (!verifyPduValue(logPrefix, 'phone', res, 'getAddress().getPhone()', expRes.address.phone))
                return false;
        }
        if (expRes.scts !== undefined) {
            if (!verifyPduValue(logPrefix, 'timestamp', res, 'getScts().getIsoString()', expRes.scts.isoStr))
                return false;
        }
        if (expRes.data !== undefined) {
            if (!verifyPduValue(logPrefix, 'text', res, 'getData().getText()', expRes.data.text))
                return false;
        }
    }

    return true;
}

var parserTests = [
    {
        name: 'Simple Delivery message #1',
        pduStr: '07919730071111F1000B919746121611F10000811170021222230DC8329BFD6681EE6F399B1C02',
        expectedResult: {
            sca: {isAddress: false, phone: '79037011111'},
            address: {isAddress: true, phone: '79642161111'},
            scts: {isoStr: '2018-11-07T20:21:22+08:00'},
            data: {text: 'Hello, world!'},
        },
    }, {
        name: 'Negative SCTS Time Zone offset',
        pduStr: '07919730071111F1000B919746121611F100008111700212222B0DC8329BFD6681EE6F399B1C02',
        expectedResult: {scts: {isoStr: '2018-11-07T20:21:22-08:00'}},
    }
];

testNum = 0;
for (let test of parserTests) {
    var logPrefix = makeLogPrefix('parser', ++testNum, test.name);
    var error = '';
    var msg = undefined;

    cntTotal++;
    try {
        msg = pdu.parse(test.pduStr);
    } catch (e) {
        error = e.message;
    }

    if (verifyResultPdu(logPrefix, msg, test.expectedResult, error)) {
        cntOk++;
        console.log(logPrefix + 'Ok');
    }
}

console.log('Perform ' + cntTotal + ' test(s): ' + cntOk + ' Ok ' + (cntTotal - cntOk) + ' fail');
