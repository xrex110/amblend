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
	
	document.body.appendChild(document.createElement("br"));
	document.body.appendChild(document.createElement("br"));
	
	var btn = document.createElement("input");
	btn.type = "button";
	btn.id = 'loadButton';
	btn.value = "Load";
	btn.addEventListener('click', loadListCreation);
	document.body.appendChild(btn);
}

function loadListCreation(){
	if(loadListViewable){
		loadListViewable = false;
		for(i = 0; i < loadListIds.length; ++i){
			var btn = document.getElementById(loadListIds[i]);
			document.body.removeChild(btn);
		}
		var ldButton = document.getElementById("loadButton");
		ldButton.value = "Load";
		loadListIds = [];
	}
	else {
		var database = firebase.firestore();
		var ldButton = document.getElementById("loadButton");
		ldButton.value = "Close";
			database.collection("users").get().then(snapshot => { snapshot.forEach(doc => {
				if(doc.data().email == firebase.auth().currentUser.email){
					database.collection("users/" + doc.id + "/ClipCollections").get().then(snapshot => {snapshot.forEach(doc2 => {
							loadListViewable = true;
							//document.body.appendChild(document.createElement("br"));
							if(!(doc2.data().name == "dummyClipCollection")){
								//document.body.appendChild(document.createElement("br"));
								loadListIds.push(doc2.data().name);
								var btn = document.createElement("input");
								btn.type = "button";
								btn.id = doc2.data().name;
								btn.value = doc2.data().name;
								btn.addEventListener('click', function(){
									loadLoadout(doc2.data().name);
								}, false);
								document.body.appendChild(btn);
							}
							
						});
					});
				}
			});
		});
	}
}

function loadLoadout(buttonID){
	console.log("loadLoadout() called");
	
	var database = firebase.firestore();
			database.collection("users").get().then(snapshot => { snapshot.forEach(doc => {
				if(doc.data().email == firebase.auth().currentUser.email){
					database.collection("users/" + doc.id + "/ClipCollections").get().then(snapshot => {snapshot.forEach(doc2 => {
							if(buttonID == doc2.data().name){
								database.collection("users/" + doc.id + "/ClipCollections/" + doc2.id + "/Clips").get().then(snapshot => {snapshot.forEach(doc3 => {
										//setting values from load
										var clipVolume = document.getElementById(doc3.data().name + " Volume");
										clipVolume.value = doc3.data().volume * 100;
										var clipPanning = document.getElementById(doc3.data().name + " Panning");
										clipPanning.value = doc3.data().panning * 100;
										for(i = 0; i < soundoptions.length; ++i){
											if(doc3.data().name == soundoptions[i].name){
											
												soundoptions[i].sound.volume(doc3.data().volume);
												soundoptions[i].sound.stereo(doc3.data().panning);
												console.log(doc3.data().name + " updated");
												
												if(doc3.data().activated){
													if(!(soundoptions[i].sound.playing())){
														soundoptions[i].sound.play();
														document.getElementById(doc3.data().name + " Activate").value = "Deactivate " + soundoptions[i].name;
													}
												}else{
													if(soundoptions[i].sound.playing()){
														soundoptions[i].sound.stop();
														document.getElementById(doc3.data().name + " Activate").value = "Activate " + soundoptions[i].name;
													}
												}
											}
										}
										
									});
								});
							}
						});
					});
				}
			});
			});
			
}

function saveLoadout(){
	console.log("saveLoadout() called");
	
	if(!(firebase.auth().currentUser == null)){
		for(i = 0; i < soundoptions.length; ++i){
			console.log(soundoptions[i].name + " " + soundoptions[i].sound.volume() + " " + soundoptions[i].sound.stereo());
		}
			var database = firebase.firestore();
			database.collection("users").get().then(snapshot => { snapshot.forEach(doc => {
				if(doc.data().email == firebase.auth().currentUser.email){
					var clipCollectionName = document.getElementById("saveText").value;
					database.collection("users").doc(doc.id).collection("ClipCollections").add({
						name: clipCollectionName
					});
					document.getElementById("saveText").value = "";
					database.collection("users/" + doc.id + "/ClipCollections").get().then(snapshot => {snapshot.forEach(doc2 => {
							if(doc2.data().name == clipCollectionName){
								for(i = 0; i < soundoptions.length; ++i){
									var stereoValue;
									if(!(soundoptions[i].sound.stereo())){
										stereoValue = 0;
									}else{
										stereoValue = soundoptions[i].sound.stereo();
									}
									database.collection("users/" + doc.id + "/ClipCollections").doc(doc2.id).collection("Clips").add({
										name: soundoptions[i].name,
										panning: stereoValue,
										volume: soundoptions[i].sound.volume(),
										activated: soundoptions[i].sound.playing()
									});
								}
							}
						});
					});
				}
			});
			});
			
			if(loadListViewable == true){
				//recreate load list if it's already open to add newest item.
				loadListCreation();
				loadListViewable = false;
				loadListCreation();
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
		volumeSlider.id = clip.name + " Volume";
		volumeSlider.type = "range";
		volumeSlider.min = "0";
		volumeSlider.max = "100";
		volumeSlider.value = "50";
		volumeSlider.addEventListener('input', updateVolume);
		document.body.appendChild(volumeSlider);

		document.body.appendChild(document.createElement("br"));

		var panningSlider = document.createElement("input");
		panningSlider.id = clip.name + " Panning";
		panningSlider.type = "range";
		panningSlider.min = "-100";
		panningSlider.max = "100";
		panningSlider.value = "0";
		panningSlider.addEventListener('input', updatePanning);
		document.body.appendChild(panningSlider);

		document.body.appendChild(document.createElement("br"));

		var btn = document.createElement("input");
		btn.type = "button";
		btn.id = clip.name + " Activate";
		btn.value = "Activate " + clip.name;
		btn.addEventListener('click', activateSound);
		document.body.appendChild(btn);
		
		document.body.appendChild(document.createElement("br"));
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


