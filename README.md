# Sistema de Moeda Estudantil - Lab03S02

## Implementações Realizadas

### ✅ Modelo ER Implementado
- **Usuario** (classe base): id, nome, email, senha, tipo_usuario, data_criacao, ativo
- **Aluno**: usuario_id, instituicao (texto), cpf, rg, endereco, curso, saldo_moedas, data_cadastro
- **Professor**: usuario_id, instituicao_id, departamento, saldo_moedas, data_cadastro
- **Empresa**: usuario_id, cnpj, nome_fantasia, telefone, endereco, descricao, data_cadastro
- **Instituicao**: nome, endereco, telefone, email, data_criacao, ativo
- **Vantagem**: empresa_id, nome, descricao, custo_moedas, foto, ativo, data_criacao
- **Transacao**: id, aluno_id, professor_id, empresa_id, vantagem_id, tipo, valor, descricao, data_transacao

### ✅ Estratégia de Acesso ao Banco de Dados
- **ORM**: JPA/Hibernate
- **Padrão Repository**: Spring Data JPA
- **Banco de Dados**: MySQL
- **Validações**: Bean Validation (JSR-303)

### ✅ CRUDs Implementados

#### CRUD de Aluno
**Backend:**
- ✅ Controller: `/api/alunos`
- ✅ Service: AlunoService com validações
- ✅ Repository: AlunoRepository com queries customizadas
- ✅ DTOs: AlunoRequestDTO e AlunoResponseDTO

**Frontend:**
- ✅ Página: `frontend/pages/alunos.html`
- ✅ JavaScript: `frontend/js/alunos.js`
- ✅ Funcionalidades: Cadastrar, Listar, Editar, Excluir, Buscar, Filtrar

#### CRUD de Empresa Parceira
**Backend:**
- ✅ Controller: `/api/empresas`
- ✅ Service: EmpresaService com validações
- ✅ Repository: EmpresaRepository com queries customizadas
- ✅ DTOs: EmpresaRequestDTO e EmpresaResponseDTO

**Frontend:**
- ✅ Página: `frontend/pages/empresas.html`
- ⚠️ JavaScript: `frontend/js/empresas.js` (pendente)

### ✅ Configurações do Projeto

#### Backend
- **Framework**: Spring Boot 3.1.5
- **Java**: 17
- **Build**: Maven
- **Banco**: MySQL (configurado)
- **Segurança**: Spring Security (temporariamente desabilitada para testes)
- **CORS**: Configurado para aceitar requisições do frontend

#### Frontend
- **HTML5**: Estrutura semântica
- **CSS3**: Grid Layout, Flexbox, Design responsivo
- **JavaScript**: ES6+, Async/Await, Classes
- **API**: Fetch API para comunicação REST

## 🚀 Como Executar

### 1. Configurar Banco MySQL
Siga as instruções em: `MYSQL_SETUP.md`

### 2. Executar Backend
```bash
cd backend
# Via VS Code: Abrir SistemaMoedaApplication.java e clicar em "Run"
# Ou via terminal (se Maven estiver instalado):
mvn spring-boot:run
```

### 3. Abrir Frontend
```bash
cd frontend
# Abrir index.html no navegador
# Ou usar Live Server no VS Code
```

## 📁 Estrutura do Projeto

```
lab-software-sistema-de-moeda/
├── backend/
│   ├── src/main/java/com/sistemamoeda/
│   │   ├── config/         # Configurações (CORS, Security)
│   │   ├── controller/     # REST Controllers
│   │   ├── dto/           # Data Transfer Objects
│   │   ├── model/         # Entidades JPA
│   │   ├── repository/    # Repositories Spring Data
│   │   └── service/       # Regras de negócio
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
├── frontend/
│   ├── css/               # Estilos CSS
│   ├── js/                # Scripts JavaScript
│   ├── pages/             # Páginas HTML
│   └── index.html         # Página inicial
├── MYSQL_SETUP.md         # Instruções MySQL
└── README.md
```

## 🔄 Estado Atual

### ✅ Concluído
- Modelo ER completo
- Backend Spring Boot configurado
- CRUD Aluno (backend + frontend)
- CRUD Empresa (backend)
- Configuração MySQL
- CORS e Security configurados
- Interface responsiva

### ⚠️ Pendente
- JavaScript para CRUD de Empresas (`empresas.js`)
- Implementação de autenticação JWT
- Testes de integração frontend-backend

### 🎯 Próximos Passos
1. Completar frontend de empresas
2. Implementar autenticação
3. Adicionar validações avançadas
4. Implementar sistema de transações

## 🛠️ Tecnologias Utilizadas

**Backend:**
- Spring Boot, Spring Data JPA, Spring Security
- MySQL, Hibernate, Bean Validation
- Lombok, Maven

**Frontend:**
- HTML5, CSS3, JavaScript ES6+
- Fetch API, CSS Grid, Flexbox
- Design responsivo

## 📝 Observações Técnicas

1. **Campo Instituição**: Simplificado como campo de texto para facilitar cadastro
2. **Segurança**: Temporariamente desabilitada para facilitar testes
3. **CORS**: Configurado para desenvolvimento local
4. **Validações**: Implementadas tanto no frontend quanto backend
5. **Responsividade**: Interface adaptável para desktop e mobile