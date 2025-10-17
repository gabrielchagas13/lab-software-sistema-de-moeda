-- Script para inserir instituições de exemplo
-- Pode ser executado manualmente no MySQL Workbench ou similar

INSERT INTO instituicao (nome, endereco, telefone, email, data_criacao, ativo) VALUES
('Universidade Federal de Minas Gerais', 'Av. Antônio Carlos, 6627 - Pampulha, Belo Horizonte - MG', '(31) 3409-4000', 'reitoria@ufmg.br', NOW(), true),
('Universidade de São Paulo', 'Rua da Reitoria, 374 - Butantã, São Paulo - SP', '(11) 3091-3500', 'scs@usp.br', NOW(), true),
('Universidade Federal do Rio de Janeiro', 'Av. Pedro Calmon, 550 - Cidade Universitária, Rio de Janeiro - RJ', '(21) 3938-0100', 'reitoria@ufrj.br', NOW(), true),
('Universidade Estadual de Campinas', 'Cidade Universitária Zeferino Vaz, Campinas - SP', '(19) 3521-4000', 'reitoria@unicamp.br', NOW(), true),
('Pontifícia Universidade Católica do Rio de Janeiro', 'Rua Marquês de São Vicente, 225 - Gávea, Rio de Janeiro - RJ', '(21) 3527-1001', 'vice-reitoria@puc-rio.br', NOW(), true);