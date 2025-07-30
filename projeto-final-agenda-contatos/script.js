$(document).ready(function() {
    // Variáveis globais
    let messages = JSON.parse(localStorage.getItem('messages')) || [];
    let currentTheme = localStorage.getItem('theme') || 'light';
    
    // Inicialização
    initTheme();
    loadMessages();
    setupEventListeners();
    
    // Funções de inicialização
    function initTheme() {
        if (currentTheme === 'dark') {
            $('body').addClass('dark-mode');
            $('#themeToggle').html('<i class="fas fa-sun"></i>');
        }
    }
    
    function loadMessages() {
        const searchTerm = $('#searchInput').val().toLowerCase();
        let filteredMessages = messages;
        
        if (searchTerm) {
            filteredMessages = messages.filter(msg => 
                msg.sender.toLowerCase().includes(searchTerm) || 
                msg.receiver.toLowerCase().includes(searchTerm) || 
                msg.message.toLowerCase().includes(searchTerm)
            );
        }
        
        renderMessages(filteredMessages);
    }
    
    function setupEventListeners() {
        // Envio de formulário
        $('#messageForm').on('submit', function(e) {
            e.preventDefault();
            if (validateForm()) {
                addMessage();
            }
        });
        
        // Busca de recados
        $('#searchInput').on('input', function() {
            loadMessages();
        });
        
        // Alternar tema
        $('#themeToggle').on('click', function() {
            toggleTheme();
        });
        
        // Efeito de hover nos cards
        $(document).on('mouseenter', '.message-card', function() {
            $(this).css('transform', 'translateY(-5px)');
        }).on('mouseleave', '.message-card', function() {
            $(this).css('transform', 'translateY(0)');
        });
    }
    
    // Funções de validação
    function validateForm() {
        let isValid = true;
        const $form = $('#messageForm');
        
        $('.is-invalid').removeClass('is-invalid');
        
        $form.find('[required]').each(function() {
            const $field = $(this);
            if (!$field.val().trim()) {
                $field.addClass('is-invalid');
                isValid = false;
                
                // Efeito de shake no campo inválido
                $field.addClass('shake');
                setTimeout(() => $field.removeClass('shake'), 500);
            }
        });
        
        return isValid;
    }
    
    // Funções de manipulação de mensagens
    function addMessage() {
        const sender = $('#sender').val().trim();
        const receiver = $('#receiver').val().trim();
        const message = $('#message').val().trim();
        const now = new Date();
        
        const newMessage = {
            id: Date.now(),
            sender,
            receiver,
            message,
            date: now.toLocaleDateString('pt-BR'),
            time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            timestamp: now.getTime()
        };
        
        messages.unshift(newMessage); // Adiciona no início do array
        saveMessages();
        renderMessages([newMessage], true);
        showNotification('Recado enviado com sucesso!', 'success');
        
        // Resetar formulário com animação
        $('#messageForm')[0].reset();
        $('.form-control').removeClass('is-invalid');
        
        // Efeito visual
        $('.message-form-container')
            .animate({ backgroundColor: 'rgba(76, 201, 240, 0.2)' }, 300)
            .animate({ backgroundColor: 'var(--card-bg)' }, 300);
    }
    
    function deleteMessage(id, $element) {
        // Animação de saída
        $element.addClass('slide-out');
        
        setTimeout(() => {
            messages = messages.filter(msg => msg.id !== id);
            saveMessages();
            loadMessages();
            showNotification('Recado removido!', 'danger');
        }, 300);
    }
    
    // Funções de renderização
    function renderMessages(messagesToRender, isNew = false) {
        const $messageList = $('#messageList');
        
        if (messagesToRender.length === 0) {
            $messageList.html(`
                <div class="empty-state fade-in">
                    <i class="fas fa-comment-slash"></i>
                    <p>Nenhum recado encontrado</p>
                    <small>Tente ajustar sua busca ou deixe um novo recado!</small>
                </div>
            `);
            $('#totalMessages').text('0');
            return;
        }
        
        if (isNew) {
            // Adiciona apenas a nova mensagem
            const messageHtml = createMessageHtml(messagesToRender[0]);
            $messageList.prepend(messageHtml);
            
            // Efeito de destaque
            $messageList.find('.message-card:first')
                .css('background-color', 'rgba(76, 201, 240, 0.1)')
                .animate({ backgroundColor: 'var(--card-bg)' }, 1000);
        } else {
            // Renderiza todas as mensagens
            let messagesHtml = '';
            messagesToRender.forEach(msg => {
                messagesHtml += createMessageHtml(msg);
            });
            
            $messageList.html(messagesHtml);
        }
        
        // Atualiza contador
        $('#totalMessages').text(messagesToRender.length);
    }
    
    function createMessageHtml(message) {
        return `
            <div class="message-card fade-in" data-id="${message.id}">
                <div class="message-header">
                    <div>
                        <div class="message-sender">
                            <i class="fas fa-user"></i> ${message.sender}
                        </div>
                        <div class="message-receiver">
                            <i class="fas fa-user-tag"></i> ${message.receiver}
                        </div>
                    </div>
                    <div class="message-date">
                        <i class="far fa-clock"></i> ${message.date} às ${message.time}
                    </div>
                </div>
                <div class="message-content">
                    ${message.message.replace(/\n/g, '<br>')}
                </div>
                <div class="message-actions">
                    <button class="btn btn-danger" onclick="deleteMessage(${message.id}, $(this).closest('.message-card'))">
                        <i class="fas fa-trash-alt"></i> Excluir
                    </button>
                </div>
            </div>
        `;
    }
    
    // Funções utilitárias
    function saveMessages() {
        localStorage.setItem('messages', JSON.stringify(messages));
    }
    
    function toggleTheme() {
        $('body').toggleClass('dark-mode');
        
        if ($('body').hasClass('dark-mode')) {
            currentTheme = 'dark';
            $('#themeToggle').html('<i class="fas fa-sun"></i>');
        } else {
            currentTheme = 'light';
            $('#themeToggle').html('<i class="fas fa-moon"></i>');
        }
        
        localStorage.setItem('theme', currentTheme);
    }
    
    function showNotification(text, type = 'info') {
        const $notification = $('#notification');
        let icon = '';
        let bgColor = '';
        
        switch(type) {
            case 'success':
                icon = '<i class="fas fa-check-circle"></i>';
                bgColor = 'var(--success-color)';
                break;
            case 'danger':
                icon = '<i class="fas fa-exclamation-circle"></i>';
                bgColor = 'var(--danger-color)';
                break;
            default:
                icon = '<i class="fas fa-info-circle"></i>';
                bgColor = 'var(--primary-color)';
        }
        
        $notification.html(`${icon} ${text}`).css('background-color', bgColor).addClass('show');
        
        setTimeout(() => {
            $notification.removeClass('show');
        }, 3000);
    }
    
    // Tornando funções disponíveis globalmente
    window.deleteMessage = deleteMessage;
});

// Efeito de shake para campos inválidos
$.fn.shake = function() {
    this.css('position', 'relative');
    for (let i = 0; i < 3; i++) {
        this.animate({ left: '-=5px' }, 50)
            .animate({ left: '+=10px' }, 50)
            .animate({ left: '-=5px' }, 50);
    }
    return this;
};