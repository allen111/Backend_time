//moduli globali 
var http = require('http');
var fs = require('fs')
var url = require('url')
var querystring = require('querystring');
var sql = require('sql.js')


//processare richieste post(form o AJAX da jQuery ecc)
function processPost(request, response, callback) {
	var queryData = "";
	if (typeof callback !== 'function') return null;
	
	if (request.method == 'POST') {
		request.on('data', function (data) {
			queryData += data;
			if (queryData.length > 1e6) {
				queryData = "";
				response.writeHead(413, { 'Content-Type': 'text/plain' }).end();
				request.connection.destroy();
			}
		});
		
		request.on('end', function () {
			request.post = querystring.parse(queryData);
			callback();
		});

	} else {
		response.writeHead(405, { 'Content-Type': 'text/plain' });
		response.end();
	}
}
//creazione server
var server = http.createServer(function (req, res) {
    //routing richieste a seconda dell'url
    switch (req.url) {
        //risposta a form (form1) utilizzo db , sql e usa processPost
		case '/myaction':
			processPost(req, res, function () {
                console.log(req.post);
                //creazione db
                var db = new sql.Database();
                //crazione tabella
                var sqlstr = "CREATE TABLE hello (name char, lastmname char, pref int);";
                //estrazione dati da Post della Form
				var a = req.post.name;
                var b = req.post.lastname;
                var c = req.post.pref;
                //inserimento nota le ' "
                sqlstr += "INSERT INTO hello VALUES ('" + a + "','" + b + "'," + c + " );"
                //comando senza return per il db
                db.run(sqlstr);
                //comada con return db
                var rez = db.exec("SELECT * FROM hello");
                //utilizzo risultati del comando db
				console.log("\n rez : " + rez);
				console.log("\n rez 0: " + rez[0]);
				console.log("\n rez 0 val: " + rez[0].values);
				var srr = rez[0].values.toString();
				console.log("string : "+srr);
				var arr = srr.split(",");
				console.log("arraystring : "+arr);
				
                res.writeHead(200, "OK", { 'Content-Type': 'text/plain' });

				res.write("Your name is :" + arr[0]);
                res.write("Your Lastname is :" + arr[1]);
                res.write("Your Pref is :" + arr[2]);
				res.end();
			});
			
            break;
        //invio json a front end
        case '/jsn1':
            res.writeHead(200, { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" });
            //creazione json nota                       ^^^                  ^^^^^^^^^^^^^^^^^^^^
            //sono must senno non invia
            var myJson = { 'key': 'value' };
            //aggiunta chiave
            myJson.key2 = 'val2';
            //stringify necessario si inviano solo stringhe o binari
            var json = JSON.stringify(myJson);
            res.end(json)
            break;
        //ricezione json da AJAX jQuery vedi bla1
        case '/jsn2':
            //uso preocessPost
            processPost(req, res, function () {
                //output
                console.log(req.post);
                console.log(req.post.name);
                res.end();
            });
            break;
        //form nota come hostare un html
		case '/form1':
            res.writeHead(200, { 'Content-Type': 'text/html' });
            //per hostare direttamente pagina html ^^^^ e sotto (path assoluto non necessario)
			fs.createReadStream("C:/Users/allen/Documents/Visual Studio 2015/Projects/NodejsConsoleApp1/NodejsConsoleApp1/Backend_time/form1.html").pipe(res);
			
            break;
        //index 
		case '/uno':
			res.writeHead(200, { 'Content-Type': 'text/html' });
			fs.createReadStream("C:/Users/allen/Documents/Visual Studio 2015/Projects/NodejsConsoleApp1/NodejsConsoleApp1/Backend_time/bla.html").pipe(res);
			
            break;
        //^
		case '/bla1111':
			res.writeHead(200, { 'Content-Type': 'text/html' });
			fs.createReadStream("C:/Users/allen/Documents/Visual Studio 2015/Projects/NodejsConsoleApp1/NodejsConsoleApp1/Backend_time/bla1.html").pipe(res);
            break;
        //scrivere direttamente su browser utile per errori o per debug
		default:
			res.writeHead(404, { 'Content-Type': 'text/html' });
			res.write("error 404:page not found");
			res.end();
			break;
	}

})

server.listen(1337, '127.0.0.1');

console.log('Server running at http://127.0.0.1:1337/');

