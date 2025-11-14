document.addEventListener("DOMContentLoaded", () => {
    
    const API_URL = "http://localhost:8080/api";

    const alunoFields = document.getElementById("form-aluno-fields");
    const professorFields = document.getElementById("form-professor-fields");
    const empresaFields = document.getElementById("form-empresa-fields");
    
    const registerForm = document.getElementById("register-form");
    const userTypeSelector = document.getElementById("user-type-selector");

    // --- MUDANÇA: INICIALIZAÇÃO DAS MÁSCARAS ---
    const maskOptions = {
        lazy: false // Faz a máscara aparecer no placeholder
    };
    
    // Máscaras de Aluno
    const alunoCpfMask = IMask(document.getElementById('alunoCpf'), { mask: '000.000.000-00', ...maskOptions });
    const alunoRgMask = IMask(document.getElementById('alunoRg'), { mask: '00.000.000', ...maskOptions });

    // Máscaras de Professor
    const professorCpfMask = IMask(document.getElementById('professorCpf'), { mask: '000.000.000-00', ...maskOptions });

    // Máscaras de Empresa
    const empresaCnpjMask = IMask(document.getElementById('empresaCnpj'), { mask: '00.000.000/0000-00', ...maskOptions });
    const empresaTelefoneMask = IMask(document.getElementById('empresaTelefone'), { mask: '(00) 00000-0000', ...maskOptions });
    // --- FIM DAS MÁSCARAS ---


    async function loadInstituicoes() {
        try {
            const response = await fetch(`${API_URL}/instituicoes`); 
            if (!response.ok) throw new Error("Falha ao carregar instituições");
            
            const instituicoes = await response.json();
            
            const selectAluno = document.getElementById("alunoInstituicaoId");
            const selectProfessor = document.getElementById("professorInstituicaoId");
            
            selectAluno.innerHTML = '<option value="">Selecione uma instituição</option>';
            selectProfessor.innerHTML = '<option value="">Selecione uma instituição</option>';

            instituicoes.forEach(inst => {
                const option = `<option value="${inst.id}">${inst.nome}</option>`;
                selectAluno.innerHTML += option;
                selectProfessor.innerHTML += option;
            });
            
        } catch (error) {
            console.error(error);
            Swal.fire('Erro', 'Não foi possível carregar a lista de instituições. Tente recarregar a página.', 'error');
        }
    }

    userTypeSelector.addEventListener("change", (e) => {
        const selectedType = e.target.value;

        alunoFields.classList.add("d-none");
        professorFields.classList.add("d-none");
        empresaFields.classList.add("d-none");

        if (selectedType === "aluno") {
            alunoFields.classList.remove("d-none");
        } else if (selectedType === "professor") {
            professorFields.classList.remove("d-none");
        } else if (selectedType === "empresa") {
            empresaFields.classList.remove("d-none");
        }
    });

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
                endpoint = `${API_URL}/alunos`;
                payload = {
                    ...payload,
                    // --- MUDANÇA: Usando .unmaskedValue para enviar só os números ---
                    cpf: alunoCpfMask.value,
                    rg: alunoRgMask.value,
                    instituicaoId: document.getElementById("alunoInstituicaoId").value,
                    curso: document.getElementById("alunoCurso").value,
                    endereco: document.getElementById("alunoEndereco").value
                };
            } else if (selectedType === "professor") {
                endpoint = `${API_URL}/professores`;
                payload = {
                    ...payload,
                    cpf: professorCpfMask.value,
                    departamento: document.getElementById("professorDepartamento").value,
                    instituicaoId: document.getElementById("professorInstituicaoId").value
                };
            } else if (selectedType === "empresa") {
                endpoint = `${API_URL}/empresas`;
                payload = {
                    ...payload,
                    cnpj: empresaCnpjMask.value,
                    nomeFantasia: document.getElementById("empresaNomeFantasia").value,
                    telefone: empresaTelefoneMask.value,
                    endereco: document.getElementById("empresaEndereco").value,
                    descricao: document.getElementById("empresaDescricao").value
                };
            }
            // --- FIM DAS MUDANÇAS ---

            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Falha ao cadastrar. Verifique os dados.");
            }

            Swal.fire({
                icon: 'success',
                title: 'Cadastro realizado!',
                text: 'Você será redirecionado para a tela de login.',
                timer: 2000,
                showConfirmButton: false
            }).then(() => {
                window.location.href = "login.html";
            });

        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Erro no Cadastro',
                text: error.message
            });
        }
    });

    loadInstituicoes();
});