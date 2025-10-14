package com.sistemamoeda.service;

import com.sistemamoeda.dto.AlunoRequestDTO;
import com.sistemamoeda.dto.AlunoResponseDTO;
import com.sistemamoeda.model.*;
import com.sistemamoeda.repository.AlunoRepository;
import com.sistemamoeda.repository.UsuarioRepository;
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
public class AlunoService {
    
    private final AlunoRepository alunoRepository;
    private final UsuarioRepository usuarioRepository;
    
    // Criar novo aluno
    public AlunoResponseDTO criarAluno(AlunoRequestDTO request) {
        // Verificar se email já existe
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new DataIntegrityViolationException("Email já cadastrado no sistema");
        }
        
        // Verificar se CPF já existe
        if (alunoRepository.existsByCpf(request.getCpf())) {
            throw new DataIntegrityViolationException("CPF já cadastrado no sistema");
        }
        
        // Criar usuário
        Usuario usuario = new Usuario(
                request.getNome().trim(),
                request.getEmail().trim(),
                request.getSenha(), // TODO: Implementar hash da senha
                TipoUsuario.ALUNO
        );
        usuario = usuarioRepository.save(usuario);
        
        // Criar aluno
        Aluno aluno = new Aluno(
                usuario,
                request.getInstituicao().trim(),
                request.getCpf().trim(),
                request.getRg().trim(),
                request.getEndereco().trim(),
                request.getCurso().trim()
        );
        aluno = alunoRepository.save(aluno);

        return convertToResponseDTO(aluno);
    }
    
    // Buscar todos os alunos
    @Transactional(readOnly = true)
    public List<AlunoResponseDTO> listarTodos() {
        return alunoRepository.findAll()
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }
    
    // Buscar aluno por ID
    @Transactional(readOnly = true)
    public AlunoResponseDTO buscarPorId(Long id) {
        Aluno aluno = alunoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Aluno não encontrado"));
        return convertToResponseDTO(aluno);
    }
    
    // Atualizar aluno
    public AlunoResponseDTO atualizarAluno(Long id, AlunoRequestDTO request) {
        Aluno aluno = alunoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Aluno não encontrado"));
        
        // Verificar se email já existe (diferente do atual)
        if (!aluno.getUsuario().getEmail().equals(request.getEmail()) && 
            usuarioRepository.existsByEmail(request.getEmail())) {
            throw new DataIntegrityViolationException("Email já cadastrado no sistema");
        }
        
        // Verificar se CPF já existe (diferente do atual)
        if (!aluno.getCpf().equals(request.getCpf()) && 
            alunoRepository.existsByCpf(request.getCpf())) {
            throw new DataIntegrityViolationException("CPF já cadastrado no sistema");
        }
        
        // Atualizar dados do usuário
        Usuario usuario = aluno.getUsuario();
        usuario.setNome(request.getNome());
        usuario.setEmail(request.getEmail());
        if (request.getSenha() != null && !request.getSenha().trim().isEmpty()) {
            usuario.setSenha(request.getSenha()); // TODO: Implementar hash da senha
        }
        usuarioRepository.save(usuario);
        
        // Atualizar dados do aluno
        aluno.setInstituicao(request.getInstituicao());
        aluno.setCpf(request.getCpf());
        aluno.setRg(request.getRg());
        aluno.setEndereco(request.getEndereco());
        aluno.setCurso(request.getCurso());
        
        aluno = alunoRepository.save(aluno);
        return convertToResponseDTO(aluno);
    }
    
    // Deletar aluno
    public void deletarAluno(Long id) {
        Aluno aluno = alunoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Aluno não encontrado"));
        
        // Deletar aluno (vai deletar o usuário em cascata)
        alunoRepository.delete(aluno);
    }
    
    // Buscar alunos por instituição
    @Transactional(readOnly = true)
    public List<AlunoResponseDTO> buscarPorInstituicao(String instituicao) {
        return alunoRepository.findByInstituicaoContainingIgnoreCase(instituicao)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }
    
    // Buscar alunos por curso
    @Transactional(readOnly = true)
    public List<AlunoResponseDTO> buscarPorCurso(String curso) {
        return alunoRepository.findByCursoContainingIgnoreCase(curso)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }
    
    // Buscar alunos por nome
    @Transactional(readOnly = true)
    public List<AlunoResponseDTO> buscarPorNome(String nome) {
        return alunoRepository.findByUsuarioNomeContainingIgnoreCase(nome)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }
    
    // Converter entidade para DTO de resposta
    private AlunoResponseDTO convertToResponseDTO(Aluno aluno) {
        AlunoResponseDTO dto = new AlunoResponseDTO();
        dto.setId(aluno.getId());
        dto.setUsuarioId(aluno.getUsuario().getId());
        dto.setNome(aluno.getUsuario().getNome());
        dto.setEmail(aluno.getUsuario().getEmail());
        dto.setTipoUsuario(aluno.getUsuario().getTipoUsuario().name());
        dto.setDataCriacao(aluno.getUsuario().getDataCriacao());
        dto.setAtivo(aluno.getUsuario().getAtivo());
        dto.setInstituicao(aluno.getInstituicao());
        dto.setCpf(aluno.getCpf());
        dto.setRg(aluno.getRg());
        dto.setEndereco(aluno.getEndereco());
        dto.setCurso(aluno.getCurso());
        dto.setSaldoMoedas(aluno.getSaldoMoedas());
        dto.setDataCadastro(aluno.getDataCadastro());
        return dto;
    }
}