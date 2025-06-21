const express = require('express');
const bodyParser = require('body-parser');
 HEAD
const request = require('request'); // para enviar mensagens ao Messenger

 b4770ceb0279a305129b878b05884b0792b0563b

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Bot Messenger IA no ar!');
});

 HEAD
// ✅ Verificação do webhook

 b4770ceb0279a305129b878b05884b0792b0563b
app.get('/webhook', (req, res) => {
  const VERIFY_TOKEN = 'verifica123';
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token && mode === 'subscribe' && token === VERIFY_TOKEN) {
 HEAD
    console.log('✅ Webhook verificado!');
    res.status(200).send(challenge);
  } else {
    console.log('❌ Verificação falhou!');

    res.status(200).send(challenge);
  } else {
 b4770ceb0279a305129b878b05884b0792b0563b
    res.sendStatus(403);
  }
});

 HEAD
// ✅ Receber mensagens do Messenger
app.post('/webhook', (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    body.entry.forEach(function(entry) {
      const webhookEvent = entry.messaging[0];
      const senderId = webhookEvent.sender.id;

      if (webhookEvent.message && webhookEvent.message.text) {
        const receivedMessage = webhookEvent.message.text;
        console.log(`📨 Mensagem recebida de ${senderId}: "${receivedMessage}"`);

        // 🔁 Responder com uma mensagem simples
        enviarMensagem(senderId, `Recebi a tua mensagem: "${receivedMessage}"`);
      }
    });

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

// ✅ Função para enviar mensagem ao Messenger
function enviarMensagem(senderPsid, mensagemTexto) {
  const PAGE_ACCESS_TOKEN = 'AQUI_O_TOKEN_DA_TUA_PÁGINA';

  const corpoMensagem = {
    recipient: { id: senderPsid },
    message: { text: mensagemTexto }
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

// ✅ Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor ativo na porta ${PORT}`);
});


app.listen(PORT, () => {
  console.log(`Servidor ativo na porta ${PORT}`);
});
 b4770ceb0279a305129b878b05884b0792b0563b
