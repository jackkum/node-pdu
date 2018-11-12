'use strict';

var PDU     = require('../pdu'),
    sprintf = require('sprintf');
    
function SCA(isAddress)
{
    /**
     * Type of number
     * @var Type
     */
    this._type   = null;
    
    /**
     * Phone size
     * @var integer
     */
    this._size   = 0x00;
    
    
    /**
     * phone number
     * @var string
     */
    this._phone  = null;
    
    /**
     * recipient encoded
     * @var type 
     */
    this._encoded = null;


    /**
     * how claclulate size (octets or digits)
     * OA and DA size is on digits
     * @var boolean
     */
    this._isAddress = false;
    
    var Type = PDU.getModule('PDU/SCA/Type');
    
    // create sca type
    this.setType(new Type());
        
    this._isAddress = !!isAddress;
}

SCA.parse = function(isAddress)
{
    var Type   = PDU.getModule('PDU/SCA/Type'),
        Helper = PDU.getModule('PDU/Helper');
    
    if(isAddress === undefined) isAddress = true;
    
    var buffer = new Buffer(PDU.getPduSubstr(2), 'hex');
    var sca  = new SCA(isAddress),
        size = buffer[0],
        octets;

    if(size){

        // if is OA or DA then the size in semi-octets
        if(isAddress){
            octets = Math.ceil(size / 2);   /* to full octets */
        // else size in octets
        } else {
            size--;
            octets = size;
            size *= 2;          /* to semi-octets for future usage */
        }

        buffer = new Buffer(PDU.getPduSubstr(2), 'hex');
        sca.setType(
            new Type(buffer[0])
        );

        var hex = PDU.getPduSubstr(octets * 2);

        switch(sca.getType().getType()){
            case Type.TYPE_UNKNOWN: 
            case Type.TYPE_INTERNATIONAL:
            case Type.TYPE_ACCEPTER_INTO_NET:
            case Type.TYPE_SUBSCRIBER_NET:
            case Type.TYPE_TRIMMED:

                if (!isAddress && hex.charAt(size - 2) == 'F')  /* Detect padding char */
                    size--;

                sca.setPhone(
                    hex.match(/.{1,2}/g).map(function(b){
                        return SCA._map_filter_decode(b)
                                .split("").reverse().join("");
                    }).join("").slice(0, size),
                    !isAddress
                );

                break;

            case Type.TYPE_ALPHANUMERICAL:

                size = Math.floor(size * 4 / 7);    /* semi-octets to septets */
                sca.setPhone(Helper.decode7Bit(hex, size), !isAddress);

                break;

        }

    }

    return sca;
};

/**
 * getter for phone
 * @return string|null
 */
SCA.prototype.getPhone = function()
{
    return this._phone;
};

/**
 * set phone number
 * @param string phone
 * @param boolean SC 
 */
SCA.prototype.setPhone = function(phone, SC)
{
    var Helper = PDU.getModule('PDU/Helper'),
        Type   = PDU.getModule('PDU/SCA/Type');
    
    this._phone     = phone;
    this._isAddress = !SC;
    
    if(this.getType().getType() === Type.TYPE_ALPHANUMERICAL){
        var tmp = Helper.encode7Bit(phone);
        this._size    = Math.ceil(tmp.shift() * 7 / 4); /* septets to semi-octets */
        this._encoded = tmp.shift();
    } else {
        var clear = phone.replace(/[^a-c0-9\*\#]/gi, '');
        
        // get size
        // service center addres counting by octets OA or DA as length numbers
        this._size = SC ? 1 + Math.ceil(clear.length / 2) : clear.length;
        
        this._encoded = clear.split("").map(function(s){
            return SCA._map_filter_encode(s);
        }).join("");
        
    }
    
};

/**
 * getter for phone size
 * @return integer
 */
SCA.prototype.getSize = function()
{
    return this._size;
};

/**
 * getter for phone type
 * @return Type
 */
SCA.prototype.getType = function()
{
    return this._type;
};

/**
 * setter type
 * @param Type type
 */
SCA.prototype.setType = function(type)
{
    this._type = type;
};

/**
 * check is address
 * @return boolean
 */
SCA.prototype.isAddress = function()
{
    return !!this._isAddress;
};

/**
 * magic method for cast to string
 * @return srting|null
 */
SCA.prototype.toString = function()
{
    var Type = PDU.getModule('PDU/SCA/Type');
    var str = sprintf("%02X", this.getSize());
    
    if(this.getSize()){
        
        str += this.getType().toString();
        
        if(this.getType().getType() !== Type.TYPE_ALPHANUMERICAL){
            // reverse octets
            var l = this._encoded.length;
            for(var i = 0; i < l; i += 2){
                var b1 = this._encoded.substr(i, 1),
                    b2 = ((i + 1) >= l) ? 'F' : this._encoded.substr(i+1, 1);
            
                // add to pdu
                str += b2 + b1;
            }
        } else {
            str += this._encoded;
        }
    }
    
    return str;
};

/**
 * get offset
 * @return integer
 */
SCA.prototype.getOffset = function()
{
    return ( ! this._size ? 2 : this._size + 4);
};

/**
 * decode phone number
 * @param string $letter
 * @return string
 */
SCA._map_filter_decode = function(letter)
{
    var buffer = new Buffer(letter, 'hex');
    switch(buffer[0]){
        case 0x0A: return "*";
        case 0x0B: return "#";
        case 0x0C: return "a";
        case 0x0D: return "b";
        case 0x0E: return "c";
        default: return letter;
    }
};


/**
 * encode phone number
 * @param string $letter
 * @return string
 */
SCA._map_filter_encode = function(letter)
{
    switch(letter){
        case "*": return 'A';
        case "#": return 'B';
        case "a": return 'C';
        case "b": return 'D';
        case "c": return 'E';
        default: return letter;
    }
};


module.exports = SCA;