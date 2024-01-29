const WebSocket = require('ws');
const http = require('http');
const server = http.createServer();
const wss = new WebSocket.Server({ server });
const express = require('express')
const axios = require('axios')
const { SerialPort } = require('serialport')
const {createInterface} = require('readline')
const cors = require('cors')
const { parse } = require('path');
const exp = require('constants');

let parameters = {
    ref_voltage :350,
    power_limit:150,
    duty_ratio: 30,
    kp:10,
    ki:1,
    mode : 0
}

let webSocketDataDispatcher;


let buffer = '';


    // const parser = port.pipe(new createInterface({ input:port,delimiter: '\n' }));
let dataObject = {
    voltage : 0,
    current:0,
    duty_ratio:0
}

const BASE_URL = "https://controlhub-881eb-default-rtdb.firebaseio.com/"
function sendDataToSTM32(data) {
    // Assuming 'data' is an object with properties corresponding to the struct entireData
    const buffer = Buffer.alloc(20); // Allocate a buffer of the appropriate size
    
    // Write each property to the buffer using the correct data type and offset
    buffer.writeFloatLE(data.ref_voltage, 0);
    buffer.writeFloatLE(data.power_limit, 4);
    buffer.writeFloatLE(data.duty_ratio, 8);
    buffer.writeFloatLE(data.kp, 12);
    buffer.writeFloatLE(data.mode, 16);
    // Send the binary data to the STM32
    port.write(buffer, (err) => {
        if (err) {
            console.error('Error writing to port:', err.message);
        } else {
          
        }
    });
}



    



const dataDispatcher = (dataObject)=>{
    if(dataObject && dataObject.voltage && dataObject.current && dataObject.duty_ratio)
    {
    dataObject.current_time = new Date();
   
    dataObject.duty_ratio = dataObject.duty_ratio/100;
    dataObject.voltage = dataObject.voltage;
    dataObject.current = dataObject.current;

    axios.post(BASE_URL+'readings.json',dataObject).then(()=>{
        if(parameters.mode==3)
        {
            setTimeout(()=>{
                parameters.mode = 0;
            
            },100)
        }
    }).catch((err)=>{
        console.log(err)
    })}
    axios.patch(BASE_URL+'parameters.json',
        parameters).then((res1)=>{

            if(res1)
            {
                console.log('data sent')
            }
        }).catch((err)=>{

        })

}




// setInterval(()=>{
//     sendDataToSTM32(parameters)
// },100)



// SerialPort.list().then(ports=>{
//     ports.forEach(port=>{
//         console.log(port.path)
//     })
// })
// port.on('open', () => {
//     console.log('Port opened successfully!!');
// });


// parser.on('data', data => {


//     const sensorData = parseSensorData(data);
//     if (sensorData) {
       
//         console.log(dataObject);
//     }

// });
// port.on('data',data=>{
   
//     let result = parseSensorData(data);
//     let voltage,current,duty_ratio;
//     if(result)
//     {
//        voltage = result.voltage;
//        current = result.current;
//        duty_ratio = result.duty_ratio;
  
//        if(result.mode===3)
//        {
    
//         parameters.mode = 0;
//        }
//     }

//     let sensorData = {
//         voltage:voltage,
//         current:current,
//         duty_ratio:duty_ratio
//     }
//      if(sensorData)
//      {
//          dataObject = {...sensorData};
//      }

// })

const parseSensorData = (data) => {
    // Convert the binary data into a SensorData object
    const buffer = Buffer.from(data,'hex');
      // Assuming the binary data is transmitted in hex format
   


      if (buffer.length === 32) {
        const data = {
            voltage: buffer.readFloatLE(0),
            current: buffer.readFloatLE(4),
            set_duty: buffer.readFloatLE(8),
            ref_voltage: buffer.readFloatLE(12),
            duty_ratio: buffer.readFloatLE(16),
            mode: buffer.readFloatLE(20),
            kp: buffer.readFloatLE(24),
            
            power_limit: buffer.readFloatLE(28),
        };
        return data;
    }
     else {
        // Handle the case when the buffer is too small

        return null;
    }
};

const app = express();
const express_port = 5000;

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));

app.use(express.json());


app.get('/sensor-data',(req,res)=>{
    dataObject.voltage = Math.random()*20+ 400;
    dataObject.current = Math.random()*100+200;
    dataObject.duty_ratio = 50;
    dataObject.current_time = new Date();
    res.json({dataObject});
})

app.get('/soft-start',(req,res)=>{
    res.send({message:'done'})
    parameters.mode =3;
})
app.post('/parameters',(req,res)=>{
    const data = req.body;
    console.log(data)
    if(data)
    {
     
      
        parameters.ref_voltage = parseFloat(data.ref_voltage);
        parameters.power_limit = parseFloat(data.power_limit);
        parameters.duty_ratio = parseFloat(data.duty_ratio);
        parameters.kp = parseFloat(data.kp)
        parameters.ki = 0
        parameters.mode = data.mode;
        console.log(parameters)
        axios.patch(BASE_URL+'parameters.json',
        parameters).then((res1)=>{

            if(res1)
            {
                console.log('data sent')
            }
        }).catch((err)=>{

        })


        res.status(200).send({message:'done'})
    }
    else{
        res.status(404).send({message:'Parameters not within Range'})
    }
    
    
})








resolution = 10;

wss.on('connection', (socket) => {
    console.log('A user connected');
    clearInterval(webSocketDataDispatcher);

    webSocketDataDispatcher = setupWebSocketDataDispatcher(socket);
    client = socket;
    socket.on('close', (code, reason) => {
        console.log('User disconnected:', reason);
        clearInterval(webSocketDataDispatcher);
    });
});

app.post('/resolution', (req, res) => {
    let r = req.body;

    if (r.resolution <= 1000 && r.resolution >= 1) {
        clearInterval(webSocketDataDispatcher);

        // Update resolution
        resolution = r.resolution;

        // Set up a new interval
        webSocketDataDispatcher = setupWebSocketDataDispatcher(client);
    }

    res.status(200).send({ message: 'done' });
});

function setupWebSocketDataDispatcher(socket) {
    return setInterval(() => {
        const time = new Date().getMilliseconds();
        const pulseWidth = 20; // Set pulse width as needed
        const isPulse = time % 40 < pulseWidth;

        dataObject.voltage = isPulse ? 350 : 0; 
        dataObject.current = Math.random() * 100 + 200;
        dataObject.duty_ratio = 0.5;
        dataObject.current_time = new Date();

        socket.send(JSON.stringify(dataObject));
    }, resolution);
}




server.listen(8080, () => {
    console.log('WebSocket server listening on port 6000');
  });










app.listen(express_port)