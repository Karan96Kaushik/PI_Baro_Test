var baro_port = '/dev/ttyUSB0';
var baro_port2 = '/dev/ttyUSB1';

const createCsvWriter = require('csv-writer').createObjectCsvWriter;	// CSV Logging
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const path = require('path');
const date = require('date-and-time');
const fs = require('fs');

fs.writeFile("/sys/class/gpio/export", "21", () => {});
fs.writeFile("/sys/class/gpio/gpio21/direction", "out", () => {});

let now = new Date();
logname = date.format(now, 'DD-MM-YYYY[-]HH:mm'); //Name for csv Log File

const csvWriter = createCsvWriter({
    path: path.join(__dirname + `/Log-${logname}.csv`),
    header: [
        { id: 'time', title: 'Time' },
        { id: 'data', title: 'Data' },
        { id: 'data2', title: 'Data2' },
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

SerPortS2 = new SerialPort(baro_port2, {  // SGS
    baudRate: 9600,
    parity: "none"
}, function (err) {
    if (err) {
        console.log('SGS2 serial port Error');
    }
});

const parserS = SerPortS.pipe(new Readline({ delimiter: '\n' }));
const parserS2 = SerPortS2.pipe(new Readline({ delimiter: '\n' }));

var datas;
var datas2;

parserS.on('data', _datas => {
   // process.stdout.write("#");
    datas = _datas;
})

parserS2.on('data', _datas => {
    //process.stdout.write("!");
    datas2 = _datas;
})

setInterval(() => {
    write_csv();
}, 1000);

function write_csv() {
      now = new Date();

    let records = [
        {
            time: date.format(now, 'HH:mm:ss'),
            data: datas,
            data2: datas2
        }
    ];

    csvWriter.writeRecords(records).then(() => {
        console.log(datas,datas2);
    });
}

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
