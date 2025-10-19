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
            console.log('[transacoes] vantagens carregadas:', Array.isArray(this.vantagens) ? this.vantagens.length : typeof this.vantagens, this.vantagens && this.vantagens.slice ? this.vantagens.slice(0,5) : this.vantagens);
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
        const modalEl = document.getElementById('resgatarVantagemModal');
        const modal = new bootstrap.Modal(modalEl);
        const form = document.getElementById('resgatarVantagemForm');
        if (form) form.reset();
        this.vantagemSelecionada = null;
        const confirmarBtn = document.getElementById('confirmarResgateBtn');
        if (confirmarBtn) confirmarBtn.disabled = true;

        // Show loading placeholder while we fetch vantagens for the currently selected aluno
        const container = document.getElementById('vantagensDisponiveis');
        if (container) container.innerHTML = '<div class="col-12"><p class="text-muted">Carregando vantagens...</p></div>';

        modal.show();

        // After modal is shown, ensure alunos are loaded and then populate vantagens based on selected aluno
        setTimeout(() => {
            // If aluno selection exists in modal, trigger loading
            const alunoSelect = document.getElementById('alunoResgateId');
            const alunoId = alunoSelect ? alunoSelect.value : null;
            if (!alunoId) {
                if (container) container.innerHTML = '<div class="col-12"><p class="text-muted">Selecione um aluno primeiro</p></div>';
                return;
            }
            // Ensure vantagens list is up-to-date by reloading from server
            this.loadVantagens().then(() => {
                try {
                    this.loadVantagensDisponiveis();
                } catch (err) {
                    console.error('Erro ao popular vantagens no modal:', err);
                    if (container) container.innerHTML = '<div class="col-12"><p class="text-muted">Erro ao carregar vantagens</p></div>';
                }
            }).catch(err => {
                console.error('Erro ao recarregar vantagens:', err);
                if (container) container.innerHTML = '<div class="col-12"><p class="text-muted">Erro ao carregar vantagens</p></div>';
            });
        }, 150);
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
        const selectEl = document.getElementById('alunoResgateId');
        const alunoId = selectEl ? selectEl.value : null;
        const container = document.getElementById('vantagensDisponiveis');
        const confirmarBtn = document.getElementById('confirmarResgateBtn');

        if (!container) return;

        if (!alunoId) {
            container.innerHTML = '<div class="col-12"><p class="text-muted">Selecione um aluno primeiro</p></div>';
            if (confirmarBtn) confirmarBtn.disabled = true;
            return;
        }

        const aluno = this.alunos.find(a => a.id == alunoId);
        if (!aluno) {
            container.innerHTML = '<div class="col-12"><p class="text-muted">Aluno não encontrado</p></div>';
            if (confirmarBtn) confirmarBtn.disabled = true;
            return;
        }

        const vantagensList = Array.isArray(this.vantagens) ? this.vantagens : [];
    console.log('[transacoes] aluno saldo:', aluno.saldoMoedas, 'vantagens total:', vantagensList.length);
    const vantagensAcessiveis = vantagensList.filter(v => (v.ativa === true || v.ativo === true) && (v.custoMoedas || v.custo || 0) <= (aluno.saldoMoedas || 0));
    console.log('[transacoes] vantagens acessiveis para aluno', aluno.id, vantagensAcessiveis.length, vantagensAcessiveis.map(v=>({id:v.id,nome:v.nome,custo:v.custoMoedas,ativa:v.ativa})));

        if (vantagensAcessiveis.length === 0) {
            container.innerHTML = '<div class="col-12"><p class="text-muted">Nenhuma vantagem disponível para este aluno</p></div>';
            if (confirmarBtn) confirmarBtn.disabled = true;
            return;
        }

        container.innerHTML = vantagensAcessiveis.map(vantagem => `
            <div class="col-md-6 mb-3">
                <div class="card vantagem-card" data-vantagem-id="${vantagem.id}" style="cursor:pointer">
                    <div class="card-body">
                        <h6 class="card-title">${vantagem.nome}</h6>
                        <p class="card-text">${vantagem.descricao || ''}</p>
                        <p class="text-primary fw-bold">${appUtils.formatCurrency(vantagem.custoMoedas)} moedas</p>
                        <small class="text-muted">${(vantagem.empresa && vantagem.empresa.nome) || vantagem.empresaNome || ''}</small>
                    </div>
                </div>
            </div>
        `).join('');

        // reset selection and disable confirm until user selects
        this.vantagemSelecionada = null;
        if (confirmarBtn) confirmarBtn.disabled = true;

        // Add click handlers to vantagem cards
        container.querySelectorAll('.vantagem-card').forEach(card => {
            card.addEventListener('click', () => {
                container.querySelectorAll('.vantagem-card').forEach(c => c.classList.remove('border-success'));
                card.classList.add('border-success');
                this.vantagemSelecionada = parseInt(card.dataset.vantagemId);
                if (confirmarBtn) confirmarBtn.disabled = false;
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

        // Apply tipo filter (support novo campo tipoTransacao e legado tipo)
        if (this.tipoFilter) {
            transacoesFiltradas = transacoesFiltradas.filter(t => (t.tipoTransacao || t.tipo) === this.tipoFilter);
        }

        // Apply action filter
        switch (this.filtroAtivo) {
            case 'recent':
                const umDiaAtras = new Date();
                umDiaAtras.setDate(umDiaAtras.getDate() - 1);
                transacoesFiltradas = transacoesFiltradas.filter(t => 
                    new Date(t.dataTransacao || t.dataHora) > umDiaAtras
                );
                break;
            case 'envios':
                transacoesFiltradas = transacoesFiltradas.filter(t => 
                    (t.tipoTransacao || t.tipo) === 'ENVIO_MOEDA'
                );
                break;
            case 'resgates':
                transacoesFiltradas = transacoesFiltradas.filter(t => 
                    (t.tipoTransacao || t.tipo) === 'RESGATE_VANTAGEM'
                );
                break;
        }

        if (!tbody) return;

        if (transacoesFiltradas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center">Nenhuma transação encontrada</td></tr>';
            return;
        }

        tbody.innerHTML = transacoesFiltradas.map(transacao => {
            // Use DTO fields from backend
            const data = transacao.dataTransacao ? appUtils.formatDate(transacao.dataTransacao) : '—';
            const tipo = transacao.tipoTransacao || transacao.tipo || 'UNKNOWN';
            const badgeClass = this.getTipoBadgeClass(tipo);
            const remetente = transacao.remetenteNome || transacao.remetente ? (transacao.remetenteNome || (transacao.remetente && transacao.remetente.nome)) : 'Sistema';
            const destinatario = transacao.destinatarioNome || (transacao.destinatario && transacao.destinatario.nome) || '-';
            const valor = transacao.valor !== undefined && transacao.valor !== null ? appUtils.formatCurrency(transacao.valor) : '';
            const vantagemInfo = transacao.vantagemNome ? `${transacao.vantagemNome} (${transacao.empresaNome || ''})` : (transacao.codigoCupom ? `Cupom: ${transacao.codigoCupom}` : '');

            return `
                <tr>
                    <td>#${transacao.id}</td>
                    <td><span class="badge ${badgeClass}">${this.formatTipo(tipo)}</span></td>
                    <td>${remetente}</td>
                    <td>${destinatario}</td>
                    <td><span class="badge bg-primary">${valor}</span></td>
                    <td>${transacao.descricao || ''}</td>
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
        // Prefer DTO fields
        if (transacao.remetenteNome) return transacao.remetenteNome;
        if (transacao.professorRemetente) return `Prof. ${transacao.professorRemetente.nome}`;
        return 'Sistema';
    }

    formatDestinatario(transacao) {
        if (transacao.destinatarioNome) return transacao.destinatarioNome;
        if (transacao.alunoDestinatario) return transacao.alunoDestinatario.nome;
        if (transacao.professorDestinatario) return `Prof. ${transacao.professorDestinatario.nome}`;
        return '-';
    }

    viewDetails(transacaoId) {
        const transacao = this.transacoes.find(t => t.id === transacaoId);
        if (!transacao) return;

        // Create modal if not exists
        let modalEl = document.getElementById('transacaoDetailsModal');
        if (!modalEl) {
            modalEl = document.createElement('div');
            modalEl.id = 'transacaoDetailsModal';
            modalEl.className = 'modal fade';
            modalEl.innerHTML = `
                <div class="modal-dialog modal-lg"><div class="modal-content">
                    <div class="modal-header"><h5 class="modal-title">Detalhes da Transação</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
                    <div class="modal-body"><div id="transacaoDetailsContent"></div></div>
                    <div class="modal-footer"><button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button></div>
                </div></div>`;
            document.body.appendChild(modalEl);
        }

        const detailsHtml = `
            <dl class="row">
                <dt class="col-sm-3">ID</dt><dd class="col-sm-9">${transacao.id}</dd>
                <dt class="col-sm-3">Tipo</dt><dd class="col-sm-9">${this.formatTipo(transacao.tipoTransacao || transacao.tipo)}</dd>
                <dt class="col-sm-3">Remetente</dt><dd class="col-sm-9">${transacao.remetenteNome || '-'}</dd>
                <dt class="col-sm-3">Destinatário</dt><dd class="col-sm-9">${transacao.destinatarioNome || '-'}</dd>
                <dt class="col-sm-3">Valor</dt><dd class="col-sm-9">${appUtils.formatCurrency(transacao.valor)}</dd>
                <dt class="col-sm-3">Descrição</dt><dd class="col-sm-9">${transacao.descricao || ''}</dd>
                <dt class="col-sm-3">Data</dt><dd class="col-sm-9">${transacao.dataTransacao ? appUtils.formatDate(transacao.dataTransacao) : ''}</dd>
                ${transacao.vantagemNome ? `<dt class="col-sm-3">Vantagem</dt><dd class="col-sm-9">${transacao.vantagemNome} (${transacao.empresaNome || ''})</dd>` : ''}
                ${transacao.codigoCupom ? `<dt class="col-sm-3">Cupom</dt><dd class="col-sm-9">${transacao.codigoCupom}</dd>` : ''}
            </dl>
        `;

        document.getElementById('transacaoDetailsContent').innerHTML = detailsHtml;
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
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
            this.formatTipo(t.tipoTransacao || t.tipo),
            this.formatRemetente(t),
            this.formatDestinatario(t),
            t.valor,
            t.descricao,
            appUtils.formatDate(t.dataTransacao || t.dataHora)
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