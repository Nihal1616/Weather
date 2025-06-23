const express=require("express");
const axios=require("axios");
const dotenv=require("dotenv");
const mongoose=require("mongoose");
const Search = require('./models/search');


dotenv.config();

const app=express();



app.set("view engine","ejs");
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));

mongoose.connect('mongodb://127.0.0.1:27017/weatherApp', {
    // useNewUrlParser: true,
    // useUnifiedTopology: true
}).then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));



app.get('/', async (req, res) => {
    try {
        const recent = await Search.find().sort({ searchedAt: -1 }).limit(5);
        res.render('index', { recent });  
    } catch (err) {
        console.error('MongoDB query error:', err);
        res.render('index', { recent: [] });  
    }
});


app.post("/weather",async(req,res)=>{
    const city=req.body.city;
    const apiKey = process.env.WEATHER_KEY; 

const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    try{
        const response=await axios.get(url);
        const data=response.data;
        
        const weather={
            city:data.name,
            temp:data.main.temp,
            humidity:data.main.humidity,
            description:data.weather[0].description,
        };
        await Search.create({city:weather.city});
        res.render("result.ejs",{weather,error:null});
    }catch(err){
        res.render('result', { weather: null, error: "City not found. Try again!" });
    }
});


app.listen(8080,()=>{
    console.log('listening to port 8080');
});


