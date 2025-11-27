package com.sistemamoeda.service;

import org.apache.commons.text.StringEscapeUtils;
import com.sistemamoeda.service.EmailService;
import com.sistemamoeda.service.QRCodeService;
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
    private EmailService emailService;
   
    @Autowired
    private QRCodeService qrCodeService;



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
    // Envia e-mail HTML com GIF aleatório para o aluno
    emailService.enviarEmailHtmlComGif(
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

    // Gerar código único do cupom (forma já usada no projeto)
    String codigoCupom = generateCupomCode();

    // Criar registro de transação (inclui codigoCupom)
    Transacao transacao = new Transacao(
        TipoTransacao.RESGATE_VANTAGEM,
        vantagem.getCustoMoedas(),
        "Resgate da vantagem: " + vantagem.getNome(),
        aluno.getUsuario(),
        vantagem,
        codigoCupom
    );

    transacao = transacaoRepository.save(transacao);

    try {
        String emailAluno = aluno.getUsuario().getEmail();
        String nomeAluno = aluno.getUsuario().getNome();
        String assuntoAluno = "Seu cupom: " + codigoCupom;

        // mensagem em HTML (pode ajustar o template conforme desejar)
        String mensagemAlunoHtml = String.format(
            """
            <html>
            <body style="font-family: Arial, sans-serif; background-color:#f7f7f7; padding:20px;">
                <div style="max-width:600px; margin:auto; background:white; padding:25px; border-radius:10px; box-shadow:0 2px 10px rgba(0,0,0,0.08);">
                    
                    <h2 style="color:#333; text-align:center;">🎉 Seu Cupom Está Pronto!</h2>
                    
                    <p>Olá <b>%s</b>,</p>

                    <p>Obrigado por resgatar a vantagem:</p>
                    
                    <div style="padding:10px 15px; background:#eef5ff; border-left:4px solid #4a90e2; border-radius:5px; margin:10px 0;">
                        <b>%s</b>
                    </div>

                    <p>O seu código do cupom é:</p>

                    <div style="font-size:20px; padding:10px 15px; background:#fff3cd; border-left:4px solid #f0ad4e; border-radius:5px; margin:10px 0;">
                        <b>%s</b>
                    </div>

                    <p>
                        Você pode apresentar esse código <b>ou</b> utilizar o QR Code abaixo para resgatar sua vantagem:<br><br>
                    </p>

                    <div style="text-align:center;">
                        <img src="cid:qrcodeinline" style="width:250px; height:250px;"/>
                    </div>

                    <p style="margin-top:25px;">
                        Atenciosamente,<br/>
                        <b>Sistema de Moeda</b>
                    </p>

                    <hr style="margin:30px 0; border:none; border-top:1px solid #ddd;"/>

                    <p style="font-size:12px; color:#777; text-align:center;">
                        Este é um e-mail automático. Não responda.
                    </p>

                </div>
            </body>
            </html>
            """,
            StringEscapeUtils.escapeHtml4(nomeAluno),
            StringEscapeUtils.escapeHtml4(vantagem.getNome()),
            StringEscapeUtils.escapeHtml4(codigoCupom)
        );



        // Gera QR Code como arquivo físico (em qrcodes/) e obtém o caminho
        String qrConteudo = codigoCupom;
        byte[] qrBytes = qrCodeService.gerarQRCodeBytes(qrConteudo);

        emailService.enviarCupomComQrCodeInline(emailAluno, assuntoAluno, mensagemAlunoHtml, qrBytes);

        // Notificar a empresa parceira (mantendo comportamento original)
        if (vantagem.getEmpresa() != null && vantagem.getEmpresa().getUsuario() != null) {
            String emailEmpresa = vantagem.getEmpresa().getUsuario().getEmail();
            String nomeEmpresa = vantagem.getEmpresa().getNomeFantasia();
            String assuntoEmpresa = "Novo resgate da vantagem: " + vantagem.getNome();
            String mensagemEmpresa = String.format("Olá %s,\n\nO aluno %s resgatou a vantagem '%s'.\nCódigo do cupom: %s\n\nAtenciosamente,\nSistema de Moeda",
                    nomeEmpresa, nomeAluno, vantagem.getNome(), codigoCupom);

            emailService.enviarEmailSimples(emailEmpresa, assuntoEmpresa, mensagemEmpresa);
        }

    } catch (Exception e) {
        // não interromper o fluxo do resgate apenas por falha no envio de e-mail
        System.out.println(String.format("Falha ao enviar e-mail com cupom para aluno: %s", e.getMessage()));
        e.printStackTrace();
    }

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

    // Transferir/ trocar uma vantagem (cupom) entre alunos
// Transferir/ trocar uma vantagem (cupom) entre alunos
    public TransacaoResponseDTO transferirVantagem(com.sistemamoeda.dto.TransferirVantagemRequestDTO request) {
        
        // MUDANÇA: Buscar a transação MAIS RECENTE do cupom, não a original
        Transacao transacaoAtual = transacaoRepository.findTopByCodigoCupomOrderByDataTransacaoDesc(request.getCodigoCupom())
                .orElseThrow(() -> new EntityNotFoundException("Cupom não encontrado"));

        if (transacaoAtual.getVantagem() == null) {
            throw new IllegalArgumentException("Transação não corresponde a um resgate de vantagem");
        }

        // Buscar alunos envolvidos e extrair seus usuarios
        Aluno remetenteAluno = alunoRepository.findById(request.getRemetenteId())
            .orElseThrow(() -> new EntityNotFoundException("Remetente (aluno) não encontrado"));
        Aluno destinatarioAluno = alunoRepository.findById(request.getDestinatarioId())
            .orElseThrow(() -> new EntityNotFoundException("Destinatário (aluno) não encontrado"));

        Usuario remetente = remetenteAluno.getUsuario();
        Usuario destinatario = destinatarioAluno.getUsuario();

        // MUDANÇA: Validar proprietário atual do cupom (deve ser o destinatário da ÚLTIMA transação)
        if (transacaoAtual.getDestinatario() == null || !transacaoAtual.getDestinatario().getId().equals(remetente.getId())) {
            throw new IllegalArgumentException("O remetente informado não é o proprietário atual do cupom");
        }

        // Criar transação de troca
        Transacao troca = new Transacao();
        troca.setTipoTransacao(com.sistemamoeda.model.TipoTransacao.TROCA_VANTAGEM);
        troca.setValor(java.math.BigDecimal.ZERO); // Valor é 0.00 para trocas
        troca.setDescricao("Transferência de cupom: " + transacaoAtual.getCodigoCupom());
        troca.setRemetente(remetente);
        troca.setDestinatario(destinatario);
        troca.setVantagem(transacaoAtual.getVantagem());
        troca.setCodigoCupom(transacaoAtual.getCodigoCupom());

        troca = transacaoRepository.save(troca);

        // Enviar notificações por email (novo proprietário + empresa)
        try {
            String emailDest = destinatario.getEmail();
            String nomeDest = destinatario.getNome();
            String assunto = "Você recebeu um cupom transferido: " + troca.getCodigoCupom();
            String mensagemTransferenciaHtml = String.format(
                """
                <html>
                <body style="font-family: Arial, sans-serif; background-color:#f7f7f7; padding:20px;">
                    <div style="max-width:600px; margin:auto; background:white; padding:25px; border-radius:10px; box-shadow:0 2px 10px rgba(0,0,0,0.08);">
                        
                        <h2 style="color:#333; text-align:center;">🎁 Você recebeu um Cupom!</h2>
                        
                        <p>Olá <b>%s</b>,</p>

                        <p>O aluno(a) <b>%s</b> transferiu a seguinte vantagem para você:</p>
                        
                        <div style="padding:10px 15px; background:#eef5ff; border-left:4px solid #4a90e2; border-radius:5px; margin:10px 0;">
                            <b>%s</b>
                        </div>

                        <p>O seu código do cupom é:</p>

                        <div style="font-size:20px; padding:10px 15px; background:#fff3cd; border-left:4px solid #f0ad4e; border-radius:5px; margin:10px 0;">
                            <b>%s</b>
                        </div>

                        <p>
                            Você pode apresentar esse código <b>ou</b> utilizar o QR Code abaixo para resgatar sua vantagem:<br><br>
                        </p>

                        <div style="text-align:center;">
                            <img src="cid:qrcodeinline" style="width:250px; height:250px;"/>
                        </div>

                        <p style="margin-top:25px;">
                            Atenciosamente,<br/>
                            <b>Sistema de Moeda</b>
                        </p>

                        <hr style="margin:30px 0; border:none; border-top:1px solid #ddd;"/>

                        <p style="font-size:12px; color:#777; text-align:center;">
                            Este é um e-mail automático. Não responda.
                        </p>

                    </div>
                </body>
                </html>
                """,
                StringEscapeUtils.escapeHtml4(destinatario.getNome()),       // 1º %s: Nome do Destinatário
                StringEscapeUtils.escapeHtml4(remetente.getNome()),          // 2º %s: Nome de quem enviou
                StringEscapeUtils.escapeHtml4(troca.getVantagem().getNome()),// 3º %s: Nome da Vantagem
                StringEscapeUtils.escapeHtml4(troca.getCodigoCupom())        // 4º %s: Código do Cupom
            );

            String qrConteudo = troca.getCodigoCupom();

            byte[] qrBytes = qrCodeService.gerarQRCodeBytes(qrConteudo);

            emailService.enviarCupomComQrCodeInline(destinatario.getEmail(), assunto, mensagemTransferenciaHtml, qrBytes);

            if (troca.getVantagem().getEmpresa() != null && troca.getVantagem().getEmpresa().getUsuario() != null) {
                String emailEmpresa = troca.getVantagem().getEmpresa().getUsuario().getEmail();
                String mensagemEmpresa = String.format("Olá,\n\nO cupom %s da vantagem '%s' foi transferido do aluno %s para %s.\n\nAtenciosamente,\nSistema de Moeda",
                        troca.getCodigoCupom(), troca.getVantagem().getNome(), remetente.getNome(), nomeDest);
                emailService.enviarEmailSimples(emailEmpresa, "Cupom transferido", mensagemEmpresa);
            }
        } catch (Exception e) {
            System.err.println("⚠️ Falha ao enviar emails sobre transferência: " + e.getMessage());
        }

        return convertToResponseDTO(troca);
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