$( function( $ ) {

$.widget("ui.rangeslider", $.ui.multislider, {
    version: "0.0.1",
    widgetEventPrefix: "rangeslider",

    // initialization

    options: {
        min: 0,
        max: 100,
        step: 1,
        values: [],
        ranges: null,

        // callbacks
        change: null
    },

    _create: function() {
        this._initRanges();
        this._super();
        this._createHighlight();
    },

    _initRanges: function() {
        var _ranges;

        if ( this.options.ranges === null ) {
            _ranges = [ { key: "range", values: this.options.values } ];
        } else {
            _ranges = $.transformToArray( this.options.ranges );
        }

        this._ranges = _ranges.sort( this._sortByFirstValue );
    },

    _createHighlight: function() {
        var that = this;

        this._ranges.forEach( function( range ) {
            that._renderHighlight( range.key );
            that._refreshHighlight( range.key );
        });
    },

    //render

    _renderHighlight: function( rangeKey ) {
        var sliderTrack = this._track,
            highlightNode = $( "<div class='slider-highlight' />" );

        highlightNode.prependTo( sliderTrack );

        this._highlight = this._highlight || {};
        this._highlight[ rangeKey ] = highlightNode;
    },

    _refreshHighlight: function( rangeKey ) {
        var left1 = this._track.slidertrack( "handlePosition", rangeKey + ":0" ).fromBegin,
            left2 = this._track.slidertrack( "handlePosition", rangeKey + ":1" ).fromBegin;

        this._highlight[ rangeKey ].css({
            left: left1 + "%",
            width: ( left2 - left1 ) + "%"
        });
    },

    // events

    _handlechange: function( event, ui ) {
        var key = ui.handleKey.split( ":" ),
            anotherValue = this._handleValue( this._anotherHandle( ui.handleKey ) );

        this._updateNeighbours( ui.handleKey, ui.value );
        this._refreshHighlight( key[ 0 ] );

        this._trigger("change", event, {
            range: key[ 0 ],
            index: +key[ 1 ],
            value: ui.value,
            values: [ ui.value, anotherValue ].sort( this._sortValues )
        });
    },

    //helpers

    _sortValues: function( a, b ) {
        if ( a > b ) {
            return 1;
        }
        if ( a < b ) {
            return -1;
        }
        return 0;
    },

    _sortByFirstValue: function( a, b ) {
        if (a.values[ 0 ] > b.values[ 0 ] ) {
            return 1;
        }
        if (a.values[ 0 ] < b.values[ 0 ] ) {
            return -1;
        }
        return 0;
    },
    
    _handles: function() {
        var ranges = this._ranges,
            prevKey, start = this.options.min,
            handles = {},
            self = this;

        ranges.forEach( function( range ) {
            var i, handleKey;

            for ( i = 0; i < 2; i++ ) {
                handleKey = range.key + ":" + i;

                handles[ handleKey ] = {
                    start: start,
                    value: range.values[ i ]
                };

                if ( typeof handles[ prevKey ] !== "undefined" ) {
                    handles[ prevKey ].stop = range.values[ i ];
                }

                start = range.values[ i ];
                prevKey = handleKey;
            }
        });

        return handles;
    },
    
    _handleValue: function( key ) {
        return this._track.slidertrack( "value", key );
    },

    _anotherHandle: function( key ) {
        key = key.split( ":" );
        return key[ 0 ] + ( key[ 1 ] === "0" ? ":1" : ":0" );
    }
});

} ( jQuery ) );