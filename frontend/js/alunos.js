// Alunos management
class AlunosManager {
    constructor() {
        this.currentEditId = null;
        this.alunos = [];
        this.instituicoes = [];
        this.filtroAtivo = 'all';
        this.init();
    }

    async init() {
        await Promise.all([
            this.loadAlunos(),
            this.loadInstituicoes()
        ]);
        this.setupEventListeners();
        this.populateFilters();
    }

    async loadAlunos() {
        try {
            const tableBody = document.getElementById('alunosTableBody');
            appUtils.showLoading(tableBody);
            
            this.alunos = await appUtils.httpClient.get('/alunos');
            this.renderAlunos();
        } catch (error) {
            document.getElementById('alunosTableBody').innerHTML = 
                '<tr><td colspan="7" class="text-center">Erro ao carregar alunos</td></tr>';
            appUtils.showError('Erro ao carregar alunos: ' + error.message);
        }
    }

    async loadInstituicoes() {
        try {
            this.instituicoes = await appUtils.httpClient.get('/instituicoes');
            this.populateInstituicaoSelect();
        } catch (error) {
            appUtils.showError('Erro ao carregar instituições: ' + error.message);
            this.instituicoes = [];
        }
    }

    populateInstituicaoSelect() {
        const select = document.getElementById('instituicaoId');
        if (!select) return;
        
        while (select.children.length > 1) {
            select.removeChild(select.lastChild);
        }
        
        this.instituicoes.forEach(instituicao => {
            const option = document.createElement('option');
            option.value = instituicao.id;
            option.textContent = instituicao.nome;
            select.appendChild(option);
        });
    }

    renderAlunos() {
        let alunosFiltrados = this.getFilteredAlunos();
        const tableBody = document.getElementById('alunosTableBody');
        
        if (alunosFiltrados.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" class="text-center">Nenhum aluno encontrado</td></tr>';
            return;
        }

        tableBody.innerHTML = alunosFiltrados.map(aluno => `
            <tr>
                <td>${aluno.id}</td>
                <td>${aluno.nome}</td>
                <td>${aluno.email}</td>
                <td>${aluno.curso}</td>
                <td>${aluno.instituicao ? aluno.instituicao.nome : ''}</td>
                <td><span class="badge bg-primary">${aluno.saldoMoedas || 0}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="alunosManager.editAluno(${aluno.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="alunosManager.deleteAluno(${aluno.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    getFilteredAlunos() {
        let filtered = [...this.alunos];
        
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        if (searchTerm) {
            filtered = filtered.filter(aluno => 
                aluno.nome.toLowerCase().includes(searchTerm) || 
                aluno.email.toLowerCase().includes(searchTerm)
            );
        }

        const cursoFilter = document.getElementById('cursoFilter').value;
        if (cursoFilter) {
            filtered = filtered.filter(aluno => aluno.curso === cursoFilter);
        }

        switch (this.filtroAtivo) {
            case 'active':
                break;
            case 'rich':
                filtered = filtered.filter(aluno => (aluno.saldoMoedas || 0) > 0);
                break;
        }

        return filtered;
    }

    populateFilters() {
        const cursos = [...new Set(this.alunos.map(a => a.curso))].sort();
        const cursoFilter = document.getElementById('cursoFilter');
        cursoFilter.innerHTML = '<option value="">Todos os cursos</option>' +
            cursos.map(curso => `<option value="${curso}">${curso}</option>`).join('');
    }

    setupEventListeners() {
        document.getElementById('novoAlunoBtn').addEventListener('click', () => {
            this.showAlunoModal();
        });

        document.getElementById('alunoForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });
        
        const emailInput = document.getElementById('email');
        emailInput.addEventListener('blur', () => {
            if (emailInput.value && !appUtils.validateEmail(emailInput.value)) {
                emailInput.classList.add('is-invalid');
            } else {
                emailInput.classList.remove('is-invalid');
            }
        });

        const cpfInput = document.getElementById('cpf');
        if (cpfInput) {
            cpfInput.addEventListener('blur', () => {
                if (!cpfInput.value.trim()) {
                    cpfInput.classList.add('is-invalid');
                } else {
                    cpfInput.classList.remove('is-invalid');
                }
            });
            cpfInput.addEventListener('input', () => appUtils.maskCPF(cpfInput));
        }

        document.getElementById('searchInput').addEventListener('input', () => {
            this.renderAlunos();
        });

        document.getElementById('cursoFilter').addEventListener('change', () => {
            this.renderAlunos();
        });

        document.querySelectorAll('[data-filter]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.filtroAtivo = e.target.dataset.filter;
                this.renderAlunos();
            });
        });
    }

    showAlunoModal(aluno = null) {
        this.currentEditId = aluno ? aluno.id : null;
        const modal = new bootstrap.Modal(document.getElementById('alunoModal'));
        
        const modalTitle = document.getElementById('modalTitle');
        const saveBtn = document.getElementById('salvarAlunoBtn');
        
        if (aluno) {
            modalTitle.textContent = 'Editar Aluno';
            saveBtn.innerHTML = '<i class="fas fa-save me-2"></i>Atualizar Aluno';
            this.fillForm(aluno);
        } else {
            modalTitle.textContent = 'Novo Aluno';
            saveBtn.innerHTML = '<i class="fas fa-save me-2"></i>Salvar Aluno';
            this.resetForm();
        }
        
        modal.show();
    }

    fillForm(aluno) {
        document.getElementById('nome').value = aluno.nome || '';
        document.getElementById('email').value = aluno.email || '';
        document.getElementById('cpf').value = aluno.cpf || '';
        document.getElementById('rg').value = aluno.rg || '';
        document.getElementById('senha').value = '';
        document.getElementById('instituicaoId').value = aluno.instituicao ? aluno.instituicao.id : '';
        document.getElementById('curso').value = aluno.curso || '';
        document.getElementById('endereco').value = aluno.endereco || '';
    }

    async handleFormSubmit() {
        if (!this.validateForm()) {
            return;
        }

        const formData = this.getFormData();
        
        try {
            const saveBtn = document.getElementById('salvarAlunoBtn');
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Salvando...';
            saveBtn.disabled = true;

            if (this.currentEditId) {
                await appUtils.httpClient.put(`/alunos/${this.currentEditId}`, formData);
                appUtils.showSuccess('Aluno atualizado com sucesso!');
            } else {
                await appUtils.httpClient.post('/alunos', formData);
                appUtils.showSuccess('Aluno cadastrado com sucesso!');
            }

            bootstrap.Modal.getInstance(document.getElementById('alunoModal')).hide();
            await this.loadAlunos();
        } catch (error) {
            appUtils.showError('Erro ao salvar aluno: ' + error.message);
        } finally {
            const saveBtn = document.getElementById('salvarAlunoBtn');
            saveBtn.innerHTML = this.currentEditId ? '<i class="fas fa-save me-2"></i>Atualizar Aluno' : '<i class="fas fa-save me-2"></i>Salvar Aluno';
            saveBtn.disabled = false;
        }
    }

    validateForm() {
        let isValid = true;
        const requiredFields = ['nome', 'email', 'cpf', 'rg', 'endereco', 'curso', 'instituicaoId'];
        
        document.querySelectorAll('.form-control').forEach(input => {
            input.classList.remove('is-invalid');
        });

        requiredFields.forEach(field => {
            const input = document.getElementById(field);
            if (!input.value.trim()) {
                input.classList.add('is-invalid');
                isValid = false;
            }
        });

        const senhaInput = document.getElementById('senha');
        if (!this.currentEditId && (!senhaInput.value || senhaInput.value.length < 6)) {
            senhaInput.classList.add('is-invalid');
            isValid = false;
        }

        const emailInput = document.getElementById('email');
        if (emailInput.value && !appUtils.validateEmail(emailInput.value)) {
            emailInput.classList.add('is-invalid');
            isValid = false;
        }

        return isValid;
    }

    getFormData() {
        const instituicaoId = document.getElementById('instituicaoId').value;
        return {
            nome: document.getElementById('nome').value.trim(),
            email: document.getElementById('email').value.trim(),
            cpf: document.getElementById('cpf').value.trim(),
            rg: document.getElementById('rg').value.trim(),
            senha: document.getElementById('senha').value,
            instituicaoId: instituicaoId ? parseInt(instituicaoId) : null,
            curso: document.getElementById('curso').value.trim(),
            endereco: document.getElementById('endereco').value.trim()
        };
    }

    async editAluno(id) {
        try {
            const aluno = await appUtils.httpClient.get(`/alunos/${id}`);
            this.showAlunoModal(aluno);
        } catch (error) {
            appUtils.showError('Erro ao carregar dados do aluno: ' + error.message);
        }
    }

    // --- FUNÇÃO ATUALIZADA ---
    async deleteAluno(id) {
        const aluno = this.alunos.find(a => a.id === id);
        if (!aluno) return;

        const confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));
        document.getElementById('confirmModalTitle').textContent = 'Confirmar Exclusão';
        document.getElementById('confirmModalBody').textContent = `Tem certeza que deseja excluir o aluno "${aluno.nome}"?`;
        
        const confirmBtn = document.getElementById('confirmModalBtn');
        
        // .onclick é uma forma segura de garantir que teremos apenas um evento por vez
        confirmBtn.onclick = async () => {
            try {
                // Adiciona um feedback visual para o usuário
                confirmBtn.disabled = true;
                confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Excluindo...';

                await appUtils.httpClient.delete(`/alunos/${id}`);
                appUtils.showSuccess('Aluno excluído com sucesso!');
                await this.loadAlunos();
            } catch (error) {
                appUtils.showError('Erro ao excluir aluno: ' + error.message);
            } finally {
                // Restaura o botão e esconde o modal
                confirmBtn.disabled = false;
                confirmBtn.innerHTML = 'Confirmar';
                confirmModal.hide();
            }
        };

        confirmModal.show();
    }

    resetForm() {
        this.currentEditId = null;
        document.getElementById('alunoForm').reset();
    }

    exportAlunos() {
        if (this.alunos.length === 0) {
            appUtils.showWarning('Nenhum aluno para exportar');
            return;
        }

        const csv = this.convertToCSV(this.alunos);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `alunos_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    convertToCSV(data) {
        if (data.length === 0) return '';

        const headers = ['ID', 'Nome', 'Email', 'CPF', 'Curso', 'Instituição', 'Moedas'];
        const rows = data.map(aluno => [
            aluno.id,
            aluno.nome,
            aluno.email,
            aluno.cpf,
            aluno.curso,
            aluno.instituicao ? aluno.instituicao.nome : '',
            aluno.saldoMoedas || 0
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(field => `"${String(field || '').replace(/"/g, '""')}"`).join(','))
            .join('\n');

        return csvContent;
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.alunosManager = new AlunosManager();
});