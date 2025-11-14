class VantagensAlunoManager {
    constructor() {
        this.aluno = null;
        this.usuarioId = null;
        this.vantagens = [];
        this.meusCupons = []; 
        this.alunosParaTransferencia = []; 
        
        this.empresaFilter = '';
        this.filtroAtivo = 'all';
        
        this.vantagemSelecionada = null;
        this.cupomSelecionado = null; 
        
        this.resgateModalInstance = null;
        this.transferirModalInstance = null;

        this.init();
    }

    async init() {
        const profile = JSON.parse(localStorage.getItem('userProfile'));
        if (!profile) {
            Swal.fire({
                icon: 'error',
                title: 'Acesso Negado',
                text: 'Você precisa estar logado para ver esta página.',
                confirmButtonText: 'Ir para Login'
            }).then(() => {
                const isSubPage = window.location.pathname.includes("/pages/");
                window.location.href = isSubPage ? 'login.html' : 'pages/login.html';
            });
            return;
        }

        if (profile.tipoUsuario !== 'ALUNO') {
            Swal.fire('Acesso Negado', 'Esta página é exclusiva para Alunos.', 'error');
            return;
        }

        this.usuarioId = profile.id; 
        
        this.resgateModalInstance = new bootstrap.Modal(document.getElementById('resgateModal'));
        this.transferirModalInstance = new bootstrap.Modal(document.getElementById('transferirModal'));

        await this.loadData();
        await this.loadAlunosParaTransferencia(); 
        this.attachEventListeners();
    }

    async loadData() {
        const loadingIndicator = document.getElementById('loadingIndicator');
        loadingIndicator.classList.remove('d-none');
        
        try {
            this.aluno = await appUtils.httpClient.get(`/alunos/por-usuario/${this.usuarioId}`);
            this.saldo = this.aluno.saldoMoedas || 0;
            
            this.vantagens = await appUtils.httpClient.get('/vantagens');
            
            await this.loadMeusCupons();
            
            this.updateSaldoDisplay();
            this.populateEmpresaFilters();
            this.renderVantagens();
        } catch (error) {
            Swal.fire('Erro ao Carregar', 'Não foi possível carregar o catálogo: ' + error.message, 'error');
        } finally {
            loadingIndicator.classList.add('d-none');
        }
    }
    
    // MUDANÇA: Lógica de posse de cupom corrigida
    async loadMeusCupons() {
        if (!this.aluno || !this.aluno.usuarioId) return;
        
        try {
            const extrato = await appUtils.httpClient.get(`/transacoes/extrato/usuario/${this.aluno.usuarioId}`);
            
            // 1. Encontrar todos os cupons que o usuário *recebeu* (seja resgate ou troca)
            const cuponsRecebidos = extrato.filter(tx =>
                (tx.tipoTransacao === 'RESGATE_VANTAGEM' || tx.tipoTransacao === 'TROCA_VANTAGEM') &&
                tx.destinatarioId === this.aluno.usuarioId &&
                tx.codigoCupom
            );

            // 2. Encontrar todos os códigos de cupom que o usuário *enviou*
            const cuponsEnviados = new Set(
                extrato
                    .filter(tx => tx.tipoTransacao === 'TROCA_VANTAGEM' && tx.remetenteId === this.aluno.usuarioId && tx.codigoCupom)
                    .map(tx => tx.codigoCupom)
            );

            // 3. A lista final é: cupons recebidos MENOS cupons enviados
            this.meusCupons = cuponsRecebidos.filter(cupom => !cuponsEnviados.has(cupom.codigoCupom));
            
            this.renderMeusCupons();
        } catch (error) {
            console.error("Erro ao carregar meus cupons:", error);
            const cupomBody = document.getElementById('meusCuponsTableBody');
            if(cupomBody) cupomBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Erro ao carregar seus cupons.</td></tr>`;
        }
    }
    
    async loadAlunosParaTransferencia() {
        try {
            const allAlunos = await appUtils.httpClient.get('/alunos');
            this.alunosParaTransferencia = allAlunos.filter(a => a.id !== this.aluno.id);
            
            const select = document.getElementById('destinatarioSelect');
            select.innerHTML = '<option value="">Selecione um aluno...</option>';
            this.alunosParaTransferencia.forEach(a => {
                select.innerHTML += `<option value="${a.id}">${a.nome} (${a.email})</option>`;
            });
        } catch (error) {
            console.error("Erro ao carregar lista de alunos:", error);
            const select = document.getElementById('destinatarioSelect');
            select.innerHTML = '<option value="">Erro ao carregar alunos</option>';
        }
    }

    updateSaldoDisplay() {
        const saldoEl = document.getElementById('aluno-saldo');
        if (saldoEl) {
            saldoEl.textContent = appUtils.formatCurrency(this.saldo);
        }
    }

    populateEmpresaFilters() {
        const select = document.getElementById('empresaFilter');
        if (!select) return;
        const empresas = [...new Set(this.vantagens.map(v => v.empresaNome || 'N/A'))].sort();
        
        select.innerHTML = '<option value="">Todas as empresas</option>';
        empresas.forEach(nome => {
            if(nome !== 'N/A') {
                select.innerHTML += `<option value="${nome}">${nome}</option>`;
            }
        });
    }

    renderVantagens() {
        let vantagensFiltradas = this.getFilteredVantagens();
        const grid = document.getElementById('vantagensGrid');
        if (!grid) return;

        if (vantagensFiltradas.length === 0) {
            grid.innerHTML = '<div class="col-12"><p class="text-center text-muted p-4">Nenhuma vantagem encontrada com os filtros atuais.</p></div>';
            return;
        }

        grid.innerHTML = vantagensFiltradas.map(v => {
            const custo = v.custoMoedas || 0;
            const acessivel = custo <= this.saldo;
            const badgeClass = acessivel ? 'bg-success' : 'bg-danger';
            const buttonText = acessivel ? 'Resgatar' : 'Saldo Insuficiente';
            const buttonDisabled = !acessivel ? 'disabled' : '';
            const foto = v.fotoUrl || `https://placehold.co/300x200/0d6efd/white?text=${v.nome.split(' ').join('+')}`;
            const empresaNome = v.empresaNome || '';

            return `
                <div class="col-md-4 col-lg-3 mb-4">
                    <div class="card vantagem-card shadow-sm h-100 border-0" data-vantagem-id="${v.id}">
                        <img src="${foto}" 
                             class="card-img-top" alt="${v.nome}" style="height: 150px; object-fit: cover;">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">${v.nome}</h5>
                            <p class="card-text text-muted small">${v.descricao.substring(0, 50)}...</p>
                            <small class="text-primary fw-bold">${empresaNome}</small> 
                            <p class="mt-auto pt-2">
                                <span class="badge ${badgeClass} fs-6">${appUtils.formatCurrency(custo)} moedas</span>
                            </p>
                            <button class="btn btn-sm btn-outline-success mt-2 w-100" 
                                    onclick="vantagensAlunoManager.showConfirmModal(${v.id})" 
                                    ${buttonDisabled}>
                                ${buttonText}
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    renderMeusCupons() {
        const tableBody = document.getElementById('meusCuponsTableBody');
        if (!tableBody) return;

        if (this.meusCupons.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted p-3">Você ainda não resgatou nenhum cupom.</td></tr>';
            return;
        }

        tableBody.innerHTML = this.meusCupons.map(tx => `
            <tr>
                <td>${tx.vantagemNome || 'N/A'}</td>
                <td>${tx.empresaNome || 'N/A'}</td>
                <td><strong>${tx.codigoCupom}</strong></td>
                <td>${appUtils.formatDate(tx.dataTransacao)}</td>
                <td>
                    <button class="btn btn-sm btn-primary" 
                            onclick="vantagensAlunoManager.showTransferirModal('${tx.codigoCupom}', '${tx.vantagemNome}')">
                        <i class="fas fa-paper-plane me-1"></i> Transferir
                    </button>
                </td>
            </tr>
        `).join('');
    }

    getFilteredVantagens() {
        let filtered = this.vantagens.filter(v => v.ativa); 

        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        if (searchTerm) {
            filtered = filtered.filter(v => 
                v.nome.toLowerCase().includes(searchTerm) || 
                v.descricao.toLowerCase().includes(searchTerm) ||
                (v.empresaNome && v.empresaNome.toLowerCase().includes(searchTerm))
            );
        }

        const empresaFilter = document.getElementById('empresaFilter').value;
        if (empresaFilter) {
            filtered = filtered.filter(v => v.empresaNome === empresaFilter); 
        }

        switch (this.filtroAtivo) {
            case 'acessiveis':
                filtered = filtered.filter(v => (v.custoMoedas || 0) <= this.saldo);
                break;
            case 'mais-baratas':
                filtered.sort((a, b) => (a.custoMoedas || 0) - (b.custoMoedas || 0));
                break;
        }
        return filtered;
    }

    attachEventListeners() {
        document.getElementById('searchInput').addEventListener('input', () => this.renderVantagens());
        document.getElementById('empresaFilter').addEventListener('change', () => this.renderVantagens());

        document.querySelectorAll('[data-filter]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.filtroAtivo = e.target.dataset.filter;
                this.renderVantagens();
            });
        });

        document.getElementById('confirmarResgateBtn').addEventListener('click', () => this.handleResgatarVantagem());
        
        document.getElementById('confirmarTransferenciaBtn').addEventListener('click', () => this.handleTransferirVantagem());
    }

    showConfirmModal(vantagemId) {
        const vantagem = this.vantagens.find(v => v.id === vantagemId);
        if (!vantagem) return;
        
        this.vantagemSelecionada = vantagemId;
        
        document.getElementById('vantagem-nome-modal').textContent = vantagem.nome;
        document.getElementById('vantagem-custo-modal').textContent = appUtils.formatCurrency(vantagem.custoMoedas);
        document.getElementById('aluno-saldo-modal').textContent = appUtils.formatCurrency(this.saldo);

        const acessivel = (vantagem.custoMoedas || 0) <= this.saldo;
        const alertaEl = document.getElementById('alerta-saldo');
        if (alertaEl) {
            alertaEl.classList.remove('alert-warning', 'alert-success', 'alert-danger', 'alert-info');
            alertaEl.classList.add(acessivel ? 'alert-info' : 'alert-danger');
            
            const strongEl = alertaEl.querySelector('strong');
            if(strongEl) {
                strongEl.classList.remove('text-primary', 'text-danger');
                strongEl.classList.add(acessivel ? 'text-primary' : 'text-danger');
            }
        }

        const confirmarBtn = document.getElementById('confirmarResgateBtn');
        if (confirmarBtn) {
            confirmarBtn.disabled = !acessivel;
        }
        
        this.resgateModalInstance.show();
    }
    
    showTransferirModal(cupomCode, vantagemNome) {
        this.cupomSelecionado = cupomCode; 
        
        document.getElementById('cupom-info-modal').textContent = `Transferindo: ${vantagemNome} (Cupom: ${cupomCode})`;
        document.getElementById('destinatarioSelect').value = ''; 
        
        this.transferirModalInstance.show();
    }

    async handleResgatarVantagem() {
        if (!this.vantagemSelecionada) {
            Swal.fire('Atenção', 'Nenhuma vantagem selecionada.', 'warning');
            return;
        }

        const formData = {
            alunoId: this.aluno.id, 
            vantagemId: this.vantagemSelecionada
        };

        const confirmarBtn = document.getElementById('confirmarResgateBtn');
        const originalHtml = confirmarBtn.innerHTML;

        try {
            confirmarBtn.disabled = true;
            confirmarBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Resgatando...';

            const resultado = await appUtils.httpClient.post('/transacoes/resgatar-vantagem', formData);
            
            Swal.fire({
                icon: 'success',
                title: 'Resgate Concluído!',
                html: `Vantagem resgatada com sucesso! Seu cupom foi enviado por email.`,
                confirmButtonText: 'Entendi'
            });

            this.resgateModalInstance.hide();
            this.loadData(); 
        } catch (error) {
            Swal.fire('Erro no Resgate', error.message, 'error');
        } finally {
            confirmarBtn.disabled = false;
            confirmarBtn.innerHTML = originalHtml;
        }
    }
    
    async handleTransferirVantagem() {
        const destinatarioId = document.getElementById('destinatarioSelect').value;
        if (!destinatarioId) {
            Swal.fire('Erro', 'Selecione um aluno para quem transferir.', 'warning');
            return;
        }
        
        const payload = {
            codigoCupom: this.cupomSelecionado,
            remetenteId: this.aluno.id,
            destinatarioId: parseInt(destinatarioId)
        };
        
        const confirmarBtn = document.getElementById('confirmarTransferenciaBtn');
        const originalHtml = confirmarBtn.innerHTML;
        
        Swal.fire({
            title: 'Processando Transferência',
            text: 'Aguarde enquanto transferimos seu cupom...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            confirmarBtn.disabled = true;
            confirmarBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Transferindo...';
            
            await appUtils.httpClient.post('/transacoes/transferir-vantagem', payload);
            
            Swal.close();
            Swal.fire(
                'Sucesso!',
                'Cupom transferido com sucesso!',
                'success'
            );
            
            this.transferirModalInstance.hide();
            this.loadData(); 
            
        } catch (error) {
            Swal.close();
            Swal.fire('Erro na Transferência', error.message, 'error');
        } finally {
            confirmarBtn.disabled = false;
            confirmarBtn.innerHTML = originalHtml;
        }
    }
}

window.vantagensAlunoManager = new VantagensAlunoManager();