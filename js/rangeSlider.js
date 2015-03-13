(function( $ ) {
    var ROOT_NODE = "ROOT_NODE";

    $.widget("ui.rangeslider", {
        version: "0.0.1",
        widgetEventPrefix: "slide",

        options: {
            min: 0,
            max: 100,
            ranges: {},
            highlight: true,
            highlightColor: "#3388cc",

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
            var _mainTrack = null, v,
                _sliders = $( "<div class='ui-rangeslider-sliders' />"),
                self = this,
                queue = [  ROOT_NODE ],
                highlightColor = this.options.highlightColor;

            this.element.attr( "data-role", "rangeslider" );
            this.element.addClass( "ui-rangeslider" );
            _sliders.appendTo( this.element );

            while ( queue.length > 0 ) {
                v = queue.shift();

                self._rangesGraph.neighbours( v ).forEach(function( n ) {
                    var range = self._rangesGraph.get( n ),
                        highlight, firstWidget, lastWidget, firstLeft, lastLeft,
                        first = $( self._createSliderInput( range.values[ 0 ] ) ),
                        last = $( self._createSliderInput( range.values[ 1 ] ) );

                    first.appendTo( self.element ).slider().textinput();
                    last.appendTo( self.element ).slider().textinput();

                    firstWidget = self._getSliderWidget( first );
                    lastWidget = self._getSliderWidget( last );

                    firstWidget.slider.prependTo( _sliders );
                    lastWidget.slider.prependTo( _sliders );

                    if ( _mainTrack === null ) {
                        _mainTrack = firstWidget.slider;
                        lastWidget.handle.appendTo( _mainTrack );
                    } else {
                        lastWidget.handle.appendTo( _mainTrack );
                        firstWidget.handle.appendTo( _mainTrack );
                    }

                    firstLeft = parseInt( firstWidget.handle.get( 0 ).style.left, 10 );
                    lastLeft = parseInt( lastWidget.handle.get( 0 ).style.left, 10 );

                    highlight = $( "<div class='ui-slider-bg ui-btn-active'>" );
                    highlight.css({
                        left: firstLeft + "%",
                        width: ( lastLeft - firstLeft ) + "%",
                        backgroundColor: highlightColor
                    })
                    .appendTo( _mainTrack );

                    queue.push( n );
                });

                highlightColor = shadeColor( highlightColor, -0.25 );
            }

            $.extend( this, {
                _mainTrack: _mainTrack,
                _sliders: _sliders
            });
        },

        _getSliderWidget: function( el ) {
            return $.data( el.get( 0 ), "mobile-slider" );
        },

        _createSliderInput: function( value ) {
            var min = this.options.min, max = this.options.max,
                highlight = this.options.highlight,
                step = this.options.step;
            value = value || min;

            return format(
                "<input type='number' data-type='range' value='%s' step='%s' min='%s' max='%s'  />",
                value, step, min, max );
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
