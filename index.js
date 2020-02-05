var baro_port = '/dev/ttyUSB0';

const createCsvWriter = require('csv-writer').createObjectCsvWriter;	// CSV Logging
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const path = require('path');
const date = require('date-and-time');
const fs = require('fs');

let now = new Date();
logname = date.format(now, 'DD-MM-YYYY[-]HH:mm'); //Name for csv Log File

const csvWriter = createCsvWriter({
    path: path.join(__dirname + `/Log-${logname}.csv`),
    header: [
        { id: 'time', title: 'Time' },
        { id: 'data', title: 'Data' },
    ]
});

SerPortS = new SerialPort(baro_port, {  // SGS
    baudRate: 9600,
    parity: "none"
}, function (err) {
    if (err) {
        console.log('SGS serial port Error');
    }
});

const parserS = SerPortS.pipe(new Readline({ delimiter: '\n' }));

parserS.on('data', datas => {
    process.stdout.write("!");

    now = new Date();

    let records = [
        {
            time: date.format(now, 'HH:mm:ss'),
            data: datas
        }
    ];

    csvWriter.writeRecords(records).then(() => {
        //console.log('Done');
    });
})

setInterval(() => {
    toggle_supply();
}, 20000);

function toggle_supply() {
    fs.writeFile("/sys/class/gpio/gpio21/value", "0", function (err) {
        console.log("The file was saved!");
        now = new Date();

        let records = [
            {
                time: date.format(now, 'HH:mm:ss'),
                data: "Restarted"
            }
        ];

        csvWriter.writeRecords(records).then(() => {
            //console.log('Done');
        });
    });

    setTimeout(() => {
        fs.writeFile("/sys/class/gpio/gpio21/value", "1", function (err) {
            //console.log("The file was saved!");
        });
    }, 5000);
}