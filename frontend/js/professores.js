// Professores management
class ProfessoresManager {
    constructor() {
        this.currentEditId = null;
        this.professores = [];
        this.instituicoes = [];
        
        this.init();
    }

    async init() {
        await this.loadInstituicoes();
        await this.loadProfessores();
        this.setupEventListeners();
    }

    async loadProfessores(filters = {}) {
        try {
            const tableBody = document.getElementById('professoresTableBody');
            appUtils.showLoading(tableBody);

            let url = '/professores';
            
            // Apply filters
            if (filters.nome) {
                url = `/professores/nome?nome=${encodeURIComponent(filters.nome)}`;
            } else if (filters.instituicao) {
                url = `/professores/instituicao?instituicao=${encodeURIComponent(filters.instituicao)}`;
            } else if (filters.departamento) {
                url = `/professores/departamento?departamento=${encodeURIComponent(filters.departamento)}`;
            } else if (filters.saldoBaixo) {
                url = `/professores/saldo-baixo`;
            }

            this.professores = await appUtils.httpClient.get(url);
            this.renderProfessoresTable();
        } catch (error) {
            document.getElementById('professoresTableBody').innerHTML = 
                '<tr><td colspan="9" class="text-center">Erro ao carregar professores</td></tr>';
            appUtils.showError('Erro ao carregar professores: ' + error.message);
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
        
        // Clear existing options (keep the first placeholder option)
        while (select.children.length > 1) {
            select.removeChild(select.lastChild);
        }
        
        // Add institution options
        this.instituicoes.forEach(instituicao => {
            const option = document.createElement('option');
            option.value = instituicao.id;
            option.textContent = instituicao.nome;
            select.appendChild(option);
        });
    }

    renderProfessoresTable() {
        const tableBody = document.getElementById('professoresTableBody');
        
        if (this.professores.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="9" class="text-center">Nenhum professor encontrado</td></tr>';
            return;
        }

        tableBody.innerHTML = this.professores.map(professor => `
            <tr>
                <td>${professor.id}</td>
                <td>${professor.nome || '-'}</td>
                <td>${professor.email || '-'}</td>
                <td>${professor.cpf || '-'}</td>
                <td>${professor.instituicao ? professor.instituicao.nome : '-'}</td>
                <td>${professor.departamento || '-'}</td>
                <td>
                    <span class="badge bg-${this.getSaldoBadgeClass(professor.saldoMoedas)}">
                        ${professor.saldoMoedas || 0} moedas
                    </span>
                </td>
                <td>
                    <span class="badge bg-${professor.ativo ? 'success' : 'danger'}">
                        ${professor.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                </td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-outline-primary" 
                                onclick="professoresManager.editProfessor(${professor.id})"
                                title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-info" 
                                onclick="professoresManager.viewProfessor(${professor.id})"
                                title="Visualizar">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-secondary" 
                                onclick="professoresManager.showExtrato(${professor.id})"
                                title="Ver Extrato">
                        <i class="fas fa-list-alt"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-success" 
                                onclick="professoresManager.showAddCoinsModal(${professor.id}, '${professor.nome}')"
                                title="Adicionar Moedas">
                            <i class="fas fa-coins"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" 
                                onclick="professoresManager.deleteProfessor(${professor.id})"
                                title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    getSaldoBadgeClass(saldo) {
        if (saldo >= 500) return 'success';
        if (saldo >= 100) return 'warning';
        return 'danger';
    }

    setupEventListeners() {
        // Form submission
        const form = document.getElementById('professorForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveProfessor();
            });
        }

        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchProfessores(e.target.value);
            });
        }

        // Filter buttons
        const filterButtons = document.querySelectorAll('[data-filter]');
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                // Update active button
                filterButtons.forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                
                const filterType = e.target.dataset.filter;
                this.applyFilter(filterType);
            });
        });

        // New professor button
        const newProfessorBtn = document.getElementById('newProfessorBtn');
        if (newProfessorBtn) {
            newProfessorBtn.addEventListener('click', () => {
                this.showNewProfessorModal();
            });
        }

        // Clear form button
        const clearFormBtn = document.getElementById('clearFormBtn');
        if (clearFormBtn) {
            clearFormBtn.addEventListener('click', () => {
                this.clearForm();
            });
        }

        // Add coins button
        const confirmAddCoinsBtn = document.getElementById('confirmAddCoinsBtn');
        if (confirmAddCoinsBtn) {
            confirmAddCoinsBtn.addEventListener('click', () => {
                this.addSemesterCoins();
            });
        }
    }

    showNewProfessorModal() {
        this.currentEditId = null;
        this.clearForm();
        document.getElementById('modalTitle').textContent = 'Novo Professor';
        document.getElementById('saveProfessorBtn').textContent = 'Cadastrar Professor';
        
        const modal = new bootstrap.Modal(document.getElementById('professorModal'));
        modal.show();
    }

    async editProfessor(id) {
        try {
            const professor = await appUtils.httpClient.get(`/professores/${id}`);
            this.currentEditId = id;
            this.fillForm(professor);
            
            document.getElementById('modalTitle').textContent = 'Editar Professor';
            document.getElementById('saveProfessorBtn').textContent = 'Salvar Alterações';
            
            const modal = new bootstrap.Modal(document.getElementById('professorModal'));
            modal.show();
        } catch (error) {
            appUtils.showError('Erro ao carregar dados do professor: ' + error.message);
        }
    }

    async viewProfessor(id) {
        try {
            const professor = await appUtils.httpClient.get(`/professores/${id}`);
            this.showProfessorDetails(professor);
        } catch (error) {
            appUtils.showError('Erro ao carregar dados do professor: ' + error.message);
        }
    }

    showProfessorDetails(professor) {
        const detailsHtml = `
            <div class="row">
                <div class="col-md-6">
                    <h6><strong>Dados Pessoais</strong></h6>
                    <p><strong>ID:</strong> ${professor.id}</p>
                    <p><strong>Nome:</strong> ${professor.nome || '-'}</p>
                    <p><strong>Email:</strong> ${professor.email || '-'}</p>
                    <p><strong>CPF:</strong> ${professor.cpf || '-'}</p>
                </div>
                <div class="col-md-6">
                    <h6><strong>Dados Profissionais</strong></h6>
                    <p><strong>Instituição:</strong> ${professor.instituicao ? professor.instituicao.nome : '-'}</p>
                    <p><strong>Departamento:</strong> ${professor.departamento || '-'}</p>
                    <p><strong>Saldo de Moedas:</strong> 
                        <span class="badge bg-${this.getSaldoBadgeClass(professor.saldoMoedas)} fs-6">
                            ${professor.saldoMoedas || 0} moedas
                        </span>
                    </p>
                    <p><strong>Status:</strong> 
                        <span class="badge bg-${professor.ativo ? 'success' : 'danger'}">
                            ${professor.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                    </p>
                    <p><strong>Data de Cadastro:</strong> ${appUtils.formatDate(professor.dataCadastro)}</p>
                </div>
            </div>
        `;

        document.getElementById('professorDetailsContent').innerHTML = detailsHtml;
        const modal = new bootstrap.Modal(document.getElementById('professorDetailsModal'));
        modal.show();
    }

    showAddCoinsModal(professorId, professorName) {
        this.currentProfessorForCoins = professorId;
        document.getElementById('professorNameForCoins').textContent = professorName;
        
        const modal = new bootstrap.Modal(document.getElementById('addCoinsModal'));
        modal.show();
    }

    async addSemesterCoins() {
        try {
            const confirmBtn = document.getElementById('confirmAddCoinsBtn');
            const originalText = confirmBtn.innerHTML;
            confirmBtn.disabled = true;
            confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Adicionando...';

            await appUtils.httpClient.post(`/professores/${this.currentProfessorForCoins}/moedas-semestrais`);
            
            appUtils.showSuccess('Moedas semestrais adicionadas com sucesso!');
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('addCoinsModal'));
            modal.hide();
            
            await this.loadProfessores();
        } catch (error) {
            appUtils.showError('Erro ao adicionar moedas: ' + error.message);
        } finally {
            const confirmBtn = document.getElementById('confirmAddCoinsBtn');
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = '<i class="fas fa-coins me-2"></i>Adicionar Moedas';
        }
    }

    fillForm(professor) {
        document.getElementById('nome').value = professor.nome || '';
        document.getElementById('email').value = professor.email || '';
        document.getElementById('cpf').value = professor.cpf || '';
        document.getElementById('instituicaoId').value = professor.instituicao ? professor.instituicao.id : '';
        document.getElementById('departamento').value = professor.departamento || '';
        document.getElementById('senha').value = ''; // Never populate password
    }

    clearForm() {
        document.getElementById('professorForm').reset();
        this.currentEditId = null;
        
        // Clear any validation states
        const inputs = document.querySelectorAll('#professorForm .form-control');
        inputs.forEach(input => {
            input.classList.remove('is-valid', 'is-invalid');
        });
        
        // Clear any feedback messages
        const feedbacks = document.querySelectorAll('#professorForm .invalid-feedback');
        feedbacks.forEach(feedback => feedback.style.display = 'none');
    }

    async saveProfessor() {
        try {
            const formData = this.getFormData();
            
            if (!this.validateForm(formData)) {
                return;
            }

            const saveBtn = document.getElementById('saveProfessorBtn');
            const originalText = saveBtn.textContent;
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';

            try {
                if (this.currentEditId) {
                    await appUtils.httpClient.put(`/professores/${this.currentEditId}`, formData);
                    appUtils.showSuccess('Professor atualizado com sucesso!');
                } else {
                    await appUtils.httpClient.post('/professores', formData);
                    appUtils.showSuccess('Professor cadastrado com sucesso!');
                }

                const modal = bootstrap.Modal.getInstance(document.getElementById('professorModal'));
                modal.hide();
                
                await this.loadProfessores();
            } finally {
                saveBtn.disabled = false;
                saveBtn.textContent = originalText;
            }
        } catch (error) {
            appUtils.showError('Erro ao salvar professor: ' + error.message);
        }
    }

    getFormData() {
        const instituicaoId = document.getElementById('instituicaoId').value;
        const formData = {
            nome: document.getElementById('nome').value.trim(),
            email: document.getElementById('email').value.trim(),
            cpf: document.getElementById('cpf').value.trim(),
            instituicaoId: instituicaoId ? parseInt(instituicaoId) : null,
            departamento: document.getElementById('departamento').value.trim(),
            senha: document.getElementById('senha').value
        };

        // Remove empty senha for updates
        if (this.currentEditId && !formData.senha) {
            delete formData.senha;
        }

        return formData;
    }

    validateForm(formData) {
        let isValid = true;
        
        // Clear previous validations
        const inputs = document.querySelectorAll('#professorForm .form-control');
        inputs.forEach(input => {
            input.classList.remove('is-valid', 'is-invalid');
        });

        // Validate required fields
        const requiredFields = [
            { field: 'nome', name: 'Nome' },
            { field: 'email', name: 'Email' },
            { field: 'cpf', name: 'CPF' },
            { field: 'instituicaoId', name: 'Instituição' },
            { field: 'departamento', name: 'Departamento' }
        ];

        // Only validate password for new professors
        if (!this.currentEditId) {
            requiredFields.push({ field: 'senha', name: 'Senha' });
        }

        requiredFields.forEach(({ field, name }) => {
            const input = document.getElementById(field);
            if (!formData[field]) {
                this.showFieldError(input, `${name} é obrigatório`);
                isValid = false;
            } else {
                this.showFieldSuccess(input);
            }
        });

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const emailInput = document.getElementById('email');
        if (formData.email && !emailRegex.test(formData.email)) {
            this.showFieldError(emailInput, 'Email deve ter um formato válido');
            isValid = false;
        }

        // Validate CPF format
        const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
        const cpfInput = document.getElementById('cpf');
        if (formData.cpf && !cpfRegex.test(formData.cpf)) {
            this.showFieldError(cpfInput, 'CPF deve estar no formato XXX.XXX.XXX-XX');
            isValid = false;
        }

        // Validate password for new professors
        if (!this.currentEditId && formData.senha && formData.senha.length < 6) {
            const senhaInput = document.getElementById('senha');
            this.showFieldError(senhaInput, 'Senha deve ter pelo menos 6 caracteres');
            isValid = false;
        }

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

    async deleteProfessor(id) {
        if (!confirm('Tem certeza que deseja excluir este professor? Esta ação não pode ser desfeita.')) {
            return;
        }

        try {
            await appUtils.httpClient.delete(`/professores/${id}`);
            appUtils.showSuccess('Professor excluído com sucesso!');
            await this.loadProfessores();
        } catch (error) {
            appUtils.showError('Erro ao excluir professor: ' + error.message);
        }
    }

    searchProfessores(searchTerm) {
        if (!searchTerm.trim()) {
            this.loadProfessores();
            return;
        }

        // Search in loaded data first
        const filtered = this.professores.filter(professor => {
            const searchLower = searchTerm.toLowerCase();
            return (professor.nome && professor.nome.toLowerCase().includes(searchLower)) ||
                   (professor.email && professor.email.toLowerCase().includes(searchLower)) ||
                   (professor.cpf && professor.cpf.includes(searchTerm)) ||
                   (professor.instituicao && professor.instituicao.nome && professor.instituicao.nome.toLowerCase().includes(searchLower)) ||
                   (professor.departamento && professor.departamento.toLowerCase().includes(searchLower));
        });

        const tableBody = document.getElementById('professoresTableBody');
        if (filtered.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="9" class="text-center">Nenhum professor encontrado</td></tr>';
        } else {
            this.professores = filtered;
            this.renderProfessoresTable();
        }
    }

    applyFilter(filterType) {
        switch (filterType) {
            case 'all':
                this.loadProfessores();
                break;
            case 'active':
                const activeProfessores = this.professores.filter(professor => professor.ativo);
                this.professores = activeProfessores;
                this.renderProfessoresTable();
                break;
            case 'inactive':
                const inactiveProfessores = this.professores.filter(professor => !professor.ativo);
                this.professores = inactiveProfessores;
                this.renderProfessoresTable();
                break;
            case 'saldo-baixo':
                this.loadProfessores({ saldoBaixo: true });
                break;
            default:
                this.loadProfessores();
        }
    }

    // Export functionality
    exportProfessores() {
        if (this.professores.length === 0) {
            appUtils.showWarning('Nenhum professor para exportar');
            return;
        }

        const csvContent = this.generateCSV();
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `professores_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    }

    generateCSV() {
        const headers = ['ID', 'Nome', 'Email', 'CPF', 'Instituição', 'Departamento', 'Saldo Moedas', 'Status', 'Data Cadastro'];
        const rows = this.professores.map(professor => [
            professor.id,
            professor.nome || '',
            professor.email || '',
            professor.cpf || '',
            professor.instituicao ? professor.instituicao.nome : '',
            professor.departamento || '',
            professor.saldoMoedas || 0,
            professor.ativo ? 'Ativo' : 'Inativo',
            appUtils.formatDate(professor.dataCadastro)
        ]);

        return [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');
    }

    async showExtrato(id) {
        // 1. Busca o professor na lista local para pegar o nome
        const professor = this.professores.find(p => p.id === id);
        if (!professor) {
            appUtils.showError('Professor não encontrado.');
            return;
        }
            
        const usuarioIdParaExtrato = professor.usuarioId;
        
        if (!usuarioIdParaExtrato) {
            appUtils.showError('Erro: ID de usuário não encontrado para este professor.');
            return;
        }

        // 2. Pega os elementos do modal
        const modalElement = document.getElementById('extratoModal');
        const modalTitle = document.getElementById('extratoModalTitle');
        const modalBody = document.getElementById('extratoModalBody');
        const modal = new bootstrap.Modal(modalElement);

        // 3. Define o título e o estado de "carregando"
        modalTitle.textContent = `Extrato de ${professor.nome}`;
        modalBody.innerHTML = `
            <div class="text-center p-3">
                <i class="fas fa-spinner fa-spin fa-2x"></i>
                <p class="mt-2">Buscando transações...</p>
            </div>
        `;
        
        // 4. Mostra o modal
        modal.show();

        try {
            // 5. Busca as transações
            const transacoes = await appUtils.httpClient.get(`/transacoes/extrato/usuario/${usuarioIdParaExtrato}`);
            
            // 6. Renderiza os dados no corpo do modal
            if (transacoes.length === 0) {
                modalBody.innerHTML = '<p class="text-center">Nenhuma transação encontrada para este professor.</p>';
                return;
            }

            // 7. Cria a tabela de extrato
            let tableHTML = `
                <table class="table table-striped table-hover">
                    <thead class="table-dark">
                        <tr>
                            <th>Data</th>
                            <th>Tipo</th>
                            <th>Descrição</th>
                            <th class="text-end">Valor</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            // 8. Loop para preencher a tabela 
            transacoes.forEach(tx => {
                const dataFormatada = new Date(tx.dataTransacao).toLocaleString('pt-BR', {
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit'
                }); 

                let valorClasse = '';
                let valorFormatado = '';
                let tipoBadge = '';
                let descricaoFinal = '';

                const isEnvio = tx.destinatarioNome; 
                const isResgate = tx.vantagemNome;

                if (isEnvio) {

                    tipoBadge = '<span class="badge bg-danger">Envio</span>';
                    descricaoFinal = `Para: ${tx.destinatarioNome}`;
                    valorClasse = 'text-danger';
                    valorFormatado = `-${tx.valor}`;

                } else if (isResgate) {
                    tipoBadge = '<span class="badge bg-success">Resgate</span>';
                    descricaoFinal = tx.vantagemNome + (tx.empresaNome ? ` (${tx.empresaNome})` : '');
                    valorClasse = 'text-danger';
                    valorFormatado = `-${tx.valor}`;

                } else {
                    tipoBadge = '<span class="badge bg-primary">Recebimento</span>';
                    descricaoFinal = tx.remetenteNome ? `De: ${tx.remetenteNome}` : (tx.descricao || 'Bônus/Crédito');
                    valorClasse = 'text-success';
                    valorFormatado = `+${tx.valor}`;
                }

                tableHTML += `
                    <tr>
                        <td>${dataFormatada}</td>
                        <td>${tipoBadge}</td>
                        <td>${descricaoFinal}</td>
                        <td class="text-end ${valorClasse}"><strong>${valorFormatado}</strong></td>
                    </tr>
                `;
            });

            tableHTML += '</tbody></table>';
            modalBody.innerHTML = tableHTML;

        } catch (error) {
            modalBody.innerHTML = `<p class="text-danger text-center">Erro ao carregar o extrato: ${error.message}</p>`;
            appUtils.showError('Erro ao buscar extrato: ' + error.message);
        }
    }
}

// Initialize professores manager when page loads
let professoresManager;
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('professoresTableBody')) {
        professoresManager = new ProfessoresManager();
    }
});

