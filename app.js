const express = require('express')
const axios = require('axios')
const { SerialPort } = require('serialport')
const {createInterface} = require('readline')
const cors = require('cors')
const { parse } = require('path')
const port = new SerialPort({ path: 'COM5', baudRate: 1152000 ,
stopBits:1,
parity:'none',


})

let parameters = {
    ref_voltage :350,
    power_limit:150,
    duty_ratio: 30,
    kp:10,
    ki:1,
    mode : 0
}

const zeroPad = (value, width) => {
    const str = value.toString();
    const pad = width - str.length;
    return pad > 0 ? '0'.repeat(pad) + str : str;
};

let buffer = '';


    const parser = port.pipe(new createInterface({ input:port,delimiter: '\n' }));
let dataObject = {
    voltage : 0,
    current:0,
    duty_ratio:0
}

const BASE_URL = ""
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
    dataObject.voltage = dataObject.voltage.toFixed(2);
    dataObject.current = dataObject.current.toFixed(2);

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

let dispatchTimer;

// Start dispatching data every 200ms

dispatchTimer = setInterval(() => {
  dataDispatcher(dataObject);
}, 500);

setInterval(()=>{
    sendDataToSTM32(parameters)
},500)



SerialPort.list().then(ports=>{
    ports.forEach(port=>{
        console.log(port.path)
    })
})
port.on('open', () => {
    console.log('Port opened successfully!!');
});


parser.on('data', data => {


    const sensorData = parseSensorData(data);
    if (sensorData) {
       
        console.log(dataObject);
    }

});
port.on('data',data=>{
   
    let result = parseSensorData(data);
    let voltage,current,duty_ratio;
    if(result)
    {
       voltage = result.voltage;
       current = result.current;
       duty_ratio = result.duty_ratio;
  
       if(result.mode===3)
       {
    
        parameters.mode = 0;
       }
    }

    let sensorData = {
        voltage:voltage,
        current:current,
        duty_ratio:duty_ratio
    }
     if(sensorData)
     {
         dataObject = {...sensorData};
     }

})

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
const corsOptions ={
    origin:'http://localhost:3000', 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200
}
app.use(cors(corsOptions));
app.use(express.json());
app.get('/soft-stop',(req,res)=>{
    res.send({message : 'done'})
    parameters.mode=2;
}

)

app.options('*', (req, res) => {
    // Set CORS headers to allow requests from any origin
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).send();
  });
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

app.listen(express_port)