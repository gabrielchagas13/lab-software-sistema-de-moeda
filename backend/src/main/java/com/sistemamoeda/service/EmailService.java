package com.sistemamoeda.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

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
            System.out.println("✅ E-mail enviado para: " + destinatario);
        } catch (Exception e) {
            System.err.println("❌ Erro ao enviar e-mail para " + destinatario + ": " + e.getMessage());
        }
    }
}
