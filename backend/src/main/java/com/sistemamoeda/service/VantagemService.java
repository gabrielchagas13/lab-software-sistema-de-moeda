package com.sistemamoeda.service;

import com.sistemamoeda.dto.VantagemRequestDTO;
import com.sistemamoeda.dto.VantagemResponseDTO;
import com.sistemamoeda.model.Empresa;
import com.sistemamoeda.model.Vantagem;
import com.sistemamoeda.repository.EmpresaRepository;
import com.sistemamoeda.repository.VantagemRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class VantagemService {
    
    private final VantagemRepository vantagemRepository;
    private final EmpresaRepository empresaRepository;
    
    // Criar nova vantagem
    public VantagemResponseDTO criarVantagem(VantagemRequestDTO request) {
        // Verificar se empresa existe
        Empresa empresa = empresaRepository.findById(request.getEmpresaId())
                .orElseThrow(() -> new EntityNotFoundException("Empresa não encontrada"));
        
        // Criar vantagem
        Vantagem vantagem = new Vantagem(
            empresa,
            request.getNome().trim(),
            request.getDescricao().trim(),
            request.getCustoMoedas(),
            request.getFotoUrl() != null ? request.getFotoUrl().trim() : null
        );
        
        vantagem = vantagemRepository.save(vantagem);
        
        return convertToResponseDTO(vantagem);
    }
    
    // Buscar todas as vantagens
    @Transactional(readOnly = true)
    public List<VantagemResponseDTO> listarTodas() {
        return vantagemRepository.findAll()
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }
    
    // Buscar apenas vantagens ativas
    @Transactional(readOnly = true)
    public List<VantagemResponseDTO> listarAtivas() {
        return vantagemRepository.findByAtivaTrue()
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }
    
    // Buscar vantagem por ID
    @Transactional(readOnly = true)
    public VantagemResponseDTO buscarPorId(Long id) {
        Vantagem vantagem = vantagemRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Vantagem não encontrada"));
        
        return convertToResponseDTO(vantagem);
    }
    
    // Atualizar vantagem
    public VantagemResponseDTO atualizarVantagem(Long id, VantagemRequestDTO request) {
        Vantagem vantagem = vantagemRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Vantagem não encontrada"));
        
        // Verificar se empresa existe (se foi alterada)
        if (!vantagem.getEmpresa().getId().equals(request.getEmpresaId())) {
            Empresa empresa = empresaRepository.findById(request.getEmpresaId())
                    .orElseThrow(() -> new EntityNotFoundException("Empresa não encontrada"));
            vantagem.setEmpresa(empresa);
        }
        
        // Atualizar dados da vantagem
        vantagem.setNome(request.getNome().trim());
        vantagem.setDescricao(request.getDescricao().trim());
        vantagem.setCustoMoedas(request.getCustoMoedas());
        vantagem.setFotoUrl(request.getFotoUrl() != null ? request.getFotoUrl().trim() : null);
        
        vantagem = vantagemRepository.save(vantagem);
        
        return convertToResponseDTO(vantagem);
    }
    
    // Deletar vantagem
    public void deletarVantagem(Long id) {
        Vantagem vantagem = vantagemRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Vantagem não encontrada"));
        
        vantagemRepository.delete(vantagem);
    }
    
    // Ativar vantagem
    public VantagemResponseDTO ativarVantagem(Long id) {
        Vantagem vantagem = vantagemRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Vantagem não encontrada"));
        
        vantagem.ativar();
        vantagem = vantagemRepository.save(vantagem);
        
        return convertToResponseDTO(vantagem);
    }
    
    // Desativar vantagem
    public VantagemResponseDTO desativarVantagem(Long id) {
        Vantagem vantagem = vantagemRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Vantagem não encontrada"));
        
        vantagem.desativar();
        vantagem = vantagemRepository.save(vantagem);
        
        return convertToResponseDTO(vantagem);
    }
    
    // Buscar vantagens por empresa
    @Transactional(readOnly = true)
    public List<VantagemResponseDTO> buscarPorEmpresa(Long empresaId) {
        return vantagemRepository.findByEmpresaId(empresaId)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }
    
    // Buscar vantagens ativas por empresa
    @Transactional(readOnly = true)
    public List<VantagemResponseDTO> buscarAtivasPorEmpresa(Long empresaId) {
        return vantagemRepository.findByEmpresaIdAndAtivaTrue(empresaId)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }
    
    // Buscar por nome
    @Transactional(readOnly = true)
    public List<VantagemResponseDTO> buscarPorNome(String nome) {
        return vantagemRepository.findByNomeContainingIgnoreCase(nome)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }
    
    // Buscar por descrição
    @Transactional(readOnly = true)
    public List<VantagemResponseDTO> buscarPorDescricao(String descricao) {
        return vantagemRepository.findByDescricaoContainingIgnoreCase(descricao)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }
    
    // Buscar vantagens por faixa de preço
    @Transactional(readOnly = true)
    public List<VantagemResponseDTO> buscarPorFaixaPreco(BigDecimal minimo, BigDecimal maximo) {
        return vantagemRepository.findByCustoMoedasBetween(minimo, maximo)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }
    
    // Buscar vantagens que o aluno consegue pagar
    @Transactional(readOnly = true)
    public List<VantagemResponseDTO> buscarQueAlunoConseguePagar(BigDecimal saldoAluno) {
        return vantagemRepository.findVantagensQueAlunoConseguePagar(saldoAluno)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }
    
    // Buscar vantagens mais baratas
    @Transactional(readOnly = true)
    public List<VantagemResponseDTO> buscarMaisBaratas() {
        return vantagemRepository.findVantagensOrdemCrescente()
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }
    
    // Buscar vantagens mais caras
    @Transactional(readOnly = true)
    public List<VantagemResponseDTO> buscarMaisCaras() {
        return vantagemRepository.findVantagensOrdemDecrescente()
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }
    
    // Estatísticas - custo médio por empresa
    @Transactional(readOnly = true)
    public BigDecimal calcularCustoMedioPorEmpresa(Long empresaId) {
        return vantagemRepository.findCustoMedioPorEmpresa(empresaId);
    }
    
    // Estatísticas - custo mínimo por empresa
    @Transactional(readOnly = true)
    public BigDecimal calcularCustoMinimoPorEmpresa(Long empresaId) {
        return vantagemRepository.findCustoMinimoPorEmpresa(empresaId);
    }
    
    // Estatísticas - custo máximo por empresa
    @Transactional(readOnly = true)
    public BigDecimal calcularCustoMaximoPorEmpresa(Long empresaId) {
        return vantagemRepository.findCustoMaximoPorEmpresa(empresaId);
    }
    
    // Converter entidade para DTO de resposta
    private VantagemResponseDTO convertToResponseDTO(Vantagem vantagem) {
        VantagemResponseDTO dto = new VantagemResponseDTO();
        dto.setId(vantagem.getId());
        dto.setEmpresaId(vantagem.getEmpresa().getId());
        dto.setEmpresaNome(vantagem.getEmpresa().getNomeFantasia());
        dto.setNome(vantagem.getNome());
        dto.setDescricao(vantagem.getDescricao());
        dto.setCustoMoedas(vantagem.getCustoMoedas());
        dto.setFotoUrl(vantagem.getFotoUrl());
        dto.setAtiva(vantagem.getAtiva());
        dto.setDataCriacao(vantagem.getDataCriacao());
        return dto;
    }
}