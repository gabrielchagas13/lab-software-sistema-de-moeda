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
        // New Empresa button
        const novaEmpresaBtn = document.getElementById('novaEmpresaBtn');
        if (novaEmpresaBtn) {
            novaEmpresaBtn.addEventListener('click', () => this.showEmpresaModal());
        }
        // CNPJ mask
        const cnpjInput = document.getElementById('cnpj');
        if (cnpjInput) {
            cnpjInput.addEventListener('input', () => appUtils.maskCNPJ(cnpjInput));
        }

        // Phone mask
        const telefoneInput = document.getElementById('telefone');
        if (telefoneInput) {
            telefoneInput.addEventListener('input', () => this.maskTelefone(telefoneInput));
        }

        // Form submission
        const empresaForm = document.getElementById('empresaForm');
        if (empresaForm) {
            empresaForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit();
            });
        }

        // Cancel button
        const cancelBtn = document.getElementById('cancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.resetForm();
            });
        }

        // Search and filter buttons
        const searchBtn = document.getElementById('searchBtn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.handleSearch();
            });
        }

        const clearBtn = document.getElementById('clearBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearFilters();
            });
        }

        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadEmpresas();
            });
        }

        // Enter key on search inputs
        const searchNome = document.getElementById('searchNome');
        if (searchNome) {
            searchNome.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSearch();
                }
            });
        }

        const searchNomeFantasia = document.getElementById('searchNomeFantasia');
        if (searchNomeFantasia) {
            searchNomeFantasia.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSearch();
                }
            });
        }
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
            const submitBtn = document.getElementById('salvarEmpresaBtn');
            const originalHtml = submitBtn ? submitBtn.innerHTML : null;
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Salvando...';
                submitBtn.disabled = true;
            }

            if (this.currentEditId) {
                await appUtils.httpClient.put(`/empresas/${this.currentEditId}`, formData);
                appUtils.showSuccess('Empresa atualizada com sucesso!');
            } else {
                await appUtils.httpClient.post('/empresas', formData);
                appUtils.showSuccess('Empresa cadastrada com sucesso!');
            }

            // Close modal after success
            const modalEl = document.getElementById('empresaModal');
            if (modalEl) {
                const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                modalInstance.hide();
            }

            this.resetForm();
            await this.loadEmpresas();
        } catch (error) {
            appUtils.showError('Erro ao salvar empresa: ' + error.message);
        } finally {
            const submitBtn = document.getElementById('salvarEmpresaBtn');
            if (submitBtn) {
                submitBtn.innerHTML = this.currentEditId ? '<i class="fas fa-save me-2"></i>Atualizar Empresa' : '<i class="fas fa-save me-2"></i>Salvar Empresa';
                submitBtn.disabled = false;
            }
        }
    }

    validateForm() {
        this.clearErrors();
        let isValid = true;

        const data = this.getFormData();

        // Required field validation
        const requiredFields = ['nome', 'cnpj', 'endereco', 'email'];

        requiredFields.forEach(field => {
            if (!data[field] || String(data[field]).trim() === '') {
                this.showFieldError(field, 'Este campo é obrigatório');
                isValid = false;
            }
        });

        // Password validation (only for new users or when password is provided)
        if (!this.currentEditId || data.senha) {
            if (!data.senha || data.senha.length < 6) {
                this.showFieldError('senha', 'Senha deve ter no mínimo 6 caracteres');
                isValid = false;
            }
        }

        // Email validation
        if (data.email && !appUtils.validateEmail(data.email)) {
            this.showFieldError('email', 'Email deve ter formato válido');
            isValid = false;
        }

        // CNPJ validation
        if (data.cnpj && !appUtils.validateCNPJ(data.cnpj)) {
            this.showFieldError('cnpj', 'CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX');
            isValid = false;
        }

        return isValid;
    }

    getFormData() {
        // Inputs do not têm atributo 'name', então lemos diretamente pelos IDs
        const get = (id) => {
            const el = document.getElementById(id);
            return el ? el.value : '';
        };

        return {
            nome: String(get('nome')).trim(),
            nomeFantasia: String(get('nomeFantasia')).trim(),
            cnpj: String(get('cnpj')).trim(),
            telefone: String(get('telefone')).trim(),
            endereco: String(get('endereco')).trim(),
            email: String(get('email')).trim(),
            senha: get('senha'),
            descricao: String(get('descricao')).trim()
        };
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
        const modalTitle = document.getElementById('modalTitle');
        if (modalTitle) modalTitle.textContent = 'Editar Empresa';
        const saveBtn = document.getElementById('salvarEmpresaBtn');
        if (saveBtn) saveBtn.innerHTML = '<i class="fas fa-save me-2"></i>Atualizar Empresa';

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('empresaModal'));
        modal.show();
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

        const modalTitle = document.getElementById('modalTitle');
        if (modalTitle) modalTitle.textContent = 'Nova Empresa';
        const saveBtn = document.getElementById('salvarEmpresaBtn');
        if (saveBtn) saveBtn.innerHTML = '<i class="fas fa-save me-2"></i>Salvar Empresa';

        this.clearErrors();
    }

    showEmpresaModal(empresa = null) {
        this.currentEditId = empresa ? empresa.id : null;
        const modalEl = document.getElementById('empresaModal');
        const modal = new bootstrap.Modal(modalEl);

        const modalTitle = document.getElementById('modalTitle');
        const saveBtn = document.getElementById('salvarEmpresaBtn');

        if (empresa) {
            if (modalTitle) modalTitle.textContent = 'Editar Empresa';
            if (saveBtn) saveBtn.innerHTML = '<i class="fas fa-save me-2"></i>Atualizar Empresa';
            this.fillFormForEdit(empresa);
        } else {
            if (modalTitle) modalTitle.textContent = 'Nova Empresa';
            if (saveBtn) saveBtn.innerHTML = '<i class="fas fa-save me-2"></i>Salvar Empresa';
            this.resetForm();
        }

        modal.show();
    }

    exportEmpresas() {
        if (this.empresas.length === 0) {
            appUtils.showWarning('Nenhuma empresa para exportar');
            return;
        }

        const headers = ['ID', 'Nome', 'Nome Fantasia', 'CNPJ', 'Email', 'Telefone', 'Endereço', 'Descrição'];
        const rows = this.empresas.map(e => [
            e.id,
            e.nome,
            e.nomeFantasia || '',
            e.cnpj || '',
            e.email || '',
            e.telefone || '',
            e.endereco || '',
            e.descricao || ''
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `empresas_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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