package com.sistemamoeda.controller;

import com.sistemamoeda.dto.AlunoRequestDTO;
import com.sistemamoeda.dto.AlunoResponseDTO;
import com.sistemamoeda.service.AlunoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/alunos")
@RequiredArgsConstructor
@Validated
public class AlunoController {
    
    private final AlunoService alunoService;
    
    // Criar novo aluno
    @PostMapping
    public ResponseEntity<?> criarAluno(@Valid @RequestBody AlunoRequestDTO request) {
        AlunoResponseDTO aluno = alunoService.criarAluno(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(aluno);
    }
    
    // Listar todos os alunos
    @GetMapping
    public ResponseEntity<List<AlunoResponseDTO>> listarTodos() {
        List<AlunoResponseDTO> alunos = alunoService.listarTodos();
        return ResponseEntity.ok(alunos);
    }
    
    // Buscar aluno por ID
    @GetMapping("/{id}")
    public ResponseEntity<?> buscarPorId(@PathVariable Long id) {
        AlunoResponseDTO aluno = alunoService.buscarPorId(id);
        return ResponseEntity.ok(aluno);
    }

    // ADICIONE ESTE ENDPOINT:
    @GetMapping("/por-usuario/{usuarioId}")
    public ResponseEntity<?> buscarPorUsuarioId(@PathVariable Long usuarioId) {
        AlunoResponseDTO aluno = alunoService.buscarPorUsuarioId(usuarioId);
        return ResponseEntity.ok(aluno);
    }
    
    // Atualizar aluno
    @PutMapping("/{id}")
    public ResponseEntity<?> atualizarAluno(@PathVariable Long id, @Valid @RequestBody AlunoRequestDTO request) {
        AlunoResponseDTO aluno = alunoService.atualizarAluno(id, request);
        return ResponseEntity.ok(aluno);
    }
    
    // Deletar aluno
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletarAluno(@PathVariable Long id) {
        alunoService.deletarAluno(id);
        Map<String, String> success = new HashMap<>();
        success.put("mensagem", "Aluno deletado com sucesso");
        return ResponseEntity.ok(success);
    }
    
    // Buscar alunos por instituição
    @GetMapping("/instituicao")
    public ResponseEntity<List<AlunoResponseDTO>> buscarPorInstituicao(@RequestParam String instituicao) {
        List<AlunoResponseDTO> alunos = alunoService.buscarPorInstituicao(instituicao);
        return ResponseEntity.ok(alunos);
    }
    
    // Buscar alunos por curso
    @GetMapping("/curso")
    public ResponseEntity<List<AlunoResponseDTO>> buscarPorCurso(@RequestParam String curso) {
        List<AlunoResponseDTO> alunos = alunoService.buscarPorCurso(curso);
        return ResponseEntity.ok(alunos);
    }
    
    // Buscar alunos por nome
    @GetMapping("/nome")
    public ResponseEntity<List<AlunoResponseDTO>> buscarPorNome(@RequestParam String nome) {
        List<AlunoResponseDTO> alunos = alunoService.buscarPorNome(nome);
        return ResponseEntity.ok(alunos);
    }
}