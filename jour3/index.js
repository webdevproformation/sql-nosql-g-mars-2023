import express from "express";
const PORT = 8000 ;
import axios from "axios";
import { createClient } from 'redis';

const client = createClient({
  url: 'redis://default:foobared@192.168.1.125:6379' 
});

const app = express();

app.get("/" , async (req,rep) => {
  const start = Date.now();
  await client.connect();
  const resultat = await client.get('users');
  if(!resultat){
    const { data } = await axios.get("https://jsonplaceholder.typicode.com/posts");
    const end = Date.now()
    rep.json( {
        from : "jsonplaceholder.typicode.com",
        duration :  end - start ,
        posts : data
      } )
    await client.set('users' , JSON.stringify(data))
    await client.disconnect();
  } else {
    const end = Date.now()
    await client.disconnect();
    rep.json( {
        from : "redis",
        duration :  end - start , 
        posts : JSON.parse(resultat)
      } )
  }
})

app.listen(PORT, () => console.log(`le serveur express écoute sur le port ${PORT}`));
