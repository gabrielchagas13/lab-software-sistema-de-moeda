package com.sistemamoeda.controller;

import com.sistemamoeda.model.Instituicao;
import com.sistemamoeda.repository.InstituicaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/instituicoes")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:5500"})
public class InstituicaoController {
    
    private final InstituicaoRepository instituicaoRepository;
    
    // Listar todas as instituições ativas
    @GetMapping
    public ResponseEntity<List<Instituicao>> listarTodas() {
        List<Instituicao> instituicoes = instituicaoRepository.findByAtivoTrue();
        return ResponseEntity.ok(instituicoes);
    }
    
    // Buscar instituição por ID
    @GetMapping("/{id}")
    public ResponseEntity<Instituicao> buscarPorId(@PathVariable Long id) {
        return instituicaoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}