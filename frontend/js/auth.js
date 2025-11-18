// Este script roda em todas as páginas que precisam de login

document.addEventListener("DOMContentLoaded", () => {
    
    // --- INÍCIO DA CORREÇÃO DE CAMINHO ---
    // Detecta se estamos em uma subpasta (ex: /pages/)
    const isSubPage = window.location.pathname.includes("/pages/");
    
    // Define os prefixos corretos com base na localização
    const rootPrefix = isSubPage ? '../' : ''; // Para links que voltam à raiz (index.html)
    const pagesPrefix = isSubPage ? '' : 'pages/'; // Para links que vão para uma página (alunos.html)
    const loginRedirectPath = isSubPage ? 'login.html' : 'pages/login.html'; // Para onde redirecionar no logout/falha

    const userProfileString = localStorage.getItem("userProfile");
    const token = localStorage.getItem("authToken");

    // 1. CHECAGEM DE SEGURANÇA
    if (!token || !userProfileString) {
        window.location.href = loginRedirectPath; // <-- MUDANÇA
        return; 
    }

    // 2. Se está logado, preenche os dados
    const userProfile = JSON.parse(userProfileString);

    populateUserInfo(userProfile);
    buildSidebar(userProfile.tipoUsuario, rootPrefix, pagesPrefix); // <-- MUDANÇA
    setupLogout(loginRedirectPath); // <-- MUDANÇA
});

/**
 * Preenche o nome e o papel do usuário no rodapé da sidebar
 */
function populateUserInfo(profile) {
    document.getElementById("user-name").textContent = profile.nome;
    document.getElementById("user-role").textContent = profile.tipoUsuario;
}

/**
 * Adiciona o evento de clique no botão de logout
 */
function setupLogout(loginPath) { // <-- MUDANÇA
    document.getElementById("logout-btn").addEventListener("click", (e) => {
        e.preventDefault();
        
        localStorage.removeItem("authToken");
        localStorage.removeItem("userProfile");
        
        window.location.href = loginPath; // <-- MUDANÇA
    });
}

/**
 * Constrói dinamicamente os links da barra lateral baseado no papel do usuário
 */
function buildSidebar(role, rootPrefix, pagesPrefix) { // <-- MUDANÇA
    const navContainer = document.getElementById("sidebar-nav");
    if (!navContainer) return;

    let navHTML = "";
    
    const path = window.location.pathname;
    const currentPage = path.substring(path.lastIndexOf('/') + 1);

    const createNavLink = (href, icon, text) => {
        const isActive = currentPage === href.substring(href.lastIndexOf('/') + 1);
        const linkClass = isActive ? 'active' : 'text-white-50';
        
        // --- PEQUENA CORREÇÃO DE BUG ---
        // Faltava um '=' depois de 'class' no seu código original
        return `
            <li class="nav-item">
                <a class="nav-link ${linkClass}" href="${href}"> 
                    <i class="fas ${icon} me-2"></i>
                    ${text}
                </a>
            </li>
        `;
        // --- FIM DA CORREÇÃO DE BUG ---
    };

    if (role === 'ADMIN') {
        // --- INÍCIO DA CORREÇÃO DE CAMINHO ---
        navHTML = 
            createNavLink(`${rootPrefix}index.html`, "fa-home", "Dashboard") +
            createNavLink(`${pagesPrefix}alunos.html`, "fa-user-graduate", "Alunos") +
            createNavLink(`${pagesPrefix}professores.html`, "fa-chalkboard-teacher", "Professores") +
            createNavLink(`${pagesPrefix}empresas.html`, "fa-building", "Empresas") +
            createNavLink(`${pagesPrefix}vantagens.html`, "fa-gift", "Vantagens") +
            createNavLink(`${pagesPrefix}transacoes.html`, "fa-exchange-alt", "Transações") +
            createNavLink(`${pagesPrefix}sobre.html`, "fa-info-circle", "Sobre");
        // --- FIM DA CORREÇÃO DE CAMINHO ---
    } 
    
    else if (role === 'ALUNO') {
         navHTML = 
            createNavLink(`${rootPrefix}index.html`, "fa-home", "Dashboard") +
            createNavLink(`${pagesPrefix}vantagens_aluno.html`, "fa-gift", "Catálogo") +
            createNavLink(`${pagesPrefix}meu_extrato.html`, "fa-list-alt", "Meu Extrato") + 
            createNavLink(`${pagesPrefix}sobre.html`, "fa-info-circle", "Sobre");
    }
    
    // LÓGICA DO PROFESSOR
    else if (role === 'PROFESSOR') {
         navHTML = 
            createNavLink(`${rootPrefix}index.html`, "fa-home", "Dashboard") +
            createNavLink(`${pagesPrefix}enviar_moedas.html`, "fa-paper-plane", "Enviar Moedas") + 
            createNavLink(`${pagesPrefix}meu_extrato.html`, "fa-list-alt", "Meu Extrato") +
            createNavLink(`${pagesPrefix}sobre.html`, "fa-info-circle", "Sobre");
    }
    
    // LÓGICA DA EMPRESA (Gerenciar Vantagens)
    else if (role === 'EMPRESA') {
         navHTML = 
            createNavLink(`${rootPrefix}index.html`, "fa-home", "Dashboard") +
            createNavLink(`${pagesPrefix}vantagens.html`, "fa-gift", "Gerenciar Vantagens") +
            createNavLink(`${pagesPrefix}sobre.html`, "fa-info-circle", "Sobre");
    }

    else {
        navHTML = createNavLink(`${rootPrefix}index.html`, "fa-home", "Dashboard");
    }
    navContainer.innerHTML = navHTML;
}