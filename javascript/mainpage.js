//A Class to represent a Clip

class Clip {
	constructor(name, sound, volume, panning) {
		this.name = name;
		this.sound = sound;
		this.volume = volume;
		this.panning = panning;
	}
}

var loadListViewable = false;

var loadListIds = [];


// The following are all Howls declared based on the clips available
var softrain = new Howl ({
	src: ['resources/sounds/Gentle-rain-loop.mp3'],
	loop: true,
	volume: 0.5,
	stereo: 0
});
var fireplace = new Howl ({
	src: ['resources/sounds/Fireplace-sound.mp3'],
	loop: true,
	volume: 0.5,
	stereo: 0
});
var forest_creek = new Howl ({
	src: ['resources/sounds/Forest-creek-nature-sounds.mp3'],
	loop:true,
	volume: 0.5,
	stereo: 0
});
var ocean_waves = new Howl ({
	src: ['resources/sounds/Sound-of-the-ocean.mp3'],
	loop: true,
	volume: 0.5,
	stereo: 0
});
var brown_noise = new Howl ({
	src: ['resources/sounds/Brown-noise-sleep.mp3'],
	loop: true,
	volume: 0.5,
	stereo: 0
});
var rolling_thunder = new Howl ({
	src: ['resources/sounds/rolling-thunder.mp3'],
	loop: true,
	volume: 0.5,
	stereo: 0
});
var insects_night = new Howl ({
	src: ['resources/sounds/insects-night.mp3'],
	loop: true,
	volume: 0.5,
	stereo: 0
});
var crab_rave = new Howl ({
	src: ['resources/sounds/crab-rave.mp3'],
	loop: true,
	volume: 0.5,
	stereo: 0
});

var soundoptions = [new Clip("Soft rain", softrain, 0, 0),
					new Clip("Fireplace", fireplace, 0, 0),
					new Clip("Forest creek", forest_creek, 0, 0),
					new Clip("Ocean beach", ocean_waves, 0, 0),
					new Clip("Brown Noise", brown_noise, 0, 0),
					new Clip("Thunder", rolling_thunder, 0, 0),
					new Clip("Nighttime", insects_night, 0, 0),
					new Clip("Calming notes", crab_rave, 0, 0)];
console.log("Stuff created");

//The below event listener makes this code wait until the DOM is loaded from HTML,
//and then starts calling the createOptions method.
//It is required because sometimes createOptions will start executing before the DOM
//is ready, and document.body can return null in that case
document.addEventListener("DOMContentLoaded", function(even) {
	firebase.auth().onAuthStateChanged(function(user) {
		if (user) {
			// User is signed in.
			createLogoutButton(); //Relevant functions in googleAuthFunctions.js
            createLeaderboardButton();
			createOptions();
			console.log(user.displayName + " logged in");
			addUserToDatabase(); //Relevant functions in googleAuthFunctions.js
			createSaveLoad(); //relevant functions in saveLoadFunctions.js
		} else {
			// No user is signed in.
			createGoogleAuth(); //Relevant functions in googleAuthFunctions.js
			createOptions();
		}
	});
});

function createOptions() {
    //TODO DELETE ME
	console.log("createOptions() called");
	for(i = 0; i < soundoptions.length; ++i) {
		var parentDivId = "c" + i;
		console.log("The current div: " + parentDivId);
		var parentDiv = document.getElementById(parentDivId);

		var clip = soundoptions[i];
		console.log("In the loop");
		//Create the title
		var title = document.createElement("h1");
		title.className = "clipTitleText";
		title.appendChild(document.createTextNode(clip.name));
		parentDiv.appendChild(title);
		
		//parentDiv.appendChild(document.createElement("br"));
		//Create the two sliders:
		var volumeSlider = document.createElement("input");
		volumeSlider.id = clip.name + " Volume";
		volumeSlider.type = "range";
		volumeSlider.className = "volume-slider";
		volumeSlider.min = "0";
		volumeSlider.max = "100";
		volumeSlider.value = "50";
		volumeSlider.addEventListener('input', updateVolume);
		parentDiv.appendChild(volumeSlider);

		parentDiv.appendChild(document.createElement("br"));
		parentDiv.appendChild(document.createElement("br"));
		parentDiv.appendChild(document.createElement("br"));

		var panningSlider = document.createElement("input");
		panningSlider.id = clip.name + " Panning";
		panningSlider.type = "range";
		panningSlider.className = "volume-slider";
		panningSlider.min = "-100";
		panningSlider.max = "100";
		panningSlider.value = "0";
		panningSlider.addEventListener('input', updatePanning);
		parentDiv.appendChild(panningSlider);

		parentDiv.appendChild(document.createElement("br"));
		parentDiv.appendChild(document.createElement("br"));
		parentDiv.appendChild(document.createElement("br"));

		var btn = document.createElement("input");
		btn.type = "button";
		btn.className = "activate-button";
		btn.id = clip.name + " Activate";
		btn.value = "Activate " + clip.name;
		btn.addEventListener('click', activateSound);
		parentDiv.appendChild(btn);
	}
}

function activateSound(e) {
	for(i = 0; i < soundoptions.length; i++) {
		if(soundoptions[i].name + " Activate" == e.srcElement.id) {
			if(soundoptions[i].sound.playing()){
				soundoptions[i].sound.stop();
				document.getElementById(e.srcElement.id).value = "Activate " + soundoptions[i].name; 
			}
			else{
				soundoptions[i].sound.play();
				document.getElementById(e.srcElement.id).value = "Deactivate " + soundoptions[i].name; 
			}
		}
	}
}

function createLeaderboardButton() {
	console.log("createLeaderboardButton() called");
	var btn = document.createElement("input");
	btn.type = "button";
	btn.className = "activate-button";
	btn.id = 'leaderboardButton';
	btn.value = "View Leaderboards";
	btn.onclick=directToLeaderboard;
	document.getElementById("leaderBoardWrapper").appendChild(document.createElement("br"));
	document.getElementById("leaderBoardWrapper").appendChild(btn);
}
function directToLeaderboard() {
    window.location = "./leaderboard.html"
}

function updateVolume(e) {
	//console.log("Volume changed for " + e.srcElement.id);
	for(i = 0; i < soundoptions.length; i++) {
		if(soundoptions[i].name + " Volume" == e.srcElement.id) {
			//console.log("Eureka! at " + i);
			soundoptions[i].sound.volume(e.srcElement.value * 0.01);
		}
	}
}

function updatePanning(e) {
	console.log("Panning set to " + e.srcElement.value);
	for(i = 0; i < soundoptions.length; i++) {
		if(soundoptions[i].name + " Panning" == e.srcElement.id) {
			//console.log("Eureka! at " + i);
			soundoptions[i].sound.stereo(e.srcElement.value * 0.01);
		}
	}
}


