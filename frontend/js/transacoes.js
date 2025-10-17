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

    init() {
        this.loadData();
        this.attachEventListeners();
    }

    async loadData() {
        try {
            await Promise.all([
                this.loadTransacoes(),
                this.loadProfessores(),
                this.loadAlunos(),
                this.loadVantagens()
            ]);
            this.renderTransacoes();
            this.populateSelects();
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            showToast('Erro ao carregar dados do sistema', 'error');
        }
    }

    async loadTransacoes() {
        try {
            const response = await fetch('/api/transacoes');
            if (response.ok) {
                this.transacoes = await response.json();
            }
        } catch (error) {
            console.error('Erro ao carregar transações:', error);
        }
    }

    async loadProfessores() {
        try {
            const response = await fetch('/api/professores');
            if (response.ok) {
                this.professores = await response.json();
            }
        } catch (error) {
            console.error('Erro ao carregar professores:', error);
        }
    }

    async loadAlunos() {
        try {
            const response = await fetch('/api/alunos');
            if (response.ok) {
                this.alunos = await response.json();
            }
        } catch (error) {
            console.error('Erro ao carregar alunos:', error);
        }
    }

    async loadVantagens() {
        try {
            const response = await fetch('/api/vantagens');
            if (response.ok) {
                this.vantagens = await response.json();
            }
        } catch (error) {
            console.error('Erro ao carregar vantagens:', error);
        }
    }

    populateSelects() {
        // Populate professores select
        const professorSelect = document.getElementById('professorId');
        professorSelect.innerHTML = '<option value="">Selecione um professor</option>';
        this.professores.forEach(professor => {
            const option = document.createElement('option');
            option.value = professor.id;
            option.textContent = `${professor.nome} (${professor.saldoMoedas} moedas)`;
            professorSelect.appendChild(option);
        });

        // Populate alunos selects
        const alunoSelects = ['alunoId', 'alunoResgateId'];
        alunoSelects.forEach(selectId => {
            const select = document.getElementById(selectId);
            select.innerHTML = '<option value="">Selecione um aluno</option>';
            this.alunos.forEach(aluno => {
                const option = document.createElement('option');
                option.value = aluno.id;
                option.textContent = `${aluno.nome} (${aluno.saldoMoedas} moedas)`;
                select.appendChild(option);
            });
        });
    }

    attachEventListeners() {
        // Modal buttons
        document.getElementById('enviarMoedasBtn').addEventListener('click', () => {
            this.showEnviarMoedasModal();
        });

        document.getElementById('resgatarVantagemBtn').addEventListener('click', () => {
            this.showResgatarVantagemModal();
        });

        // Forms
        document.getElementById('enviarMoedasForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleEnviarMoedas();
        });

        document.getElementById('confirmarResgateBtn').addEventListener('click', () => {
            this.handleResgatarVantagem();
        });

        // Filters
        document.getElementById('tipoFilter').addEventListener('change', (e) => {
            this.tipoFilter = e.target.value;
            this.renderTransacoes();
        });

        // Filter buttons
        document.querySelectorAll('[data-filter]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.filtroAtivo = e.target.dataset.filter;
                this.renderTransacoes();
            });
        });

        // Aluno change for resgate
        document.getElementById('alunoResgateId').addEventListener('change', () => {
            this.loadVantagensDisponiveis();
        });
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
        const formData = {
            professorId: parseInt(document.getElementById('professorId').value),
            alunoId: parseInt(document.getElementById('alunoId').value),
            valor: parseInt(document.getElementById('valorMoedas').value),
            motivo: document.getElementById('motivoEnvio').value
        };

        try {
            const response = await fetch('/api/transacoes/enviar-moedas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const transacao = await response.json();
                showToast('Moedas enviadas com sucesso!', 'success');
                bootstrap.Modal.getInstance(document.getElementById('enviarMoedasModal')).hide();
                this.loadData();
            } else {
                const error = await response.text();
                showToast(`Erro: ${error}`, 'error');
            }
        } catch (error) {
            console.error('Erro ao enviar moedas:', error);
            showToast('Erro ao enviar moedas', 'error');
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
            const response = await fetch('/api/transacoes/resgatar-vantagem', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const resultado = await response.json();
                showToast(`Vantagem resgatada! Cupom: ${resultado.cupomCodigo}`, 'success');
                bootstrap.Modal.getInstance(document.getElementById('resgatarVantagemModal')).hide();
                this.loadData();
            } else {
                const error = await response.text();
                showToast(`Erro: ${error}`, 'error');
            }
        } catch (error) {
            console.error('Erro ao resgatar vantagem:', error);
            showToast('Erro ao resgatar vantagem', 'error');
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