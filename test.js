var pdu = require('node-pdu');
var Helper = pdu.getModule('PDU/Helper');

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

var sevenBitEncodingTests = [
    {
        name: 'Lowercase letters',
        text: 'abcdefghijklmnopqrstuvwxyz',
        code: '61F1985C369FD169F59ADD76BFE171F99C5EB7DFF1793D',
    }, {
        name: 'Uppercase letters',
        text: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        code: '41E19058341E9149E592D9743EA151E9945AB55EB1592D',
    }, {
        name: 'Digits',
        text: '0123456789',
        code: 'B0986C46ABD96EB81C',
    }, {
        name: '1 symbol', text: 'a', code: '61',
    }, {
        name: '2 symbols', text: 'ab', code: '6131',
    }, {
        name: '3 symbols', text: 'abc', code: '61F118',
    }, {
        name: '4 symbols', text: 'abcd', code: '61F1980C',
    }, {
        name: '5 symbols', text: 'abcde', code: '61F1985C06',
    }, {
        name: '6 symbols', text: 'abcdef', code: '61F1985C3603',
    }, {
        name: '7 symbols', text: 'abcdefg', code: '61F1985C369F01',
    }, {
        name: '8 symbols', text: 'abcdefgh', code: '61F1985C369FD1',
    }, {
        name: '9 symbols', text: 'abcdefghi', code: '61F1985C369FD169',
    }
];

testNum = 0;
for (let test of sevenBitEncodingTests) {
    var logPrefix = makeLogPrefix('7BitEncoding', ++testNum, test.name);
    var out = undefined;
    var passed = true;

    cntTotal++;

    out = Helper.encode7Bit(test.text);
    if (out[1] != test.code) {
        passed = false;
        console.log(logPrefix + 'fail: encoder error (text: "' + test.text + '", expecting: "' + test.code + '", got "' + out[1] + '")');
    }

    out = Helper.decode7Bit(test.code);
    if (out != test.text) {
        passed = false;
        console.log(logPrefix + 'fail: decoder error (code: "' + test.code + '", expecting: "' + test.text + '", got "' + out + '")');
    }

    if (passed) {
        cntOk++;
        console.log(logPrefix + 'Ok');
    }
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
