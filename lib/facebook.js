'use strict';
var Conversation = require('watson-developer-cloud/conversation/v1'); // watson sdk
var request = require('request'); // app server


exports.receivedMessage = function(req, res, event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message:",
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var messageId = message.mid;

  var messageText = message.text;
  var messageAttachments = message.attachments;

  var workspace = process.env.WORKSPACE_ID || '<workspace-id>';
  if (!workspace || workspace === '<workspace-id>') {
    console.log("The app has not been configured with a workspace");
  }
  var payload = {
    workspace_id: workspace,
    context: req.body.context || {},
    input: {"text": messageText} || {}
  };
  // Send the input to the conversation service
  conversation.message(payload, function(err, data) {
    if (err) {
      console.log(err);
      sendTextMessage(senderID, "Sorry, erro ao chamar o conversation.");
    } else if (messageAttachments) {
      sendTextMessage(senderID, "Mensagem com anexos");
    } else {
      messageText = " " + data.output.text[0];
      //messageText = JSON.stringify(data.output.text);
      sendTextMessage(senderID, messageText);
      // if (messageText != null) {
      //   // If we receive a text message, check to see if it matches a keyword
      //   // and send back the example. Otherwise, just echo the text we received.
      //   switch (messageText) {
      //     case 'generic':
      //       sendGenericMessage(senderID);
      //       break;
      //
      //     default:
      //       sendTextMessage(senderID, messageText);
      //   }
    }
  });
}



function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };
  callSendAPI(messageData);
}

function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: process.env.FACEBOOK_TOKEN },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s",
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });
}

function sendGenericMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "rift",
            subtitle: "Next-generation virtual reality",
            item_url: "https://www.oculus.com/en-us/rift/",
            image_url: "http://messengerdemo.parseapp.com/img/rift.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/rift/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for first bubble",
            }],
          }, {
            title: "touch",
            subtitle: "Your Hands, Now in VR",
            item_url: "https://www.oculus.com/en-us/touch/",
            image_url: "http://messengerdemo.parseapp.com/img/touch.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/touch/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for second bubble",
            }]
          }]
        }
      }
    }
  };

  callSendAPI(messageData);
}
