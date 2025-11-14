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
            await this.loadTransacoes().catch(e => console.warn('[transacoes] loadTransacoes failed', e));
            await this.loadProfessores().catch(e => console.warn('[transacoes] loadProfessores failed', e));
            await this.loadAlunos().catch(e => console.warn('[transacoes] loadAlunos failed', e));
            await this.loadVantagens().catch(e => console.warn('[transacoes] loadVantagens failed', e));

            this.renderTransacoes();
            this.populateSelects();
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            if (window.Swal) {
                Swal.fire('Erro', 'Erro ao carregar dados do sistema: ' + error.message, 'error');
            } else {
                alert('Erro ao carregar dados do sistema: ' + error.message);
            }
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
        } catch (error) {
            console.error('Erro ao carregar professores:', error);
            this.professores = [];
        }
    }

    async loadAlunos() {
        try {
            this.alunos = await appUtils.httpClient.get('/alunos');
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
        const professorSelect = document.getElementById('professorId');
        if (professorSelect) {
            professorSelect.innerHTML = '<option value="">Selecione um professor</option>';
            if (!this.professores || this.professores.length === 0) {
                professorSelect.innerHTML += '<option value="" disabled>Nenhum professor cadastrado</option>';
            } else {
                this.professores.forEach(professor => {
                    const saldo = (professor.saldoMoedas !== undefined && professor.saldoMoedas !== null) ? professor.saldoMoedas : 0;
                    professorSelect.innerHTML += `<option value="${professor.id}">${professor.nome} (${saldo} moedas)</option>`;
                });
            }
        }

        const alunoSelects = ['alunoId', 'alunoResgateId'];
        alunoSelects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (!select) return;
            select.innerHTML = '<option value="">Selecione um aluno</option>';
            if (!this.alunos || this.alunos.length === 0) {
                select.innerHTML += '<option value="" disabled>Nenhum aluno cadastrado</option>';
            } else {
                this.alunos.forEach(aluno => {
                    const saldo = (aluno.saldoMoedas !== undefined && aluno.saldoMoedas !== null) ? aluno.saldoMoedas : 0;
                    select.innerHTML += `<option value="${aluno.id}">${aluno.nome} (${saldo} moedas)</option>`;
                });
            }
        });
    }

    attachEventListeners() {
        const enviarMoedasBtn = document.getElementById('enviarMoedasBtn');
        if (enviarMoedasBtn) {
            enviarMoedasBtn.addEventListener('click', () => this.showEnviarMoedasModal());
        }

        const resgatarVantagemBtn = document.getElementById('resgatarVantagemBtn');
        if (resgatarVantagemBtn) {
            resgatarVantagemBtn.addEventListener('click', () => this.showResgatarVantagemModal());
        }

        const enviarMoedasForm = document.getElementById('enviarMoedasForm');
        if (enviarMoedasForm) {
            enviarMoedasForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleEnviarMoedas();
            });
        }

        const confirmarEnvioBtn = document.getElementById('confirmarEnvioBtn');
        if (confirmarEnvioBtn) {
            confirmarEnvioBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleEnviarMoedas();
            });
        }

        const confirmarResgateBtn = document.getElementById('confirmarResgateBtn');
        if (confirmarResgateBtn) {
            confirmarResgateBtn.addEventListener('click', () => this.handleResgatarVantagem());
        }

        const tipoFilterEl = document.getElementById('tipoFilter');
        if (tipoFilterEl) {
            tipoFilterEl.addEventListener('change', (e) => {
                this.tipoFilter = e.target.value;
                this.renderTransacoes();
            });
        }

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

        const container = document.getElementById('vantagensDisponiveis');
        if (container) container.innerHTML = '<div class="col-12"><p class="text-muted">Carregando vantagens...</p></div>';

        modal.show();

        setTimeout(() => {
            const alunoSelect = document.getElementById('alunoResgateId');
            const alunoId = alunoSelect ? alunoSelect.value : null;
            if (!alunoId) {
                if (container) container.innerHTML = '<div class="col-12"><p class="text-muted">Selecione um aluno primeiro</p></div>';
                return;
            }
            this.loadVantagens().then(() => {
                try {
                    this.loadVantagensDisponiveis();
                } catch (err) {
                    if (container) container.innerHTML = '<div class="col-12"><p class="text-muted">Erro ao carregar vantagens</p></div>';
                }
            }).catch(err => {
                if (container) container.innerHTML = '<div class="col-12"><p class="text-muted">Erro ao carregar vantagens</p></div>';
            });
        }, 150);
    }

    async handleEnviarMoedas() {
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
        
        // MUDANÇA: Adiciona SweetAlert de Loading
        Swal.fire({
            title: 'Processando Envio',
            text: 'Enviando moedas e disparando e-mails...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            await appUtils.httpClient.post('/transacoes/enviar-moedas', formData);
            
            Swal.close(); // Fecha o loading
            Swal.fire('Sucesso!', 'Moedas enviadas com sucesso!', 'success');
            
            bootstrap.Modal.getInstance(document.getElementById('enviarMoedasModal')).hide();
            this.loadData();
        } catch (error) {
            Swal.close(); // Fecha o loading
            Swal.fire('Erro!', 'Erro ao enviar moedas: ' + error.message, 'error');
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
        const vantagensAcessiveis = vantagensList.filter(v => (v.ativa === true || v.ativo === true) && (v.custoMoedas || v.custo || 0) <= (aluno.saldoMoedas || 0));

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

        this.vantagemSelecionada = null;
        if (confirmarBtn) confirmarBtn.disabled = true;

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
            Swal.fire('Atenção', 'Selecione uma vantagem', 'warning');
            return;
        }

        const formData = {
            alunoId: parseInt(document.getElementById('alunoResgateId').value),
            vantagemId: this.vantagemSelecionada
        };

        // MUDANÇA: Adiciona SweetAlert de Loading
        Swal.fire({
            title: 'Processando Resgate',
            text: 'Registrando seu cupom e enviando e-mails...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const resultado = await appUtils.httpClient.post('/transacoes/resgatar-vantagem', formData);
            
            Swal.close(); // Fecha o loading
            Swal.fire(
                'Vantagem Resgatada!',
                `Cupom: ${resultado.cupomCodigo}`,
                'success'
            );
            
            bootstrap.Modal.getInstance(document.getElementById('resgatarVantagemModal')).hide();
            this.loadData();
        } catch (error) {
            Swal.close(); // Fecha o loading
            Swal.fire('Erro!', 'Erro ao resgatar vantagem: ' + error.message, 'error');
        }
    }

    renderTransacoes() {
        const tbody = document.getElementById('transacoesTableBody');
        let transacoesFiltradas = this.transacoes;

        if (this.tipoFilter) {
            transacoesFiltradas = transacoesFiltradas.filter(t => (t.tipoTransacao || t.tipo) === this.tipoFilter);
        }

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

document.addEventListener('DOMContentLoaded', function() {
    window.transacoesManager = new TransacoesManager();
});