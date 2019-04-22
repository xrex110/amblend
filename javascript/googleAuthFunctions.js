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