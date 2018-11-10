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
    
    if(params){
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

Header.IE_CONCAT_16BIT_REF      = 0x08;

/**
 * parse header
 * @return Header
 */
Header.parse = function()
{
    var buffer    = new Buffer(PDU.getPduSubstr(6), 'hex'),
        udhl      = buffer[0],
        type      = buffer[1],
        psize     = buffer[2];
        buffer    = new Buffer(PDU.getPduSubstr((psize - 2) * 2 ), 'hex'); // psize is pointer + segments + current
    var pointer   = buffer.length === 1 ? buffer[0] : (buffer[0]<<8) | buffer[1];
        buffer    = new Buffer(PDU.getPduSubstr(4), 'hex');
    var sergments = buffer[0],
        current   = buffer[1];
    
    var self = new Header({
            'POINTER':  pointer,
            'SEGMENTS': sergments,
            'CURRENT':  current
    });
    
    return self;
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