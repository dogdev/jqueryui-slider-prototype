$( function( $ ) {

$.widget("ui.multislider", $.ui.singleslider, {
    version: "0.0.1",
    widgetEventPrefix: "multislider",

    // initialization

    options: {
        min: 0,
        max: 100,
        step: 1,
        values: [],

        // callbacks
        change: null
    },

    // events

    _handlechange: function ( event, ui ) {
        this._updateNeighbours( ui.handleKey, ui.value );
        this._trigger("change", event, { index: +ui.handleKey, value: ui.value });
    },

    _onSliderTrackInit: function( options ) {
        this._keys = Object.keys( options.handles );
    },

    // methods

    _updateNeighbours: function ( key, value ) {
        var neighbours = this._neighbours( key );
        this._track.slidertrack( "handleStop", neighbours.prev, value );
        this._track.slidertrack( "handleStart", neighbours.next, value );
    },

    // helpers
    
    _neighbours: function( key ) {
        var handleIndex = this._keys.indexOf( key ),
            neighbours;

        neighbours = {
            prev: this._keys[ handleIndex - 1 ],
            next: this._keys[ handleIndex + 1 ]
        };

        return neighbours;
    },

    _handles: function() {
        var i, prevKey,
            values = this.options.values,
            start = this.options.min,
            handles = {};

        for (i = 0; i < values.length; i++) {
            handles[ i ] = {
                start: start,
                value: values[i]
            };

            if ( typeof handles[ prevKey ] !== "undefined" ) {
                handles[ prevKey ].stop = values[ i ];
            }
            prevKey = i;
            start = values[ i ];
        }

        return handles;
    }
});

} ( jQuery ) );