// Alunos management
class AlunosManager {
    constructor() {
        this.currentEditId = null;
        this.alunos = [];
        
        this.init();
    }

    async init() {
        await this.loadAlunos();
        this.setupEventListeners();
    }

    async loadAlunos(filters = {}) {
        try {
            const tableBody = document.getElementById('alunosTableBody');
            appUtils.showLoading(tableBody);

            let url = '/alunos';
            
            // Apply filters
            if (filters.nome) {
                url = `/alunos/nome?nome=${encodeURIComponent(filters.nome)}`;
            } else if (filters.instituicao) {
                // Filter by institution name in frontend since we're using text field
                this.alunos = await appUtils.httpClient.get('/alunos');
                this.alunos = this.alunos.filter(aluno => 
                    aluno.instituicao && aluno.instituicao.toLowerCase().includes(filters.instituicao.toLowerCase())
                );
                this.renderAlunosTable();
                return;
            }

            this.alunos = await appUtils.httpClient.get(url);
            this.renderAlunosTable();
        } catch (error) {
            document.getElementById('alunosTableBody').innerHTML = 
                '<tr><td colspan="8" class="text-center">Erro ao carregar alunos</td></tr>';
            appUtils.showError('Erro ao carregar alunos: ' + error.message);
        }
    }

    renderAlunosTable() {
        const tableBody = document.getElementById('alunosTableBody');
        
        if (this.alunos.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="8" class="text-center">Nenhum aluno encontrado</td></tr>';
            return;
        }

        tableBody.innerHTML = this.alunos.map(aluno => `
            <tr>
                <td>${aluno.id}</td>
                <td>${aluno.nome}</td>
                <td>${aluno.email}</td>
                <td>${appUtils.formatCPF(aluno.cpf)}</td>
                <td>${aluno.instituicao || ''}</td>
                <td>${aluno.curso}</td>
                <td>R$ ${aluno.saldoMoedas.toFixed(2)}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="alunosManager.editAluno(${aluno.id})">
                        Editar
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="alunosManager.deleteAluno(${aluno.id})">
                        Excluir
                    </button>
                </td>
            </tr>
        `).join('');
    }

    setupEventListeners() {
        // CPF mask
        const cpfInput = document.getElementById('cpf');
        cpfInput.addEventListener('input', () => appUtils.maskCPF(cpfInput));

        // Form submission
        document.getElementById('alunoForm').addEventListener('submit', (e) => {
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
            this.loadAlunos();
        });

        // Enter key on search inputs
        document.getElementById('searchNome').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });
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
                await appUtils.httpClient.put(`/alunos/${this.currentEditId}`, formData);
                appUtils.showSuccess('Aluno atualizado com sucesso!');
            } else {
                await appUtils.httpClient.post('/alunos', formData);
                appUtils.showSuccess('Aluno cadastrado com sucesso!');
            }

            this.resetForm();
            await this.loadAlunos();
        } catch (error) {
            appUtils.showError('Erro ao salvar aluno: ' + error.message);
        } finally {
            const submitBtn = document.getElementById('submitBtn');
            submitBtn.textContent = this.currentEditId ? 'Atualizar Aluno' : 'Cadastrar Aluno';
            submitBtn.disabled = false;
        }
    }

    validateForm() {
        this.clearErrors();
        let isValid = true;

        const formData = this.getFormData();

        // Required field validation
        const requiredFields = ['nome', 'email', 'cpf', 'rg', 'endereco', 'curso', 'instituicao'];
        
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

        // CPF validation
        if (formData.cpf && !appUtils.validateCPF(formData.cpf)) {
            this.showFieldError('cpf', 'CPF deve estar no formato XXX.XXX.XXX-XX');
            isValid = false;
        }

        return isValid;
    }

    getFormData() {
        const form = document.getElementById('alunoForm');
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        // Remove instituicaoId conversion since we're now using instituicao as text
        
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

    async editAluno(id) {
        try {
            const aluno = await appUtils.httpClient.get(`/alunos/${id}`);
            this.fillFormForEdit(aluno);
        } catch (error) {
            appUtils.showError('Erro ao carregar dados do aluno: ' + error.message);
        }
    }

    fillFormForEdit(aluno) {
        this.currentEditId = aluno.id;
        
        // Fill form fields
        document.getElementById('alunoId').value = aluno.id;
        document.getElementById('nome').value = aluno.nome;
        document.getElementById('email').value = aluno.email;
        document.getElementById('cpf').value = aluno.cpf;
        document.getElementById('rg').value = aluno.rg;
        document.getElementById('endereco').value = aluno.endereco;
        document.getElementById('curso').value = aluno.curso;
        document.getElementById('instituicao').value = aluno.instituicao || '';
        document.getElementById('senha').value = ''; // Don't fill password
        
        // Update form UI
        document.getElementById('formTitle').textContent = 'Editar Aluno';
        document.getElementById('submitBtn').textContent = 'Atualizar Aluno';
        
        // Scroll to form
        document.getElementById('formCard').scrollIntoView({ behavior: 'smooth' });
    }

    async deleteAluno(id) {
        const aluno = this.alunos.find(a => a.id === id);
        if (!aluno) return;

        if (confirm(`Tem certeza que deseja excluir o aluno "${aluno.nome}"?`)) {
            try {
                await appUtils.httpClient.delete(`/alunos/${id}`);
                appUtils.showSuccess('Aluno excluído com sucesso!');
                await this.loadAlunos();
            } catch (error) {
                appUtils.showError('Erro ao excluir aluno: ' + error.message);
            }
        }
    }

    resetForm() {
        this.currentEditId = null;
        
        document.getElementById('alunoForm').reset();
        document.getElementById('alunoId').value = '';
        
        document.getElementById('formTitle').textContent = 'Cadastrar Novo Aluno';
        document.getElementById('submitBtn').textContent = 'Cadastrar Aluno';
        
        this.clearErrors();
    }

    handleSearch() {
        const nome = document.getElementById('searchNome').value.trim();
        const instituicao = document.getElementById('filterInstituicao').value.trim();
        
        const filters = {};
        if (nome) filters.nome = nome;
        if (instituicao) filters.instituicao = instituicao;
        
        this.loadAlunos(filters);
    }

    clearFilters() {
        document.getElementById('searchNome').value = '';
        document.getElementById('filterInstituicao').value = '';
        this.loadAlunos();
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.alunosManager = new AlunosManager();
});