( function( exports ) {

exports.format = function() {
    var args = Array.prototype.slice.apply( arguments ),
        arg,
        txt = args.shift();

    while ( args.length > 0 ) {
        arg = args.shift();
        txt = txt.replace( "%s", arg );
    }

    return txt;
};

exports.transformToArray = function( ob, defaultOb ) {
    var key, item,
        arr = [];
    defaultOb = $.extend( {}, defaultOb );

    for ( key in ob ) {
        item = $.extend( {}, defaultOb, ob[ key ], {
            key: key
        });
        arr.push( item );
    }

    return arr;
};

exports.shadeColor = function( color, percent ) {
    var f = parseInt( color.slice( 1 ), 16 ),
        t = percent < 0 ? 0 : 255,
        p = percent < 0 ? percent * - 1 : percent,
        R = f >> 16,
        G = f >> 8 & 0x00FF,
        B = f & 0x0000FF;

    return "#" + (

        0x1000000 + ( Math.round( ( t - R ) * p ) + R ) *
        0x10000 +   ( Math.round( ( t - G ) * p ) + G ) *
        0x100 +     ( Math.round( ( t - B ) * p ) + B )

        ).toString( 16 ).slice( 1 );
};

}( $ ) );