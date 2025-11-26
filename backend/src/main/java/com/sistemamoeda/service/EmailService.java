package com.sistemamoeda.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
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
            String html = "<html><body>" +
                    "<p>" + escapeHtml(mensagem).replace("\n", "<br/>") + "</p>" +
                    "<p><img src='" + gif + "' alt='celebration' style='max-width:100%;height:auto'/></p>" +
                    "</body></html>";

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

    /**
     * Envia um e-mail HTML com o QR Code anexado (arquivo PNG).
     *
     * @param destinatario  e-mail do destinatário
     * @param assunto       assunto do e-mail
     * @param mensagemHtml  corpo em HTML (já formatado)
     * @param arquivoQRCode caminho para o arquivo PNG do QR Code
     */
    @Async
    public void enviarCupomComQrCode(String destinatario, String assunto, String mensagemHtml, String arquivoQRCode) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            // true = multipart
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(destinatario);
            helper.setSubject(assunto);
            helper.setText(mensagemHtml, true);

            // Anexa o arquivo (se existir)
            if (arquivoQRCode != null) {
                FileSystemResource file = new FileSystemResource(new File(arquivoQRCode));
                if (file.exists()) {
                    helper.addAttachment("qrcode.png", file);
                } else {
                    log.warn("Arquivo QR Code não encontrado para anexar: {}", arquivoQRCode);
                }
            }

            mailSender.send(mimeMessage);
            log.info("E-mail de cupom enviado para {}", destinatario);
        } catch (Exception e) {
            log.error("Erro ao enviar email de cupom: {}", e.getMessage(), e);
        }
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
}
