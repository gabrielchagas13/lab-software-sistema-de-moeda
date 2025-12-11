package com.sistemamoeda.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;

import java.io.File;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    private final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Async
    public void enviarEmailSimples(String destinatario, String assunto, String mensagem) {
        try {
            SimpleMailMessage email = new SimpleMailMessage();
            email.setTo(destinatario);
            email.setSubject(assunto);
            email.setText(mensagem);
            mailSender.send(email);
            log.info("E-mail enviado para: {} assunto={}", destinatario, assunto);
        } catch (Exception e) {
            log.error("Erro ao enviar e-mail para {}: {}", destinatario, e.getMessage(), e);
        }
    }

    @Async
    public void enviarEmailHtmlComGif(String destinatario, String assunto, String mensagem) {
        List<String> gifs = Arrays.asList(
                "https://media.giphy.com/media/3o6Zt6ML6BklcajjsA/giphy.gif",
                "https://media.giphy.com/media/l0MYEqEzwMWFCg8rm/giphy.gif",
                "https://media.giphy.com/media/111ebonMs90YLu/giphy.gif",
                "https://media.giphy.com/media/5GoVLqeAOo6PK/giphy.gif",
                "https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif"
        );

        String gif = gifs.get(new Random().nextInt(gifs.size()));

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, false, "UTF-8");
            String html = """
            <html>
            <body style="font-family: Arial, sans-serif; background-color:#f2f2f2; padding:30px;">
                <div style="
                    max-width:600px;
                    margin:auto;
                    background:white;
                    padding:25px;
                    border-radius:12px;
                    box-shadow:0 4px 15px rgba(0,0,0,0.1);
                    text-align:center;
                ">
                    <h2 style="color:#4A90E2; margin-bottom:20px;">📩 Você recebeu uma mensagem!</h2>
                    
                    <p style="
                        font-size:16px;
                        color:#333;
                        line-height:1.6;
                        text-align:left;
                    ">
                        %s
                    </p>

                    <div style="margin:25px 0;">
                        <img src="%s" alt="gif" style="width:100%%; max-width:380px; border-radius:10px;">
                    </div>

                    <p style="color:#888; font-size:13px; margin-top:25px;">
                        Esta é uma mensagem automática — por favor, não responda.
                    </p>
                </div>
            </body>
            </html>
            """.formatted(
                escapeHtml(mensagem).replace("\n", "<br/>"),
                gif
            );

            helper.setTo(destinatario);
            helper.setSubject(assunto);
            helper.setText(html, true);
            mailSender.send(mimeMessage);
            log.info("E-mail HTML enviado para: {} assunto={}", destinatario, assunto);
        } catch (Exception e) {
            log.error("Erro ao enviar e-mail HTML para {}: {}", destinatario, e.getMessage(), e);
        }
    }

    @Async
    public void sendSimpleEmail(String to, String subject, String text) {
        enviarEmailSimples(to, subject, text);
    }

    // utilitário seguro de escape HTML (mantido localmente)
    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#x27;");
    }

    @Async
    public void enviarCupomComQrCodeInline(String destinatario, String assunto, String mensagemHtml, byte[] qrCodeBytes, byte[] fotoVantagem) {
        try {
            if (destinatario == null || destinatario.isBlank()) {
                throw new IllegalArgumentException("Destinatário inválido");
            }

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(destinatario);
            helper.setSubject(assunto);
            helper.setText(mensagemHtml, true);

            // Adiciona QR code inline
            if (qrCodeBytes != null && qrCodeBytes.length > 0) {
                helper.addInline("qrcodeinline", new ByteArrayResource(qrCodeBytes) {
                    @Override
                    public String getFilename() {
                        return "qrcode.png";
                    }
                }, "image/png");
            } else {
                log.warn("QR code vazio, não será adicionado ao e-mail");
            }

            // Adiciona foto da vantagem inline
            if (fotoVantagem != null && fotoVantagem.length > 0) {
                helper.addInline("imagemVantagem", new ByteArrayResource(fotoVantagem) {
                    @Override
                    public String getFilename() {
                        return "vantagem.jpg"; // ajuste se for PNG
                    }
                }, "image/jpeg"); // ajuste para image/png se necessário
            } else {
                log.warn("Foto da vantagem vazia, não será adicionada ao e-mail");
            }

            mailSender.send(mimeMessage);
            log.info("E-mail enviado com sucesso para {}", destinatario);

        } catch (Exception e) {
            log.error("Erro ao enviar e-mail HTML com QR inline", e);
        }
    }

}

