-- Script de Criação do Banco de Dados - Sistema de Moeda Estudantil
-- MySQL 8.0+

-- Criar database
CREATE DATABASE IF NOT EXISTS sistema_moeda CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sistema_moeda;

-- Tabela USUARIO (tabela base para autenticação)
CREATE TABLE usuario (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo_usuario ENUM('ALUNO', 'PROFESSOR', 'EMPRESA') NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ativo BOOLEAN DEFAULT TRUE,
    
    INDEX idx_usuario_email (email),
    INDEX idx_usuario_tipo (tipo_usuario)
);

-- Tabela INSTITUICAO
CREATE TABLE instituicao (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    endereco VARCHAR(255),
    telefone VARCHAR(20),
    email VARCHAR(150),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ativo BOOLEAN DEFAULT TRUE
);

-- Tabela ALUNO
CREATE TABLE aluno (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT UNIQUE NOT NULL,
    instituicao_id BIGINT NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    rg VARCHAR(15) NOT NULL,
    endereco VARCHAR(255) NOT NULL,
    curso VARCHAR(100) NOT NULL,
    saldo_moedas DECIMAL(10,2) DEFAULT 0.00,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE,
    FOREIGN KEY (instituicao_id) REFERENCES instituicao(id),
    INDEX idx_aluno_cpf (cpf),
    INDEX idx_aluno_instituicao (instituicao_id)
);

-- Tabela PROFESSOR
CREATE TABLE professor (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT UNIQUE NOT NULL,
    instituicao_id BIGINT NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    departamento VARCHAR(100) NOT NULL,
    saldo_moedas DECIMAL(10,2) DEFAULT 1000.00,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE,
    FOREIGN KEY (instituicao_id) REFERENCES instituicao(id),
    INDEX idx_professor_cpf (cpf),
    INDEX idx_professor_instituicao (instituicao_id)
);

-- Tabela EMPRESA
CREATE TABLE empresa (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT UNIQUE NOT NULL,
    nome_fantasia VARCHAR(150) NOT NULL,
    cnpj VARCHAR(18) UNIQUE NOT NULL,
    endereco VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    descricao TEXT,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE,
    INDEX idx_empresa_cnpj (cnpj)
);

-- Tabela VANTAGEM
CREATE TABLE vantagem (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    empresa_id BIGINT NOT NULL,
    nome VARCHAR(150) NOT NULL,
    descricao TEXT NOT NULL,
    custo_moedas DECIMAL(10,2) NOT NULL CHECK (custo_moedas > 0),
    foto_url VARCHAR(255),
    ativa BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (empresa_id) REFERENCES empresa(id) ON DELETE CASCADE,
    INDEX idx_vantagem_empresa (empresa_id),
    INDEX idx_vantagem_ativa (ativa)
);

-- Tabela TRANSACAO
CREATE TABLE transacao (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tipo_transacao ENUM('ENVIO_MOEDA', 'RESGATE_VANTAGEM', 'CREDITO_SEMESTRAL') NOT NULL,
    valor DECIMAL(10,2) NOT NULL CHECK (valor > 0),
    descricao TEXT,
    data_transacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    remetente_id BIGINT NULL, -- NULL para créditos semestrais
    destinatario_id BIGINT NULL, -- NULL para resgates
    vantagem_id BIGINT NULL, -- preenchido apenas para resgates
    codigo_cupom VARCHAR(50) NULL, -- gerado para resgates
    
    FOREIGN KEY (remetente_id) REFERENCES usuario(id),
    FOREIGN KEY (destinatario_id) REFERENCES usuario(id),
    FOREIGN KEY (vantagem_id) REFERENCES vantagem(id),
    
    INDEX idx_transacao_data (data_transacao),
    INDEX idx_transacao_tipo (tipo_transacao),
    INDEX idx_transacao_remetente (remetente_id),
    INDEX idx_transacao_destinatario (destinatario_id),
    INDEX idx_transacao_codigo_cupom (codigo_cupom)
);

-- Inserir dados iniciais das instituições
INSERT INTO instituicao (nome, endereco, telefone, email) VALUES
('Universidade Federal de Minas Gerais', 'Av. Presidente Antônio Carlos, 6627 - Pampulha, Belo Horizonte - MG', '(31) 3409-4000', 'reitoria@ufmg.br'),
('Pontifícia Universidade Católica de Minas Gerais', 'Av. Dom José Gaspar, 500 - Coração Eucarístico, Belo Horizonte - MG', '(31) 3319-4000', 'reitoria@pucminas.br'),
('Centro Federal de Educação Tecnológica de Minas Gerais', 'Av. Amazonas, 7675 - Nova Gameleira, Belo Horizonte - MG', '(31) 3319-7000', 'reitoria@cefetmg.br');

-- Criar usuário administrador do sistema
INSERT INTO usuario (nome, email, senha, tipo_usuario) VALUES
('Administrador do Sistema', 'admin@sistemamoeda.com', '$2a$10$XYZ...', 'PROFESSOR'); -- senha hasheada

COMMIT;