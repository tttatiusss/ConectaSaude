document.addEventListener('DOMContentLoaded', () => {
    // 1. Seleciona os elementos do formulário e do cartão de pré-visualização
    const formElements = {
        name: document.getElementById('name'),
        dob: document.getElementById('dob'),
        gender: document.getElementById('gender'),
        phone: document.getElementById('phone'),
        address: document.getElementById('address'),
        emergency: document.getElementById('emergency'),
        conditions: document.getElementById('conditions'),
        allergies: document.getElementById('allergies'),
        medications: document.getElementById('medications'),
        photoInput: document.getElementById('photo'), // Renomeado para evitar conflito
        resetBtn: document.getElementById('resetBtn'),
        saveBtn: document.getElementById('saveBtn'), // Novo
        editBtn: document.getElementById('editBtn'), // Novo
        photoGroup: document.querySelector('.photo-group') // Para desabilitar o grupo da foto
    };

    const cardElements = {
        name: document.getElementById('cardName'),
        dobGender: document.getElementById('cardDobGender'),
        phone: document.getElementById('cardPhone'),
        address: document.getElementById('cardAddress'),
        emergency: document.getElementById('cardEmergency'),
        conditions: document.getElementById('cardConditions'),
        allergies: document.getElementById('cardAllergies'),
        medications: document.getElementById('cardMedications'),
        cardPhotoContainer: document.getElementById('cardPhoto'), // Renomeado para clareza
        formPhotoPreview: document.getElementById('photoPreview') // Renomeado para clareza
    };

    // Variável para armazenar a URL da imagem selecionada
    let currentPhotoUrl = null;

    // Função para formatar a data (AAAA-MM-DD para DD/MM/AAAA)
    const formatarData = (dateString) => {
        if (!dateString) return '—';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };

    // Função para combinar data e gênero
    const formatarDataGenero = (dob, gender) => {
        const dataFormatada = formatarData(dob);
        const generoTexto = gender && gender !== '' ? ` (${gender})` : '';
        return `${dataFormatada}${generoTexto}`;
    };

    // Função para aplicar máscara de telefone (exemplo: (xx) xxxxx-xxxx)
    const formatarTelefone = (input) => {
        let value = input.value.replace(/\D/g, ''); // Remove tudo que não é dígito
        
        if (value.length > 0) {
            value = '(' + value;
        }
        if (value.length > 3) {
            value = value.substring(0, 3) + ') ' + value.substring(3);
        }
        if (value.length > 10) {
            value = value.substring(0, 10) + '-' + value.substring(10, 15);
        }
        input.value = value;
    };


    // 2. Função principal para atualizar o cartão
    const updateCard = () => {
        // Atualiza Nome
        cardElements.name.textContent = formElements.name.value || '—';

        // Atualiza Data de Nascimento e Gênero
        cardElements.dobGender.textContent = formatarDataGenero(
            formElements.dob.value,
            formElements.gender.value
        );

        // Atualiza Telefone (já formatado pela máscara)
        cardElements.phone.textContent = formElements.phone.value || '—';
        
        // Atualiza Demais Campos
        cardElements.address.textContent = formElements.address.value || '—';
        cardElements.emergency.textContent = formElements.emergency.value || '—';
        // Usar innerHTML para quebras de linha (<br>)
        cardElements.conditions.innerHTML = formElements.conditions.value.replace(/\n/g, '<br>') || '—';
        cardElements.allergies.innerHTML = formElements.allergies.value.replace(/\n/g, '<br>') || '—';
        cardElements.medications.innerHTML = formElements.medications.value.replace(/\n/g, '<br>') || '—';
    };

    // Função para atualizar as pré-visualizações da imagem
    const updatePhotoPreviews = (url) => {
        // Limpa e atualiza a pré-visualização do formulário
        cardElements.formPhotoPreview.innerHTML = '';
        cardElements.cardPhotoContainer.innerHTML = '';

        if (url) {
            const imgForm = document.createElement('img');
            imgForm.src = url;
            imgForm.alt = 'Foto de perfil';
            cardElements.formPhotoPreview.appendChild(imgForm);

            const imgCard = document.createElement('img');
            imgCard.src = url;
            imgCard.alt = 'Foto de perfil';
            cardElements.cardPhotoContainer.appendChild(imgCard);
        } else {
            // Se não houver URL, exibe o placeholder
            cardElements.formPhotoPreview.innerHTML = '<span class="photo-placeholder">Sem foto</span>';
            cardElements.cardPhotoContainer.innerHTML = '<span>Sem foto</span>';
        }
    };


    // 3. Função para alternar entre modo de edição e visualização
    const toggleEditMode = (isEditing) => {
        const formInputs = document.querySelectorAll('#patientForm input, #patientForm select, #patientForm textarea');
        
        formInputs.forEach(input => {
            // O input de foto é tratado separadamente
            if (input.id !== 'photo') {
                input.disabled = !isEditing;
            }
        });

        // Desabilita/habilita o input de foto e adiciona/remove a classe
        formElements.photoInput.disabled = !isEditing;
        if (isEditing) {
            formElements.photoGroup.classList.remove('disabled');
        } else {
            formElements.photoGroup.classList.add('disabled');
        }

        formElements.saveBtn.style.display = isEditing ? 'inline-block' : 'none';
        formElements.resetBtn.style.display = isEditing ? 'inline-block' : 'none';
        formElements.editBtn.style.display = isEditing ? 'none' : 'inline-block';
    };

    // 4. Adiciona ouvintes de evento (event listeners) para atualização em tempo real
    // Campos de texto, data e select
    Object.values(formElements).forEach(element => {
        // Exclui os botões e o input de arquivo, que serão tratados separadamente
        if (element && !['photoInput', 'resetBtn', 'saveBtn', 'editBtn', 'photoGroup'].includes(element.id)) {
            element.addEventListener('input', updateCard);
            element.addEventListener('change', updateCard); // Para o 'select' e 'date'
        }
    });

    // Adiciona máscara ao campo Telefone
    formElements.phone.addEventListener('input', () => {
        formatarTelefone(formElements.phone);
        updateCard();
    });

    // 5. Lógica para pré-visualização da Imagem
    formElements.photoInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const file = this.files[0];
            const reader = new FileReader();

            reader.onload = function(e) {
                currentPhotoUrl = e.target.result; // Armazena a URL da imagem
                updatePhotoPreviews(currentPhotoUrl); // Atualiza ambas as pré-visualizações
            };
            reader.readAsDataURL(file);
        } else {
            currentPhotoUrl = null; // Limpa a URL se nenhum arquivo for selecionado
            updatePhotoPreviews(null); // Limpa as pré-visualizações
        }
    });

    // 6. Funcionalidade dos botões "Limpar", "Concluir" e "Editar"
    formElements.resetBtn.addEventListener('click', () => {
        document.getElementById('patientForm').reset();
        currentPhotoUrl = null; // Reseta a URL da foto
        updatePhotoPreviews(null); // Limpa as pré-visualizações da foto
        updateCard(); // Reseta os outros campos do cartão
    });

    formElements.saveBtn.addEventListener('click', (event) => {
        event.preventDefault(); // Evita o envio padrão do formulário
        
        // Aqui você adicionaria a lógica para "salvar" os dados
        // Por exemplo, enviar para um servidor via fetch() ou armazenar no localStorage
        console.log("Dados do paciente concluídos/salvos!");

        // Após "salvar", muda para o modo de visualização
        toggleEditMode(false);
    });

    formElements.editBtn.addEventListener('click', () => {
        // Volta para o modo de edição
        toggleEditMode(true);
    });

    // 7. Inicialização
    // Chama a função ao carregar para garantir que o cartão comece com os valores iniciais
    // E o formulário no modo de edição padrão
    updateCard();
    toggleEditMode(true); // Inicia no modo de edição
});