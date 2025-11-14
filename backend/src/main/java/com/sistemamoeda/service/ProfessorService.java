package com.sistemamoeda.service;

import com.sistemamoeda.dto.ProfessorRequestDTO;
import com.sistemamoeda.dto.ProfessorResponseDTO;
import com.sistemamoeda.model.Instituicao;
import com.sistemamoeda.model.Professor;
import com.sistemamoeda.model.TipoUsuario;
import com.sistemamoeda.model.Usuario;
import com.sistemamoeda.repository.InstituicaoRepository;
import com.sistemamoeda.repository.ProfessorRepository;
import com.sistemamoeda.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProfessorService {
    
    private final ProfessorRepository professorRepository;
    private final UsuarioRepository usuarioRepository;
    private final InstituicaoRepository instituicaoRepository;
    private final PasswordEncoder passwordEncoder;
    
    // Criar novo professor
    public ProfessorResponseDTO criarProfessor(ProfessorRequestDTO request) {
        // Verificar se email já existe
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email já está em uso");
        }
        
        // Verificar se CPF já existe
        if (professorRepository.existsByCpf(request.getCpf())) {
            throw new IllegalArgumentException("CPF já está cadastrado");
        }
        
        // Criar usuário
        Usuario usuario = new Usuario(
            request.getNome().trim(),
            request.getEmail().trim(),
            passwordEncoder.encode(request.getSenha()),
            TipoUsuario.PROFESSOR
        );
        
        usuario = usuarioRepository.save(usuario);
        
        // Buscar instituição
        Instituicao instituicao = instituicaoRepository.findById(request.getInstituicaoId())
                .orElseThrow(() -> new EntityNotFoundException("Instituição não encontrada"));
        
        // Criar professor
        Professor professor = new Professor(
            usuario,
            instituicao,
            request.getCpf().trim(),
            request.getDepartamento().trim()
        );
        
        professor = professorRepository.save(professor);
        
        return convertToResponseDTO(professor);
    }
    
    // Buscar todos os professores
    @Transactional(readOnly = true)
    public List<ProfessorResponseDTO> listarTodos() {
        return professorRepository.findAll()
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }
    
    // Buscar professor por ID
    @Transactional(readOnly = true)
    public ProfessorResponseDTO buscarPorId(Long id) {
        Professor professor = professorRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Professor não encontrado"));
        
        return convertToResponseDTO(professor);
    }
    
    // Atualizar professor
    public ProfessorResponseDTO atualizarProfessor(Long id, ProfessorRequestDTO request) {
        Professor professor = professorRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Professor não encontrado"));
        
        Usuario usuario = professor.getUsuario();
        
        // Verificar se email já existe (exceto para o próprio usuário)
        if (!usuario.getEmail().equals(request.getEmail()) && 
            usuarioRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email já está em uso");
        }
        
        // Verificar se CPF já existe (exceto para o próprio professor)
        if (!professor.getCpf().equals(request.getCpf()) && 
            professorRepository.existsByCpf(request.getCpf())) {
            throw new IllegalArgumentException("CPF já está cadastrado");
        }
        
        // Atualizar dados do usuário
        usuario.setNome(request.getNome().trim());
        usuario.setEmail(request.getEmail().trim());
        
        // Atualizar senha se fornecida
        if (request.getSenha() != null && !request.getSenha().trim().isEmpty()) {
            usuario.setSenha(passwordEncoder.encode(request.getSenha()));
        }
        
        // Buscar instituição se mudou
        if (!professor.getInstituicao().getId().equals(request.getInstituicaoId())) {
            Instituicao instituicao = instituicaoRepository.findById(request.getInstituicaoId())
                    .orElseThrow(() -> new EntityNotFoundException("Instituição não encontrada"));
            professor.setInstituicao(instituicao);
        }
        
        // Atualizar dados específicos do professor
        professor.setCpf(request.getCpf().trim());
        professor.setDepartamento(request.getDepartamento().trim());
        
        usuarioRepository.save(usuario);
        professor = professorRepository.save(professor);
        
        return convertToResponseDTO(professor);
    }
    
    // Deletar professor
    public void deletarProfessor(Long id) {
        Professor professor = professorRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Professor não encontrado"));
        
        // Deletar professor (vai deletar o usuário em cascata)
        professorRepository.delete(professor);
    }
    
    // Buscar professores por instituição
    @Transactional(readOnly = true)
    public List<ProfessorResponseDTO> buscarPorInstituicao(String nomeInstituicao) {
        return professorRepository.findByInstituicaoNomeContainingIgnoreCase(nomeInstituicao)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }
    
    // Buscar professores por departamento
    @Transactional(readOnly = true)
    public List<ProfessorResponseDTO> buscarPorDepartamento(String departamento) {
        return professorRepository.findByDepartamentoContainingIgnoreCase(departamento)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }
    
    // Buscar professores por nome
    @Transactional(readOnly = true)
    public List<ProfessorResponseDTO> buscarPorNome(String nome) {
        return professorRepository.findByUsuarioNomeContainingIgnoreCase(nome)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }
    
    // Buscar professor por CPF
    @Transactional(readOnly = true)
    public ProfessorResponseDTO buscarPorCpf(String cpf) {
        Professor professor = professorRepository.findByCpf(cpf)
                .orElseThrow(() -> new EntityNotFoundException("Professor não encontrado"));
        
        return convertToResponseDTO(professor);
    }
    
    // Buscar professor por email
    @Transactional(readOnly = true)
    public ProfessorResponseDTO buscarPorEmail(String email) {
        Professor professor = professorRepository.findByUsuarioEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Professor não encontrado"));
        
        return convertToResponseDTO(professor);
    }
    
    // Adicionar moedas semestrais
    public ProfessorResponseDTO adicionarMoedasSemestrais(Long id) {
        Professor professor = professorRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Professor não encontrado"));
        
        professor.adicionarMoedasSemestrais();
        professor = professorRepository.save(professor);
        
        return convertToResponseDTO(professor);
    }
    
    // Buscar professores com saldo baixo (menos de 100 moedas)
    @Transactional(readOnly = true)
    public List<ProfessorResponseDTO> buscarComSaldoBaixo() {
        return professorRepository.findBySaldoMoedasLessThan(new BigDecimal("100"))
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }
    
    // Buscar professores por faixa de saldo
    @Transactional(readOnly = true)
    public List<ProfessorResponseDTO> buscarPorFaixaSaldo(BigDecimal minimo, BigDecimal maximo) {
        return professorRepository.findBySaldoMoedasBetween(minimo, maximo)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }
    
    // Converter entidade para DTO de resposta
    private ProfessorResponseDTO convertToResponseDTO(Professor professor) {
        ProfessorResponseDTO dto = new ProfessorResponseDTO();
        dto.setId(professor.getId());
        dto.setUsuarioId(professor.getUsuario().getId());
        dto.setNome(professor.getUsuario().getNome());
        dto.setEmail(professor.getUsuario().getEmail());
        dto.setTipoUsuario(professor.getUsuario().getTipoUsuario().name());
        dto.setDataCriacao(professor.getUsuario().getDataCriacao());
        dto.setAtivo(professor.getUsuario().getAtivo());
        dto.setInstituicaoId(professor.getInstituicao().getId());
        dto.setInstituicaoNome(professor.getInstituicao().getNome());
        dto.setCpf(professor.getCpf());
        dto.setDepartamento(professor.getDepartamento());
        dto.setSaldoMoedas(professor.getSaldoMoedas());
        dto.setDataCadastro(professor.getDataCadastro());
        return dto;
    }
}