'use strict';

var PDU     = require('../../pdu'),
    sprintf = require('sprintf');
    
function Part(parent, data, size, header)
{
    var Header = PDU.getModule('PDU/Data/Header');

    /**
     * header message
     * @var \Header
     */
    this._header;
    
    /**
     * data in pdu format
     * @var string
     */
    this._data = data;
    
    /**
     * text message
     * @var string
     */
    this._text;
    
    /**
     * size this part
     * @var integer
     */
    this._size = size;
    
    /**
     * pdu data
     * @var \Data
     */
    this._parent = parent;
    
    if(header instanceof Header){   // have header
        this._header = header;
    } else if(header){              // have params for header
        // create header
        this._header = new Header(header);
    }
};

/**
 * parse pdu string
 * @param Data data
 * @return array [decoded text, text size, self object]
 * @throws Error
 */
Part.parse = function(data)
{
    var Header = PDU.getModule('PDU/Data/Header'),
        Helper = PDU.getModule('PDU/Helper'),
        DCS    = PDU.getModule('PDU/DCS');
    
    var alphabet = data.getPdu().getDcs().getTextAlphabet(),
        header   = null,
        udl      = data.getPdu().getUdl(),
        length   = 0,
        hdrSz    = 0,           /* Header full size: UDHL + UDH */
        alignBits= 0,
        text     = undefined;

    if(alphabet == DCS.ALPHABET_DEFAULT)
        length = Math.ceil(udl * 7 / 8);    /* Convert septets to octets */
    else
        length = udl;                       /* Length already in octets */
    
    if(data.getPdu().getType().getUdhi()){
        PDU.debug("Header.parse()");
        header = Header.parse();
        hdrSz = 1 + header.getSize();   /* UDHL field length + UDH length */
        length -= hdrSz;
    }
    
    var hex = PDU.getPduSubstr(length * 2); /* Extract Octets x2 chars */
    
    switch(alphabet){
        case DCS.ALPHABET_DEFAULT:
            PDU.debug("Helper.decode7Bit(" + hex + ")");
            length = udl - Math.ceil(hdrSz * 8 / 7);    /* Convert octets to septets */
            alignBits = Math.ceil(hdrSz * 8 / 7) * 7 - hdrSz * 8;
            text = Helper.decode7Bit(hex, length, alignBits);
            break;
        
        case DCS.ALPHABET_8BIT:
            PDU.debug("Helper.decode8Bit(" + hex + ")");
            text = Helper.decode8Bit(hex);
            break;
        
        case DCS.ALPHABET_UCS2:
            PDU.debug("Helper.decode16Bit(" + hex + ")");
            text = Helper.decode16Bit(hex);
            break;
        
        default:
            throw new Error("Unknown alpabet");
    }
    
    var self = new Part(data, hex, udl, header);
    
    self._text = text;
    
    return [text, udl, self];
};

/**
 * getter for text message
 * @return string
 */
Part.prototype.getText = function()
{
    return this._text;
};

/**
 * getter data
 * @return string
 */
Part.prototype.getData = function()
{
    return this._data;
};

/**
 * getter header
 * @return Header
 */
Part.prototype.getHeader = function()
{
    return this._header;
};

/**
 * getter parent of part
 * @return \Data
 */
Part.prototype.getParent = function()
{
    return this._parent;
};

/**
 * getter size
 * @return integer
 */
Part.prototype.getSize = function()
{
    return this._size;
};

/**
 * convert pdu to srting
 * @return string
 */
Part.prototype._getPduString = function()
{
    return this._parent.getPdu().getStart().toString();
};

/**
 * to hex
 * @return string
 */
Part.prototype._getPartSize = function()
{
    return sprintf("%02X", this._size);
};

/**
 * magic method for cast part to string
 * @return string
 */
Part.prototype.toString = function()
{
    PDU.debug("_getPduString() " + this._getPduString());
    PDU.debug("_getPartSize() "  + this._getPartSize());
    PDU.debug("getHeader() "     + this.getHeader());
    PDU.debug("getData() "       + this.getData());
        
    // concate pdu, size of part, headers, data
    return '' + 
           (this._getPduString() || '') + 
           (this._getPartSize()  || '') + 
           (this.getHeader()     || '') +
           (this.getData()       || '');
};

module.exports = Part;