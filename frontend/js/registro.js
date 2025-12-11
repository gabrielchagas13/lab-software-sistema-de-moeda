document.addEventListener("DOMContentLoaded", () => {
    
    const API_URL = "http://localhost:8080/api";

    const alunoFields = document.getElementById("form-aluno-fields");
    const professorFields = document.getElementById("form-professor-fields");
    const empresaFields = document.getElementById("form-empresa-fields");
    
    const registerForm = document.getElementById("register-form");
    const userTypeSelector = document.getElementById("user-type-selector");

    // --- 1. MÁSCARAS ---
    const maskOptions = { lazy: false };
    let alunoCpfMask, professorCpfMask, empresaCnpjMask, empresaTelefoneMask, alunoRgMask;

    if (typeof IMask !== 'undefined') {
        const elAlunoCpf = document.getElementById('alunoCpf');
        const elProfCpf = document.getElementById('professorCpf');
        const elEmpresaCnpj = document.getElementById('empresaCnpj');
        const elEmpresaTel = document.getElementById('empresaTelefone');
        const elAlunoRg = document.getElementById('alunoRg');

        if(elAlunoCpf) alunoCpfMask = IMask(elAlunoCpf, { mask: '000.000.000-00', ...maskOptions });
        if(elProfCpf) professorCpfMask = IMask(elProfCpf, { mask: '000.000.000-00', ...maskOptions });
        if(elEmpresaCnpj) empresaCnpjMask = IMask(elEmpresaCnpj, { mask: '00.000.000/0000-00', ...maskOptions });
        if(elEmpresaTel) empresaTelefoneMask = IMask(elEmpresaTel, { mask: '(00) 00000-0000', ...maskOptions });
        if(elAlunoRg) alunoRgMask = IMask(elAlunoRg, { mask: /^[0-9.-]+[xX0-9]?$/ });
    } else {
        console.error("IMask não carregou.");
    }
    
    // --- 2. VALIDADORES ---
    const Validators = {
        isCPF: (cpf) => {
            // Limpa para fazer a conta matemática
            cpf = cpf.replace(/[^\d]+/g, '');
            if (cpf === '') return false;
            if (cpf.length !== 11) return false;
            if (/^(\d)\1+$/.test(cpf)) return false;

            let soma = 0, resto;
            for (let i = 1; i <= 9; i++) 
                soma = soma + parseInt(cpf.substring(i-1, i)) * (11 - i);
            resto = (soma * 10) % 11;
            if ((resto === 10) || (resto === 11)) resto = 0;
            if (resto !== parseInt(cpf.substring(9, 10))) return false;

            soma = 0;
            for (let i = 1; i <= 10; i++) 
                soma = soma + parseInt(cpf.substring(i-1, i)) * (12 - i);
            resto = (soma * 10) % 11;
            if ((resto === 10) || (resto === 11)) resto = 0;
            if (resto !== parseInt(cpf.substring(10, 11))) return false;

            return true;
        },

        isCNPJ: (cnpj) => {
            cnpj = cnpj.replace(/[^\d]+/g, '');
            if (cnpj == '') return false;
            if (cnpj.length != 14) return false;
            if (/^(\d)\1+$/.test(cnpj)) return false;
        
            let tamanho = cnpj.length - 2;
            let numeros = cnpj.substring(0, tamanho);
            let digitos = cnpj.substring(tamanho);
            let soma = 0;
            let pos = tamanho - 7;
            for (let i = tamanho; i >= 1; i--) {
                soma += numeros.charAt(tamanho - i) * pos--;
                if (pos < 2) pos = 9;
            }
            let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
            if (resultado != digitos.charAt(0)) return false;
        
            tamanho = tamanho + 1;
            numeros = cnpj.substring(0, tamanho);
            soma = 0;
            pos = tamanho - 7;
            for (let i = tamanho; i >= 1; i--) {
                soma += numeros.charAt(tamanho - i) * pos--;
                if (pos < 2) pos = 9;
            }
            resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
            if (resultado != digitos.charAt(1)) return false;
        
            return true;
        },

        isRG: (rg) => {
            const limpo = rg.replace(/[^a-zA-Z0-9]/g, '');
            return limpo.length >= 7;
        }
    };

    // --- 3. CARREGAR INSTITUIÇÕES ---
    async function loadInstituicoes() {
        try {
            const response = await fetch(`${API_URL}/instituicoes`); 
            if (!response.ok) throw new Error("Falha ao carregar instituições");
            const instituicoes = await response.json();
            const selectAluno = document.getElementById("alunoInstituicaoId");
            const selectProfessor = document.getElementById("professorInstituicaoId");
            
            if(selectAluno) selectAluno.innerHTML = '<option value="">Selecione uma instituição</option>';
            if(selectProfessor) selectProfessor.innerHTML = '<option value="">Selecione uma instituição</option>';

            instituicoes.forEach(inst => {
                const option = `<option value="${inst.id}">${inst.nome}</option>`;
                if(selectAluno) selectAluno.innerHTML += option;
                if(selectProfessor) selectProfessor.innerHTML += option;
            });
        } catch (error) {
            console.error(error);
        }
    }

    if(userTypeSelector) {
        userTypeSelector.addEventListener("change", (e) => {
            const selectedType = e.target.value;
            alunoFields.classList.add("d-none");
            professorFields.classList.add("d-none");
            empresaFields.classList.add("d-none");

            if (selectedType === "aluno") alunoFields.classList.remove("d-none");
            else if (selectedType === "professor") professorFields.classList.remove("d-none");
            else if (selectedType === "empresa") empresaFields.classList.remove("d-none");
        });
    }

    // --- 4. SUBMIT ---
    if(registerForm) {
        registerForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            
            const selectedType = document.querySelector('input[name="userType"]:checked').value;
            const nome = document.getElementById("nome").value;
            const email = document.getElementById("email").value;
            const senha = document.getElementById("senha").value;

            let payload = { nome, email, senha };
            let endpoint = "";

            try {
                if (selectedType === "aluno") {
                    const cpfValue = alunoCpfMask ? alunoCpfMask.value : document.getElementById('alunoCpf').value;
                    const rgValue = document.getElementById('alunoRg').value;

                    if (!Validators.isCPF(cpfValue)) throw new Error("CPF do aluno inválido.");
                    if (!Validators.isRG(rgValue)) throw new Error("RG inválido (Mínimo 7 caracteres).");

                    endpoint = `${API_URL}/alunos`;
                    payload = {
                        ...payload,
                        cpf: cpfValue, 
                        rg: rgValue,
                        instituicaoId: document.getElementById("alunoInstituicaoId").value,
                        curso: document.getElementById("alunoCurso").value,
                        endereco: document.getElementById("alunoEndereco").value
                    };
                } else if (selectedType === "professor") {
                    const cpfValue = professorCpfMask ? professorCpfMask.value : document.getElementById('professorCpf').value;

                    if (!Validators.isCPF(cpfValue)) throw new Error("CPF do professor inválido.");

                    endpoint = `${API_URL}/professores`;
                    payload = {
                        ...payload,
                        cpf: cpfValue, 
                        departamento: document.getElementById("professorDepartamento").value,
                        instituicaoId: document.getElementById("professorInstituicaoId").value
                    };
                } else if (selectedType === "empresa") {
                    endpoint = `${API_URL}/empresas`;
                    // MUDANÇA: .value (formatado)
                    const cnpjValue = empresaCnpjMask ? empresaCnpjMask.value : document.getElementById('empresaCnpj').value;
                    const telValue = empresaTelefoneMask ? empresaTelefoneMask.value : document.getElementById('empresaTelefone').value;
                    
                    if (!Validators.isCNPJ(cnpjValue)) {
                        throw new Error("CNPJ inválido. Verifique os dígitos.");
                    }

                    payload = {
                        ...payload,
                        cnpj: cnpjValue, 
                        nomeFantasia: document.getElementById("empresaNomeFantasia").value,
                        telefone: telValue, 
                        endereco: document.getElementById("empresaEndereco").value,
                        descricao: document.getElementById("empresaDescricao").value
                    };
                }

                const response = await fetch(endpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    let msg = "Falha ao cadastrar.";
                    if (errorData.errors && Array.isArray(errorData.errors)) {
                        msg = errorData.errors.map(e => e.defaultMessage).join("\n");
                    } else if (errorData.message) {
                        msg = errorData.message;
                    }
                    throw new Error(msg);
                }

                Swal.fire({
                    icon: 'success',
                    title: 'Cadastro realizado!',
                    text: 'Redirecionando...',
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    window.location.href = "login.html";
                });

            } catch (error) {
                Swal.fire({ icon: 'error', title: 'Atenção', text: error.message });
            }
        });
    }

    loadInstituicoes();
});