document.addEventListener("DOMContentLoaded", () => {
    
    const loginForm = document.getElementById("login-form");
    
    // URL base da sua API
    const API_URL = "http://localhost:8080/api";

    loginForm.addEventListener("submit", async (event) => {
        
        event.preventDefault();
        
        const email = document.getElementById("email").value;
        const senha = document.getElementById("senha").value;

        try {
            const loginResponse = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    senha: senha
                })
            });

            if (!loginResponse.ok) {
                // A resposta de erro do backend será tratada no catch
                throw new Error("Email ou senha inválidos.");
            }

            const token = await loginResponse.text();
            localStorage.setItem("authToken", token);

            const profileResponse = await fetch(`${API_URL}/auth/me`, {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + token
                }
            });
            
            if (!profileResponse.ok) {
                 throw new Error("Não foi possível carregar os dados do usuário.");
            }
            
            const userProfile = await profileResponse.json();
            localStorage.setItem("userProfile", JSON.stringify(userProfile));
            
            // Alerta de sucesso com SweetAlert
            Swal.fire({
                icon: 'success',
                title: 'Login bem-sucedido!',
                text: `Bem-vindo, ${userProfile.nome}!`,
                timer: 2000,
                showConfirmButton: false
            }).then(() => {
                // Redireciona para a página principal
                window.location.href = "../index.html"; 
            });

        } catch (error) {
            // Alerta de erro com SweetAlert
            Swal.fire({
                icon: 'error',
                title: 'Falha no Login',
                text: error.message,
                confirmButtonColor: '#0d6efd'
            });
        }
    });
});