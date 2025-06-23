const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('✅ Bot Messenger IA no ar!');
});

// ✅ Verificação do webhook
app.get('/webhook', (req, res) => {
  const VERIFY_TOKEN = 'verifica123'; // Usa o mesmo no Facebook Developer
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token && mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('🔐 Webhook verificado com sucesso!');
    res.status(200).send(challenge);
  } else {
    console.log('❌ Verificação do webhook falhou.');
    res.sendStatus(403);
  }
});

// ✅ Receber mensagens
app.post('/webhook', (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    body.entry.forEach(entry => {
      const webhookEvent = entry.messaging[0];
      const senderId = webhookEvent.sender.id;

      if (webhookEvent.message && webhookEvent.message.text) {
        const messageText = webhookEvent.message.text;
        console.log(`📨 Mensagem recebida de ${senderId}: "${messageText}"`);

        // Envia resposta
        enviarMensagem(senderId, `Recebi a tua mensagem: "${messageText}"`);
      }
    });

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

// ✅ Enviar mensagem
function enviarMensagem(senderId, texto) {
  const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

  const corpoMensagem = {
    recipient: { id: senderId },
    message: { text: texto }
  };

  request({
    uri: 'https://graph.facebook.com/v17.0/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: corpoMensagem
  }, (err, res, body) => {
    if (!err) {
      console.log('✅ Mensagem enviada com sucesso!');
    } else {
      console.error('❌ Erro ao enviar mensagem:', err);
    }
  });
}

//
