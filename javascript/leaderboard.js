
function setupTable(tableBody) {
    var titleRow = document.createElement('tr');
    titleRow.setAttribute("class","clipTitleText");
    titleRow.setAttribute("style","text-align: center; color: #6D00FF");
    
    var temp = document.createElement('td');
    temp.setAttribute("class","divTableCell");
    temp.setAttribute("style","text-align: center; color: #6D00FF");
    temp.appendChild(document.createTextNode("Name"));
    titleRow.appendChild(temp);
    
    temp = document.createElement('td');
    temp.setAttribute("class","divTableCell");
    temp.setAttribute("style","text-align: center; color: #6D00FF");
    temp.appendChild(document.createTextNode("Owner"));
    titleRow.appendChild(temp);
    
    temp = document.createElement('td');
    temp.setAttribute("class","divTableCell");
    temp.setAttribute("style","text-align: center; color: #6D00FF");
    temp.appendChild(document.createTextNode("Rating"));
    titleRow.appendChild(temp);
    
    temp = document.createElement('td');
    temp.setAttribute("class","divTableCell");
    temp.setAttribute("style","text-align: center; color: #6D00FF");
    temp.appendChild(document.createTextNode("Vote"));
    titleRow.appendChild(temp);

    tableBody.appendChild(titleRow);
}

var list = [];
function populateTable(tableBody) {
	var database = firebase.firestore();
    var counter = 0;
    database.collection("leaderboard").get().then(snapshot => {snapshot.forEach(doc2 => {
        
        if(doc2.data().name == "dummyClip") return;
            var entry = {name: doc2.data().name, userEmail: doc2.data().userEmail, rating: doc2.data().rating};
            list[counter] = entry;
            console.log("Adding");
            counter = counter + 1;
			
			database.collection("leaderboard").doc(doc2.id).collection("Upvotes").get().then(snapshot => {snapshot.forEach(doc3 => {
						if(doc3.data().name == firebase.auth().currentUser.email){
							list[counter-1].pressed = true;
						}
			});
		});
			
        })
        
        list.sort(function(x,y) {
            if(x.rating > y.rating) return 1;
            if(x.rating == y.rating) return 0;
            return -1;
        });

        for(var i = 0; i < list.length; ++i) {

            var tr = document.createElement('tr');
            tr.setAttribute("class","clipTitleText");
            
            var td = document.createElement('td');
            td.setAttribute("class","divTableCell");
            td.setAttribute("style","text-align: center; color: #6D00FF");
            td.appendChild(document.createTextNode(list[i].name));
            tr.appendChild(td)
            
            var td = document.createElement('td');
            td.setAttribute("class","divTableCell");
            td.setAttribute("style","text-align: center; color: #6D00FF");
            td.appendChild(document.createTextNode(list[i].userEmail));
            tr.appendChild(td)
            
            var td = document.createElement('td');
            td.setAttribute("class","divTableCell");
            td.setAttribute("style","text-align: center; color: #6D00FF");
            var text = document.createTextNode(list[i].rating);
            td.appendChild(text);
            tr.appendChild(td)
            
            var button = document.createElement("input");
            button.type = "button";
            button.id = "upvote" + i;
            button.value = "\u2B06"
            button.setAttribute("onClick","upvoteClick("+i+")");
            button.setAttribute("class","divTableCell");
            button.setAttribute("style","height:100px;width:100%; font-size: 50pt");

            tr.setAttribute("style","vertical-align: middle");
	        tr.appendChild(button);

            tableBody.appendChild(tr);


        }

    });
}

var table = document.createElement("TABLE");

document.addEventListener("DOMContentLoaded", function(even) {
    console.log("Loading leaderboard");
    createBackButton();
    table.setAttribute("id", "myTable");
    table.setAttribute("class", "divTable purpleHorizon");
    document.body.appendChild(table);
    var tableBody = document.createElement('tbody');
    tableBody.setAttribute("class","divTableBody");
    tableBody.setAttribute("style","background: #4A2F6F; font-size: 20pt");
    
    setupTable(tableBody);
    
    populateTable(tableBody);
    
    table.appendChild(tableBody);
})

function upvoteClick(id) {
	var database = firebase.firestore();
    console.log("Upvoting " + id);
    console.log(list[id]);
    if(list[id].pressed == true) {
        list[id].rating -= 1;
		database.collection("leaderboard").get().then(snapshot => {snapshot.forEach(doc2 => {
				if(doc2.data().name == list[id].name){
					var newRating = doc2.data().rating - 1;
					database.collection("leaderboard").doc(doc2.id).update({
						rating: newRating
					});
					database.collection("leaderboard").doc(doc2.id).collection("Upvotes").get().then(snapshot => {snapshot.forEach(doc3 => {
						if(doc3.data().name == firebase.auth().currentUser.email){
							doc3.ref.delete();
						}
						});
					});
					//start delete
					
					database.collection("users").get().then(snapshot => {snapshot.forEach(doc3 => {
							if(doc3.data().email == firebase.auth().currentUser.email){
								database.collection("users/" + doc3.id + "/ClipCollections").get().then(snapshot => {snapshot.forEach(doc4 => {
										if(doc4.data().name == doc2.data().name){
											//begin actual deletion
											
											database.collection("users").doc(doc3.id).collection("ClipCollections").doc(doc4.id).collection("Clips").get().then(snapshot => {snapshot.forEach(doc5 => {
												
													doc5.ref.delete();
												
												});
											});
											
											doc4.ref.delete();
											
											//end actual deletion
										}
									});
								});
							}
						});
					});
					
					
					//end
				}
			});
		});
    } else {
		database.collection("leaderboard").get().then(snapshot => {snapshot.forEach(doc2 => {
				if(doc2.data().name == list[id].name){
					var newRating = doc2.data().rating + 1;
					database.collection("leaderboard").doc(doc2.id).update({
						rating: newRating
					});
					database.collection("leaderboard").doc(doc2.id).collection("Upvotes").add({
						name: firebase.auth().currentUser.email
					});
					database.collection("users").get().then(snapshot => {snapshot.forEach(doc3 => {
							if(doc3.data().email == firebase.auth().currentUser.email){
								var clipCollectionName = doc2.data().name;
								database.collection("users").doc(doc3.id).collection("ClipCollections").add({
									name: clipCollectionName
								});
								database.collection("users/" + doc3.id + "/ClipCollections").get().then(snapshot => {snapshot.forEach(doc4 => {
									if(clipCollectionName == doc4.data().name){
										console.log("once");
										database.collection("leaderboard").doc(doc2.id).collection("Clips").get().then(snapshot => {snapshot.forEach(doc5 => {
											console.log(doc5.data().name);
												database.collection("users").doc(doc3.id).collection("ClipCollections").doc(doc4.id).collection("Clips").add({
												name: doc5.data().name,
												panning: doc5.data().panning,
												volume: doc5.data().volume,
												activated: doc5.data().activated
												});
											});
										});
									}
								});
								});
							}
						});
					});
				}
			});
		});
        list[id].rating += 1;
    }
    
    list[id].pressed = !list[id].pressed;
    
    //Alters HTML text displaying the rating
    table.rows[id+1].cells[2].innerHTML = list[id].rating;
    //TODO: Tell firebase to save the preset and increment rating!
	
    //list's elements hold the form {name, userEmail, rating, ratingElement (used for updating text)}


}
function createBackButton() {
	console.log("createBackButton() called");
	var btn = document.createElement("input");
	btn.type = "button";
	btn.id = 'mainPageButton';
	btn.value = "Go Back";
    btn.style="margin: auto; width: 100%; text-align: center;";
    btn.setAttribute("class","activate-button");
	btn.onclick=directToMain;
	document.body.appendChild(btn);
}

function directToMain() {
    window.location = "./index.html";
}

