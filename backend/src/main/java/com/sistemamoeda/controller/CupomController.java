package com.sistemamoeda.controller;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.qrcode.QRCodeWriter;
import com.sistemamoeda.dto.TransacaoResponseDTO;
import com.sistemamoeda.model.Aluno;
import com.sistemamoeda.model.Professor;
import com.sistemamoeda.service.AlunoService;
import com.sistemamoeda.service.EmailService;
import com.sistemamoeda.service.ProfessorService;
import com.sistemamoeda.service.TransacaoService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import java.io.ByteArrayOutputStream;

@RestController
@RequestMapping("/api/cupons")
@RequiredArgsConstructor
public class CupomController {

    private final TransacaoService transacaoService;
    private final EmailService emailService;
    private final ProfessorService professorService;
    private final AlunoService alunoService;


    @GetMapping("/{codigo}")
    public TransacaoResponseDTO buscarCupom(@PathVariable String codigo) {
        return transacaoService.buscarPorCodigoCupom(codigo);
    }

    @GetMapping(value = "/{codigo}/qrcode", produces = MediaType.IMAGE_PNG_VALUE)
    public @ResponseBody byte[] gerarQrCode(@PathVariable String codigo) throws Exception {
        return generateQRCodeImage(codigo);
    }

    @PostMapping("/{codigo}/enviar/{usuarioId}")
    public String enviarCupomPorEmail(@PathVariable String codigo, @PathVariable Long usuarioId) throws Exception {

        TransacaoResponseDTO cupom = transacaoService.buscarPorCodigoCupom(codigo);

        String email;
        String nomeUsuario;


        Professor professor = professorService.buscarPorId(usuarioId);
        if (professor != null) {
            email = professor.getUsuario().getEmail();
            nomeUsuario = professor.getUsuario().getNome();
        } 

        else {
            Aluno aluno = alunoService.buscarPorId(usuarioId);
            if (aluno == null) {
                throw new IllegalArgumentException("O usuário informado não é aluno nem professor.");
            }
            email = aluno.getUsuario().getEmail();
            nomeUsuario = aluno.getUsuario().getNome();
        }

        // Gerar QR code
        byte[] qr = generateQRCodeImage(cupom.getCodigoCupom());

        // Montar conteúdo HTML
        String mensagemHtml = """
            <h2>Seu Cupom</h2>
            <p>Olá %s,</p>
            <p>Aqui está seu cupom referente à vantagem: <b>%s</b></p>
            <p><b>Código:</b> %s</p>
            <p>Use o QR Code abaixo para realizar o resgate:</p>
            <br>
            <img src='cid:qrcodeImage'>
        """.formatted(nomeUsuario, cupom.getVantagemNome(), cupom.getCodigoCupom());

        // Enviar e-mail com QR Code embedado
        emailService.enviarEmailComAnexoInline(
                email,
                "Seu Cupom - Sistema de Moeda",
                mensagemHtml,
                "qrcodeImage",
                qr
        );

        return "Cupom enviado para " + email;
    }

    private byte[] generateQRCodeImage(String text) throws WriterException, java.io.IOException {
        QRCodeWriter qr = new QRCodeWriter();
        var matrix = qr.encode(text, BarcodeFormat.QR_CODE, 300, 300);

        ByteArrayOutputStream pngOutput = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(matrix, "PNG", pngOutput);

        return pngOutput.toByteArray();
    }
}
