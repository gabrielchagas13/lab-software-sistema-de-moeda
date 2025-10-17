package com.sistemamoeda.controller;

import com.sistemamoeda.dto.VantagemRequestDTO;
import com.sistemamoeda.dto.VantagemResponseDTO;
import com.sistemamoeda.service.VantagemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/vantagens")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class VantagemController {
    
    private final VantagemService vantagemService;
    
    // Criar nova vantagem
    @PostMapping
    public ResponseEntity<?> criarVantagem(@Valid @RequestBody VantagemRequestDTO request) {
        try {
            VantagemResponseDTO vantagem = vantagemService.criarVantagem(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(vantagem);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Erro de validação: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro interno do servidor: " + e.getMessage());
        }
    }
    
    // Listar todas as vantagens
    @GetMapping
    public ResponseEntity<?> listarVantagens() {
        try {
            List<VantagemResponseDTO> vantagens = vantagemService.listarTodas();
            return ResponseEntity.ok(vantagens);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao buscar vantagens: " + e.getMessage());
        }
    }
    
    // Listar apenas vantagens ativas
    @GetMapping("/ativas")
    public ResponseEntity<?> listarVantagensAtivas() {
        try {
            List<VantagemResponseDTO> vantagens = vantagemService.listarAtivas();
            return ResponseEntity.ok(vantagens);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao buscar vantagens ativas: " + e.getMessage());
        }
    }
    
    // Buscar vantagem por ID
    @GetMapping("/{id}")
    public ResponseEntity<?> buscarVantagem(@PathVariable Long id) {
        try {
            VantagemResponseDTO vantagem = vantagemService.buscarPorId(id);
            return ResponseEntity.ok(vantagem);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Vantagem não encontrada: " + e.getMessage());
        }
    }
    
    // Atualizar vantagem
    @PutMapping("/{id}")
    public ResponseEntity<?> atualizarVantagem(@PathVariable Long id, 
                                             @Valid @RequestBody VantagemRequestDTO request) {
        try {
            VantagemResponseDTO vantagem = vantagemService.atualizarVantagem(id, request);
            return ResponseEntity.ok(vantagem);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Erro de validação: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao atualizar vantagem: " + e.getMessage());
        }
    }
    
    // Deletar vantagem
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletarVantagem(@PathVariable Long id) {
        try {
            vantagemService.deletarVantagem(id);
            return ResponseEntity.ok().body("Vantagem excluída com sucesso");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao excluir vantagem: " + e.getMessage());
        }
    }
    
    // Ativar vantagem
    @PostMapping("/{id}/ativar")
    public ResponseEntity<?> ativarVantagem(@PathVariable Long id) {
        try {
            VantagemResponseDTO vantagem = vantagemService.ativarVantagem(id);
            return ResponseEntity.ok(vantagem);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao ativar vantagem: " + e.getMessage());
        }
    }
    
    // Desativar vantagem
    @PostMapping("/{id}/desativar")
    public ResponseEntity<?> desativarVantagem(@PathVariable Long id) {
        try {
            VantagemResponseDTO vantagem = vantagemService.desativarVantagem(id);
            return ResponseEntity.ok(vantagem);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao desativar vantagem: " + e.getMessage());
        }
    }
    
    // Buscar por empresa
    @GetMapping("/empresa/{empresaId}")
    public ResponseEntity<?> buscarPorEmpresa(@PathVariable Long empresaId) {
        try {
            List<VantagemResponseDTO> vantagens = vantagemService.buscarPorEmpresa(empresaId);
            return ResponseEntity.ok(vantagens);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao buscar vantagens: " + e.getMessage());
        }
    }
    
    // Buscar vantagens ativas por empresa
    @GetMapping("/empresa/{empresaId}/ativas")
    public ResponseEntity<?> buscarAtivasPorEmpresa(@PathVariable Long empresaId) {
        try {
            List<VantagemResponseDTO> vantagens = vantagemService.buscarAtivasPorEmpresa(empresaId);
            return ResponseEntity.ok(vantagens);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao buscar vantagens: " + e.getMessage());
        }
    }
    
    // Buscar por nome
    @GetMapping("/nome")
    public ResponseEntity<?> buscarPorNome(@RequestParam String nome) {
        try {
            List<VantagemResponseDTO> vantagens = vantagemService.buscarPorNome(nome);
            return ResponseEntity.ok(vantagens);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao buscar vantagens: " + e.getMessage());
        }
    }
    
    // Buscar por descrição
    @GetMapping("/descricao")
    public ResponseEntity<?> buscarPorDescricao(@RequestParam String descricao) {
        try {
            List<VantagemResponseDTO> vantagens = vantagemService.buscarPorDescricao(descricao);
            return ResponseEntity.ok(vantagens);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao buscar vantagens: " + e.getMessage());
        }
    }
    
    // Buscar por faixa de preço
    @GetMapping("/preco")
    public ResponseEntity<?> buscarPorFaixaPreco(@RequestParam BigDecimal minimo, 
                                               @RequestParam BigDecimal maximo) {
        try {
            List<VantagemResponseDTO> vantagens = vantagemService.buscarPorFaixaPreco(minimo, maximo);
            return ResponseEntity.ok(vantagens);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao buscar vantagens: " + e.getMessage());
        }
    }
    
    // Buscar vantagens que o aluno consegue pagar
    @GetMapping("/acessiveis/{saldoAluno}")
    public ResponseEntity<?> buscarQueAlunoConseguePagar(@PathVariable BigDecimal saldoAluno) {
        try {
            List<VantagemResponseDTO> vantagens = vantagemService.buscarQueAlunoConseguePagar(saldoAluno);
            return ResponseEntity.ok(vantagens);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao buscar vantagens: " + e.getMessage());
        }
    }
    
    // Buscar vantagens mais baratas
    @GetMapping("/mais-baratas")
    public ResponseEntity<?> buscarMaisBaratas() {
        try {
            List<VantagemResponseDTO> vantagens = vantagemService.buscarMaisBaratas();
            return ResponseEntity.ok(vantagens);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao buscar vantagens: " + e.getMessage());
        }
    }
    
    // Buscar vantagens mais caras
    @GetMapping("/mais-caras")
    public ResponseEntity<?> buscarMaisCaras() {
        try {
            List<VantagemResponseDTO> vantagens = vantagemService.buscarMaisCaras();
            return ResponseEntity.ok(vantagens);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao buscar vantagens: " + e.getMessage());
        }
    }
    
    // Estatísticas - custo médio por empresa
    @GetMapping("/empresa/{empresaId}/custo-medio")
    public ResponseEntity<?> calcularCustoMedioPorEmpresa(@PathVariable Long empresaId) {
        try {
            BigDecimal custoMedio = vantagemService.calcularCustoMedioPorEmpresa(empresaId);
            return ResponseEntity.ok(custoMedio);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao calcular custo médio: " + e.getMessage());
        }
    }
    
    // Estatísticas - custo mínimo por empresa
    @GetMapping("/empresa/{empresaId}/custo-minimo")
    public ResponseEntity<?> calcularCustoMinimoPorEmpresa(@PathVariable Long empresaId) {
        try {
            BigDecimal custoMinimo = vantagemService.calcularCustoMinimoPorEmpresa(empresaId);
            return ResponseEntity.ok(custoMinimo);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao calcular custo mínimo: " + e.getMessage());
        }
    }
    
    // Estatísticas - custo máximo por empresa
    @GetMapping("/empresa/{empresaId}/custo-maximo")
    public ResponseEntity<?> calcularCustoMaximoPorEmpresa(@PathVariable Long empresaId) {
        try {
            BigDecimal custoMaximo = vantagemService.calcularCustoMaximoPorEmpresa(empresaId);
            return ResponseEntity.ok(custoMaximo);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao calcular custo máximo: " + e.getMessage());
        }
    }
}