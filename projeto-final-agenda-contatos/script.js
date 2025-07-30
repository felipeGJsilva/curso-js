// Sistema de Recados
document.addEventListener('DOMContentLoaded', function() {
  // Elementos do DOM
  const messageForm = document.getElementById('messageForm');
  const messageList = document.getElementById('messageList');
  
  // Carregar recados ao iniciar
  loadMessages();
  
  // Evento de submit do formulário
  messageForm.addEventListener('submit', function(e) {
    e.preventDefault();
    if (validateForm()) {
      addMessage();
      messageForm.reset();
      
      // Efeito visual
      messageList.classList.add('fade-in');
      setTimeout(() => messageList.classList.remove('fade-in'), 500);
    }
  });
});

// Validação do formulário
function validateForm() {
  let isValid = true;
  const sender = document.getElementById('sender');
  const receiver = document.getElementById('receiver');
  const message = document.getElementById('message');
  
  // Resetar estados de erro
  [sender, receiver, message].forEach(field => {
    field.classList.remove('is-invalid');
  });
  
  // Validar campos
  if (sender.value.trim() === '') {
    sender.classList.add('is-invalid');
    isValid = false;
  }
  
  if (receiver.value.trim() === '') {
    receiver.classList.add('is-invalid');
    isValid = false;
  }
  
  if (message.value.trim() === '') {
    message.classList.add('is-invalid');
    isValid = false;
  }
  
  return isValid;
}

// Adicionar novo recado
function addMessage() {
  const sender = document.getElementById('sender').value.trim();
  const receiver = document.getElementById('receiver').value.trim();
  const messageText = document.getElementById('message').value.trim();
  const now = new Date();
  
  const newMessage = {
    id: Date.now(),
    sender,
    receiver,
    message: messageText,
    date: now.toLocaleDateString('pt-BR'),
    time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    timestamp: now.getTime()
  };
  
  // Obter recados existentes
  let messages = JSON.parse(localStorage.getItem('messages')) || [];
  messages.push(newMessage);
  
  // Salvar no localStorage
  localStorage.setItem('messages', JSON.stringify(messages));
  
  // Atualizar a exibição
  displayMessages([newMessage], true);
}

// Carregar recados
function loadMessages() {
  const messages = JSON.parse(localStorage.getItem('messages')) || [];
  displayMessages(messages);
}

// Exibir recados
function displayMessages(messages, isNew = false) {
  const messageList = document.getElementById('messageList');
  
  if (isNew) {
    // Adicionar apenas o novo recado
    const messageElement = createMessageElement(messages[0]);
    messageList.prepend(messageElement);
  } else {
    // Limpar e recarregar todos
    messageList.innerHTML = '';
    
    if (messages.length === 0) {
      messageList.innerHTML = `
        <div class="empty-state">
          <p>Nenhum recado encontrado. Deixe seu primeiro recado!</p>
        </div>
      `;
      return;
    }
    
    // Ordenar por data (mais recente primeiro)
    messages.sort((a, b) => b.timestamp - a.timestamp);
    
    // Adicionar todos os recados
    messages.forEach(msg => {
      const messageElement = createMessageElement(msg);
      messageList.appendChild(messageElement);
    });
  }
}

// Criar elemento HTML para um recado
function createMessageElement(message) {
  const messageElement = document.createElement('div');
  messageElement.className = 'message-card fade-in';
  messageElement.innerHTML = `
    <div class="message-meta">
      <span><strong>Para:</strong> ${message.receiver}</span>
      <span>${message.date} às ${message.time}</span>
    </div>
    <div class="message-content">
      <p>${message.message}</p>
      <p><em>De: ${message.sender}</em></p>
    </div>
    <div class="message-actions">
      <button class="btn btn-danger" onclick="deleteMessage(${message.id}, this.parentNode.parentNode)">Excluir</button>
    </div>
  `;
  
  return messageElement;
}

// Excluir recado
function deleteMessage(id, element) {
  // Animação de saída
  element.classList.add('slide-out');
  
  setTimeout(() => {
    // Remover do localStorage
    let messages = JSON.parse(localStorage.getItem('messages')) || [];
    messages = messages.filter(msg => msg.id !== id);
    localStorage.setItem('messages', JSON.stringify(messages));
    
    // Recarregar a lista
    loadMessages();
  }, 300);
}