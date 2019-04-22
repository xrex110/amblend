
function setupTable(tableBody) {
    var titleRow = document.createElement('tr');
    titleRow.setAttribute("class","divTableRow");
    
    var temp = document.createElement('td');
    temp.setAttribute("class","divTableCell");
    temp.appendChild(document.createTextNode("Name"));
    titleRow.appendChild(temp);
    
    temp = document.createElement('td');
    temp.setAttribute("class","divTableCell");
    temp.appendChild(document.createTextNode("Owner"));
    titleRow.appendChild(temp);
    
    temp = document.createElement('td');
    temp.setAttribute("class","divTableCell");
    temp.appendChild(document.createTextNode("Rating"));
    titleRow.appendChild(temp);
    
    temp = document.createElement('td');
    temp.setAttribute("class","divTableCell");
    temp.appendChild(document.createTextNode("Vote"));
    titleRow.appendChild(temp);

    tableBody.appendChild(titleRow);
}

document.addEventListener("DOMContentLoaded", function(even) {
    console.log("Loading leaderboard");
    var table = document.createElement("TABLE");
    table.setAttribute("id", "myTable");
    table.setAttribute("class", "divTable purpleHorizon");
    document.body.appendChild(table);
    var tableBody = document.createElement('tbody');
    tableBody.setAttribute("class","divTableBody");
    
    setupTable(tableBody);
    
    for (var i = 0; i < 10; i++) {
        var tr = document.createElement('tr');
        tr.setAttribute("class","divTableRow");
        //TODO: Query FB and set each column to the relevant information
        for(var j = 0; j < 3; j++) {
            var td = document.createElement('td');
            td.setAttribute("class","divTableCell");
            //TODO: replace "test" with preset's field relevant to the column
            //PresetName    Owner   Rating
            td.appendChild(document.createTextNode("Test"));
            tr.appendChild(td)
        }

        //Here we also need to add buttons on each row

        tableBody.appendChild(tr);
    }
    table.appendChild(tableBody);
})
