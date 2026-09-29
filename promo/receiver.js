// Petit serveur local qui reçoit des images (dataURL) du navigateur et les écrit sur disque.
// POST http://localhost:3038/?f=<chemin relatif au dossier promo>
const http=require('http'),fs=require('fs'),path=require('path');
http.createServer((q,r)=>{
  const f=new URL(q.url,'http://x').searchParams.get('f');
  const chunks=[];q.on('data',d=>chunks.push(d));
  q.on('end',()=>{
    r.writeHead(200,{'Access-Control-Allow-Origin':'*'});
    if(f){const b=Buffer.concat(chunks).toString();fs.writeFileSync(path.join(__dirname,f),Buffer.from(b.slice(b.indexOf(',')+1),'base64'))}
    r.end('ok');
  });
}).listen(3038,()=>console.log('receiver on 3038'));
