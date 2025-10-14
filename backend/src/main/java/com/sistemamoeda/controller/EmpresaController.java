package com.sistemamoeda.controller;

import com.sistemamoeda.dto.EmpresaRequestDTO;
import com.sistemamoeda.dto.EmpresaResponseDTO;
import com.sistemamoeda.service.EmpresaService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/empresas")
@RequiredArgsConstructor
@Validated
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:5500"})
public class EmpresaController {
    
    private final EmpresaService empresaService;
    
    // Criar nova empresa
    @PostMapping
    public ResponseEntity<?> criarEmpresa(@Valid @RequestBody EmpresaRequestDTO request) {
        try {
            EmpresaResponseDTO empresa = empresaService.criarEmpresa(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(empresa);
        } catch (DataIntegrityViolationException e) {
            Map<String, String> error = new HashMap<>();
            error.put("erro", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("erro", "Erro interno do servidor");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    // Listar todas as empresas
    @GetMapping
    public ResponseEntity<List<EmpresaResponseDTO>> listarTodas() {
        List<EmpresaResponseDTO> empresas = empresaService.listarTodas();
        return ResponseEntity.ok(empresas);
    }
    
    // Buscar empresa por ID
    @GetMapping("/{id}")
    public ResponseEntity<?> buscarPorId(@PathVariable Long id) {
        try {
            EmpresaResponseDTO empresa = empresaService.buscarPorId(id);
            return ResponseEntity.ok(empresa);
        } catch (EntityNotFoundException e) {
            Map<String, String> error = new HashMap<>();
            error.put("erro", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
    
    // Atualizar empresa
    @PutMapping("/{id}")
    public ResponseEntity<?> atualizarEmpresa(@PathVariable Long id, @Valid @RequestBody EmpresaRequestDTO request) {
        try {
            EmpresaResponseDTO empresa = empresaService.atualizarEmpresa(id, request);
            return ResponseEntity.ok(empresa);
        } catch (EntityNotFoundException e) {
            Map<String, String> error = new HashMap<>();
            error.put("erro", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (DataIntegrityViolationException e) {
            Map<String, String> error = new HashMap<>();
            error.put("erro", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("erro", "Erro interno do servidor");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    // Deletar empresa
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletarEmpresa(@PathVariable Long id) {
        try {
            empresaService.deletarEmpresa(id);
            Map<String, String> success = new HashMap<>();
            success.put("mensagem", "Empresa deletada com sucesso");
            return ResponseEntity.ok(success);
        } catch (EntityNotFoundException e) {
            Map<String, String> error = new HashMap<>();
            error.put("erro", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("erro", "Erro interno do servidor");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    // Buscar empresas por nome fantasia
    @GetMapping("/nome-fantasia")
    public ResponseEntity<List<EmpresaResponseDTO>> buscarPorNomeFantasia(@RequestParam String nomeFantasia) {
        List<EmpresaResponseDTO> empresas = empresaService.buscarPorNomeFantasia(nomeFantasia);
        return ResponseEntity.ok(empresas);
    }
    
    // Buscar empresas por nome do usuário
    @GetMapping("/nome")
    public ResponseEntity<List<EmpresaResponseDTO>> buscarPorNome(@RequestParam String nome) {
        List<EmpresaResponseDTO> empresas = empresaService.buscarPorNome(nome);
        return ResponseEntity.ok(empresas);
    }
    
    // Buscar empresas com vantagens ativas
    @GetMapping("/com-vantagens")
    public ResponseEntity<List<EmpresaResponseDTO>> buscarEmpresasComVantagensAtivas() {
        List<EmpresaResponseDTO> empresas = empresaService.buscarEmpresasComVantagensAtivas();
        return ResponseEntity.ok(empresas);
    }
}