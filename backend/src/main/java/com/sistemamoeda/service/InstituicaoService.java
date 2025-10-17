package com.sistemamoeda.service;

import com.sistemamoeda.dto.InstituicaoRequestDTO;
import com.sistemamoeda.dto.InstituicaoResponseDTO;
import com.sistemamoeda.model.Instituicao;
import com.sistemamoeda.repository.InstituicaoRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class InstituicaoService {

    private final InstituicaoRepository instituicaoRepository;

    // Criar nova instituição
    public InstituicaoResponseDTO criarInstituicao(InstituicaoRequestDTO request) {
        // Verificar se nome já existe
        if (instituicaoRepository.existsByNome(request.getNome())) {
            throw new DataIntegrityViolationException("Instituição com este nome já existe");
        }

        // Criar instituição
        Instituicao instituicao = new Instituicao(
                request.getNome().trim(),
                request.getEndereco() != null ? request.getEndereco().trim() : null,
                request.getTelefone() != null ? request.getTelefone().trim() : null,
                request.getEmail() != null ? request.getEmail().trim() : null
        );

        instituicao = instituicaoRepository.save(instituicao);
        return convertToResponseDTO(instituicao);
    }

    // Buscar todas as instituições
    @Transactional(readOnly = true)
    public List<InstituicaoResponseDTO> listarTodas() {
        return instituicaoRepository.findAll()
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    // Buscar apenas instituições ativas
    @Transactional(readOnly = true)
    public List<InstituicaoResponseDTO> listarAtivas() {
        return instituicaoRepository.findByAtivo(true)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    // Buscar instituição por ID
    @Transactional(readOnly = true)
    public InstituicaoResponseDTO buscarPorId(Long id) {
        Instituicao instituicao = instituicaoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Instituição não encontrada"));
        return convertToResponseDTO(instituicao);
    }

    // Atualizar instituição
    public InstituicaoResponseDTO atualizarInstituicao(Long id, InstituicaoRequestDTO request) {
        Instituicao instituicao = instituicaoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Instituição não encontrada"));

        // Verificar se nome já existe (excluindo a própria instituição)
        if (!instituicao.getNome().equals(request.getNome()) &&
            instituicaoRepository.existsByNome(request.getNome())) {
            throw new DataIntegrityViolationException("Instituição com este nome já existe");
        }

        // Atualizar dados
        instituicao.setNome(request.getNome().trim());
        instituicao.setEndereco(request.getEndereco() != null ? request.getEndereco().trim() : null);
        instituicao.setTelefone(request.getTelefone() != null ? request.getTelefone().trim() : null);
        instituicao.setEmail(request.getEmail() != null ? request.getEmail().trim() : null);

        instituicao = instituicaoRepository.save(instituicao);
        return convertToResponseDTO(instituicao);
    }

    // Ativar/desativar instituição (soft delete)
    public InstituicaoResponseDTO alterarStatus(Long id, Boolean ativo) {
        Instituicao instituicao = instituicaoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Instituição não encontrada"));

        instituicao.setAtivo(ativo);
        instituicao = instituicaoRepository.save(instituicao);
        return convertToResponseDTO(instituicao);
    }

    // Buscar instituições por nome
    @Transactional(readOnly = true)
    public List<InstituicaoResponseDTO> buscarPorNome(String nome) {
        return instituicaoRepository.findByNomeContainingIgnoreCase(nome)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    // Converter entidade para DTO de resposta
    private InstituicaoResponseDTO convertToResponseDTO(Instituicao instituicao) {
        return new InstituicaoResponseDTO(
                instituicao.getId(),
                instituicao.getNome(),
                instituicao.getEndereco(),
                instituicao.getTelefone(),
                instituicao.getEmail(),
                instituicao.getDataCriacao(),
                instituicao.getAtivo()
        );
    }
}