let markerElement;

(function( $ ) {
	$( document ).ready( async function() {
		// Request needed libraries.
		const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
		markerElement = AdvancedMarkerElement;
	} );
})( window.jQuery );

// Control for toggling the user location function
function MyLocationControl( map ) {
	var controlDiv = document.createElement('div');
	controlDiv.style.padding = '5px';
	controlDiv.index = 1;

	var controlUI = document.createElement('div');
	controlUI.style.backgroundColor = 'white';
	controlUI.style.borderStyle = 'solid';
	controlUI.style.borderColor = 'rgba(0, 0, 0, 0.14902)';
	controlUI.style.borderWidth = '1px';
	controlUI.style.borderRadius = '2px';
	controlUI.style.cursor = 'pointer';
	controlUI.style.textAlign = 'center';
	controlUI.style.boxShadow = 'rgba(0, 0, 0, 0.298039) 0px 1px 4px -1px';
	controlUI.style.backgroundClip = 'padding-box';
	controlUI.title = mw.msg('maps-fullscreen-button-tooltip');
	controlDiv.appendChild(controlUI);

	var controlText = document.createElement('div');
	controlText.style.fontFamily = 'Roboto, Arial, sans-serif';
	controlText.style.fontSize = '11px';
	controlText.style.fontWeight = '400';
	controlText.style.color = 'rgb(86, 86, 86)';
	controlText.style.padding = '1px 6px';
	controlText.innerHTML = 'Toggle my location'; // TODO: Translation
	controlUI.appendChild(controlText);

	google.maps.event.addDomListener( controlUI, 'click', function() {
		var mapDiv = $( map.getDiv() );

		if ( mapDiv.data( 'followMyLocation' ) != null ) {
			mapDiv.removeData( 'followMyLocation' );
			deactivateMyLocation( map );
		} else {
			mapDiv.data( 'followMyLocation', 'on' );
			activateMyLocation( map );
		}
	} );

	return controlDiv;
}

window.MyLocationControl = MyLocationControl;

function handleLocationError( browserHasGeolocation, pos ) {
	console.log( browserHasGeolocation ?
		'Error: The Geolocation service failed.' :
		'Error: Your browser doesn\'t support geolocation.' );
}

function drawMyLocation( position, map ) {
	var pos = {
		lat: position.coords.latitude,
		lng: position.coords.longitude
	};

	// Center the map on the user's location
	map.setCenter( pos );

	var mapDiv = $( map.getDiv() );

	if ( typeof mapDiv.data( 'myLocationMarker' ) === 'undefined' ) {
		// Add a marker at the user's location
		const locationMarkerEl = document.createElement( 'div' );
		locationMarkerEl.className = 'my-location-marker';

		// TODO: Radius based on accuracy
		let myLocationMarker = new markerElement( {
			map,
			position: pos,
			content: locationMarkerEl,
		} );
		mapDiv.data( 'myLocationMarker', myLocationMarker );
	} else {
		mapDiv.data( 'myLocationMarker' ).position = pos;
	}
}

function activateMyLocation( map ) {
	mapDiv = $( map.getDiv() );

	// Check if geolocation is supported
	if ( navigator.geolocation ) {
		let myLocationWatchId = navigator.geolocation.watchPosition(
			function( position ) {
				drawMyLocation( position, map )
			},
			// Error handling
			function() {
				handleLocationError( true, map.getCenter() );
			},
			// Geolocation options
			{
				enableHighAccuracy: false,
				timeout: 5000,
				maximumAge: 0,
			}
		);
		mapDiv.data( 'myLocationWatchId', myLocationWatchId );
	} else {
		// Browser doesn't support geolocation
		handleLocationError( false, map.getCenter() );
	}
}

function deactivateMyLocation( map ) {
	mapDiv = $( map.getDiv() );

	// Check if geolocation is supported
	if ( navigator.geolocation ) {
		// Stop tracking location
		navigator.geolocation.clearWatch( mapDiv.data( 'myLocationWatchId' ) );
		mapDiv.removeData( 'myLocationWatchId' );
	}

	// Remove marker from the map
	if ( typeof mapDiv.data( 'myLocationMarker' ) !== 'undefined' ) {
		mapDiv.data( 'myLocationMarker' ).setMap( null );
		mapDiv.removeData( 'myLocationMarker' );
	}
}
