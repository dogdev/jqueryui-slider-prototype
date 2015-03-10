(function( $ ) {
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
        return $.extend( {}, this._nodes[ key ].value );
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

    var ROOT_NODE = 'ROOT_NODE';

    $.widget("ui.rangeSlider", {
        version: "0.0.1",
        widgetEventPrefix: "slide",

        options: {
            min: 0,
            max: 100,
            ranges: {},

            // callbacks
            change: null,
            slide: null,
            start: null,
            stop: null
        },
        
        _create: function() {
            this._buildGraph();
            this._normalize( ROOT_NODE );
            this._render();
        },

        _render: function() {
            
        },
        
        _buildGraph: function() {
            var rangesKeys = Object.keys( this.options.ranges ),
                vertices,
                self = this;

            this._rangesGraph = new Graph( {
                childrenSort: function( a, b ) {
                    if ( typeof a.values === 'undefined' && typeof b.values === 'undefined' ) {
                        return 0;
                    }

                    if ( typeof a.values === 'undefined' ) {
                        return -1;
                    }

                    if ( typeof b.values === 'undefined' ) {
                        return 1;
                    }

                    if ( a.values[ 0 ] > b.values[ 0 ]  ) {
                        return 1;
                    }

                    if ( a.values[ 0 ] < b.values[ 0 ]  ) {
                        return -1;
                    }

                    return 0;
                }
            } );

            this._rangesGraph.add( ROOT_NODE, {
                min: this.options.min,
                max: this.options.max
            });

            rangesKeys.forEach( function( key ) {
                self._rangesGraph.add( key, self.options.ranges[ key ] );
            });

            rangesKeys.forEach( function( key ) {
                var range = self.options.ranges[ key ];

                if ( range.parent && self.options.ranges[ range.parent ] !== "undefined" ) {
                    self._rangesGraph.connect( self.options.ranges[ key ].parent, key );
                }
            });

            self._rangesGraph.keys().forEach( function( key ) {
                if ( self._rangesGraph.isVertex( key ) && key !== ROOT_NODE ) {
                    self._rangesGraph.connect( ROOT_NODE, key );
                }
            });
        },

        _normalize: function( rootNode ) {
            var v, parentNode, parentValues, lastChildrenMax,
                queue = [ rootNode ],
                rangesGraph = this._rangesGraph;

            while( queue.length > 0 ) {
                v = queue.shift();
                parentNode = rangesGraph.get( v );
                parentValues = v === ROOT_NODE ? [ parentNode.min - 1, parentNode.max + 1 ] : parentNode.values;
                lastChildrenMax = null;

                rangesGraph.neighbours( v ).forEach( function( n ) {
                    var childrenNode = rangesGraph.get( n ),
                        correctValues = childrenNode.values || [ parentValues[ 0 ] + 1, parentValues[ 1 ] - 1 ];

                    correctValues[ 0 ] = Math.min( correctValues[ 0 ], correctValues[ 1 ] );
                    correctValues[ 0 ] = Math.max( correctValues[ 0 ], parentValues[ 0 ] + 1 );
                    correctValues[ 1 ] = Math.min( correctValues[ 1 ], parentValues[ 1 ] - 1 );

                    if ( lastChildrenMax !== null ) {
                        correctValues[ 0 ] = Math.max( correctValues[ 0 ], lastChildrenMax + 1 );
                    }

                    //invariant: push to queue only ranges with correct values
                    rangesGraph.set( n, {
                        values: correctValues
                    });

                    lastChildrenMax = correctValues[ 1 ];
                    queue.push( n );
                });
            }
        }
    });

}(jQuery));
