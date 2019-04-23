var loadListViewable = false;


var loadListIds = [];

function createSaveLoad() {
	console.log("createSaveLoad() called");
	loadListCreation();
	
	//save button
	document.getElementById("saveMenu").appendChild(document.createElement("br"));
	var textField = document.createElement("input");
	textField.type = "text";
	textField.id = "saveShit-input";
	textField.className = "save-input";
	textField.placeholder = "Enter Preset Name";
	document.getElementById("saveMenu").appendChild(textField);
	document.getElementById("saveMenu").appendChild(document.createElement("br"));
	document.getElementById("saveMenu").appendChild(document.createElement("br"));
	var saveButton = document.createElement("input");
	saveButton.type = "button";
	saveButton.className = "activate-button";
	saveButton.id = "saveShit";
	saveButton.value = "Save";
	saveButton.addEventListener('click', function(){
		saveLoadout();
	}, false);
	document.getElementById("saveMenu").appendChild(saveButton);
	document.getElementById("saveMenu").appendChild(document.createElement("br"));
	
	//load shit
	var menu = document.createElement("div");
	menu.className = "select";
	var selecter = document.createElement("select");
	selecter.id = "loadOptions";
	setTimeout(function(){

	loadListIds.forEach(function(lol) {
		var el = document.createElement("option");
		el.textContent = lol;
		el.value = lol;
		selecter.appendChild(el);
	});
	}, 1000);
	
	menu.appendChild(selecter);
	var arrow = document.createElement("div");
	arrow.className = "select_arrow";
	menu.appendChild(arrow);
	document.getElementById("loadMenu").appendChild(document.createElement("br"));
	document.getElementById("loadMenu").appendChild(menu);
	document.getElementById("loadMenu").appendChild(document.createElement("br"));
	var btn = document.createElement("input");
	btn.type = "button";
	btn.className = "activate-button";
	btn.id = "loadShit";
	btn.value = "Load";
	btn.addEventListener('click', function(){
		loadLoadout(selecter.options[selecter.selectedIndex].text);
	}, false);
	document.getElementById("loadMenu").appendChild(btn);
	
	

	/*document.body.appendChild(document.createElement("br"));
	
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
	document.body.appendChild(btn);*/
}

function loadListCreation(){
	
		var database = firebase.firestore();
			database.collection("users").get().then(snapshot => { snapshot.forEach(doc => {
				if(doc.data().email == firebase.auth().currentUser.email){
					database.collection("users/" + doc.id + "/ClipCollections").get().then(snapshot => {snapshot.forEach(doc2 => {
							loadListViewable = true;
							//document.body.appendChild(document.createElement("br"));
							if(!(doc2.data().name == "dummyClipCollection")){
								//document.body.appendChild(document.createElement("br"));
								loadListIds.push(doc2.data().name);
							}
							
						});
					});
					
					//return loadListIds;
				}
			});
			});
			
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
					var clipCollectionName = document.getElementById("saveShit-input").value;
					var el = document.createElement("option");
					el.textContent = document.getElementById("saveShit-input").value;
					el.value = document.getElementById("saveShit-input").value;
					document.getElementById("loadOptions").appendChild(el);
					
					database.collection("leaderboard").add({
						name: clipCollectionName,
						userEmail: doc.data().email,
						rating: 0
					});
					database.collection("leaderboard").get().then(snapshot => {snapshot.forEach(doc2 => {
							if(doc2.data().name == clipCollectionName){
								for(i = 0; i < soundoptions.length; ++i){
									var stereoValue;
									if(!(soundoptions[i].sound.stereo())){
										stereoValue = 0;
									}else{
										stereoValue = soundoptions[i].sound.stereo();
									}
									database.collection("leaderboard").doc(doc2.id).collection("Clips").add({
										name: soundoptions[i].name,
										panning: stereoValue,
										volume: soundoptions[i].sound.volume(),
										activated: soundoptions[i].sound.playing()
									});
								}
								database.collection("leaderboard").doc(doc2.id).collection("Upvotes").add({
										name: "dummyUpvoter"
								});
							}
						});
					});
					
					database.collection("users").doc(doc.id).collection("ClipCollections").add({
						name: clipCollectionName
					});
					document.getElementById("saveShit-input").value = "";
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
			
	}else{
		console.log("big error");
	}
}
