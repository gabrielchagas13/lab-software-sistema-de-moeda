class MinhasVantagensManager {
    constructor() {
        this.usuarioId = null;
        this.empresaId = null;
        this.vantagens = [];
        this.currentEditId = null;
        this.modalInstance = null;
        
        this.init();
    }

    async init() {
        const profile = JSON.parse(localStorage.getItem('userProfile'));
        if (!profile) {
            window.location.href = 'login.html';
            return;
        }

        if (profile.tipoUsuario !== 'EMPRESA') {
            Swal.fire('Acesso Negado', 'Área exclusiva para empresas.', 'error')
                .then(() => window.location.href = '../index.html');
            return;
        }

        this.usuarioId = profile.id;
        this.modalInstance = new bootstrap.Modal(document.getElementById('vantagemModal'));
        
        await this.loadEmpresaAndVantagens();
        this.attachEventListeners();
    }

    async loadEmpresaAndVantagens() {
        const loading = document.getElementById('loadingIndicator');
        loading.classList.remove('d-none');

        try {
            const todasEmpresas = await appUtils.httpClient.get('/empresas');
            const minhaEmpresa = todasEmpresas.find(e => e.usuarioId === this.usuarioId);

            if (!minhaEmpresa) {
                throw new Error("Perfil de empresa não encontrado.");
            }

            this.empresaId = minhaEmpresa.id;

            const todasVantagens = await appUtils.httpClient.get('/vantagens');
            this.vantagens = todasVantagens.filter(v => v.empresaId === this.empresaId); 

            this.renderGrid();

        } catch (error) {
            console.error(error);
            Swal.fire('Erro', 'Falha ao carregar dados: ' + error.message, 'error');
        } finally {
            loading.classList.add('d-none');
        }
    }

    renderGrid(filterType = 'all', searchTerm = '') {
        const grid = document.getElementById('vantagensGrid');
        grid.innerHTML = '';

        let filtered = this.vantagens;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(v => 
                v.nome.toLowerCase().includes(term) || 
                v.descricao.toLowerCase().includes(term)
            );
        }

        if (filterType === 'active') filtered = filtered.filter(v => v.ativa);
        if (filterType === 'inactive') filtered = filtered.filter(v => !v.ativa);

        if (filtered.length === 0) {
            grid.innerHTML = '<div class="col-12 text-center text-muted p-5">Nenhuma vantagem encontrada.</div>';
            return;
        }

        grid.innerHTML = filtered.map(v => `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card h-100 shadow-sm">
                    ${v.fotoUrl ? `
                        <img src="${v.fotoUrl}" class="card-img-top" alt="${v.nome}" 
                             style="height: 200px; object-fit: cover;"
                             onerror="this.src='https://via.placeholder.com/300x200?text=Sem+Imagem'">
                    ` : `
                        <div class="card-img-top bg-light d-flex align-items-center justify-content-center" 
                             style="height: 200px;">
                            <i class="fas fa-gift fa-3x text-muted"></i>
                        </div>
                    `}
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${v.nome}</h5>
                        <p class="card-text flex-grow-1 text-muted small">${v.descricao.substring(0, 100)}${v.descricao.length > 100 ? '...' : ''}</p>
                        
                        <div class="mt-auto">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <span class="badge bg-primary fs-6">
                                    <i class="fas fa-coins me-1"></i>
                                    ${appUtils.formatCurrency(v.custoMoedas)}
                                </span>
                                <span class="badge bg-${v.ativa ? 'success' : 'danger'}">
                                    ${v.ativa ? 'Ativa' : 'Inativa'}
                                </span>
                            </div>

                            <div class="btn-group w-100" role="group">
                                <button class="btn btn-sm btn-outline-primary" 
                                        onclick="minhasVantagensManager.openEdit(${v.id})"
                                        title="Editar">
                                    <i class="fas fa-edit"></i>
                                </button>
                                
                                <button class="btn btn-sm btn-outline-${v.ativa ? 'warning' : 'success'}" 
                                        onclick="minhasVantagensManager.toggleStatus(${v.id}, ${v.ativa})"
                                        title="${v.ativa ? 'Desativar' : 'Ativar'}">
                                    <i class="fas fa-${v.ativa ? 'pause' : 'play'}"></i>
                                </button>
                                
                                <button class="btn btn-sm btn-outline-danger" 
                                        onclick="minhasVantagensManager.deleteVantagem(${v.id})"
                                        title="Excluir">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    attachEventListeners() {
        document.getElementById('newVantagemBtn').addEventListener('click', () => this.openNew());
        
        document.getElementById('vantagemForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveVantagem();
        });

        // Listener para upload de arquivo
        document.getElementById('fotoInput').addEventListener('change', (e) => {
            this.handleFileSelect(e);
        });

        // Listener para remover foto
        document.getElementById('removeFotoBtn').addEventListener('click', () => {
            this.clearFotoPreview();
        });

        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.renderGrid('all', e.target.value);
        });

        document.querySelectorAll('[data-filter]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.renderGrid(e.target.dataset.filter, document.getElementById('searchInput').value);
            });
        });
    }

    // Lógica de conversão de arquivo para Base64
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        const maxSize = 10 * 1024 * 1024; 
        
        if (file.size > maxSize) {
            Swal.fire('Erro', 'A imagem é muito grande. O limite é 10MB.', 'error');
            event.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const base64String = e.target.result;
            document.getElementById('fotoBase64').value = base64String;
            
            // Mostra preview
            const previewContainer = document.getElementById('previewContainer');
            const previewImg = document.getElementById('fotoPreview');
            previewImg.src = base64String;
            previewContainer.classList.remove('d-none');
        };
        reader.readAsDataURL(file);
    }

    clearFotoPreview() {
        document.getElementById('fotoInput').value = '';
        document.getElementById('fotoBase64').value = '';
        document.getElementById('previewContainer').classList.add('d-none');
        document.getElementById('fotoPreview').src = '';
    }

    openNew() {
        this.currentEditId = null;
        document.getElementById('vantagemForm').reset();
        this.clearFotoPreview(); 
        document.getElementById('modalTitle').textContent = 'Nova Vantagem';
        document.getElementById('ativa').checked = true;
        this.modalInstance.show();
    }

    openEdit(id) {
        const v = this.vantagens.find(item => item.id === id);
        if (!v) return;

        this.currentEditId = id;
        document.getElementById('modalTitle').textContent = 'Editar Vantagem';
        document.getElementById('nome').value = v.nome;
        document.getElementById('custoMoedas').value = v.custoMoedas;
        document.getElementById('descricao').value = v.descricao;
        document.getElementById('ativa').checked = v.ativa;
        
        if (v.fotoUrl) {
            document.getElementById('fotoBase64').value = v.fotoUrl;
            const previewContainer = document.getElementById('previewContainer');
            const previewImg = document.getElementById('fotoPreview');
            previewImg.src = v.fotoUrl;
            previewContainer.classList.remove('d-none');
        } else {
            this.clearFotoPreview();
        }

        this.modalInstance.show();
    }

    async toggleStatus(id, currentStatus) {
        try {
            const action = currentStatus ? 'desativar' : 'ativar';
            const endpoint = `/vantagens/${id}/${action}`;
            
            await appUtils.httpClient.post(endpoint);
            
            const title = currentStatus ? 'Desativada!' : 'Ativada!';
            const text = currentStatus ? 'A vantagem foi desativada com sucesso.' : 'A vantagem foi ativada com sucesso.';
            
            Swal.fire({
                icon: 'success',
                title: title,
                text: text,
                timer: 1500,
                showConfirmButton: false
            });
            
            await this.loadEmpresaAndVantagens(); 
        } catch (error) {
            Swal.fire('Erro', 'Erro ao alterar status: ' + error.message, 'error');
        }
    }

    async saveVantagem() {
        const payload = {
            empresaId: this.empresaId, 
            nome: document.getElementById('nome').value,
            custoMoedas: parseFloat(document.getElementById('custoMoedas').value),
            // Agora enviamos o Base64 em vez de URL
            fotoUrl: document.getElementById('fotoBase64').value, 
            descricao: document.getElementById('descricao').value,
            ativa: document.getElementById('ativa').checked
        };

        const btn = document.getElementById('saveVantagemBtn');
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';

        try {
            if (this.currentEditId) {
                await appUtils.httpClient.put(`/vantagens/${this.currentEditId}`, payload);
            } else {
                await appUtils.httpClient.post('/vantagens', payload);
            }

            Swal.fire({
                icon: 'success',
                title: 'Sucesso!',
                text: 'Vantagem salva com sucesso!',
                timer: 1500,
                showConfirmButton: false
            });

            this.modalInstance.hide();
            await this.loadEmpresaAndVantagens(); 

        } catch (error) {
            Swal.fire('Erro', error.message, 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }

    async deleteVantagem(id) {
        const result = await Swal.fire({
            title: 'Tem certeza?',
            text: "Não será possível reverter isso!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sim, excluir!',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await appUtils.httpClient.delete(`/vantagens/${id}`);
                Swal.fire(
                    'Excluído!',
                    'A vantagem foi removida.',
                    'success'
                );
                await this.loadEmpresaAndVantagens();
            } catch (error) {
                Swal.fire('Erro', error.message, 'error');
            }
        }
    }
}

window.minhasVantagensManager = new MinhasVantagensManager();