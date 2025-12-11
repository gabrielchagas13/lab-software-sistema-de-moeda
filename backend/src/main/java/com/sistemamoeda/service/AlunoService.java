package com.sistemamoeda.service;

import com.sistemamoeda.dto.AlunoRequestDTO;
import com.sistemamoeda.dto.AlunoResponseDTO;
import com.sistemamoeda.model.*;
import com.sistemamoeda.repository.AlunoRepository;
import com.sistemamoeda.repository.InstituicaoRepository;
import com.sistemamoeda.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.stream.Collectors;
import com.sistemamoeda.mapper.AlunoMapper;

@Service
@RequiredArgsConstructor
@Transactional
public class AlunoService {
    
    private final AlunoRepository alunoRepository;
    private final UsuarioRepository usuarioRepository;
    private final InstituicaoRepository instituicaoRepository;
    private final PasswordEncoder passwordEncoder;

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
                passwordEncoder.encode(request.getSenha()),
                TipoUsuario.ALUNO
        );
        usuario = usuarioRepository.save(usuario);
        
        // Buscar instituição
        Instituicao instituicao = instituicaoRepository.findById(request.getInstituicaoId())
                .orElseThrow(() -> new EntityNotFoundException("Instituição não encontrada"));
        
        // Criar aluno
        Aluno aluno = new Aluno(
                usuario,
                instituicao,
                request.getCpf().trim(),
                request.getRg().trim(),
                request.getEndereco().trim(),
                request.getCurso().trim()
        );
        aluno = alunoRepository.save(aluno);

    return AlunoMapper.toDto(aluno);
    }
    
    // Buscar todos os alunos
    @Transactional(readOnly = true)
    public List<AlunoResponseDTO> listarTodos() {
    return alunoRepository.findAll()
        .stream()
        .map(AlunoMapper::toDto)
        .collect(Collectors.toList());
    }
    
    // Buscar aluno por ID
    @Transactional(readOnly = true)
    public AlunoResponseDTO buscarPorId(Long id) {
        Aluno aluno = alunoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Aluno não encontrado"));
    return AlunoMapper.toDto(aluno);
    }

    @Transactional(readOnly = true)
    public AlunoResponseDTO buscarPorUsuarioId(Long usuarioId) {
    Aluno aluno = alunoRepository.findByUsuarioId(usuarioId)
        .orElseThrow(() -> new EntityNotFoundException("Aluno não encontrado para o ID de usuário: " + usuarioId));
    return AlunoMapper.toDto(aluno); 
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
            usuario.setSenha(passwordEncoder.encode(request.getSenha()));
        }
        usuarioRepository.save(usuario);
        
        // Buscar instituição se mudou
        if (!aluno.getInstituicao().getId().equals(request.getInstituicaoId())) {
            Instituicao instituicao = instituicaoRepository.findById(request.getInstituicaoId())
                    .orElseThrow(() -> new EntityNotFoundException("Instituição não encontrada"));
            aluno.setInstituicao(instituicao);
        }
        
        // Atualizar dados do aluno
        aluno.setCpf(request.getCpf());
        aluno.setRg(request.getRg());
        aluno.setEndereco(request.getEndereco());
        aluno.setCurso(request.getCurso());
        
    aluno = alunoRepository.save(aluno);
    return AlunoMapper.toDto(aluno);
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
    public List<AlunoResponseDTO> buscarPorInstituicao(String nomeInstituicao) {
    return alunoRepository.findByInstituicaoNomeContainingIgnoreCase(nomeInstituicao)
        .stream()
        .map(AlunoMapper::toDto)
        .collect(Collectors.toList());
    }
    
    // Buscar alunos por curso
    @Transactional(readOnly = true)
    public List<AlunoResponseDTO> buscarPorCurso(String curso) {
    return alunoRepository.findByCursoContainingIgnoreCase(curso)
        .stream()
        .map(AlunoMapper::toDto)
        .collect(Collectors.toList());
    }
    
    // Buscar alunos por nome
    @Transactional(readOnly = true)
    public List<AlunoResponseDTO> buscarPorNome(String nome) {
    return alunoRepository.findByUsuarioNomeContainingIgnoreCase(nome)
        .stream()
        .map(AlunoMapper::toDto)
        .collect(Collectors.toList());
    }
    
    // Conversões movidas para AlunoMapper
}