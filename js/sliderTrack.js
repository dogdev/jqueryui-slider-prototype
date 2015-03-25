$( function( $ ) {

$.widget("ui.slidertrack", $.ui.mouse, {
    version: "0.0.1",
    widgetEventPrefix: "slidertrack",

    // initialization

    options: {
        min: 0,
        max: 100,
        step: 1,
        handles: {},

        // callbacks
        handlechange: null
    },

    _handleOptions: function() {
        return {
            value: this._getMin(),
            start: this._getMin(),
            stop: this._getMax()
        };
    },

    _create: function() {
        var that = this;

        this._lastChangedHandle = null;
        this._activeHandle = null;

        this._calculateNewMax();
        this._mouseInit();
        this._createHandles();
        this._renderHandles();

        this._handles.forEach( function( handle ) {
            that._refreshHandle( handle.key );
        });
    },

    // render

    _renderHandles: function() {
        var _handlesNodes = {},
            self = this;

        this._handles.forEach( function( handle ) {
            _handlesNodes[ handle.key ] = $( $.format( "<span class='handle' data-key='%s'></span>", handle.key ) );
            _handlesNodes[ handle.key].appendTo( self.element );
        });

        this.element.addClass( "slider-track" );
        this._handlesNodes = _handlesNodes;
    },
    
    _refreshHandle: function( key ) {
        var handle = this._handle( key );

        var valueInPercent = this._percent( handle.value ),
            handleNode = this._handleNode( handle.key);

        handleNode.css( { "left": valueInPercent + "%" } );
    },

    _createHandles: function() {
        var that = this;

        this._handles = $.transformToArray( this.options.handles, this._handleOptions() );
        this._handles.forEach( function ( handle ) {
            handle.value = that._trimValue( handle.value );
        });
    },

    _handleNode: function( key ) {
        if ( typeof key === "undefined" || typeof this._handlesNodes[ key ] === "undefined" ) {
            return null;
        }

        return this._handlesNodes[ key ];
    },

    // events

    _mouseCapture: function( event ) {
        var handleNode,
            capturedElement = $( event.target ),
            mouseValue = this._mouseValue( event );

        if ( this._lastChangedHandle === null || capturedElement.is( ".handle" ) ) {
            this._activeHandle = this._closestHandleKey( mouseValue );
        } else {
            this._activeHandle = this._lastChangedHandle;
        }

        this._selectHandle( this._activeHandle );
        this._changeValue( this._activeHandle, mouseValue );
        return true;
    },

    _mouseDrag: function ( event ) {
        var value = this._mouseValue( event );
        this._changeValue( this._activeHandle, value );
        return false;
    },

    //methods

    _changeValue: function ( key, value, allowToChangeLast ) {
        var that = this,
            handle = this._handle( key ),
            oldValue = handle.value;

        if ( typeof allowToChangeLast === "undefined" ) {
            allowToChangeLast = true;
        }

        handle.value = this._trimHandleValue( value, handle );

        this._lastChangedHandle = allowToChangeLast ? key : this._lastChangedHandle;
        this._refreshHandle( key );

        if ( oldValue !== handle.value ) {
            this._trigger( "handlechange", null, {
                handleKey: key,
                value: handle.value
            });
        }
    },

    _handle: function ( key ) {
        var handle = null;

        this._handles.forEach( function( h ) {
            if (h.key === key ) {
                handle = h;
            }
        });

        return handle;
    },
    
    _selectHandle: function ( key ) {
        var handleNode = this._handleNode( this._activeHandle),
            lastChangedHandleNode = this._handleNode( this._lastChangedHandle );

        if ( lastChangedHandleNode !== null ) {
            lastChangedHandleNode.removeClass( "active" );
            lastChangedHandleNode.css( { zIndex: 0 } );
        }

        handleNode.addClass( "active" );
        handleNode.css( { zIndex: 1 } );
    },

    //public

    handleStart: function( key, value ) {
        if ( typeof key === "undefined" ) {
            return;
        }

        key = key.toString();
        var handle = this._handle( key );

        if ( handle === null ) {
            return;
        }

        handle.start = value;
        this._changeValue( key, handle.value, false );
    },

    handleStop: function( key, value ) {
        if ( typeof key === "undefined" ) {
            return;
        }

        key = key.toString();
        var handle = this._handle( key );

        if ( handle === null ) {
            return;
        }

        handle.stop = value;
        this._changeValue( key, handle.value, false );
    },

    value: function ( key, value ) {
        if ( typeof value === 'undefined' ) {
            return this._handle( key ).value;
        }

        this._changeValue( key, value );
    },

    handlePosition: function( key ) {
        var handleStyle,
            handleNode = this._handleNode( key );

        if ( handleNode === null ) {
            return null;
        }

        handleStyle = handleNode.get( 0 ).style;

        return {
            fromBegin: parseInt( handleStyle.left, 10 )
        }
    },
    
    // helpers

    _mouseValue: function( event ) {
        var position = { left: event.pageX, top: event.pageY },
            elementOffset = this.element.offset(),
            total = this.element.width(),
            left = position.left - elementOffset.left,
            percentValue = left * 100 / total;

        return this._trimValue( this._valueFromPercent( percentValue ) );
    },

    _trimHandleValue: function( value, handle ) {
        if ( value > handle.stop ) {
            return handle.stop;
        }
        if ( value < handle.start ) {
            return handle.start;
        }

        return value;
    },

    _trimValue: function( value ) {
        var min = this._getMin(),
            max = this._getMax(),
            step = this._getStep(),
            valModStep = Math.abs( value - min ) % step,
            alignValue = value - valModStep;

        if ( value <= min ) {
            return min;
        }
        if ( value >= max ) {
            return max;
        }

        if ( valModStep * 2 >= step ) {
            alignValue += ( valModStep > 0 ) ? step : ( -step );
        }

        return parseFloat( alignValue.toFixed( 5 ) );
    },

    _closestHandleKey: function( value ) {
        var handleKey,
            that = this,
            min = this._getMin(), max = this._getMax(),
            distance = max - min + 1;

        this._handles.forEach( function( handle ) {
            var handleDistance = Math.abs( value - handle.value),
                change = false;

            if ( distance > handleDistance ) {
                change = true;
            }
            if ( distance === handleDistance && ( handle.key === that._lastChangedHandle || handle.value === min ) ) {
                change = true;
            }
            if ( change ) {
                distance = handleDistance;
                handleKey = handle.key;
            }
        });

        return handleKey;
    },

    _percent: function( value ) {
        var max = this._getMax(),
            min = this._getMin();

        return (100 * value) / (max - min);
    },
    
    _valueFromPercent: function (percent) {
        var max = this._getMax(),
            min = this._getMin(),
            total = max - min;

        return total * percent / 100;
    },

    _getMax: function() {
        return this.max;
    },

    _getMin: function() {
        return this.options.min;
    },

    _getStep: function() {
        return ( this.options.step > 0 ) ? this.options.step : 1;
    },

    _calculateNewMax: function() {
        var max = this.options.max,
            min = this._getMin(),
            step = this.options.step,
            aboveMin = Math.floor( ( +( max - min ).toFixed( this._precision() ) ) / step ) * step;

        max = aboveMin + min;
        this.max = parseFloat( max.toFixed( this._precision() ) );
    },

    _precision: function() {
        var precision = this._precisionOf( this.options.step );
        if ( this.options.min !== null ) {
            precision = Math.max( precision, this._precisionOf( this.options.min ) );
        }
        return precision;
    },

    _precisionOf: function( num ) {
        var str = num.toString(),
            decimal = str.indexOf( "." );
        return decimal === -1 ? 0 : str.length - decimal - 1;
    }
});

} ( jQuery ) );