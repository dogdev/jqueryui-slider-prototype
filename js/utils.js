( function( global ) {

global.format = function() {
    var args = Array.prototype.slice.apply( arguments ),
        arg,
        txt = args.shift();

    while ( args.length > 0 ) {
        arg = args.shift();
        txt = txt.replace( "%s", arg );
    }

    return txt;
}

}( window ) );