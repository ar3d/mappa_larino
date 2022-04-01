window.onload = () => {
    let method = 'dynamic';

    // if you want to statically add places, de-comment following line:
    method = 'static';
    if (method === 'static') {
        let places = staticLoadPlaces();
        return renderPlaces(places);
    }

    if (method !== 'static') {
        // first get current user location
        return navigator.geolocation.getCurrentPosition(function (position) {

            // than use it to load from remote APIs some places nearby
            dynamicLoadPlaces(position.coords)
                .then((places) => {
                    renderPlaces(places);
                })
        },
            (err) => console.error('Error in retrieving position', err),
            {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 27000,
            }
        );
    }
};

function staticLoadPlaces() {
    return [
        {
            name: "Duomo di Larino",
            location: {
                lat: 41.801077, // change here latitude if using static data
                lng: 14.910286, // change here longitude if using static data
            },
			look: "[gps-camera]",
			image: "assets/map-marker.png",
			href: "",
			sfondo: "assets/sfondi/duomo.jpg",
			text: "La basilica è intitolata a Santa Maria Assunta e San Pardo, patrono della città. La chiesa venne consacrata nel 1319 e prese il posto di un precedente luogo di culto dedicato sempre al santo Vescovo."
        },
		{
            name: "Chiesa di San Francesco",
            location: {
                lat: 41.800840, // change here latitude if using static data
                lng: 14.910768, // change here longitude if using static data
            },
			look: "[gps-camera]",
			image: "assets/map-marker.png",
			href: "",
			sfondo: "assets/sfondi/san_francesco.jpg",
			text: "La chiesa e l'annesso convento nascono agli inizi del XIV secolo ad opera dell'ordine francescano. Dell'originaria costruzione rimane poco in quanto nel dorso dei secoli l'edificio ha subito profonde modifiche."
        },
		{
            name: "Palazzo ducale",
            location: {
                lat: 41.800420, // change here latitude if using static data
                lng: 14.910763, // change here longitude if using static data
            },
			look: "[gps-camera]",
			image: "assets/map-marker_2.png",
			href: "",
			sfondo: "assets/sfondi/ducale.jpg",
			text: "Il palazzo in origine era un castello. Fu la famiglia Di Sangro, divenuta feudataria di Larino nel 1683 che trasformò la fortificazione in palazzo gentilizio. Oltre al Comune il palazzo ospita anche il museo civico."
        },
		{
            name: "Episcopio",
            location: {
                lat: 41.800420, // change here latitude if using static data
                lng: 14.910763, // change here longitude if using static data
            },
			look: "[gps-camera]",
			image: "assets/map-marker_2.png",
			href: "",
			sfondo: "assets/sfondi/episcopio.jpg",
			text: "Il palazzo ha ospitato il primo seminiario della storia creato dal vescovo Belisario Balduino nel 1564. Oggi accoglie il MAB, cioè il museo, l'archivio e la bibioteca diocesani."
        },
    ];
}

// getting places from REST APIs
function dynamicLoadPlaces(position) {
    let params = {
        radius: 300,    // search places not farther than this value (in meters)
        clientId: 'HZIJGI4COHQ4AI45QXKCDFJWFJ1SFHYDFCCWKPIJDWHLVQVZ',
        clientSecret: '',
        version: '20300101',    // foursquare versioning, required but unuseful for this demo
    };

    // CORS Proxy to avoid CORS problems
    // NOTE this no longer works - please replace with your own proxy
    let corsProxy = 'https://cors-anywhere.herokuapp.com/';

    // Foursquare API
    let endpoint = `${corsProxy}https://api.foursquare.com/v2/venues/search?intent=checkin
        &ll=${position.latitude},${position.longitude}
        &radius=${params.radius}
        &client_id=${params.clientId}
        &client_secret=${params.clientSecret}
        &limit=15
        &v=${params.version}`;
    return fetch(endpoint)
        .then((res) => {
            return res.json()
                .then((resp) => {
                    return resp.response.venues;
                })
        })
        .catch((err) => {
            console.error('Error with places API', err);
        })
};

function renderPlaces(places) {
    let scene = document.querySelector('a-scene');

    places.forEach((place) => {
        let latitude = place.location.lat;
        let longitude = place.location.lng;

        // add place name
        let icon = document.createElement('a-image');
        icon.setAttribute('gps-entity-place', `latitude: ${latitude}; longitude: ${longitude};`);
        icon.setAttribute('look-at', place.look);
		icon.setAttribute('name', place.name);
        icon.setAttribute('src', place.image);
        icon.setAttribute('scale', '5 5 5');
		icon.setAttribute('href', place.href);
		icon.setAttribute('sfondo', place.sfondo);
		icon.setAttribute('text', place.text);
		

        
        icon.addEventListener('loaded', () => window.dispatchEvent(new CustomEvent('gps-entity-place-loaded')));


// this click listener has to be added simply to a click event on an a-entity element
const clickListener = function (ev) {
    ev.stopPropagation();
    ev.preventDefault();

    const name = ev.target.getAttribute('name');
	const link = ev.target.getAttribute('href');
	const testo = ev.target.getAttribute('text');
	const sfondo = ev.target.getAttribute('sfondo');
    const el = ev.detail.intersection && ev.detail.intersection.object.el;
	
    if (el && el === ev.target) {
        // after click, we are adding a label with the name of the place
		const label = document.createElement('span');
        const container = document.createElement('div');
		container.setAttribute('id', 'place-label');
		label.innerHTML = '<a href="'+link+'" target="_blank" class="animated-button1" style="background-image:url('+sfondo+')"><span></span><span></span><span></span><span></span><p class="p1">'+name+'</p><br><p class="p2">'+testo+'</p></a>';
		container.appendChild(label);
		document.body.appendChild(container);
        
		

        setTimeout(() => {
            // that will disappear after less than 6 seconds
            container.parentElement.removeChild(container);
        }, 6000);
     }
 };
icon.addEventListener('click', clickListener);
        scene.appendChild(icon);
    });
}
