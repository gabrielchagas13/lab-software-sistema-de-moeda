package com.sistemamoeda.controller;

import com.sistemamoeda.dto.ResgateVantagemRequestDTO;
import com.sistemamoeda.dto.TransacaoRequestDTO;
import com.sistemamoeda.dto.TransacaoResponseDTO;
import com.sistemamoeda.model.TipoTransacao;
import com.sistemamoeda.service.TransacaoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/transacoes")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class TransacaoController {
    
    private final TransacaoService transacaoService;
    
    // Enviar moedas (Professor -> Aluno)
    @PostMapping("/enviar-moedas")
    public ResponseEntity<?> enviarMoedas(@Valid @RequestBody TransacaoRequestDTO request) {
        try {
            TransacaoResponseDTO transacao = transacaoService.enviarMoedas(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(transacao);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Erro de validação: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro interno do servidor: " + e.getMessage());
        }
    }
    
    // Resgatar vantagem (Aluno -> Empresa)
    @PostMapping("/resgatar-vantagem")
    public ResponseEntity<?> resgatarVantagem(@Valid @RequestBody ResgateVantagemRequestDTO request) {
        try {
            TransacaoResponseDTO transacao = transacaoService.resgatarVantagem(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(transacao);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Erro de validação: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro interno do servidor: " + e.getMessage());
        }
    }
    
    // Adicionar crédito semestral para todos os professores (endpoint administrativo)
    @PostMapping("/credito-semestral")
    public ResponseEntity<?> adicionarCreditoSemestral() {
        try {
            List<TransacaoResponseDTO> transacoes = transacaoService.adicionarCreditoSemestral();
            return ResponseEntity.ok(transacoes);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao adicionar crédito semestral: " + e.getMessage());
        }
    }
    
    // Listar todas as transações
    @GetMapping
    public ResponseEntity<?> listarTransacoes() {
        try {
            List<TransacaoResponseDTO> transacoes = transacaoService.listarTodas();
            return ResponseEntity.ok(transacoes);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao buscar transações: " + e.getMessage());
        }
    }
    
    // Buscar transação por ID
    @GetMapping("/{id}")
    public ResponseEntity<?> buscarTransacao(@PathVariable Long id) {
        try {
            TransacaoResponseDTO transacao = transacaoService.buscarPorId(id);
            return ResponseEntity.ok(transacao);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Transação não encontrada: " + e.getMessage());
        }
    }
    
    // Buscar extrato de um usuário
    @GetMapping("/extrato/usuario/{usuarioId}")
    public ResponseEntity<?> buscarExtratoUsuario(@PathVariable Long usuarioId) {
        try {
            List<TransacaoResponseDTO> transacoes = transacaoService.buscarExtratoUsuario(usuarioId);
            return ResponseEntity.ok(transacoes);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao buscar extrato: " + e.getMessage());
        }
    }
    
    // Buscar extrato por período
    @GetMapping("/extrato/usuario/{usuarioId}/periodo")
    public ResponseEntity<?> buscarExtratoPorPeriodo(
            @PathVariable Long usuarioId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataFim) {
        try {
            List<TransacaoResponseDTO> transacoes = transacaoService.buscarExtratoPorPeriodo(usuarioId, dataInicio, dataFim);
            return ResponseEntity.ok(transacoes);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao buscar extrato: " + e.getMessage());
        }
    }
    
    // Buscar transações por tipo
    @GetMapping("/tipo/{tipo}")
    public ResponseEntity<?> buscarPorTipo(@PathVariable TipoTransacao tipo) {
        try {
            List<TransacaoResponseDTO> transacoes = transacaoService.buscarPorTipo(tipo);
            return ResponseEntity.ok(transacoes);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao buscar transações: " + e.getMessage());
        }
    }
    
    // Buscar transações por período
    @GetMapping("/periodo")
    public ResponseEntity<?> buscarPorPeriodo(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataFim) {
        try {
            List<TransacaoResponseDTO> transacoes = transacaoService.buscarPorPeriodo(dataInicio, dataFim);
            return ResponseEntity.ok(transacoes);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao buscar transações: " + e.getMessage());
        }
    }
    
    // Buscar por código do cupom
    @GetMapping("/cupom/{codigoCupom}")
    public ResponseEntity<?> buscarPorCodigoCupom(@PathVariable String codigoCupom) {
        try {
            TransacaoResponseDTO transacao = transacaoService.buscarPorCodigoCupom(codigoCupom);
            return ResponseEntity.ok(transacao);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Cupom não encontrado: " + e.getMessage());
        }
    }
    
    // Buscar transações recentes
    @GetMapping("/recentes")
    public ResponseEntity<?> buscarRecentes() {
        try {
            List<TransacaoResponseDTO> transacoes = transacaoService.buscarRecentes();
            return ResponseEntity.ok(transacoes);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao buscar transações: " + e.getMessage());
        }
    }
    
    // Estatísticas - moedas enviadas por professor
    @GetMapping("/estatisticas/professor/{professorId}/enviadas")
    public ResponseEntity<?> calcularMoedasEnviadasPorProfessor(@PathVariable Long professorId) {
        try {
            BigDecimal total = transacaoService.calcularMoedasEnviadasPorProfessor(professorId);
            return ResponseEntity.ok(total);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao calcular estatísticas: " + e.getMessage());
        }
    }
    
    // Estatísticas - moedas recebidas por aluno
    @GetMapping("/estatisticas/aluno/{alunoId}/recebidas")
    public ResponseEntity<?> calcularMoedasRecebidasPorAluno(@PathVariable Long alunoId) {
        try {
            BigDecimal total = transacaoService.calcularMoedasRecebidasPorAluno(alunoId);
            return ResponseEntity.ok(total);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao calcular estatísticas: " + e.getMessage());
        }
    }
    
    // Estatísticas - moedas gastas por aluno
    @GetMapping("/estatisticas/aluno/{alunoId}/gastas")
    public ResponseEntity<?> calcularMoedasGastasPorAluno(@PathVariable Long alunoId) {
        try {
            BigDecimal total = transacaoService.calcularMoedasGastasPorAluno(alunoId);
            return ResponseEntity.ok(total);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao calcular estatísticas: " + e.getMessage());
        }
    }
    
    // Estatísticas - resgates de uma vantagem
    @GetMapping("/estatisticas/vantagem/{vantagemId}/resgates")
    public ResponseEntity<?> contarResgatesPorVantagem(@PathVariable Long vantagemId) {
        try {
            Long total = transacaoService.contarResgatesPorVantagem(vantagemId);
            return ResponseEntity.ok(total);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao calcular estatísticas: " + e.getMessage());
        }
    }
}