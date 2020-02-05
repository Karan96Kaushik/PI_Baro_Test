const fs = require('fs');

fs.writeFile("test", "there!", function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("The file was saved!");
}); 