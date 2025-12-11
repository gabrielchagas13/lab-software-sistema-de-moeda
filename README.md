# 🚀 Sistema de Moeda Estudantil (Lab03)

## 📘 Visão Geral

O **Sistema de Moeda Estudantil** é uma aplicação web full-stack desenvolvida para gerenciar moedas virtuais utilizadas por alunos, professores, empresas e instituições parceiras.  
Ele permite cadastro e gerenciamento de usuários, transações de moedas entre usuários, resgate de vantagens e cupons, além da visualização de saldo e histórico de transações.  

O projeto foi totalmente dockerizado, permitindo subir todo o ambiente com um único comando (`docker compose up`). Além disso, pode ser deployado em múltiplas plataformas, como **Vercel**, **Render** e **Neon**, garantindo escalabilidade e alta disponibilidade.  

🎥 [Vídeo demonstrativo do sistema](https://www.youtube.com/watch?v=SAH3_JxjsGQ)

---

## 🧱 Arquitetura do Sistema

A aplicação segue o padrão **MVC (Model-View-Controller)** e está organizada da seguinte forma:

```

lab-software-sistema-de-moeda/
│
├─ backend/               # API REST e controllers Spring MVC
│  ├─ src/main/java/...
│  ├─ src/main/resources/application.properties
│
├─ frontend/              # Frontend organizado
│  ├─ pages/              # Páginas HTML e templates
│  ├─ styles/             # Arquivos CSS
│  └─ services/           # Scripts JavaScript e consumo de API
│
├─ docker-compose.yml
└─ README.md

````

O sistema é composto por 3 containers principais:

| Componente | Descrição | Porta Local |
|------------|-----------|------------|
| 🧩 Frontend | Páginas HTML servidas via Spring MVC, com `pages/`, `styles/` e `services/` separados | 3000 |
| ⚙️ Backend | API REST + Controllers MVC em Spring Boot 3 (Java 17) | 8080 |
| 🗄️ Banco de Dados | MySQL 8.0 com volume persistente (`db_data`) | 3307 → 3306 |

---

## ⚙️ Tecnologias Utilizadas

**Backend**  
- Java 17  
- Spring Boot 3.1.5  
- Spring Data JPA (Hibernate)  
- Spring Security (configuração básica de desenvolvimento)  
- MySQL 8.0  
- Maven  
- Lombok  
- Bean Validation (JSR-303)  

**Frontend**  
- HTML5 + CSS3 + JavaScript (ES6+)  
- Estrutura MVC modularizada: `pages/` (templates HTML), `styles/` (CSS), `services/` (JS)  
- Layout responsivo com Flexbox e Grid  
- Consumo de API REST via Fetch API  

**Infraestrutura**  
- Docker e Docker Compose  
- Volume persistente (`db_data`)  
- Rede interna Docker (`sistema-moeda-network`)  
- Deploy em Vercel (frontend), Render (backend) e Neon (banco)  

---

## 🧰 Execução do Projeto (via Docker)

### Pré-requisitos
- Docker Desktop (ou Docker Engine)  
- Docker Compose  

### Subir o ambiente completo
Na raiz do projeto (`lab-software-sistema-de-moeda/`):

```bash
docker compose up --build
````

Isso irá:

* Subir o backend Spring Boot (API e MVC)
* Servir páginas HTML do frontend via controllers
* Criar o banco MySQL com volume persistente (`db_data`)

### Acessar os serviços

| Serviço           | URL                                            |
| ----------------- | ---------------------------------------------- |
| 🌐 Frontend       | [http://localhost:3000](http://localhost:3000) |
| ⚙️ Backend (API)  | [http://localhost:8080](http://localhost:8080) |
| 🗄️ Banco (MySQL) | localhost:3307 (usuário: root / senha: root)   |

### Parar e remover containers

```bash
docker compose down
```

---

## ☁️ Deploy em Nuvem

### Vercel (Frontend)

* Conecte o repositório do frontend no [Vercel](https://vercel.com/)
* Configure a pasta `frontend/` como root do projeto
* Build automático com HTML/CSS/JS
* Fornece URL pública para acesso

### Render (Backend)

* Crie um serviço Web no [Render](https://render.com/)
* Conecte o repositório do backend
* Configure variável de ambiente `SPRING_PROFILES_ACTIVE=prod`
* Deploy automático via GitHub
* API REST disponível publicamente

### Neon (Banco de Dados)

* Crie uma instância no [Neon](https://neon.tech/)
* Configure usuário, senha e database
* Atualize `application.properties` do backend com as credenciais do Neon
* Banco totalmente gerenciado e escalável

---

## 🧠 Notas Técnicas

* `spring.jpa.hibernate.ddl-auto=create-drop` está configurado para desenvolvimento, recriando o schema a cada execução
* O volume Docker (`db_data`) mantém os dados mesmo após terminar os containers
* Senha gerada pelo Spring Security é temporária e aparece no log do backend
* Frontend e backend se comunicam via rede interna Docker (`sistema-moeda-network`)
* Estrutura MVC modularizada (`pages`, `services`, `styles`) facilita manutenção e escalabilidade

---

## 💡 Recomendações

* Para produção, alterar `ddl-auto` para `update` ou `none`
* Configurar Spring Security com autenticação real e JWT
* Utilizar HTTPS em produção (via Nginx ou proxy reverso)
* Considerar CI/CD com GitHub Actions ou pipelines da Render/Vercel
* Documentar endpoints da API com Swagger/OpenAPI

---

## 🎯 Conclusão

O **Sistema de Moeda Estudantil** fornece uma solução completa para gerenciar moedas estudantis, integrando backend robusto, frontend modularizado e infraestrutura dockerizada.
Com suporte a deploy em nuvem e arquitetura MVC clara, o projeto está pronto para testes, desenvolvimento e produção.
