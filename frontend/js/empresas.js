// Empresas management
class EmpresasManager {
    constructor() {
        this.currentEditId = null;
        this.empresas = [];
        
        this.init();
    }

    async init() {
        await this.loadEmpresas();
        this.setupEventListeners();
    }

    async loadEmpresas(filters = {}) {
        try {
            const tableBody = document.getElementById('empresasTableBody');
            appUtils.showLoading(tableBody);

            let url = '/empresas';
            
            // Apply filters
            if (filters.nome) {
                url = `/empresas/nome?nome=${encodeURIComponent(filters.nome)}`;
            } else if (filters.nomeFantasia) {
                url = `/empresas/nome-fantasia?nomeFantasia=${encodeURIComponent(filters.nomeFantasia)}`;
            }

            this.empresas = await appUtils.httpClient.get(url);
            this.renderEmpresasTable();
        } catch (error) {
            document.getElementById('empresasTableBody').innerHTML = 
                '<tr><td colspan="8" class="text-center">Erro ao carregar empresas</td></tr>';
            appUtils.showError('Erro ao carregar empresas: ' + error.message);
        }
    }

    renderEmpresasTable() {
        const tableBody = document.getElementById('empresasTableBody');
        
        if (this.empresas.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="8" class="text-center">Nenhuma empresa encontrada</td></tr>';
            return;
        }

        tableBody.innerHTML = this.empresas.map(empresa => `
            <tr>
                <td>${empresa.id}</td>
                <td>${empresa.nome}</td>
                <td>${empresa.nomeFantasia}</td>
                <td>${appUtils.formatCNPJ(empresa.cnpj)}</td>
                <td>${empresa.email}</td>
                <td>${empresa.telefone || '-'}</td>
                <td>${empresa.quantidadeVantagens || 0}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="empresasManager.editEmpresa(${empresa.id})">
                        Editar
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="empresasManager.deleteEmpresa(${empresa.id})">
                        Excluir
                    </button>
                </td>
            </tr>
        `).join('');
    }

    setupEventListeners() {
        // CNPJ mask
        const cnpjInput = document.getElementById('cnpj');
        cnpjInput.addEventListener('input', () => appUtils.maskCNPJ(cnpjInput));

        // Phone mask
        const telefoneInput = document.getElementById('telefone');
        telefoneInput.addEventListener('input', () => this.maskTelefone(telefoneInput));

        // Form submission
        document.getElementById('empresaForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        // Cancel button
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.resetForm();
        });

        // Search and filter buttons
        document.getElementById('searchBtn').addEventListener('click', () => {
            this.handleSearch();
        });

        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearFilters();
        });

        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.loadEmpresas();
        });

        // Enter key on search inputs
        document.getElementById('searchNome').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });

        document.getElementById('searchNomeFantasia').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });
    }

    maskTelefone(input) {
        let value = input.value.replace(/\D/g, '');
        
        if (value.length <= 10) {
            value = value.replace(/(\d{2})(\d)/, '($1) $2');
            value = value.replace(/(\d{4})(\d)/, '$1-$2');
        } else {
            value = value.replace(/(\d{2})(\d)/, '($1) $2');
            value = value.replace(/(\d{5})(\d)/, '$1-$2');
        }
        
        input.value = value;
    }

    async handleFormSubmit() {
        if (!this.validateForm()) {
            return;
        }

        const formData = this.getFormData();
        
        try {
            const submitBtn = document.getElementById('submitBtn');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Salvando...';
            submitBtn.disabled = true;

            if (this.currentEditId) {
                await appUtils.httpClient.put(`/empresas/${this.currentEditId}`, formData);
                appUtils.showSuccess('Empresa atualizada com sucesso!');
            } else {
                await appUtils.httpClient.post('/empresas', formData);
                appUtils.showSuccess('Empresa cadastrada com sucesso!');
            }

            this.resetForm();
            await this.loadEmpresas();
        } catch (error) {
            appUtils.showError('Erro ao salvar empresa: ' + error.message);
        } finally {
            const submitBtn = document.getElementById('submitBtn');
            submitBtn.textContent = this.currentEditId ? 'Atualizar Empresa' : 'Cadastrar Empresa';
            submitBtn.disabled = false;
        }
    }

    validateForm() {
        this.clearErrors();
        let isValid = true;

        const formData = this.getFormData();

        // Required field validation
        const requiredFields = ['nome', 'nomeFantasia', 'cnpj', 'endereco', 'email'];
        
        requiredFields.forEach(field => {
            if (!formData[field] || formData[field].trim() === '') {
                this.showFieldError(field, 'Este campo é obrigatório');
                isValid = false;
            }
        });

        // Password validation (only for new users or when password is provided)
        if (!this.currentEditId || formData.senha) {
            if (!formData.senha || formData.senha.length < 6) {
                this.showFieldError('senha', 'Senha deve ter no mínimo 6 caracteres');
                isValid = false;
            }
        }

        // Email validation
        if (formData.email && !appUtils.validateEmail(formData.email)) {
            this.showFieldError('email', 'Email deve ter formato válido');
            isValid = false;
        }

        // CNPJ validation
        if (formData.cnpj && !appUtils.validateCNPJ(formData.cnpj)) {
            this.showFieldError('cnpj', 'CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX');
            isValid = false;
        }

        return isValid;
    }

    getFormData() {
        const form = document.getElementById('empresaForm');
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        return data;
    }

    clearErrors() {
        const errorElements = document.querySelectorAll('.form-error');
        errorElements.forEach(el => el.textContent = '');
        
        const inputElements = document.querySelectorAll('.form-input');
        inputElements.forEach(el => el.classList.remove('error'));
    }

    showFieldError(fieldName, message) {
        const errorElement = document.getElementById(`${fieldName}Error`);
        const inputElement = document.getElementById(fieldName);
        
        if (errorElement) {
            errorElement.textContent = message;
        }
        
        if (inputElement) {
            inputElement.classList.add('error');
        }
    }

    async editEmpresa(id) {
        try {
            const empresa = await appUtils.httpClient.get(`/empresas/${id}`);
            this.fillFormForEdit(empresa);
        } catch (error) {
            appUtils.showError('Erro ao carregar dados da empresa: ' + error.message);
        }
    }

    fillFormForEdit(empresa) {
        this.currentEditId = empresa.id;
        
        // Fill form fields
        document.getElementById('empresaId').value = empresa.id;
        document.getElementById('nome').value = empresa.nome;
        document.getElementById('nomeFantasia').value = empresa.nomeFantasia;
        document.getElementById('cnpj').value = empresa.cnpj;
        document.getElementById('telefone').value = empresa.telefone || '';
        document.getElementById('endereco').value = empresa.endereco;
        document.getElementById('email').value = empresa.email;
        document.getElementById('descricao').value = empresa.descricao || '';
        document.getElementById('senha').value = ''; // Don't fill password
        
        // Update form UI
        document.getElementById('formTitle').textContent = 'Editar Empresa';
        document.getElementById('submitBtn').textContent = 'Atualizar Empresa';
        
        // Scroll to form
        document.getElementById('formCard').scrollIntoView({ behavior: 'smooth' });
    }

    async deleteEmpresa(id) {
        const empresa = this.empresas.find(e => e.id === id);
        if (!empresa) return;

        if (confirm(`Tem certeza que deseja excluir a empresa "${empresa.nomeFantasia}"?`)) {
            try {
                await appUtils.httpClient.delete(`/empresas/${id}`);
                appUtils.showSuccess('Empresa excluída com sucesso!');
                await this.loadEmpresas();
            } catch (error) {
                appUtils.showError('Erro ao excluir empresa: ' + error.message);
            }
        }
    }

    resetForm() {
        this.currentEditId = null;
        
        document.getElementById('empresaForm').reset();
        document.getElementById('empresaId').value = '';
        
        document.getElementById('formTitle').textContent = 'Cadastrar Nova Empresa';
        document.getElementById('submitBtn').textContent = 'Cadastrar Empresa';
        
        this.clearErrors();
    }

    handleSearch() {
        const nome = document.getElementById('searchNome').value.trim();
        const nomeFantasia = document.getElementById('searchNomeFantasia').value.trim();
        
        const filters = {};
        if (nome) filters.nome = nome;
        if (nomeFantasia) filters.nomeFantasia = nomeFantasia;
        
        this.loadEmpresas(filters);
    }

    clearFilters() {
        document.getElementById('searchNome').value = '';
        document.getElementById('searchNomeFantasia').value = '';
        this.loadEmpresas();
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.empresasManager = new EmpresasManager();
});