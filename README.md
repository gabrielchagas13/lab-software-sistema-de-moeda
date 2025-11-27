🚀 Sistema de Moeda Estudantil (Lab03)

📘 Visão Geral

O Sistema de Moeda Estudantil é uma aplicação web full-stack desenvolvida com o objetivo de gerenciar moedas virtuais utilizadas por alunos, professores, empresas e instituições parceiras.
O sistema permite o cadastro e a interação entre esses usuários, além de possibilitar transações de moedas e resgate de vantagens.

O projeto foi totalmente dockerizado, permitindo subir todo o ambiente com um único comando (docker compose up).

Vídeo do sistem:
https://www.youtube.com/watch?v=SAH3_JxjsGQ

🧱 Arquitetura do Sistema

A aplicação é composta por 3 containers Docker:

🧩 Frontend  	Interface web estática em HTML/CSS/JS, servida via Nginx	Porta Local: 3000
⚙️ Backend	 API REST construída em Spring Boot 3 (Java 17)	Porta Local: 8080
🗄️ Banco de Dados	 MySQL 8.0 com volume persistente (db_data)	Porta Local: 3307 → 3306

⚙️ Tecnologias Utilizadas

**Backend**

Java 17

Spring Boot 3.1.5

Spring Data JPA (Hibernate)

Spring Security (configuração básica de desenvolvimento)

MySQL 8.0

Maven

Lombok

Bean Validation (JSR-303)

**Frontend**

HTML5 + CSS3 + JavaScript (ES6+)

Fetch API para consumo da API REST

Layout responsivo com Flexbox e Grid

Servido via Nginx (Docker)

**Infraestrutura**

Docker e Docker Compose

Volume persistente (db_data)

Rede interna Docker (sistema-moeda-network)

**🧩 Entidades e Modelo de Dados
**

**🧰 Execução do Projeto (via Docker)
1️⃣ Pré-requisitos**

Certifique-se de ter instalado:

Docker Desktop (ou Docker Engine)

Docker Compose

**2️⃣ Subir o ambiente completo**

Na raiz do projeto (lab-software-sistema-de-moeda/):

docker compose up --build


Isso irá:

Construir a imagem do frontend (Nginx);

Subir o backend Spring Boot;

Criar o banco MySQL com volume persistente (db_data).

**3️⃣ Acessar os serviços**
**Serviço	URL**

🌐 Frontend	http://localhost:3000

⚙️ Backend (API)	http://localhost:8080

🗄️ Banco (MySQL)	localhost:3307 (usuário: root / senha: root)
4️⃣ Parar e remover containers

docker compose down





