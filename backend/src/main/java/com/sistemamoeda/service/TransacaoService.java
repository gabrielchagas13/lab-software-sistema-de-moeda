package com.sistemamoeda.service;

import com.sistemamoeda.service.EmailService;
import com.sistemamoeda.dto.TransacaoRequestDTO;
import com.sistemamoeda.dto.TransacaoResponseDTO;
import com.sistemamoeda.dto.ResgateVantagemRequestDTO;
import com.sistemamoeda.model.*;
import com.sistemamoeda.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Transactional
public class TransacaoService {
    
    private final TransacaoRepository transacaoRepository;
    private final ProfessorRepository professorRepository;
    private final AlunoRepository alunoRepository;
    private final VantagemRepository vantagemRepository;
    private final UsuarioRepository usuarioRepository;

    @Autowired
    private EmailService emailService;;
    


    // Enviar moedas (Professor -> Aluno)
    public TransacaoResponseDTO enviarMoedas(TransacaoRequestDTO request) {
        // Buscar professor
        Professor professor = professorRepository.findById(request.getRemetenteId())
                .orElseThrow(() -> new EntityNotFoundException("Professor não encontrado"));
        
        // Buscar aluno
        Aluno aluno = alunoRepository.findById(request.getDestinatarioId())
                .orElseThrow(() -> new EntityNotFoundException("Aluno não encontrado"));
        
        // Verificar se professor tem saldo suficiente
        if (!professor.podeEnviar(request.getValor())) {
            throw new IllegalArgumentException("Professor não possui saldo suficiente. Saldo atual: " + professor.getSaldoMoedas());
        }
        
        // Validar valor
        if (request.getValor().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Valor deve ser maior que zero");
        }
        
        // Validar descrição obrigatória
        if (request.getDescricao() == null || request.getDescricao().trim().isEmpty()) {
            throw new IllegalArgumentException("Motivo/descrição é obrigatório para envio de moedas");
        }
        
        // Realizar transferência
        professor.enviarMoedas(request.getValor());
        aluno.adicionarMoedas(request.getValor());
        
        // Salvar alterações nos usuários
        professorRepository.save(professor);
        alunoRepository.save(aluno);
        
        // Criar registro de transação
        Transacao transacao = new Transacao(
            TipoTransacao.ENVIO_MOEDA,
            request.getValor(),
            request.getDescricao().trim(),
            professor.getUsuario(),
            aluno.getUsuario()
        );
        
        transacao = transacaoRepository.save(transacao);
        
        // Envio de e-mails automáticos de confirmação
try {
    String emailProfessor = professor.getUsuario().getEmail();
    String emailAluno = aluno.getUsuario().getEmail();
    String nomeProfessor = professor.getUsuario().getNome();
    String nomeAluno = aluno.getUsuario().getNome();
    double valor = transacao.getValor().doubleValue();

    // Mensagem para o professor
    String msgProfessor = String.format(
        "Você acabou de enviar %.2f moedas ao aluno %s.",
        valor, nomeAluno
    );
    emailService.enviarEmailSimples(
        emailProfessor,
        "Confirmação de envio de moedas",
        msgProfessor
    );

    // Mensagem para o aluno
    String msgAluno = String.format(
        "Você acabou de receber %.2f moedas enviadas pelo professor %s.",
        valor, nomeProfessor
    );
    emailService.enviarEmailSimples(
        emailAluno,
        "Você recebeu novas moedas!",
        msgAluno
    );

    System.out.println("📧 E-mails de confirmação enviados com sucesso!");
} catch (Exception e) {
    System.err.println("⚠️ Falha ao enviar e-mails de confirmação: " + e.getMessage());
}

        
        return convertToResponseDTO(transacao);
    }
    
    // Resgatar vantagem (Aluno -> Empresa)
    public TransacaoResponseDTO resgatarVantagem(ResgateVantagemRequestDTO request) {
        // Buscar aluno
        Aluno aluno = alunoRepository.findById(request.getAlunoId())
                .orElseThrow(() -> new EntityNotFoundException("Aluno não encontrado"));
        
        // Buscar vantagem
        Vantagem vantagem = vantagemRepository.findById(request.getVantagemId())
                .orElseThrow(() -> new EntityNotFoundException("Vantagem não encontrada"));
        
        // Verificar se vantagem está ativa
        if (!vantagem.getAtiva()) {
            throw new IllegalArgumentException("Vantagem não está ativa");
        }
        
        // Verificar se aluno tem saldo suficiente
        if (!aluno.podeGastar(vantagem.getCustoMoedas())) {
            throw new IllegalArgumentException("Aluno não possui saldo suficiente. Saldo atual: " + aluno.getSaldoMoedas() + ", Custo: " + vantagem.getCustoMoedas());
        }
        
        // Descontar moedas do aluno
        aluno.gastarMoedas(vantagem.getCustoMoedas());
        alunoRepository.save(aluno);
        
        // Gerar código único do cupom
        String codigoCupom = generateCupomCode();
        
        // Criar registro de transação
        Transacao transacao = new Transacao(
            TipoTransacao.RESGATE_VANTAGEM,
            vantagem.getCustoMoedas(),
            "Resgate da vantagem: " + vantagem.getNome(),
            aluno.getUsuario(),
            vantagem,
            codigoCupom
        );
        
        transacao = transacaoRepository.save(transacao);
        
        // TODO: Enviar email para o aluno com o cupom
        // TODO: Enviar email para a empresa notificando o resgate
        
        return convertToResponseDTO(transacao);
    }
    
    // Adicionar crédito semestral para todos os professores
    public List<TransacaoResponseDTO> adicionarCreditoSemestral() {
        List<Professor> professores = professorRepository.findAll();
        
        return professores.stream().map(professor -> {
            // Adicionar 1000 moedas
            professor.adicionarMoedasSemestrais();
            professorRepository.save(professor);
            
            // Criar registro de transação
            Transacao transacao = new Transacao(
                TipoTransacao.CREDITO_SEMESTRAL,
                new BigDecimal("1000.00"),
                "Crédito semestral automático",
                professor.getUsuario()
            );
            
            transacao = transacaoRepository.save(transacao);
            return convertToResponseDTO(transacao);
        }).collect(Collectors.toList());
    }
    
    // Buscar extrato de um usuário
    @Transactional(readOnly = true)
    public List<TransacaoResponseDTO> buscarExtratoUsuario(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado"));
        
        return transacaoRepository.findExtratoUsuario(usuario)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }
    
    // Buscar extrato por período
    @Transactional(readOnly = true)
    public List<TransacaoResponseDTO> buscarExtratoPorPeriodo(Long usuarioId, LocalDateTime dataInicio, LocalDateTime dataFim) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado"));
        
        return transacaoRepository.findExtratoUsuarioPorPeriodo(usuario, dataInicio, dataFim)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }
    
    // Buscar todas as transações
    @Transactional(readOnly = true)
    public List<TransacaoResponseDTO> listarTodas() {
        return transacaoRepository.findAll()
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }
    
    // Buscar transação por ID
    @Transactional(readOnly = true)
    public TransacaoResponseDTO buscarPorId(Long id) {
        Transacao transacao = transacaoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Transação não encontrada"));
        
        return convertToResponseDTO(transacao);
    }
    
    // Buscar transações por tipo
    @Transactional(readOnly = true)
    public List<TransacaoResponseDTO> buscarPorTipo(TipoTransacao tipo) {
        return transacaoRepository.findByTipoTransacao(tipo)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }
    
    // Buscar transações por período
    @Transactional(readOnly = true)
    public List<TransacaoResponseDTO> buscarPorPeriodo(LocalDateTime dataInicio, LocalDateTime dataFim) {
        return transacaoRepository.findByDataTransacaoBetween(dataInicio, dataFim)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }
    
    // Buscar por código do cupom
    @Transactional(readOnly = true)
    public TransacaoResponseDTO buscarPorCodigoCupom(String codigoCupom) {
        Transacao transacao = transacaoRepository.findByCodigoCupom(codigoCupom)
                .orElseThrow(() -> new EntityNotFoundException("Cupom não encontrado"));
        
        return convertToResponseDTO(transacao);
    }
    
    // Buscar transações recentes (últimas 10)
    @Transactional(readOnly = true)
    public List<TransacaoResponseDTO> buscarRecentes() {
        return transacaoRepository.findTop10ByOrderByDataTransacaoDesc()
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }
    
    // Estatísticas - total de moedas enviadas por professor
    @Transactional(readOnly = true)
    public BigDecimal calcularMoedasEnviadasPorProfessor(Long professorId) {
        Professor professor = professorRepository.findById(professorId)
                .orElseThrow(() -> new EntityNotFoundException("Professor não encontrado"));
        
        return transacaoRepository.sumMoedasEnviadasPorProfessor(professor.getUsuario());
    }
    
    // Estatísticas - total de moedas recebidas por aluno
    @Transactional(readOnly = true)
    public BigDecimal calcularMoedasRecebidasPorAluno(Long alunoId) {
        Aluno aluno = alunoRepository.findById(alunoId)
                .orElseThrow(() -> new EntityNotFoundException("Aluno não encontrado"));
        
        return transacaoRepository.sumMoedasRecebidasPorAluno(aluno.getUsuario());
    }
    
    // Estatísticas - total de moedas gastas por aluno
    @Transactional(readOnly = true)
    public BigDecimal calcularMoedasGastasPorAluno(Long alunoId) {
        Aluno aluno = alunoRepository.findById(alunoId)
                .orElseThrow(() -> new EntityNotFoundException("Aluno não encontrado"));
        
        return transacaoRepository.sumMoedasGastasPorAluno(aluno.getUsuario());
    }
    
    // Estatísticas - total de resgates de uma vantagem
    @Transactional(readOnly = true)
    public Long contarResgatesPorVantagem(Long vantagemId) {
        return transacaoRepository.countResgatesPorVantagem(vantagemId);
    }
    
    // Gerar código único do cupom
    private String generateCupomCode() {
        return "CUP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
    
    // Converter entidade para DTO de resposta
    private TransacaoResponseDTO convertToResponseDTO(Transacao transacao) {
        TransacaoResponseDTO dto = new TransacaoResponseDTO();
        dto.setId(transacao.getId());
        dto.setTipoTransacao(transacao.getTipoTransacao().name());
        dto.setValor(transacao.getValor());
        dto.setDescricao(transacao.getDescricao());
        dto.setDataTransacao(transacao.getDataTransacao());
        dto.setCodigoCupom(transacao.getCodigoCupom());
        
        if (transacao.getRemetente() != null) {
            dto.setRemetenteId(transacao.getRemetente().getId());
            dto.setRemetenteNome(transacao.getRemetente().getNome());
        }
        
        if (transacao.getDestinatario() != null) {
            dto.setDestinatarioId(transacao.getDestinatario().getId());
            dto.setDestinatarioNome(transacao.getDestinatario().getNome());
        }
        
        if (transacao.getVantagem() != null) {
            dto.setVantagemId(transacao.getVantagem().getId());
            dto.setVantagemNome(transacao.getVantagem().getNome());
            dto.setEmpresaNome(transacao.getVantagem().getEmpresa().getNomeFantasia());
        }
        
        return dto;
    }



}