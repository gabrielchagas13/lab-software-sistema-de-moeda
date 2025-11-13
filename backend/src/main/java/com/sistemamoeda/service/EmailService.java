package com.sistemamoeda.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.MimeMessageHelper;

import java.util.Arrays;
import java.util.List;
import java.util.Random;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    private final Logger log = LoggerFactory.getLogger(EmailService.class);

    /**
     * Envia um e-mail simples de texto.
     *
     * @param destinatario Email do destinatário
     * @param assunto      Assunto do e-mail
     * @param mensagem     Corpo do e-mail
     */
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

    /**
     * Envia um e-mail HTML contendo a mensagem e um GIF aleatório.
     * O GIF é referenciado por URL (externo).
     */
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

    // Pequena utilidade para escapar caracteres HTML básicos (evita injeção simples)
    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#x27;");
    }

    /**
     * Compatibilidade: alias para {@link #enviarEmailSimples(String, String, String)}.
     */
    public void sendSimpleEmail(String to, String subject, String text) {
        enviarEmailSimples(to, subject, text);
    }
}
