'use strict';

var PDU     = require('../pdu'),
    sprintf = require('sprintf');
    
function SCTS(date)
{
    /**
     * unix time
     * @var integer
     */
    this._time = date.getTime() / 1000;
}

/**
 * parse pdu string
 * @return SCTS
 */
SCTS.parse = function()
{
    var hex    = PDU.getPduSubstr(14),
        params = [];

    if( ! hex){
        throw new Error("Not enough bytes");
    }

        hex.match(/.{1,2}/g).map(function(s){
            if(/\D+/.test(s)){
                return params.push(0);
            }

            params.push(
                parseInt(
                    s.split("").reverse().join("")
                )
            );
        });

    var year   = 2000 + params.shift();
    var month  = params.shift();
    var day    = params.shift();
    var hour   = params.shift();
    var minute = params.shift();
    var second = params.shift();
    
    var date = new Date(year, month-1, day, hour, minute, second);
    
    return new SCTS(date);
};

/**
 * getter time
 * @return integer
 */
SCTS.prototype.getTime = function()
{
    return this._time;
};

/**
 * format datatime for split
 * @return string
 */
SCTS.prototype._getDateTime = function()
{
    var dt = new Date(this.getTime() * 1000);
    return sprintf(
        '%02d%02d%02d%02d%02d%02d00', 
        dt.getYear(),
        dt.getMonth() + 1,
        dt.getDate(),
        dt.getHours(),
        dt.getMinutes(),
        dt.getSeconds()
    );
};

/**
 * cast to string
 * @return string
 */
SCTS.prototype.toString = function() 
{
    
    return this._getDateTime()
        .match(/.{1,2}/g)
        .map(function(s){
            return parseInt(
                s.split("").reverse().join("")
            );
        }).join("");
};


module.exports = SCTS;