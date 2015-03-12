(function( global ) {

var Graph = function( params ) {
    params = $.extend( {
        childrenSort: false
    }, params );

    this._childrenSort = params.childrenSort;
    this._nodes = {};
    this._neighbours = {};
};

Graph.prototype.add = function( key, value ) {
    if ( this.containsKey( key ) ) {
        return;
    }

    this._nodes[ key ] = {
        value: $.extend( {}, value ),
        parent: null
    };

    this._neighbours[ key ] = [];
};

Graph.prototype.connect = function( key1, key2 ) {
    var self = this;

    if ( !this.containsKey( key1 ) ||  !this.containsKey( key1 )) {
        return;
    }

    if ( this._neighbours[ key1].indexOf( key2 ) !== -1 ) {
        return;
    }

    this._neighbours[ key1 ].push( key2 );

    if ( this._childrenSort ) {
        this._neighbours[ key1 ].sort( function( a, b ) {
            return self._childrenSort( self.get( a ), self.get( b ) );
        });
    }

    this._nodes[ key2].parent = key1;
};

Graph.prototype.get = function( key ) {
    var self = this;

    if ( typeof key !== "undefined" ) {
        return $.extend( {}, this._nodes[ key ].value );
    }

    return Object.keys(this._nodes).map( function( key ) {
        return self.get( key );
    });
};

Graph.prototype.set = function( key, newValue ) {
    var oldValue = this._nodes[ key ].value;
    this._nodes[ key ].value = $.extend( {}, oldValue, newValue );
};

Graph.prototype.isVertex = function( key ) {
    return this._nodes[ key ].parent === null;
};

Graph.prototype.neighbours = function( key ) {
    return this._neighbours[ key ];
};

Graph.prototype.keys = function() {
    return Object.keys(this._nodes);
};

Graph.prototype.containsKey = function( key ) {
    return typeof this._nodes[ key ] !== "undefined";
};

global.Graph = Graph;

}( window ));

