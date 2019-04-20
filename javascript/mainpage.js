//A Class to represent a Clip

class Clip {
	constructor(name, sound, volume, panning) {
		this.name = name;
		this.sound = sound;
		this.volume = volume;
		this.panning = panning;
	}
}


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

var soundoptions = [new Clip("Soft rain", softrain, 0, 0),
					new Clip("Fireplace", fireplace, 0, 0),
					new Clip("Forest creek", forest_creek, 0, 0),
					new Clip("Ocean beach", ocean_waves, 0, 0)];
console.log("Stuff created");

//The below event listener makes this code wait until the DOM is loaded from HTML,
//and then starts calling the createOptions method.
//It is required because sometimes createOptions will start executing before the DOM
//is ready, and document.body can return null in that case
document.addEventListener("DOMContentLoaded", function(even) {
	//Do stuff
	/*
	firebase.auth().getRedirectResult().then(function(result){
		if(result.credential){
			console.log(result);
			console.log("Google Account Linked");
			addUserToDatabase();
			createSaveLoad();
		}
	});*/
	
	firebase.auth().onAuthStateChanged(function(user) {
		if (user) {
			// User is signed in.
			createLogoutButton();
			createOptions();
			console.log(user.displayName + " logged in");
			addUserToDatabase();
			createSaveLoad();
		} else {
			// No user is signed in.
			createGoogleAuth();
			createOptions();
		}
});

});

function createSaveLoad() {
	console.log("createSaveLoad() called");
	
	document.body.appendChild(document.createElement("br"));
	
	var textField = document.createElement("input");
	textField.setAttribute("type", "text");
	textField.id = 'saveText';
	document.body.appendChild(textField);
	
	document.body.appendChild(document.createElement("br"));
	
	var btn = document.createElement("input");
	btn.type = "button";
	btn.id = 'saveButton';
	btn.value = "Save Current Loadout";
	btn.addEventListener('click', saveLoadout);
	document.body.appendChild(btn);
}

function saveLoadout(){
	console.log("saveLoadout() called");
	
	if(!(firebase.auth().currentUser == null)){
		for(i = 0; i < soundoptions.length; ++i){
			console.log(soundoptions[i].name + " " + soundoptions[i].sound.volume() + " " + soundoptions[i].sound.stereo());
		}
	}else{
		console.log("big error");
	}
}

function createLogoutButton() {
	console.log("createLogoutButton() called");
	var btn = document.createElement("input");
	btn.type = "button";
	btn.id = 'logoutButton';
	btn.value = "Logout";
	btn.addEventListener('click', logout);
	document.body.appendChild(btn);
}

function logout(){
	
	firebase.auth().signOut().then(function(){
		location.reload();
	});
	
}

function createGoogleAuth() {
	console.log("createGoogleAuth() called");
	var btn = document.createElement("input");
	btn.type = "button";
	btn.id = 'googleButton';
	btn.value = "Google Log-In";
	btn.addEventListener('click', googleAuth);
	document.body.appendChild(btn);
	
}

function googleAuth(){
	console.log("Google Authentication Called");
	firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
		.then(function(){
			var provider = new firebase.auth.GoogleAuthProvider();
			
			return firebase.auth().signInWithRedirect(provider);
		});
}

function addUserToDatabase(){
	var database = firebase.firestore();
	var newUser = true;
	const userEmail = firebase.auth().currentUser.email;
	const userDisplayName = firebase.auth().currentUser.displayName;
	//setup new user information
	database.collection("users").get().then(snapshot => { snapshot.forEach(doc => {
			if(doc.data().email == firebase.auth().currentUser.email){
				newUser = false;
			}
		});
		if(newUser){
		database.collection("users").add({
			email: userEmail,
			displayName: userDisplayName
		}).then(function(){
			console.log("user added");
		}).catch(function(error){
			console.log("Error: ", error);
		});
		
		database.collection("users").get().then(snapshot => { snapshot.forEach(doc => {
				if(doc.data().email == firebase.auth().currentUser.email){
					database.collection("users").doc(doc.id).collection("ClipCollections").add({
						name: "dummyClipCollection"
					});
					database.collection("users/" + doc.id + "/ClipCollections").get().then(snapshot => {snapshot.forEach(doc2 => {
							if(doc2.data().name == "dummyClipCollection"){
								database.collection("users/" + doc.id + "/ClipCollections").doc(doc2.id).collection("Clips").add({
									name: "dummyClipName",
									panning: 0,
									volume: 0
								});
							}
						});
					});
				}
			});
			
		});
		
		}
	});

}

function createOptions() {
	console.log("createOptions() called");
	for(i = 0; i < soundoptions.length; ++i) {
		var clip = soundoptions[i];
		console.log("In the loop");
		//Create the title
		var title = document.createElement("h1");
		title.appendChild(document.createTextNode(clip.name));
		document.body.appendChild(title);
		
		document.body.appendChild(document.createElement("br"));
		//Create the two sliders:
		var volumeSlider = document.createElement("input");
		volumeSlider.id = i + " Volume";
		volumeSlider.type = "range";
		volumeSlider.min = "0";
		volumeSlider.max = "100";
		volumeSlider.value = "50";
		volumeSlider.addEventListener('input', updateVolume);
		document.body.appendChild(volumeSlider);

		document.body.appendChild(document.createElement("br"));

		var panningSlider = document.createElement("input");
		panningSlider.id = i + " Panning";
		panningSlider.type = "range";
		panningSlider.min = "-100";
		panningSlider.max = "100";
		panningSlider.value = "0";
		panningSlider.addEventListener('input', updatePanning);
		document.body.appendChild(panningSlider);

		document.body.appendChild(document.createElement("br"));

		var btn = document.createElement("input");
		btn.type = "button";
		btn.id = i + " Activate";
		btn.value = "Activate " + clip.name;
		btn.addEventListener('click', activateSound);
		document.body.appendChild(btn);
		
		document.body.appendChild(document.createElement("br"));
	}
}

function activateSound(e) {
	for(i = 0; i < soundoptions.length; i++) {
		if(i + " Activate" == e.srcElement.id) {
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

function updateVolume(e) {
	//console.log("Volume changed for " + e.srcElement.id);
	for(i = 0; i < soundoptions.length; i++) {
		if(i + " Volume" == e.srcElement.id) {
			//console.log("Eureka! at " + i);
			soundoptions[i].sound.volume(e.srcElement.value * 0.01);
		}
	}
}

function updatePanning(e) {
	console.log("Panning set to " + e.srcElement.value);
	for(i = 0; i < soundoptions.length; i++) {
		if(i + " Panning" == e.srcElement.id) {
			//console.log("Eureka! at " + i);
			soundoptions[i].sound.stereo(e.srcElement.value * 0.01);
		}
	}
}


