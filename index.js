const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const { OpenAI } = require('openai');

const app = express();
const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = 'verifica123';
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('🤖 Bot Messenger IA com GPT no ar!');
});

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token && mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verificado!');
    res.status(200).send(challenge);
  } else {
    console.log('❌ Verificação falhou!');
    res.sendStatus(403);
  }
});

app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    body.entry.forEach(async function (entry) {
      const webhookEvent = entry.messaging[0];
      const senderId = webhookEvent.sender.id;

      if (webhookEvent.message && webhookEvent.message.text) {
        const receivedMessage = webhookEvent.message.text;
        console.log(`📨 Mensagem recebida de ${senderId}: "${receivedMessage}"`);

        const respostaIA = await obterRespostaGPT(receivedMessage);
        enviarMensagem(senderId, respostaIA);
      }
    });

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

async function obterRespostaGPT(pergunta) {
  try {
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Estás a falar com um assistente inteligente que ajuda em tudo que for possível.' },
        { role: 'user', content: pergunta }
      ]
    });

    return chatCompletion.choices[0].message.content;
  } catch (error) {
    console.error('❌ Erro ao consultar OpenAI:', error.message);
    return 'Desculpa, houve um erro ao tentar responder. Tenta novamente mais tarde.';
  }
}

function enviarMensagem(senderPsid, mensagemTexto) {
  const corpoMensagem = {
    recipient: { id: senderPsid },
    message: { text: mensagemTexto }
  };

  request({
    uri: 'https://graph.facebook.com/v17.0/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: corpoMensagem
  }, (err) => {
    if (!err) {
      console.log('✅ Mensagem enviada com sucesso!');
    } else {
      console.error('❌ Erro ao enviar mensagem:', err);
    }
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Servidor ativo na porta ${PORT}`);
});
