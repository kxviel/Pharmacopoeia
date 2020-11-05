const express = require('express');
const https = require('https');
const app = express();



app.get("/",function(req,res){
    const url = 'https://api.fda.gov/drug/ndc.json?api_key=S3DeKRRy8PtgRxfFGl5QbUlH0lxcAZ7QR2k8R9wH&search=generic_name:alitretinoin&limit=1';
    https.get(url, function(response){
        console.log(response);

        response.on('data',function(data){
            const drug = JSON.parse(data);
            const form = drug.results[0].dosage_form;
            const genName = drug.results[0].generic_name;
            res.send('The Name of the Drug is '+genName)
        })
    });
    res.send("Server is OK Bruh")
})

app.listen(3000,function(){
    console.log('Server is Running');
})