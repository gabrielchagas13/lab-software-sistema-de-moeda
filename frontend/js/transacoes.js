// Transacoes Manager Class
class TransacoesManager {
    constructor() {
        this.transacoes = [];
        this.professores = [];
        this.alunos = [];
        this.vantagens = [];
        this.filtroAtivo = 'all';
        this.tipoFilter = '';
        this.vantagemSelecionada = null;
        this.init();
    }

    async init() {
        await this.loadData();
        this.attachEventListeners();
    }

    async loadData() {
        try {
            // Load resources one-by-one so a single failure doesn't abort everything
            await this.loadTransacoes().catch(e => console.warn('[transacoes] loadTransacoes failed', e));
            await this.loadProfessores().catch(e => console.warn('[transacoes] loadProfessores failed', e));
            await this.loadAlunos().catch(e => console.warn('[transacoes] loadAlunos failed', e));
            await this.loadVantagens().catch(e => console.warn('[transacoes] loadVantagens failed', e));

            this.renderTransacoes();
            this.populateSelects();
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            showToast('Erro ao carregar dados do sistema', 'error');
        }
    }

    async loadTransacoes() {
        try {
            this.transacoes = await appUtils.httpClient.get('/transacoes');
        } catch (error) {
            console.error('Erro ao carregar transações:', error);
        }
    }

    async loadProfessores() {
        try {
            this.professores = await appUtils.httpClient.get('/professores');
            console.log('[transacoes] professores carregados:', this.professores.length);
        } catch (error) {
            console.error('Erro ao carregar professores:', error);
            this.professores = [];
        }
    }

    async loadAlunos() {
        try {
            this.alunos = await appUtils.httpClient.get('/alunos');
            console.log('[transacoes] alunos carregados:', this.alunos.length);
        } catch (error) {
            console.error('Erro ao carregar alunos:', error);
            this.alunos = [];
        }
    }

    async loadVantagens() {
        try {
            this.vantagens = await appUtils.httpClient.get('/vantagens');
        } catch (error) {
            console.error('Erro ao carregar vantagens:', error);
        }
    }

    populateSelects() {
        // Debug info
        console.log('[transacoes] populateSelects - professores:', this.professores ? this.professores.length : 0, 'alunos:', this.alunos ? this.alunos.length : 0);

        // Populate professores select
        const professorSelect = document.getElementById('professorId');
        if (professorSelect) {
            professorSelect.innerHTML = '<option value="">Selecione um professor</option>';
            if (!this.professores || this.professores.length === 0) {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'Nenhum professor cadastrado';
                option.disabled = true;
                professorSelect.appendChild(option);
            } else {
                this.professores.forEach(professor => {
                    const option = document.createElement('option');
                    option.value = professor.id;
                    const saldo = (professor.saldoMoedas !== undefined && professor.saldoMoedas !== null) ? professor.saldoMoedas : 0;
                    option.textContent = `${professor.nome} (${saldo} moedas)`;
                    professorSelect.appendChild(option);
                });
            }
        }

        // Populate alunos selects
        const alunoSelects = ['alunoId', 'alunoResgateId'];
        alunoSelects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (!select) return;
            select.innerHTML = '<option value="">Selecione um aluno</option>';
            if (!this.alunos || this.alunos.length === 0) {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'Nenhum aluno cadastrado';
                option.disabled = true;
                select.appendChild(option);
            } else {
                this.alunos.forEach(aluno => {
                    const option = document.createElement('option');
                    option.value = aluno.id;
                    const saldo = (aluno.saldoMoedas !== undefined && aluno.saldoMoedas !== null) ? aluno.saldoMoedas : 0;
                    option.textContent = `${aluno.nome} (${saldo} moedas)`;
                    select.appendChild(option);
                });
            }
        });
    }

    attachEventListeners() {
        // Modal buttons
        const enviarMoedasBtn = document.getElementById('enviarMoedasBtn');
        if (enviarMoedasBtn) {
            enviarMoedasBtn.addEventListener('click', () => this.showEnviarMoedasModal());
        }

        const resgatarVantagemBtn = document.getElementById('resgatarVantagemBtn');
        if (resgatarVantagemBtn) {
            resgatarVantagemBtn.addEventListener('click', () => this.showResgatarVantagemModal());
        }

        // Forms
        const enviarMoedasForm = document.getElementById('enviarMoedasForm');
        if (enviarMoedasForm) {
            enviarMoedasForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleEnviarMoedas();
            });
        }

        // Fallback: also attach directly to the confirm button in case form submit isn't fired
        const confirmarEnvioBtn = document.getElementById('confirmarEnvioBtn');
        if (confirmarEnvioBtn) {
            confirmarEnvioBtn.addEventListener('click', (e) => {
                // if button is type=submit the form handler will run, but call explicitly as fallback
                e.preventDefault();
                this.handleEnviarMoedas();
            });
        }

        const confirmarResgateBtn = document.getElementById('confirmarResgateBtn');
        if (confirmarResgateBtn) {
            confirmarResgateBtn.addEventListener('click', () => this.handleResgatarVantagem());
        }

        // Filters
        const tipoFilterEl = document.getElementById('tipoFilter');
        if (tipoFilterEl) {
            tipoFilterEl.addEventListener('change', (e) => {
                this.tipoFilter = e.target.value;
                this.renderTransacoes();
            });
        }

        // Filter buttons
        const filterBtns = document.querySelectorAll('[data-filter]');
        if (filterBtns && filterBtns.length) {
            filterBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    filterBtns.forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    this.filtroAtivo = e.target.dataset.filter;
                    this.renderTransacoes();
                });
            });
        }

        // Aluno change for resgate
        const alunoResgateEl = document.getElementById('alunoResgateId');
        if (alunoResgateEl) {
            alunoResgateEl.addEventListener('change', () => this.loadVantagensDisponiveis());
        }
    }

    showEnviarMoedasModal() {
        const modal = new bootstrap.Modal(document.getElementById('enviarMoedasModal'));
        document.getElementById('enviarMoedasForm').reset();
        modal.show();
    }

    showResgatarVantagemModal() {
        const modal = new bootstrap.Modal(document.getElementById('resgatarVantagemModal'));
        document.getElementById('resgatarVantagemForm').reset();
        this.vantagemSelecionada = null;
        document.getElementById('confirmarResgateBtn').disabled = true;
        modal.show();
    }

    async handleEnviarMoedas() {
        // Backend espera: remetenteId, destinatarioId, valor (BigDecimal), descricao
        const remetenteId = parseInt(document.getElementById('professorId').value) || null;
        const destinatarioId = parseInt(document.getElementById('alunoId').value) || null;
        const valorInput = document.getElementById('valorMoedas').value;
        const descricao = document.getElementById('motivoEnvio').value || '';

        const formData = {
            remetenteId: remetenteId,
            destinatarioId: destinatarioId,
            valor: valorInput ? Number(valorInput) : null,
            descricao: descricao.trim()
        };

        try {
            await appUtils.httpClient.post('/transacoes/enviar-moedas', formData);
            showToast('Moedas enviadas com sucesso!', 'success');
            bootstrap.Modal.getInstance(document.getElementById('enviarMoedasModal')).hide();
            this.loadData();
        } catch (error) {
            console.error('Erro ao enviar moedas:', error);
            showToast('Erro ao enviar moedas: ' + error.message, 'error');
        }
    }

    async loadVantagensDisponiveis() {
        const alunoId = document.getElementById('alunoResgateId').value;
        const container = document.getElementById('vantagensDisponiveis');
        
        if (!alunoId) {
            container.innerHTML = '<div class="col-12"><p class="text-muted">Selecione um aluno primeiro</p></div>';
            return;
        }

        const aluno = this.alunos.find(a => a.id == alunoId);
        const vantagensAcessiveis = this.vantagens.filter(v => v.ativo && v.custoMoedas <= aluno.saldoMoedas);

        if (vantagensAcessiveis.length === 0) {
            container.innerHTML = '<div class="col-12"><p class="text-muted">Nenhuma vantagem disponível para este aluno</p></div>';
            return;
        }

        container.innerHTML = vantagensAcessiveis.map(vantagem => `
            <div class="col-md-6 mb-3">
                <div class="card vantagem-card" data-vantagem-id="${vantagem.id}">
                    <div class="card-body">
                        <h6 class="card-title">${vantagem.nome}</h6>
                        <p class="card-text">${vantagem.descricao}</p>
                        <p class="text-primary fw-bold">${vantagem.custoMoedas} moedas</p>
                        <small class="text-muted">${vantagem.empresa.nome}</small>
                    </div>
                </div>
            </div>
        `).join('');

        // Add click handlers to vantagem cards
        container.querySelectorAll('.vantagem-card').forEach(card => {
            card.addEventListener('click', () => {
                container.querySelectorAll('.vantagem-card').forEach(c => c.classList.remove('border-success'));
                card.classList.add('border-success');
                this.vantagemSelecionada = parseInt(card.dataset.vantagemId);
                document.getElementById('confirmarResgateBtn').disabled = false;
            });
        });
    }

    async handleResgatarVantagem() {
        if (!this.vantagemSelecionada) {
            showToast('Selecione uma vantagem', 'warning');
            return;
        }

        const formData = {
            alunoId: parseInt(document.getElementById('alunoResgateId').value),
            vantagemId: this.vantagemSelecionada
        };

        try {
            const resultado = await appUtils.httpClient.post('/transacoes/resgatar-vantagem', formData);
            showToast(`Vantagem resgatada! Cupom: ${resultado.cupomCodigo}`, 'success');
            bootstrap.Modal.getInstance(document.getElementById('resgatarVantagemModal')).hide();
            this.loadData();
        } catch (error) {
            console.error('Erro ao resgatar vantagem:', error);
            showToast('Erro ao resgatar vantagem: ' + error.message, 'error');
        }
    }

    renderTransacoes() {
        const tbody = document.getElementById('transacoesTableBody');
        let transacoesFiltradas = this.transacoes;

        // Apply tipo filter
        if (this.tipoFilter) {
            transacoesFiltradas = transacoesFiltradas.filter(t => t.tipo === this.tipoFilter);
        }

        // Apply action filter
        switch (this.filtroAtivo) {
            case 'recent':
                const umDiaAtras = new Date();
                umDiaAtras.setDate(umDiaAtras.getDate() - 1);
                transacoesFiltradas = transacoesFiltradas.filter(t => 
                    new Date(t.dataHora) > umDiaAtras
                );
                break;
            case 'envios':
                transacoesFiltradas = transacoesFiltradas.filter(t => 
                    t.tipo === 'ENVIO_MOEDA'
                );
                break;
            case 'resgates':
                transacoesFiltradas = transacoesFiltradas.filter(t => 
                    t.tipo === 'RESGATE_VANTAGEM'
                );
                break;
        }

        if (transacoesFiltradas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center">Nenhuma transação encontrada</td></tr>';
            return;
        }

        tbody.innerHTML = transacoesFiltradas.map(transacao => {
            const data = new Date(transacao.dataHora).toLocaleString('pt-BR');
            const badgeClass = this.getTipoBadgeClass(transacao.tipo);
            
            return `
                <tr>
                    <td>#${transacao.id}</td>
                    <td><span class="badge ${badgeClass}">${this.formatTipo(transacao.tipo)}</span></td>
                    <td>${this.formatRemetente(transacao)}</td>
                    <td>${this.formatDestinatario(transacao)}</td>
                    <td><span class="fw-bold text-primary">${transacao.valor}</span></td>
                    <td>${transacao.descricao}</td>
                    <td>${data}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-info" onclick="transacoesManager.viewDetails(${transacao.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    getTipoBadgeClass(tipo) {
        switch (tipo) {
            case 'ENVIO_MOEDA': return 'bg-primary';
            case 'RESGATE_VANTAGEM': return 'bg-success';
            case 'CREDITO_SEMESTRAL': return 'bg-info';
            default: return 'bg-secondary';
        }
    }

    formatTipo(tipo) {
        switch (tipo) {
            case 'ENVIO_MOEDA': return 'Envio';
            case 'RESGATE_VANTAGEM': return 'Resgate';
            case 'CREDITO_SEMESTRAL': return 'Crédito';
            default: return tipo;
        }
    }

    formatRemetente(transacao) {
        if (transacao.professorRemetente) {
            return `Prof. ${transacao.professorRemetente.nome}`;
        }
        return 'Sistema';
    }

    formatDestinatario(transacao) {
        if (transacao.alunoDestinatario) {
            return transacao.alunoDestinatario.nome;
        }
        if (transacao.professorDestinatario) {
            return `Prof. ${transacao.professorDestinatario.nome}`;
        }
        return '-';
    }

    viewDetails(transacaoId) {
        const transacao = this.transacoes.find(t => t.id === transacaoId);
        if (transacao) {
            alert(`Detalhes da Transação #${transacao.id}:\n\n${JSON.stringify(transacao, null, 2)}`);
        }
    }

    exportTransacoes() {
        const csv = this.convertToCSV(this.transacoes);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `transacoes_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    convertToCSV(data) {
        if (data.length === 0) return '';

        const headers = ['ID', 'Tipo', 'Remetente', 'Destinatário', 'Valor', 'Descrição', 'Data'];
        const rows = data.map(t => [
            t.id,
            this.formatTipo(t.tipo),
            this.formatRemetente(t),
            this.formatDestinatario(t),
            t.valor,
            t.descricao,
            new Date(t.dataHora).toLocaleString('pt-BR')
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');

        return csvContent;
    }
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', function() {
    window.transacoesManager = new TransacoesManager();
});