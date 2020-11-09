function downloadJSON(json, filename) {
    var jsonFile;
    var downloadLink;

    // JSON file
    jsonFile = new Blob([json], {type: "application/json"});

    // Download link
    downloadLink = document.createElement("a");

    // File name
    downloadLink.download = filename;

    // Create a link to the file
    downloadLink.href = window.URL.createObjectURL(jsonFile);

    // Hide download link
    downloadLink.style.display = "none";

    // Add the link to DOM
    document.body.appendChild(downloadLink);

    // Click download link
    downloadLink.click();
}

function exportTableToJSON(filename) {
    var data = [];
    var rows = document.querySelectorAll('table tr:not([style*="display: none;"])');

    // first row needs to be headers
    var headers = [];
    for (var i = 0; i < rows[0].cells.length; i++) {
        headers[i] = rows[0].cells[i].innerHTML.toLowerCase().replace(/ /gi,'');
    }

    // go through cells
    for (var i = 1; i < rows.length; i++) {

        var tableRow = rows[i];
        var rowData = {};

        for (var j = 0; j < tableRow.cells.length; j++) {
            
            if (headers[j] == "imenalikova") {
                var str = tableRow.cells[j].innerText;
                var res = str.split(","); 
                
                var arr = [];

                for (var k = 0; k < res.length; k++) {
                    var temp = res[k].trim().split(" ");
                    var fin = {};

                    var ime = temp[0];
                    fin.ime = temp[0];
                    var prezime;
                    if (temp[1] == undefined || temp[1] == null) {
                        prezime = "";
                        fin.prezime = "";
                    } else {
                        prezime = temp[1];
                        fin.prezime = temp[1];
                    }
                    arr.push(fin);
                }

                rowData[ headers[j] ] = arr;

            } else if (headers[j] == "platforma") {
                var str = tableRow.cells[j].innerText;
                var arr = str.split(","); 
                var trimmedArr = [];
                
                for (var s in arr) {
                    trimmedArr.push(arr[s].trim());
                }

                rowData[ headers[j] ] = trimmedArr;

            } else {
                rowData[ headers[j] ] = tableRow.cells[j].innerText;
            }
            
        }

        data.push(rowData);
    }       

    downloadJSON(JSON.stringify(data, null, 1), filename);
}