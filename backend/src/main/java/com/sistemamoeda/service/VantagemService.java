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
import java.util.Base64;
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
        Empresa empresa = empresaRepository.findById(request.getEmpresaId())
                .orElseThrow(() -> new EntityNotFoundException("Empresa não encontrada"));
        
        // Converter Base64 para byte[]
        byte[] fotoBytes = converterBase64ParaBytes(request.getFotoUrl());

        Vantagem vantagem = new Vantagem(
            empresa,
            request.getNome().trim(),
            request.getDescricao().trim(),
            request.getCustoMoedas(),
            fotoBytes
        );
        
        vantagem = vantagemRepository.save(vantagem);
        
        return convertToResponseDTO(vantagem);
    }
    
    @Transactional(readOnly = true)
    public List<VantagemResponseDTO> listarTodas() {
        return vantagemRepository.findAll()
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<VantagemResponseDTO> listarAtivas() {
        return vantagemRepository.findByAtivaTrue()
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }
    
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
        
        if (!vantagem.getEmpresa().getId().equals(request.getEmpresaId())) {
            Empresa empresa = empresaRepository.findById(request.getEmpresaId())
                    .orElseThrow(() -> new EntityNotFoundException("Empresa não encontrada"));
            vantagem.setEmpresa(empresa);
        }
        
        vantagem.setNome(request.getNome().trim());
        vantagem.setDescricao(request.getDescricao().trim());
        vantagem.setCustoMoedas(request.getCustoMoedas());
        
        // Atualiza a foto apenas se uma nova string Base64 for enviada
        if (request.getFotoUrl() != null && !request.getFotoUrl().trim().isEmpty()) {
            vantagem.setFoto(converterBase64ParaBytes(request.getFotoUrl()));
        }
        
        vantagem = vantagemRepository.save(vantagem);
        
        return convertToResponseDTO(vantagem);
    }
    
    public void deletarVantagem(Long id) {
        Vantagem vantagem = vantagemRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Vantagem não encontrada"));
        
        vantagemRepository.delete(vantagem);
    }
    
    public VantagemResponseDTO ativarVantagem(Long id) {
        Vantagem vantagem = vantagemRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Vantagem não encontrada"));
        
        vantagem.ativar();
        vantagem = vantagemRepository.save(vantagem);
        
        return convertToResponseDTO(vantagem);
    }
    
    public VantagemResponseDTO desativarVantagem(Long id) {
        Vantagem vantagem = vantagemRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Vantagem não encontrada"));
        
        vantagem.desativar();
        vantagem = vantagemRepository.save(vantagem);
        
        return convertToResponseDTO(vantagem);
    }
    
    @Transactional(readOnly = true)
    public List<VantagemResponseDTO> buscarPorEmpresa(Long empresaId) {
        return vantagemRepository.findByEmpresaId(empresaId)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<VantagemResponseDTO> buscarAtivasPorEmpresa(Long empresaId) {
        return vantagemRepository.findByEmpresaIdAndAtivaTrue(empresaId)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<VantagemResponseDTO> buscarPorNome(String nome) {
        return vantagemRepository.findByNomeContainingIgnoreCase(nome)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<VantagemResponseDTO> buscarPorDescricao(String descricao) {
        return vantagemRepository.findByDescricaoContainingIgnoreCase(descricao)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<VantagemResponseDTO> buscarPorFaixaPreco(BigDecimal minimo, BigDecimal maximo) {
        return vantagemRepository.findByCustoMoedasBetween(minimo, maximo)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<VantagemResponseDTO> buscarQueAlunoConseguePagar(BigDecimal saldoAluno) {
        return vantagemRepository.findVantagensQueAlunoConseguePagar(saldoAluno)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<VantagemResponseDTO> buscarMaisBaratas() {
        return vantagemRepository.findVantagensOrdemCrescente()
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<VantagemResponseDTO> buscarMaisCaras() {
        return vantagemRepository.findVantagensOrdemDecrescente()
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public BigDecimal calcularCustoMedioPorEmpresa(Long empresaId) {
        return vantagemRepository.findCustoMedioPorEmpresa(empresaId);
    }
    
    @Transactional(readOnly = true)
    public BigDecimal calcularCustoMinimoPorEmpresa(Long empresaId) {
        return vantagemRepository.findCustoMinimoPorEmpresa(empresaId);
    }
    
    @Transactional(readOnly = true)
    public BigDecimal calcularCustoMaximoPorEmpresa(Long empresaId) {
        return vantagemRepository.findCustoMaximoPorEmpresa(empresaId);
    }
    
    // Função auxiliar para converter String Base64 -> byte[]
    private byte[] converterBase64ParaBytes(String base64) {
        if (base64 == null || base64.trim().isEmpty()) {
            return null;
        }
        try {
            if (base64.contains(",")) {
                base64 = base64.split(",")[1];
            }
            return Base64.getDecoder().decode(base64);
        } catch (IllegalArgumentException e) {
            return null;
        }
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
        
        if (vantagem.getFoto() != null && vantagem.getFoto().length > 0) {
            String base64 = Base64.getEncoder().encodeToString(vantagem.getFoto());
            dto.setFotoUrl("data:image/jpeg;base64," + base64);
        } else {
            dto.setFotoUrl(null);
        }
        
        dto.setAtiva(vantagem.getAtiva());
        dto.setDataCriacao(vantagem.getDataCriacao());
        return dto;
    }
}