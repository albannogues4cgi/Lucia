/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var builder = require('botbuilder');
var restify = require('restify');
var prompts = require('./data/prompts');
var f = require('./functions/usefulFunction');
var conv = require('./speech/conversation');
var a = require('./functions/askAnswer');
var brain = require("./data/knowledge");
var fs = require("fs");
var ass = require("./speech/assurance");
var bank = require("./speech/banque");
var bankV2 = require("./speech/banqueV2");

//=========================================================
// Bot Setup
//=========================================================

// appID : ac71f72c-2c77-40f4-af7b-c4931f8110ed
// appPassword : DrjiLpupErtsdqSYDgcMTVx

//=========================================================

//=========================================================
// Pour le serveur ce cgi
//=========================================================

// Setup Restify Server
var server = restify.createServer({
   certificate: fs.readFileSync("https/server.crt.pem"),
   key: fs.readFileSync("https/server.key.pem"),
   name: "cob",
 });

 server.listen(10443, function(){
 	console.log('%s listening to %s', server.name, server.url); 
 });

// Create chat bot
var connector = new builder.ChatConnector({
// compte perso
// appId: "ac71f72c-2c77-40f4-af7b-c4931f8110ed",
// appPassword: "DrjiLpupErtsdqSYDgcMTVx"
	
 	// compte cgi lucia
 	appId: "c9f4b46f-7fe8-48fb-92fd-3d3bdad3c8c6",
 	appPassword: "0Pt09f6jqUuG3xaa2CbX92b"
	
// lucia_test for heroku
// appId: "d0db8947-f9d8-49ce-af2e-347d7ce40b00",
// appPassword: "wiAECQS7omxfB3GUiwD7MxQ"
});

var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

//=========================================================
// Pour Heroku
//=========================================================

// Setup Restify Server
// var server = restify.createServer();

// server.listen(process.env.PORT, function(){
// 	console.log('%s listening to %s', server.name, server.url); 
// });

// // Create chat bot
// var connector = new builder.ChatConnector({
// 	// compte perso
// 	// appId: "ac71f72c-2c77-40f4-af7b-c4931f8110ed",
// 	// appPassword: "DrjiLpupErtsdqSYDgcMTVx"
	
// 	// compte cgi lucia
// 	// appId: "c9f4b46f-7fe8-48fb-92fd-3d3bdad3c8c6",
// 	// appPassword: "0Pt09f6jqUuG3xaa2CbX92b"
	
// 	//lucia_test for heroku
// 	appId: "d0db8947-f9d8-49ce-af2e-347d7ce40b00",
// 	appPassword: "wiAECQS7omxfB3GUiwD7MxQ"
// });

// var bot = new builder.UniversalBot(connector);
// server.post('/api/messages', connector.listen());

/**1
 * Mode console
 **/
//Je me connecte en mode console
//var connector = new builder.ConsoleConnector().listen();
//var bot = new builder.UniversalBot(connector);

//=========================================================

//=========================================================
// Luis Setup
//=========================================================
https://api.projectoxford.ai/luis/v1/application?id=2a1b7c3f-0031-47c2-81e5-7e6378b4f0ad&subscription-key=e44f708e8fb2425587490ec44f9eef66&q=
//On connecte LUIS
//compte perso
// var model = process.env.model || 'https://api.projectoxford.ai/luis/v1/application?id=95517bc1-76fc-4d65-81a9-63456aee5245&subscription-key=e44f708e8fb2425587490ec44f9eef66&q=';

// modèle V2 ne reponds seulement à je veux faire un virement de 10€ à mathias demain et ses variantes
// A decommenter avec le matches ci dessous
// var model = process.env.model || 'https://api.projectoxford.ai/luis/v1/application?id=2a1b7c3f-0031-47c2-81e5-7e6378b4f0ad&subscription-key=e44f708e8fb2425587490ec44f9eef66&q=';

//compte cgi
var model = process.env.model || 'https://api.projectoxford.ai/luis/v1/application?id=2c3632ab-74e8-4fc3-ba6b-dcf6e1375ee8&subscription-key=a4d547a86a5e4a8e88acf3a0dc029f34&q=';
var recognizer = new builder.LuisRecognizer(model);
var dialog = new builder.IntentDialog({ recognizers: [recognizer] });

//=========================================================

/**
 * Point d'entrée de la conversation 
 **/
bot.dialog('/', dialog);
/************************************************/

/**
 * Réponse par défaut de cob 
 **/
dialog.onDefault(builder.DialogAction.send(prompts.accueil));
/************************************************/

//Pour de l'aide
//dialog.matches('aide', '/aide');
// bot.dialog('/aide', [
//     function(session){
//         f.debug('aide');
//         builder.Prompts.text(session, cob + prompts.reponse);
//     },
//     function(session, results){
//         debug(results.response);
//         if(results.response == 1){
//             session.send(cob + prompts.fonctionnement);
//             next();
            
//         }
//         if(results.response == 2){
//             session.send(cob + prompts.implementer);
// //            session.endDialog();
//         }
//         else{
// //            session.endDialog();
//         }
//     }
// ]);

/**
 * On essaie de crée un bot qui parle de tout et n'importe quoi
 **/
dialog.matches('salutation', conv.salutation);
// dialog.matches('sante', conv.sante); ----> Bug dans Luis
//dialog.matches('none', conv.none); car default qui 

/**
 * Demande de name 
 **/
dialog.matches('name', conv.name);
/************************************************/

/**
 * remerciment
 **/
dialog.matches('remerciment', conv.remerciment);
/************************************************/

/**
 * Pour les news
 **/
dialog.matches('news', conv.news);
/************************************************/

/**
 * Description cob ou user
 **/
// dialog.matches('ego', conv.ego); existe sur luis met n'est pas implémenté
/************************************************/

/**
 * Assurance 
 **/
dialog.matches('event', ass.assurance); 
/************************************************/

/**
 * Effectuer un virement 
 **/
dialog.matches('makeMoneyTransfert', bank.makeMoneyTransfert); 
/************************************************/

/**
 * Effectuer virement V2
 * à decommenter avec le modele ci dessus
 **/
//dialog.matches('makeThings', bankV2.makeMoneyTransfert); 
/************************************************/

/**
 * Consultation de comptes
 **/
dialog.matches('accessMoney', bank.accessMoney); 
/************************************************/


/**
 * Voir ces virements 
 **/
// dialog.matches('accessMoneyTransfert', conv.accessMoneyTransfert); 
/************************************************/


/** 
 * Element concernant CGI --> check luis 
 **/

// var cgi = 'nomEntreprise';

// //description CGI
// dialog.matches('description', [a.question(cgi), a.reponse('description')]);

// //fondateur CGI
// dialog.matches('fondateur', [a.question(cgi), a.reponse('fondateur')]);

// //localisation CGI
// dialog.matches('localisation', [a.question(cgi), a.reponse('localisation')]);

// //website CGI -- contact
// dialog.matches('contact', [a.question(cgi), a.reponse('website')]);

// //solution CGI
// dialog.matches('solution', [a.question(cgi), a.reponse('solution')]);
/************************************************/

