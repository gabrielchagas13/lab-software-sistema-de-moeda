package com.sistemamoeda.controller;

import com.sistemamoeda.dto.AlunoRequestDTO;
import com.sistemamoeda.dto.AlunoResponseDTO;
import com.sistemamoeda.service.AlunoService;
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
@RequestMapping("/api/alunos")
@RequiredArgsConstructor
@Validated
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:5500"})
public class AlunoController {
    
    private final AlunoService alunoService;
    
    // Criar novo aluno
    @PostMapping
    public ResponseEntity<?> criarAluno(@Valid @RequestBody AlunoRequestDTO request) {
        try {
            AlunoResponseDTO aluno = alunoService.criarAluno(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(aluno);
        } catch (DataIntegrityViolationException e) {
            Map<String, String> error = new HashMap<>();
            error.put("erro", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
        } catch (EntityNotFoundException e) {
            Map<String, String> error = new HashMap<>();
            error.put("erro", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            // Log the actual error for debugging
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("erro", "Erro interno do servidor: " + e.getMessage());
            error.put("detalhes", e.getClass().getSimpleName());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
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
        try {
            AlunoResponseDTO aluno = alunoService.buscarPorId(id);
            return ResponseEntity.ok(aluno);
        } catch (EntityNotFoundException e) {
            Map<String, String> error = new HashMap<>();
            error.put("erro", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    // ADICIONE ESTE ENDPOINT:
    @GetMapping("/por-usuario/{usuarioId}")
    public ResponseEntity<?> buscarPorUsuarioId(@PathVariable Long usuarioId) {
        try {
            AlunoResponseDTO aluno = alunoService.buscarPorUsuarioId(usuarioId);
            return ResponseEntity.ok(aluno);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
    
    // Atualizar aluno
    @PutMapping("/{id}")
    public ResponseEntity<?> atualizarAluno(@PathVariable Long id, @Valid @RequestBody AlunoRequestDTO request) {
        try {
            AlunoResponseDTO aluno = alunoService.atualizarAluno(id, request);
            return ResponseEntity.ok(aluno);
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
    
    // Deletar aluno
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletarAluno(@PathVariable Long id) {
        try {
            alunoService.deletarAluno(id);
            Map<String, String> success = new HashMap<>();
            success.put("mensagem", "Aluno deletado com sucesso");
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