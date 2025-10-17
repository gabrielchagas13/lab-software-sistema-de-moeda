package com.sistemamoeda.controller;

import com.sistemamoeda.dto.InstituicaoRequestDTO;
import com.sistemamoeda.dto.InstituicaoResponseDTO;
import com.sistemamoeda.service.InstituicaoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/instituicoes")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:5500"})
public class InstituicaoController {
    
    private final InstituicaoService instituicaoService;
    
    // Criar nova instituição
    @PostMapping
    public ResponseEntity<InstituicaoResponseDTO> criarInstituicao(@Valid @RequestBody InstituicaoRequestDTO request) {
        InstituicaoResponseDTO response = instituicaoService.criarInstituicao(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    // Listar todas as instituições ativas
    @GetMapping
    public ResponseEntity<List<InstituicaoResponseDTO>> listarAtivas() {
        List<InstituicaoResponseDTO> instituicoes = instituicaoService.listarAtivas();
        return ResponseEntity.ok(instituicoes);
    }
    
    // Listar todas as instituições (incluindo inativas)
    @GetMapping("/todas")
    public ResponseEntity<List<InstituicaoResponseDTO>> listarTodas() {
        List<InstituicaoResponseDTO> instituicoes = instituicaoService.listarTodas();
        return ResponseEntity.ok(instituicoes);
    }
    
    // Buscar instituição por ID
    @GetMapping("/{id}")
    public ResponseEntity<InstituicaoResponseDTO> buscarPorId(@PathVariable Long id) {
        InstituicaoResponseDTO instituicao = instituicaoService.buscarPorId(id);
        return ResponseEntity.ok(instituicao);
    }
    
    // Atualizar instituição
    @PutMapping("/{id}")
    public ResponseEntity<InstituicaoResponseDTO> atualizarInstituicao(
            @PathVariable Long id,
            @Valid @RequestBody InstituicaoRequestDTO request) {
        InstituicaoResponseDTO response = instituicaoService.atualizarInstituicao(id, request);
        return ResponseEntity.ok(response);
    }
    
    // Ativar/desativar instituição
    @PatchMapping("/{id}/status")
    public ResponseEntity<InstituicaoResponseDTO> alterarStatus(
            @PathVariable Long id,
            @RequestParam Boolean ativo) {
        InstituicaoResponseDTO response = instituicaoService.alterarStatus(id, ativo);
        return ResponseEntity.ok(response);
    }
    
    // Buscar instituições por nome
    @GetMapping("/buscar")
    public ResponseEntity<List<InstituicaoResponseDTO>> buscarPorNome(@RequestParam String nome) {
        List<InstituicaoResponseDTO> instituicoes = instituicaoService.buscarPorNome(nome);
        return ResponseEntity.ok(instituicoes);
    }
}