'use strict';

var PDU     = require('../pdu'),
    sprintf = require('sprintf');
    
function Helper()
{
    
}

Helper._limitNormal   = 140;
Helper._limitCompress = 160;
Helper._limitUnicode  = 70;
Helper.ALPHABET_7BIT  = "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞ\x1bÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ`¿abcdefghijklmnopqrstuvwxyzäöñüà";
Helper.EXTENDED_TABLE = "````````````````````^```````````````````{}`````\\````````````[~]`|````````````````````````````````````€``````````````````````````";

Helper.ucfirst = function(str)
{
    return str.substr(0, 1).toUpperCase() + str.substr(1);
};

/**
 * set limit
 * @param integer $limit
 * @param string $type
 */
Helper.setLimit = function(limit, type)
{
    Helper['_limit' + Helper.ucfirst(type)] = limit;
};

/**
 * getter for limit
 * @param string $type
 * @return integer
 */
Helper.getLimit = function(type)
{
    return Helper['_limit' + Helper.ucfirst(type)];
};

/**
 * ord() for unicode
 * @param string $char
 * @return integer
 */
Helper.order = function(char)
{
    return char.charCodeAt(0);
};

/**
 * chr() for unicode
 * @param integer $order
 * @return string
 */
Helper.char = function(order)
{
    return String.fromCharCode(order);
};
    
/**
 * decode message from unicode
 * @param string $text
 * @return srting
 */
Helper.decode16Bit = function(text)
{
    return text.match(/.{1,4}/g).map(function(hex){
        var buffer = new Buffer(hex, 'hex');
        return Helper.char((buffer[0]<<8) | buffer[1]);
    }).join("");
};
    
/**
 * decode message
 * @param string $text
 * @return string
 */
Helper.decode8Bit = function(text)
{
    return text.match(/.{1,2}/g).map(function(hex){
        var buffer = new Buffer(hex, 'hex');
        return Helper.char(buffer[0]);
    }).join("");
};

/**
 * decode message from 7bit
 * @param string $text
 * @param int $inLen
 * @param int $alignBits
 * @return string
 */
Helper.decode7Bit = function(text, inLen, alignBits)
{
    var ret   = [],
        data  = new Buffer(text, "hex"),
        dataPos = 0,        /* Position in the input octets stream */
        buf   = 0,          /* Bit buffer, used in FIFO manner */
        bufLen = 0,         /* Ammount of buffered bits */
        inDone = 0,
        inExt = false;

    /* If we have some leading alignment bits then skip them */
    if(alignBits && data.length){
        alignBits = alignBits % 7;
        buf = data[dataPos++];
        buf >>= alignBits;
        bufLen = 8 - alignBits;
    }
    
    while (true) {
        if(bufLen < 7){
            if(dataPos == data.length)
                break;

            /* Move next input octet to the FIFO buffer */
            buf |= data[dataPos++] << bufLen;
            bufLen += 8;
        }

        /* Fetch next septet from the FIFO buffer */
        var digit = buf & 0x7f;
        buf >>= 7;
        bufLen -= 7;
        inDone++;

        if(digit % 128 == 27){
            inExt = true;
        } else {
            if(inExt){
                ret.push(Helper.EXTENDED_TABLE.charCodeAt(digit));
                inExt = false;
            } else {
                ret.push(Helper.ALPHABET_7BIT.charCodeAt(digit));
            }
        }

        /* Do we process all input data */
        if(inLen === undefined){
            /* If we have only the final (possibly padding) septet and it's empty */
            if(dataPos == data.length && bufLen == 7 && !buf)
                break;
        } else {
            if(inDone >= inLen)
                break;
        }
    }
    
    return (new Buffer(ret, "binary")).toString();
};

/**
 * encode message
 * @param string $text
 * @return array
 */
Helper.encode8Bit = function(text)
{
    var length = 0,
        pdu    = '',
        buffer = new Buffer(text, "ascii");

    for(var i = 0; i < buffer.length; i++){
        pdu += sprintf("%02X", buffer[i]);
        length++;
    }
    
    return [length, pdu];
};

/**
 * encode message
 * @param string $text
 * @param int $alignBits
 * @return array
 */
Helper.encode7Bit = function(text, alignBits)
{
    var ret    = "",
        buf    = 0,         /* Bit buffer, used in FIFO manner */
        bufLen = 0,         /* Ammount of buffered bits */
        len    = 0;         /* Ammount of produced septets */

    /* Insert leading alignment zero bits if requested */
    if(alignBits)
        bufLen += alignBits;

    for (let symb of text) {
        var code;

        if((code = Helper.ALPHABET_7BIT.indexOf(symb)) != -1){
            buf |= code << bufLen;
            bufLen += 7;
            len++;
        } else if((code = Helper.EXTENDED_TABLE.indexOf(symb)) != -1){
            buf |= ((code << 7) | 27) << bufLen;
            bufLen += 14;
            len += 2;
        } else {
            buf |= 37 << bufLen;    /* Place space symbol */
            bufLen += 7;
            len++;
        }

        while (bufLen >= 8) {
            ret += sprintf("%02X", buf & 0xff);
            buf >>= 8;
            bufLen -= 8;
        }
    }

    if(bufLen)
        ret += sprintf("%02X", buf);    /* here we have less then 8 bits */

    return [len, ret];
};

/**
 * encode message
 * @param string $text
 * @return array
 */
Helper.encode16Bit = function(text)
{
    var length = 0,
        pdu    = '';
    
    for(var i = 0; i < text.length; i++){
        var byte    = Helper.order(text.substr(i, 1));
            pdu    += sprintf("%04X", byte);
            length += 2;
    }
    
    return [length, pdu];
};
    
/**
 * get pdu object by type
 * @return Deliver|Submit|Report
 * @throws Exception
 */
Helper.getPduByType = function()
{
    var Type = PDU.getModule('PDU/Type');
    
    // parse type of sms
    var type = Type.parse(),
        self = null;
    
    switch(type.getMti()){
        case Type.SMS_DELIVER:
            self = PDU.Deliver();
            break;
    
        case Type.SMS_SUBMIT:
            self = PDU.Submit();
            
            var buffer = new Buffer(PDU.getPduSubstr(2), 'hex');
            // get mr
            self.setMr(buffer[0]);
            break;
        
        case Type.SMS_REPORT:
            self = PDU.Report();
    
            var buffer = new Buffer(PDU.getPduSubstr(2), 'hex');
            // get reference
            self.setReference(buffer[0]);
            break;
        
        default:
            throw new Error("Unknown sms type");
            
    }
    
    // set type
    self.setType(type);
    
    return self;
};

Helper.initVars = function(pdu)
{
    
    var SCTS = PDU.getModule('PDU/SCTS'),
        PID  = PDU.getModule('PDU/PID'),
        DCS  = PDU.getModule('PDU/DCS'),
        VP   = PDU.getModule('PDU/VP'),
        Data = PDU.getModule('PDU/Data');
    
    // if is the report status
    if(pdu.getType() instanceof require('./Type/Report')){
        // parse timestamp
        pdu.setDateTime(SCTS.parse());
        
        // parse discharge
        pdu.setDischarge(SCTS.parse());
        
        var buffer = new Buffer(PDU.getPduSubstr(2), 'hex');
        // get status
        pdu.setStatus(buffer[0]);
    } else {
        // get pid
        pdu.setPid(PID.parse());

        // parse dcs
        pdu.setDcs(DCS.parse());

        // if this submit sms
        if(pdu.getType() instanceof require('./Type/Submit')){
            // parse vp
            pdu.setVp(VP.parse(pdu));
        } else {
            // parse scts
            pdu.setScts(SCTS.parse());
        }

        var buffer = new Buffer(PDU.getPduSubstr(2), 'hex');
        // get data length
        pdu.setUdl(buffer[0]);

        // parse data
        pdu.setData(Data.parse(pdu));
    }
        
    return pdu;
};

module.exports = Helper;