function filterTable() {
    var pretraga = document.getElementById("pretraga").value;
    var polje = document.getElementById("select").value;

    var filter, table, tr, td, i, txtValue;

    filter = pretraga.toUpperCase();
    table = document.getElementById("table");
    tr = table.getElementsByTagName("tr");

    for (var i = 1; i < tr.length; i++) {
        //za pocetak sakrij redak
        //redak koji ne zelimo prikazatai
        tr[i].style.display = "none";

        td = tr[i].getElementsByTagName("td");
        for (var j = 0; j < td.length; j++) {

            var cell;

            if (polje > -1 && polje < 10) {
                cell = tr[i].getElementsByTagName("td")[polje];
            } else if (polje == -1 || polje == 10) {
                cell = tr[i].getElementsByTagName("td")[j];
            }

            if (cell) {
                if (cell.innerHTML.toUpperCase().indexOf(filter) != -1) {
                    //redak koji zelimo prikazati
                    tr[i].style.display = "";
                    break;
                } 
            }
        }
    }

}