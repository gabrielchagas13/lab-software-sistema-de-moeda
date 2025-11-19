class VantagensManager {
    constructor() {
        this.currentEditId = null;
        this.vantagens = [];
        this.empresas = [];
        
        this.init();
    }

    async init() {
        await this.loadEmpresas();
        await this.loadVantagens();
        this.setupEventListeners();
    }

    async loadEmpresas() {
        try {
            this.empresas = await appUtils.httpClient.get('/empresas');
            this.populateEmpresaSelects();
        } catch (error) {
            console.error('Erro ao carregar empresas:', error);
        }
    }

    populateEmpresaSelects() {
        const empresaSelect = document.getElementById('empresaId');
        const empresaFilter = document.getElementById('empresaFilter');
        
        empresaSelect.innerHTML = '<option value="">Selecione uma empresa</option>';
        empresaFilter.innerHTML = '<option value="">Todas as empresas</option>';
        
        this.empresas.forEach(empresa => {
            const option = `<option value="${empresa.id}">${empresa.nomeFantasia || empresa.nome}</option>`;
            empresaSelect.innerHTML += option;
            empresaFilter.innerHTML += option;
        });
    }

    async loadVantagens(filters = {}) {
        try {
            this.showLoading(true);

            let url = '/vantagens';
            
            if (filters.empresa) {
                url = `/vantagens/empresa/${filters.empresa}`;
            } else if (filters.nome) {
                url = `/vantagens/nome?nome=${encodeURIComponent(filters.nome)}`;
            } else if (filters.maisBaratas) {
                url = '/vantagens/mais-baratas';
            } else if (filters.maisCaras) {
                url = '/vantagens/mais-caras';
            } else if (filters.ativas !== undefined) {
                url = filters.ativas ? '/vantagens/ativas' : '/vantagens';
            }

            this.vantagens = await appUtils.httpClient.get(url);
            
            if (filters.ativas === false) {
                this.vantagens = this.vantagens.filter(v => !v.ativa);
            }
            
            this.renderVantagensGrid();
        } catch (error) {
            this.showError('Erro ao carregar vantagens: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    showLoading(show) {
        const indicator = document.getElementById('loadingIndicator');
        const grid = document.getElementById('vantagensGrid');
        
        if (show) {
            indicator.classList.remove('d-none');
            grid.innerHTML = '';
        } else {
            indicator.classList.add('d-none');
        }
    }

    showError(message) {
        const grid = document.getElementById('vantagensGrid');
        grid.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger" role="alert">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    ${message}
                </div>
            </div>
        `;
    }

    renderVantagensGrid() {
        const grid = document.getElementById('vantagensGrid');
        
        if (this.vantagens.length === 0) {
            grid.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-info text-center" role="alert">
                        <i class="fas fa-info-circle me-2"></i>
                        Nenhuma vantagem encontrada
                    </div>
                </div>
            `;
            return;
        }

        grid.innerHTML = this.vantagens.map(vantagem => `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card h-100 shadow-sm">
                    ${vantagem.fotoUrl ? `
                        <img src="${vantagem.fotoUrl}" class="card-img-top" alt="${vantagem.nome}" 
                             style="height: 200px; object-fit: cover;"
                             onerror="this.src='https://via.placeholder.com/300x200?text=Sem+Imagem'">
                    ` : `
                        <div class="card-img-top bg-light d-flex align-items-center justify-content-center" 
                             style="height: 200px;">
                            <i class="fas fa-gift fa-3x text-muted"></i>
                        </div>
                    `}
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${vantagem.nome}</h5>
                        <p class="card-text flex-grow-1 text-muted small">${this.truncateText(vantagem.descricao, 100)}</p>
                        <div class="mt-auto">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <span class="badge bg-primary fs-6">
                                    <i class="fas fa-coins me-1"></i>
                                    ${vantagem.custoMoedas} moedas
                                </span>
                                <span class="badge bg-${vantagem.ativa ? 'success' : 'danger'}">
                                    ${vantagem.ativa ? 'Ativa' : 'Inativa'}
                                </span>
                            </div>
                            <small class="text-muted d-block mb-2">
                                <i class="fas fa-building me-1"></i>
                                ${vantagem.empresaNome}
                            </small>
                            <div class="btn-group w-100" role="group">
                                <button class="btn btn-sm btn-outline-primary" 
                                        onclick="vantagensManager.editVantagem(${vantagem.id})"
                                        title="Editar">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-info" 
                                        onclick="vantagensManager.viewVantagem(${vantagem.id})"
                                        title="Visualizar">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-${vantagem.ativa ? 'warning' : 'success'}" 
                                        onclick="vantagensManager.toggleStatus(${vantagem.id}, ${vantagem.ativa})"
                                        title="${vantagem.ativa ? 'Desativar' : 'Ativar'}">
                                    <i class="fas fa-${vantagem.ativa ? 'pause' : 'play'}"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger" 
                                        onclick="vantagensManager.deleteVantagem(${vantagem.id})"
                                        title="Excluir">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    truncateText(text, maxLength) {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    setupEventListeners() {
        const form = document.getElementById('vantagemForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveVantagem();
            });
        }

        // Listener para upload de arquivo (NOVO)
        document.getElementById('fotoInput').addEventListener('change', (e) => {
            this.handleFileSelect(e);
        });

        // Listener para remover foto (NOVO)
        document.getElementById('removeFotoBtn').addEventListener('click', (e) => {
            e.stopPropagation(); // Impede que o clique abra o seletor de arquivos
            this.clearFotoPreview();
        });

        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchVantagens(e.target.value);
            });
        }

        const empresaFilter = document.getElementById('empresaFilter');
        if (empresaFilter) {
            empresaFilter.addEventListener('change', (e) => {
                if (e.target.value) {
                    this.loadVantagens({ empresa: e.target.value });
                } else {
                    this.loadVantagens();
                }
            });
        }

        const filterButtons = document.querySelectorAll('[data-filter]');
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                
                const filterType = e.target.dataset.filter;
                this.applyFilter(filterType);
            });
        });

        const newVantagemBtn = document.getElementById('newVantagemBtn');
        if (newVantagemBtn) {
            newVantagemBtn.addEventListener('click', () => {
                this.showNewVantagemModal();
            });
        }

        const clearFormBtn = document.getElementById('clearFormBtn');
        if (clearFormBtn) {
            clearFormBtn.addEventListener('click', () => {
                this.clearForm();
            });
        }
    }

    // Lógica de conversão de arquivo para Base64 (NOVO)
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) { // 10MB
            Swal.fire('Erro', 'A imagem deve ter no máximo 10MB.', 'error');
            event.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const base64String = e.target.result;
            document.getElementById('fotoBase64').value = base64String;
            
            const placeholder = document.getElementById('uploadPlaceholder');
            const previewImg = document.getElementById('fotoPreview');
            const removeBtn = document.getElementById('removeFotoBtn');
            
            previewImg.src = base64String;
            
            placeholder.style.display = 'none';
            previewImg.style.display = 'block';
            removeBtn.style.display = 'flex';
        };
        reader.readAsDataURL(file);
    }

    clearFotoPreview() {
        document.getElementById('fotoInput').value = '';
        document.getElementById('fotoBase64').value = '';
        
        document.getElementById('uploadPlaceholder').style.display = 'block';
        document.getElementById('fotoPreview').style.display = 'none';
        document.getElementById('removeFotoBtn').style.display = 'none';
        document.getElementById('fotoPreview').src = '';
    }

    showNewVantagemModal() {
        this.currentEditId = null;
        this.clearForm(); // Limpa tudo, inclusive preview
        document.getElementById('modalTitle').textContent = 'Nova Vantagem';
        document.getElementById('saveVantagemBtn').textContent = 'Cadastrar Vantagem';
        
        const modal = new bootstrap.Modal(document.getElementById('vantagemModal'));
        modal.show();
    }

    async editVantagem(id) {
        try {
            const vantagem = await appUtils.httpClient.get(`/vantagens/${id}`);
            this.currentEditId = id;
            this.fillForm(vantagem);
            
            document.getElementById('modalTitle').textContent = 'Editar Vantagem';
            document.getElementById('saveVantagemBtn').textContent = 'Salvar Alterações';
            
            const modal = new bootstrap.Modal(document.getElementById('vantagemModal'));
            modal.show();
        } catch (error) {
            appUtils.showError('Erro ao carregar dados da vantagem: ' + error.message);
        }
    }

    async viewVantagem(id) {
        try {
            const vantagem = await appUtils.httpClient.get(`/vantagens/${id}`);
            this.showVantagemDetails(vantagem);
        } catch (error) {
            appUtils.showError('Erro ao carregar dados da vantagem: ' + error.message);
        }
    }

    showVantagemDetails(vantagem) {
        const detailsHtml = `
            <div class="row">
                <div class="col-md-6">
                    ${vantagem.fotoUrl ? `
                        <img src="${vantagem.fotoUrl}" class="img-fluid rounded mb-3 shadow-sm" 
                             alt="${vantagem.nome}"
                             onerror="this.src='https://via.placeholder.com/400x300?text=Sem+Imagem'">
                    ` : `
                        <div class="bg-light rounded d-flex align-items-center justify-content-center mb-3" 
                             style="height: 300px;">
                            <i class="fas fa-gift fa-4x text-muted"></i>
                        </div>
                    `}
                </div>
                <div class="col-md-6">
                    <h6><strong>Informações da Vantagem</strong></h6>
                    <p><strong>ID:</strong> ${vantagem.id}</p>
                    <p><strong>Nome:</strong> ${vantagem.nome}</p>
                    <p><strong>Empresa:</strong> ${vantagem.empresaNome}</p>
                    <p><strong>Custo:</strong> 
                        <span class="badge bg-primary fs-6">
                            <i class="fas fa-coins me-1"></i>
                            ${vantagem.custoMoedas} moedas
                        </span>
                    </p>
                    <p><strong>Status:</strong> 
                        <span class="badge bg-${vantagem.ativa ? 'success' : 'danger'}">
                            ${vantagem.ativa ? 'Ativa' : 'Inativa'}
                        </span>
                    </p>
                    <p><strong>Data de Criação:</strong> ${appUtils.formatDate(vantagem.dataCriacao)}</p>
                </div>
                <div class="col-12 mt-3">
                    <h6><strong>Descrição</strong></h6>
                    <p class="text-justify text-muted">${vantagem.descricao}</p>
                </div>
            </div>
        `;

        document.getElementById('vantagemDetailsContent').innerHTML = detailsHtml;
        const modal = new bootstrap.Modal(document.getElementById('vantagemDetailsModal'));
        modal.show();
    }

    async toggleStatus(id, currentStatus) {
        try {
            const action = currentStatus ? 'desativar' : 'ativar';
            const endpoint = `/vantagens/${id}/${action}`;
            await appUtils.httpClient.post(endpoint);
            
            const message = currentStatus ? 'Vantagem desativada com sucesso!' : 'Vantagem ativada com sucesso!';
            // Usando Swal para feedback
            Swal.fire({
                icon: 'success',
                title: 'Status alterado',
                text: message,
                timer: 1500,
                showConfirmButton: false
            });
            
            await this.loadVantagens();
        } catch (error) {
            appUtils.showError('Erro ao alterar status da vantagem: ' + error.message);
        }
    }

    fillForm(vantagem) {
        document.getElementById('empresaId').value = vantagem.empresaId || '';
        document.getElementById('nome').value = vantagem.nome || '';
        document.getElementById('descricao').value = vantagem.descricao || '';
        document.getElementById('custoMoedas').value = vantagem.custoMoedas || '';
        document.getElementById('ativa').checked = vantagem.ativa !== false;
        
        // Lógica para preencher o preview
        if (vantagem.fotoUrl) {
            document.getElementById('fotoBase64').value = vantagem.fotoUrl;
            
            const placeholder = document.getElementById('uploadPlaceholder');
            const previewImg = document.getElementById('fotoPreview');
            const removeBtn = document.getElementById('removeFotoBtn');
            
            previewImg.src = vantagem.fotoUrl;
            
            placeholder.style.display = 'none';
            previewImg.style.display = 'block';
            removeBtn.style.display = 'flex';
        } else {
            this.clearFotoPreview();
        }
    }

    clearForm() {
        document.getElementById('vantagemForm').reset();
        document.getElementById('ativa').checked = true;
        this.currentEditId = null;
        this.clearFotoPreview(); // Limpa preview também
        
        const inputs = document.querySelectorAll('#vantagemForm .form-control, #vantagemForm .form-select');
        inputs.forEach(input => {
            input.classList.remove('is-valid', 'is-invalid');
        });
        
        const feedbacks = document.querySelectorAll('#vantagemForm .invalid-feedback');
        feedbacks.forEach(feedback => feedback.style.display = 'none');
    }

    async saveVantagem() {
        try {
            const formData = this.getFormData();
            
            if (!this.validateForm(formData)) {
                return;
            }

            const saveBtn = document.getElementById('saveVantagemBtn');
            const originalText = saveBtn.textContent;
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';

            try {
                if (this.currentEditId) {
                    await appUtils.httpClient.put(`/vantagens/${this.currentEditId}`, formData);
                    Swal.fire('Sucesso', 'Vantagem atualizada com sucesso!', 'success');
                } else {
                    await appUtils.httpClient.post('/vantagens', formData);
                    Swal.fire('Sucesso', 'Vantagem cadastrada com sucesso!', 'success');
                }

                const modalEl = document.getElementById('vantagemModal');
                const modal = bootstrap.Modal.getInstance(modalEl);
                modal.hide();
                
                await this.loadVantagens();
            } finally {
                saveBtn.disabled = false;
                saveBtn.textContent = originalText;
            }
        } catch (error) {
            Swal.fire('Erro', 'Erro ao salvar vantagem: ' + error.message, 'error');
        }
    }

    getFormData() {
        return {
            empresaId: parseInt(document.getElementById('empresaId').value),
            nome: document.getElementById('nome').value.trim(),
            descricao: document.getElementById('descricao').value.trim(),
            custoMoedas: parseFloat(document.getElementById('custoMoedas').value),
            // Agora pega o Base64 do campo oculto
            fotoUrl: document.getElementById('fotoBase64').value || null
        };
    }

    validateForm(formData) {
        let isValid = true;
        
        const inputs = document.querySelectorAll('#vantagemForm .form-control, #vantagemForm .form-select');
        inputs.forEach(input => {
            input.classList.remove('is-valid', 'is-invalid');
        });

        const requiredFields = [
            { field: 'empresaId', name: 'Empresa', element: 'empresaId' },
            { field: 'nome', name: 'Nome', element: 'nome' },
            { field: 'descricao', name: 'Descrição', element: 'descricao' },
            { field: 'custoMoedas', name: 'Custo em moedas', element: 'custoMoedas' }
        ];

        requiredFields.forEach(({ field, name, element }) => {
            const input = document.getElementById(element);
            if (!formData[field] || (field === 'custoMoedas' && formData[field] <= 0)) {
                this.showFieldError(input, `${name} é obrigatório`);
                isValid = false;
            } else {
                this.showFieldSuccess(input);
            }
        });

        return isValid;
    }

    showFieldError(input, message) {
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
        
        let feedback = input.parentNode.querySelector('.invalid-feedback');
        if (!feedback) {
            feedback = document.createElement('div');
            feedback.className = 'invalid-feedback';
            input.parentNode.appendChild(feedback);
        }
        feedback.textContent = message;
        feedback.style.display = 'block';
    }

    showFieldSuccess(input) {
        input.classList.add('is-valid');
        input.classList.remove('is-invalid');
        
        const feedback = input.parentNode.querySelector('.invalid-feedback');
        if (feedback) {
            feedback.style.display = 'none';
        }
    }

    async deleteVantagem(id) {
        const result = await Swal.fire({
            title: 'Tem certeza?',
            text: "Não será possível reverter isso!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sim, excluir!',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await appUtils.httpClient.delete(`/vantagens/${id}`);
                Swal.fire(
                    'Excluído!',
                    'A vantagem foi removida.',
                    'success'
                );
                await this.loadVantagens();
            } catch (error) {
                Swal.fire('Erro', 'Erro ao excluir vantagem: ' + error.message, 'error');
            }
        }
    }

    searchVantagens(searchTerm) {
        if (!searchTerm.trim()) {
            this.loadVantagens();
            return;
        }

        const filtered = this.vantagens.filter(vantagem => {
            const searchLower = searchTerm.toLowerCase();
            return (vantagem.nome && vantagem.nome.toLowerCase().includes(searchLower)) ||
                   (vantagem.descricao && vantagem.descricao.toLowerCase().includes(searchLower)) ||
                   (vantagem.empresaNome && vantagem.empresaNome.toLowerCase().includes(searchLower));
        });

        if (filtered.length === 0) {
            this.showError('Nenhuma vantagem encontrada para o termo pesquisado');
        } else {
            this.vantagens = filtered;
            this.renderVantagensGrid();
        }
    }

    applyFilter(filterType) {
        switch (filterType) {
            case 'all':
                this.loadVantagens();
                break;
            case 'active':
                this.loadVantagens({ ativas: true });
                break;
            case 'inactive':
                this.loadVantagens({ ativas: false });
                break;
            case 'mais-baratas':
                this.loadVantagens({ maisBaratas: true });
                break;
            case 'mais-caras':
                this.loadVantagens({ maisCaras: true });
                break;
            default:
                this.loadVantagens();
        }
    }

    // Export functionality
    exportVantagens() {
        if (this.vantagens.length === 0) {
            appUtils.showWarning('Nenhuma vantagem para exportar');
            return;
        }

        const csvContent = this.generateCSV();
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `vantagens_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    }

    generateCSV() {
        const headers = ['ID', 'Nome', 'Empresa', 'Custo Moedas', 'Status', 'Data Criação', 'Descrição'];
        const rows = this.vantagens.map(vantagem => [
            vantagem.id,
            vantagem.nome || '',
            vantagem.empresaNome || '',
            vantagem.custoMoedas || 0,
            vantagem.ativa ? 'Ativa' : 'Inativa',
            appUtils.formatDate(vantagem.dataCriacao),
            (vantagem.descricao || '').replace(/"/g, '""')
        ]);

        return [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');
    }
}

let vantagensManager;
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('vantagensGrid')) {
        vantagensManager = new VantagensManager();
    }
});