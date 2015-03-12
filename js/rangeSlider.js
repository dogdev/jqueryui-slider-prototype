(function( $ ) {
    var ROOT_NODE = "ROOT_NODE";

    $.widget("ui.rangeslider", {
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
            var handlers = $( "<div class='ui-rangeslider-sliders'>" ),
                min = this.options.min, max = this.options.max,
                self = this,
                ranges = this._rangesGraph.get();

            this.element.addClass( "ui-rangeslider" );

            ranges.forEach( function( range ) {
                if ( range.root ) {
                    return;
                }

                var sliderFirst, sliderLast,
                    first = $( format( "<input type='range' value='%s' min='%s' max='%s'  />", range.values[ 0 ],  min, max ) ),
                    last = $( format( "<input type='range' value='%s' min='%s' max='%s'  />", range.values[ 1 ],  min, max )  );

                first.slider();
                last.slider();

                sliderFirst = self._getSlider( first ).slider;
                sliderLast = self._getSlider( last ).slider;

                handlers.append( sliderFirst ).append( sliderLast );
            });

            this.element.append( handlers );
        },

        _getSlider: function( el ) {
            return $.data( el.get( 0 ), "mobile-slider" ) || $.data( el.slider().get( 0 ), "mobile-slider" );
        },

        _buildGraph: function() {
            var rangesKeys = Object.keys( this.options.ranges ),
                self = this;

            this._rangesGraph = new Graph( {
                childrenSort: function( a, b ) {
                    if ( typeof a.values === "undefined" && typeof b.values === "undefined" ) {
                        return 0;
                    }

                    if ( typeof a.values === "undefined" ) {
                        return -1;
                    }

                    if ( typeof b.values === "undefined" ) {
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
                root: true,
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
                        correctValues[ 1 ] = Math.max( correctValues[ 0 ], correctValues[ 1 ] );
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
