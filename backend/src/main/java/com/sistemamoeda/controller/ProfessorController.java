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
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ProfessorController {
    
    private final ProfessorService professorService;
    
    // Criar novo professor
    @PostMapping
    public ResponseEntity<?> criarProfessor(@Valid @RequestBody ProfessorRequestDTO request) {
        try {
            ProfessorResponseDTO professor = professorService.criarProfessor(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(professor);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Erro de validação: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro interno do servidor: " + e.getMessage());
        }
    }
    
    // Listar todos os professores
    @GetMapping
    public ResponseEntity<?> listarProfessores() {
        try {
            List<ProfessorResponseDTO> professores = professorService.listarTodos();
            return ResponseEntity.ok(professores);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao buscar professores: " + e.getMessage());
        }
    }
    
    // Buscar professor por ID
    @GetMapping("/{id}")
    public ResponseEntity<?> buscarProfessor(@PathVariable Long id) {
        try {
            ProfessorResponseDTO professor = professorService.buscarPorId(id);
            return ResponseEntity.ok(professor);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Professor não encontrado: " + e.getMessage());
        }
    }
    
    // Atualizar professor
    @PutMapping("/{id}")
    public ResponseEntity<?> atualizarProfessor(@PathVariable Long id, 
                                              @Valid @RequestBody ProfessorRequestDTO request) {
        try {
            ProfessorResponseDTO professor = professorService.atualizarProfessor(id, request);
            return ResponseEntity.ok(professor);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Erro de validação: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao atualizar professor: " + e.getMessage());
        }
    }
    
    // Deletar professor
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletarProfessor(@PathVariable Long id) {
        try {
            professorService.deletarProfessor(id);
            return ResponseEntity.ok().body("Professor excluído com sucesso");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao excluir professor: " + e.getMessage());
        }
    }
    
    // Buscar por instituição
    @GetMapping("/instituicao")
    public ResponseEntity<?> buscarPorInstituicao(@RequestParam String instituicao) {
        try {
            List<ProfessorResponseDTO> professores = professorService.buscarPorInstituicao(instituicao);
            return ResponseEntity.ok(professores);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao buscar professores: " + e.getMessage());
        }
    }
    
    // Buscar por departamento
    @GetMapping("/departamento")
    public ResponseEntity<?> buscarPorDepartamento(@RequestParam String departamento) {
        try {
            List<ProfessorResponseDTO> professores = professorService.buscarPorDepartamento(departamento);
            return ResponseEntity.ok(professores);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao buscar professores: " + e.getMessage());
        }
    }
    
    // Buscar por nome
    @GetMapping("/nome")
    public ResponseEntity<?> buscarPorNome(@RequestParam String nome) {
        try {
            List<ProfessorResponseDTO> professores = professorService.buscarPorNome(nome);
            return ResponseEntity.ok(professores);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao buscar professores: " + e.getMessage());
        }
    }
    
    // Buscar por CPF
    @GetMapping("/cpf/{cpf}")
    public ResponseEntity<?> buscarPorCpf(@PathVariable String cpf) {
        try {
            ProfessorResponseDTO professor = professorService.buscarPorCpf(cpf);
            return ResponseEntity.ok(professor);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Professor não encontrado: " + e.getMessage());
        }
    }
    
    // Buscar por email
    @GetMapping("/email/{email}")
    public ResponseEntity<?> buscarPorEmail(@PathVariable String email) {
        try {
            ProfessorResponseDTO professor = professorService.buscarPorEmail(email);
            return ResponseEntity.ok(professor);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Professor não encontrado: " + e.getMessage());
        }
    }
    
    // Adicionar moedas semestrais
    @PostMapping("/{id}/moedas-semestrais")
    public ResponseEntity<?> adicionarMoedasSemestrais(@PathVariable Long id) {
        try {
            ProfessorResponseDTO professor = professorService.adicionarMoedasSemestrais(id);
            return ResponseEntity.ok(professor);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao adicionar moedas semestrais: " + e.getMessage());
        }
    }
    
    // Buscar professores com saldo baixo
    @GetMapping("/saldo-baixo")
    public ResponseEntity<?> buscarComSaldoBaixo() {
        try {
            List<ProfessorResponseDTO> professores = professorService.buscarComSaldoBaixo();
            return ResponseEntity.ok(professores);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao buscar professores: " + e.getMessage());
        }
    }
    
    // Buscar por faixa de saldo
    @GetMapping("/saldo")
    public ResponseEntity<?> buscarPorFaixaSaldo(@RequestParam BigDecimal minimo, 
                                               @RequestParam BigDecimal maximo) {
        try {
            List<ProfessorResponseDTO> professores = professorService.buscarPorFaixaSaldo(minimo, maximo);
            return ResponseEntity.ok(professores);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao buscar professores: " + e.getMessage());
        }
    }
}