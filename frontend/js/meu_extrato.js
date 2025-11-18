class MeuExtratoManager {
    constructor() {
        this.usuarioId = null;
        this.tipoUsuario = null;
        this.transacoes = [];
        this.saldo = 0; 
        
        this.init();
    }

    async init() {
        const profile = JSON.parse(localStorage.getItem('userProfile'));
        if (!profile) {
            window.location.href = 'login.html';
            return;
        }

        this.usuarioId = profile.id; 
        this.tipoUsuario = profile.tipoUsuario;

        await this.loadData();
    }

    async loadData() {
        const loadingIndicator = document.getElementById('loadingIndicator');
        const tableBody = document.getElementById('extratoTableBody');
        
        if (loadingIndicator) loadingIndicator.classList.remove('d-none');
        if (tableBody) tableBody.innerHTML = '';

        try {
            await this.loadSaldo();

            this.transacoes = await appUtils.httpClient.get(`/transacoes/extrato/usuario/${this.usuarioId}`);
            
            this.transacoes.sort((a, b) => new Date(b.dataTransacao) - new Date(a.dataTransacao));

            this.renderExtrato();
            this.calculateTotals();

        } catch (error) {
            if (window.Swal) Swal.fire('Erro', 'Não foi possível carregar seu extrato.', 'error');
            if (tableBody) tableBody.innerHTML = '<tr><td colspan="4" class="text-center text-danger p-4">Erro ao carregar dados.</td></tr>';
        } finally {
            if (loadingIndicator) loadingIndicator.classList.add('d-none');
        }
    }
    
    calculateTotals() {
        let totalEntradas = 0;
        let totalSaidas = 0;

        this.transacoes.forEach(tx => {
            // MUDANÇA: Lógica explícita para definir o que é saída
            let isSaida = false;

            if (tx.tipoTransacao === 'RESGATE_VANTAGEM') {
                isSaida = true; // Resgate é sempre saída
            } else if (tx.remetenteId == this.usuarioId) { // Usa == para evitar erro de tipo (string/int)
                isSaida = true;
            }

            if (tx.valor > 0) {
                if (isSaida) {
                    totalSaidas += tx.valor;
                } else {
                    totalEntradas += tx.valor;
                }
            }
        });

        if (this.tipoUsuario === 'PROFESSOR') {
            totalEntradas = this.saldo + totalSaidas;
        }

        const entradasEl = document.getElementById('total-entradas');
        const saidasEl = document.getElementById('total-saidas');
        
        if (entradasEl) entradasEl.textContent = `+${appUtils.formatCurrency(totalEntradas)}`;
        if (saidasEl) saidasEl.textContent = `-${appUtils.formatCurrency(totalSaidas)}`;
    }

    async loadSaldo() {
        const saldoDisplay = document.getElementById('saldo-display');
        if (!saldoDisplay) return;

        try {
            let dadosUsuario;
            
            if (this.tipoUsuario === 'ALUNO') {
                dadosUsuario = await appUtils.httpClient.get(`/alunos/por-usuario/${this.usuarioId}`);
            } else if (this.tipoUsuario === 'PROFESSOR') {
                const todos = await appUtils.httpClient.get('/professores');
                dadosUsuario = todos.find(p => p.usuarioId === this.usuarioId);
            }

            if (dadosUsuario) {
                this.saldo = dadosUsuario.saldoMoedas || 0;
                saldoDisplay.textContent = appUtils.formatCurrency(this.saldo);
            }
        } catch (error) {
            console.warn("Erro ao carregar saldo:", error);
            saldoDisplay.textContent = "-";
        }
    }

    renderExtrato() {
        const tableBody = document.getElementById('extratoTableBody');
        if (!tableBody) return;

        if (this.transacoes.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" class="text-center text-muted p-5">Nenhuma movimentação encontrada.</td></tr>';
            return;
        }

        tableBody.innerHTML = this.transacoes.map(tx => {
            const dataFormatada = appUtils.formatDate(tx.dataTransacao);
            
            let valorFormatado = '';
            let tipoHtml = '';
            let descFinal = '';
            let rowClass = '';


            if (tx.tipoTransacao === 'RESGATE_VANTAGEM') {
                tipoHtml = '<span class="badge bg-warning text-dark">Resgate</span>';
                descFinal = `${tx.vantagemNome} (${tx.empresaNome || 'Empresa'})`;
                rowClass = 'text-danger';
                valorFormatado = `-${appUtils.formatCurrency(tx.valor)}`;
            } 
            else if (tx.tipoTransacao === 'ENVIO_MOEDA') {

                if (tx.remetenteId == this.usuarioId) {
                    tipoHtml = '<span class="badge bg-danger">Envio</span>';
                    descFinal = `Para: ${tx.destinatarioNome || 'Aluno'}`;
                    rowClass = 'text-danger';
                    valorFormatado = `-${appUtils.formatCurrency(tx.valor)}`;
                } else {
                    tipoHtml = '<span class="badge bg-success">Recebido</span>';
                    descFinal = `De: ${tx.remetenteNome || 'Professor'}`;
                    rowClass = 'text-success';
                    valorFormatado = `+${appUtils.formatCurrency(tx.valor)}`;
                }
            }
            else if (tx.tipoTransacao === 'TROCA_VANTAGEM') {
                 if (tx.remetenteId == this.usuarioId) {
                     tipoHtml = '<span class="badge bg-secondary">Transferência</span>';
                     descFinal = `Cupom enviado para: ${tx.destinatarioNome}`;
                     valorFormatado = '0,00';
                     rowClass = 'text-muted';
                 } else {
                     tipoHtml = '<span class="badge bg-info text-dark">Recebido</span>';
                     descFinal = `Cupom recebido de: ${tx.remetenteNome}`;
                     valorFormatado = '0,00';
                     rowClass = 'text-muted';
                 }
            }
            else {
                tipoHtml = '<span class="badge bg-success">Depósito</span>';
                descFinal = tx.remetenteNome ? `De: ${tx.remetenteNome}` : (tx.descricao || 'Crédito');
                rowClass = 'text-success';
                valorFormatado = `+${appUtils.formatCurrency(tx.valor)}`;
            }

            return `
                <tr>
                    <td class="ps-4 text-muted small">${dataFormatada}</td>
                    <td>${tipoHtml}</td>
                    <td>${descFinal}</td>
                    <td class="text-end pe-4 fw-bold ${rowClass}">${valorFormatado}</td>
                </tr>
            `;
        }).join('');
    }
}

window.meuExtratoManager = new MeuExtratoManager();