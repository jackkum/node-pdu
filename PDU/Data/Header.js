'use strict';

var PDU     = require('../../pdu'),
    sprintf = require('sprintf');
    
function Header(params)
{
    /**
     * Header Information Elements
     * Each array element contains at least an IE type and raw IE data in the
     * form of a hexadecimal string.
     * @var array
     */
    this._ies = [];

    /**
     * Index of the concatenation IE
     * @var integer
     */
    this._concatIeIdx = undefined;
    
    if(Array.isArray(params)){
        /**
         * NB: This code can be factored out into a separate method if we have
         * a usecase for it.
         */
        for (var ie of params) {
            var buf = new Buffer(ie.dataHex, 'hex');
            var data = undefined;

            /* Parse known IEs (e.g. concatenetion) */
            switch (ie.type) {
            case Header.IE_CONCAT_8BIT_REF:
                this._concatIeIdx = this._ies.length;   /* Preserve IE index */
                data = {
                    msgRef: buf[0],
                    maxMsgNum: buf[1],
                    msgSeqNo: buf[2]
                }
                break;
            case Header.IE_CONCAT_16BIT_REF:
                this._concatIeIdx = this._ies.length;   /* Preserve IE index */
                data = {
                    msgRef: (buf[0] << 8) | buf[1],
                    maxMsgNum: buf[2],
                    msgSeqNo: buf[3]
                }
                break;
            }

            this._ies.push({
                type: ie.type,
                dataHex: ie.dataHex,
                data: data,
            });
        }
    } else if(params){
        var dataHex = sprintf("%04X%02X%02X",
                              params.POINTER,
                              params.SEGMENTS,
                              params.CURRENT);
        this._ies.push({
            type: Header.IE_CONCAT_16BIT_REF,
            dataHex: dataHex,
            data: {
                msgRef: params.POINTER,
                maxMsgNum: params.SEGMENTS,
                msgSeqNo: params.CURRENT
            }
        });
        this._concatIeIdx = this._ies.length - 1;
    }
};

Header.IE_CONCAT_8BIT_REF       = 0x00;
Header.IE_CONCAT_16BIT_REF      = 0x08;

/**
 * parse header
 * @return Header
 */
Header.parse = function()
{
    var buf = new Buffer(PDU.getPduSubstr(2), 'hex'),
        ieLen = 0,
        ies = [];

    /**
     * NB: this parser does not perform the IE data parsing, it only
     * splits the header onto separate IE(s) and then create a new Header
     * object using the extracted IE(s) as an initializer. IE data parsing
     * (if any) will beb performed later by the Header class constructor.
     */

    /* Parse IE(s) as TLV */
    for (var udhl = buf[0]; udhl > 0; udhl -= (2 + ieLen)) {
        buf = new Buffer(PDU.getPduSubstr(4), 'hex');
        ieLen = buf[1];
        ies.push({type: buf[0], dataHex: PDU.getPduSubstr(ieLen * 2)});
    }
    
    return new Header(ies);
};

/**
 * cast object to array
 * @return array
 */
Header.prototype.toJSON = function()
{
    return {
        'POINTER':  this.getPointer(),
        'SEGMENTS': this.getSegments(),
        'CURRENT':  this.getCurrent(),
    };
};

/**
 * get header size (UDHL value), in octets
 * @return integer
 */
Header.prototype.getSize = function()
{
    var udhl = 0;

    for (var ie of this._ies)
        udhl += 2 + ie.dataHex.length / 2;

    return udhl;
};

/**
 * get header type
 * @return integer
 */
Header.prototype.getType = function()
{
    return this._concatIeIdx === undefined ? undefined :
           this._ies[this._concatIeIdx].type;
};

/**
 * get a pointer size
 * @return integer
 */
Header.prototype.getPointerSize = function()
{
    return this._concatIeIdx === undefined ? 0 :
           this._ies[this._concatIeIdx].dataHex.length / 2;
};

/**
 * get a pointer
 * @return integer
 */
Header.prototype.getPointer = function()
{
    return this._concatIeIdx === undefined ? 0 :
           this._ies[this._concatIeIdx].data.msgRef;
};

/**
 * get a segments
 * @return integer
 */
Header.prototype.getSegments = function()
{
    return this._concatIeIdx === undefined ? 1 :
           this._ies[this._concatIeIdx].data.maxMsgNum;
};

/**
 * get current segment
 * @return integer
 */
Header.prototype.getCurrent = function()
{
    return this._concatIeIdx === undefined ? 1 :
           this._ies[this._concatIeIdx].data.msgSeqNo;
};

/**
 * method for cast to string
 * @return string
 */
Header.prototype.toString = function()
{
    var udhl = 0;
    var head = '';

    for (var ie of this._ies) {
        udhl += 2 + ie.dataHex.length / 2;
        head += sprintf("%02X%02X", ie.type, ie.dataHex.length / 2) + ie.dataHex;
    }
    
    return sprintf("%02X", udhl) + head;
};

module.exports = Header;