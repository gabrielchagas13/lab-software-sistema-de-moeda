package com.sistemamoeda.controller;

import com.sistemamoeda.dto.ProfessorRequestDTO;
import com.sistemamoeda.dto.ProfessorResponseDTO;
import com.sistemamoeda.service.ProfessorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/professores")
@RequiredArgsConstructor
public class ProfessorController {
    
    private final ProfessorService professorService;
    
    // Criar novo professor
    @PostMapping
    public ResponseEntity<?> criarProfessor(@Valid @RequestBody ProfessorRequestDTO request) {
        ProfessorResponseDTO professor = professorService.criarProfessor(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(professor);
    }
    
    // Listar todos os professores
    @GetMapping
    public ResponseEntity<?> listarProfessores() {
        List<ProfessorResponseDTO> professores = professorService.listarTodos();
        return ResponseEntity.ok(professores);
    }
    
    // Buscar professor por ID
    @GetMapping("/{id}")
    public ResponseEntity<?> buscarProfessor(@PathVariable Long id) {
        ProfessorResponseDTO professor = professorService.buscarPorId(id);
        return ResponseEntity.ok(professor);
    }
    
    // Atualizar professor
    @PutMapping("/{id}")
    public ResponseEntity<?> atualizarProfessor(@PathVariable Long id, 
                                              @Valid @RequestBody ProfessorRequestDTO request) {
        ProfessorResponseDTO professor = professorService.atualizarProfessor(id, request);
        return ResponseEntity.ok(professor);
    }
    
    // Deletar professor
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletarProfessor(@PathVariable Long id) {
        professorService.deletarProfessor(id);
        return ResponseEntity.ok().body("Professor excluído com sucesso");
    }
    
    // Buscar por instituição
    @GetMapping("/instituicao")
    public ResponseEntity<?> buscarPorInstituicao(@RequestParam String instituicao) {
        List<ProfessorResponseDTO> professores = professorService.buscarPorInstituicao(instituicao);
        return ResponseEntity.ok(professores);
    }
    
    // Buscar por departamento
    @GetMapping("/departamento")
    public ResponseEntity<?> buscarPorDepartamento(@RequestParam String departamento) {
        List<ProfessorResponseDTO> professores = professorService.buscarPorDepartamento(departamento);
        return ResponseEntity.ok(professores);
    }
    
    // Buscar por nome
    @GetMapping("/nome")
    public ResponseEntity<?> buscarPorNome(@RequestParam String nome) {
        List<ProfessorResponseDTO> professores = professorService.buscarPorNome(nome);
        return ResponseEntity.ok(professores);
    }
    
    // Buscar por CPF
    @GetMapping("/cpf/{cpf}")
    public ResponseEntity<?> buscarPorCpf(@PathVariable String cpf) {
        ProfessorResponseDTO professor = professorService.buscarPorCpf(cpf);
        return ResponseEntity.ok(professor);
    }
    
    // Buscar por email
    @GetMapping("/email/{email}")
    public ResponseEntity<?> buscarPorEmail(@PathVariable String email) {
        ProfessorResponseDTO professor = professorService.buscarPorEmail(email);
        return ResponseEntity.ok(professor);
    }
    
    // Adicionar moedas semestrais
    @PostMapping("/{id}/moedas-semestrais")
    public ResponseEntity<?> adicionarMoedasSemestrais(@PathVariable Long id) {
        ProfessorResponseDTO professor = professorService.adicionarMoedasSemestrais(id);
        return ResponseEntity.ok(professor);
    }
    
    // Buscar professores com saldo baixo
    @GetMapping("/saldo-baixo")
    public ResponseEntity<?> buscarComSaldoBaixo() {
        List<ProfessorResponseDTO> professores = professorService.buscarComSaldoBaixo();
        return ResponseEntity.ok(professores);
    }
    
    // Buscar por faixa de saldo
    @GetMapping("/saldo")
    public ResponseEntity<?> buscarPorFaixaSaldo(@RequestParam BigDecimal minimo, 
                                               @RequestParam BigDecimal maximo) {
        List<ProfessorResponseDTO> professores = professorService.buscarPorFaixaSaldo(minimo, maximo);
        return ResponseEntity.ok(professores);
    }
}