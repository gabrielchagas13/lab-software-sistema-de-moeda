class EnviarMoedasManager {
    constructor() {
        this.professorId = null; // ID da tabela professor
        this.usuarioId = null;   // ID da tabela usuario
        this.saldo = 0;
        this.historico = [];
        
        this.init();
    }

    async init() {
        const profile = JSON.parse(localStorage.getItem('userProfile'));
        if (!profile) {
            window.location.href = 'login.html';
            return;
        }

        if (profile.tipoUsuario !== 'PROFESSOR') {
            Swal.fire('Acesso Negado', 'Apenas professores podem acessar esta página.', 'error')
                .then(() => window.location.href = '../index.html');
            return;
        }

        this.usuarioId = profile.id;
        
        // Carrega dados iniciais
        await this.loadProfessorData();
        await this.loadAlunosList();
        
        this.attachEventListeners();
    }

    async loadProfessorData() {
        try {
            const todosProfessores = await appUtils.httpClient.get('/professores');
            const meuProfessor = todosProfessores.find(p => p.usuarioId === this.usuarioId);

            if (meuProfessor) {
                this.professorId = meuProfessor.id;
                this.saldo = meuProfessor.saldoMoedas || 0;
                
                // Atualiza saldo na tela
                document.getElementById('saldo-display').textContent = appUtils.formatCurrency(this.saldo);
                
                // Carrega o histórico (extrato) deste professor
                this.loadHistoricoEnvios();
            } else {
                Swal.fire('Erro', 'Perfil de professor não encontrado.', 'error');
            }
        } catch (error) {
            console.error("Erro ao carregar dados do professor:", error);
        }
    }

    async loadAlunosList() {
        try {
            const alunos = await appUtils.httpClient.get('/alunos');
            const select = document.getElementById('alunoSelect');
            
            select.innerHTML = '<option value="">Selecione um aluno...</option>';
            
            if (alunos.length === 0) {
                select.innerHTML = '<option value="" disabled>Nenhum aluno encontrado</option>';
                return;
            }

            // Ordena alfabeticamente
            alunos.sort((a, b) => a.nome.localeCompare(b.nome));

            alunos.forEach(aluno => {
                const option = document.createElement('option');
                option.value = aluno.id;
                option.textContent = `${aluno.nome} (${aluno.email})`;
                select.appendChild(option);
            });

        } catch (error) {
            console.error("Erro ao carregar lista de alunos:", error);
            Swal.fire('Erro', 'Não foi possível carregar a lista de alunos.', 'error');
        }
    }

    async loadHistoricoEnvios() {
        const loading = document.getElementById('loadingIndicator');
        const tbody = document.getElementById('historicoTableBody');
        
        loading.classList.remove('d-none');
        tbody.innerHTML = '';

        try {
            // Busca todas as transações do usuário
            const todasTransacoes = await appUtils.httpClient.get(`/transacoes/extrato/usuario/${this.usuarioId}`);
            
            // Filtra apenas os ENVIOS feitos por mim
            this.historico = todasTransacoes.filter(tx => 
                tx.tipoTransacao === 'ENVIO_MOEDA' && 
                tx.remetenteId === this.usuarioId
            );

            // Ordena por data (mais recente primeiro)
            this.historico.sort((a, b) => new Date(b.dataTransacao) - new Date(a.dataTransacao));

            this.renderHistorico();

        } catch (error) {
            console.error("Erro ao carregar histórico:", error);
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-danger p-3">Erro ao carregar histórico.</td></tr>';
        } finally {
            loading.classList.add('d-none');
        }
    }

    renderHistorico() {
        const tbody = document.getElementById('historicoTableBody');
        
        if (this.historico.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted p-3">Nenhum envio realizado ainda.</td></tr>';
            return;
        }

        tbody.innerHTML = this.historico.map(tx => `
            <tr>
                <td class="ps-4 text-muted small">${appUtils.formatDate(tx.dataTransacao)}</td>
                <td class="fw-bold">${tx.destinatarioNome || 'Aluno'}</td>
                <td><small class="text-muted">${tx.descricao}</small></td>
                <td class="text-end pe-4 text-danger fw-bold">-${appUtils.formatCurrency(tx.valor)}</td>
            </tr>
        `).join('');
    }

    attachEventListeners() {
        const form = document.getElementById('enviarMoedasForm');
        const valorInput = document.getElementById('valorMoedas');
        
        // Validação de saldo em tempo real
        valorInput.addEventListener('input', (e) => {
            const valor = parseFloat(e.target.value);
            const msgErro = document.getElementById('saldo-insuficiente-msg');
            const btnEnviar = document.getElementById('btn-enviar');
            
            if (valor > this.saldo) {
                msgErro.classList.remove('d-none');
                valorInput.classList.add('is-invalid');
                btnEnviar.disabled = true;
            } else {
                msgErro.classList.add('d-none');
                valorInput.classList.remove('is-invalid');
                btnEnviar.disabled = false;
            }
        });

        // Envio do formulário
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleEnviar();
        });
    }

    async handleEnviar() {
        const alunoId = document.getElementById('alunoSelect').value;
        const valor = document.getElementById('valorMoedas').value;
        const motivo = document.getElementById('motivoEnvio').value;

        if (!alunoId || !valor || !motivo) {
            Swal.fire('Atenção', 'Preencha todos os campos.', 'warning');
            return;
        }

        const payload = {
            remetenteId: this.professorId,    // ID do professor (tabela professor)
            destinatarioId: parseInt(alunoId), // ID do aluno (tabela aluno)
            valor: parseFloat(valor),
            descricao: motivo
        };
        
        const btnEnviar = document.getElementById('btn-enviar');
        const originalText = btnEnviar.innerHTML;

        Swal.fire({
            title: 'Enviando Moedas',
            text: 'Processando transferência e enviando e-mail...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });
        
        try {
            btnEnviar.disabled = true;

            await appUtils.httpClient.post('/transacoes/enviar-moedas', payload);
            
            Swal.fire({
                icon: 'success',
                title: 'Sucesso!',
                text: 'Moedas enviadas com sucesso!',
                timer: 2000,
                showConfirmButton: false
            });

            document.getElementById('enviarMoedasForm').reset();
            await this.loadProfessorData(); 

        } catch (error) {
            Swal.fire('Erro', error.message || 'Falha ao enviar moedas.', 'error');
        } finally {
            btnEnviar.disabled = false;
            btnEnviar.innerHTML = originalText;
        }
    }
}

// 
window.enviarMoedasManager = new EnviarMoedasManager();