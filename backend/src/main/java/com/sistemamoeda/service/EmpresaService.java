package com.sistemamoeda.service;

import com.sistemamoeda.dto.EmpresaRequestDTO;
import com.sistemamoeda.dto.EmpresaResponseDTO;
import com.sistemamoeda.model.Empresa;
import com.sistemamoeda.model.TipoUsuario;
import com.sistemamoeda.model.Usuario;
import com.sistemamoeda.repository.EmpresaRepository;
import com.sistemamoeda.repository.UsuarioRepository;
import com.sistemamoeda.repository.VantagemRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class EmpresaService {
    
    private final EmpresaRepository empresaRepository;
    private final UsuarioRepository usuarioRepository;
    private final VantagemRepository vantagemRepository;
    private final PasswordEncoder passwordEncoder; // LINHA ADICIONADA
    
    // Criar nova empresa
    public EmpresaResponseDTO criarEmpresa(EmpresaRequestDTO request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new DataIntegrityViolationException("Email já cadastrado no sistema");
        }
        
        if (empresaRepository.existsByCnpj(request.getCnpj())) {
            throw new DataIntegrityViolationException("CNPJ já cadastrado no sistema");
        }
        
        Usuario usuario = new Usuario(
                request.getNome(),
                request.getEmail(),
                passwordEncoder.encode(request.getSenha()),
                TipoUsuario.EMPRESA
        );
        usuario = usuarioRepository.save(usuario);
        
        Empresa empresa = new Empresa(
                usuario,
                request.getNomeFantasia(),
                request.getCnpj(),
                request.getEndereco(),
                request.getTelefone(),
                request.getDescricao()
        );
        empresa = empresaRepository.save(empresa);
        
        return convertToResponseDTO(empresa);
    }
    
    // Buscar todas as empresas
    @Transactional(readOnly = true)
    public List<EmpresaResponseDTO> listarTodas() {
        return empresaRepository.findAll()
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }
    
    // Buscar empresa por ID
    @Transactional(readOnly = true)
    public EmpresaResponseDTO buscarPorId(Long id) {
        Empresa empresa = empresaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Empresa não encontrada"));
        return convertToResponseDTO(empresa);
    }
    
    // Atualizar empresa
    public EmpresaResponseDTO atualizarEmpresa(Long id, EmpresaRequestDTO request) {
        Empresa empresa = empresaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Empresa não encontrada"));
        
        if (!empresa.getUsuario().getEmail().equals(request.getEmail()) && 
            usuarioRepository.existsByEmail(request.getEmail())) {
            throw new DataIntegrityViolationException("Email já cadastrado no sistema");
        }
        
        if (!empresa.getCnpj().equals(request.getCnpj()) && 
            empresaRepository.existsByCnpj(request.getCnpj())) {
            throw new DataIntegrityViolationException("CNPJ já cadastrado no sistema");
        }
        
        Usuario usuario = empresa.getUsuario();
        usuario.setNome(request.getNome());
        usuario.setEmail(request.getEmail());
        if (request.getSenha() != null && !request.getSenha().trim().isEmpty()) {
            usuario.setSenha(passwordEncoder.encode(request.getSenha()));
        }
        usuarioRepository.save(usuario);
        
        empresa.setNomeFantasia(request.getNomeFantasia());
        empresa.setCnpj(request.getCnpj());
        empresa.setEndereco(request.getEndereco());
        empresa.setTelefone(request.getTelefone());
        empresa.setDescricao(request.getDescricao());
        
        empresa = empresaRepository.save(empresa);
        return convertToResponseDTO(empresa);
    }
    
    // Deletar empresa
    public void deletarEmpresa(Long id) {
        Empresa empresa = empresaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Empresa não encontrada"));
        
        empresaRepository.delete(empresa);
    }
    
    // Buscar empresas por nome fantasia
    @Transactional(readOnly = true)
    public List<EmpresaResponseDTO> buscarPorNomeFantasia(String nomeFantasia) {
        return empresaRepository.findByNomeFantasiaContainingIgnoreCase(nomeFantasia)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }
    
    // Buscar empresas por nome do usuário
    @Transactional(readOnly = true)
    public List<EmpresaResponseDTO> buscarPorNome(String nome) {
        return empresaRepository.findByUsuarioNomeContainingIgnoreCase(nome)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }
    
    // Buscar empresas com vantagens ativas
    @Transactional(readOnly = true)
    public List<EmpresaResponseDTO> buscarEmpresasComVantagensAtivas() {
        return empresaRepository.findEmpresasComVantagensAtivas()
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }
    
    // Converter entidade para DTO de resposta
    private EmpresaResponseDTO convertToResponseDTO(Empresa empresa) {
        EmpresaResponseDTO dto = new EmpresaResponseDTO();
        dto.setId(empresa.getId());
        dto.setUsuarioId(empresa.getUsuario().getId());
        dto.setNome(empresa.getUsuario().getNome());
        dto.setEmail(empresa.getUsuario().getEmail());
        dto.setTipoUsuario(empresa.getUsuario().getTipoUsuario().name());
        dto.setDataCriacao(empresa.getUsuario().getDataCriacao());
        dto.setAtivo(empresa.getUsuario().getAtivo());
        dto.setNomeFantasia(empresa.getNomeFantasia());
        dto.setCnpj(empresa.getCnpj());
        dto.setEndereco(empresa.getEndereco());
        dto.setTelefone(empresa.getTelefone());
        dto.setDescricao(empresa.getDescricao());
        dto.setDataCadastro(empresa.getDataCadastro());
        
        Long quantidadeVantagens = vantagemRepository.countVantagensByEmpresaId(empresa.getId());
        dto.setQuantidadeVantagens(quantidadeVantagens);
        
        return dto;
    }
}