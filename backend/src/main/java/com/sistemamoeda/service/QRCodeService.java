package com.sistemamoeda.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.util.UUID;

@Service
public class QRCodeService {

    public String gerarQRCodeParaArquivo(String conteudo, String nomeArquivo) {
        try {
            int largura = 300;
            int altura = 300;
            QRCodeWriter writer = new QRCodeWriter();

            var bitMatrix = writer.encode(conteudo, BarcodeFormat.QR_CODE, largura, altura);

            File pasta = new File("qrcodes");
            if (!pasta.exists() && !pasta.mkdirs()) {
                throw new IOException("Não foi possível criar pasta para qrcodes");
            }

            // nome com token único para evitar colisão: nomeArquivo + UUID curto
            String unico = nomeArquivo + "-" + UUID.randomUUID().toString().substring(0,8);
            Path caminho = Path.of(pasta.getPath(), unico + ".png");

            MatrixToImageWriter.writeToPath(bitMatrix, "PNG", caminho);

            return caminho.toString();
        } catch (WriterException | IOException e) {
            throw new RuntimeException("Erro ao gerar QR Code", e);
        }
    }

    public byte[] gerarQRCodeBytes(String conteudo) {
        try {
            int largura = 300;
            int altura = 300;
            QRCodeWriter writer = new QRCodeWriter();

            var bitMatrix = writer.encode(conteudo, BarcodeFormat.QR_CODE, largura, altura);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", baos);

            return baos.toByteArray();
        } catch (WriterException | IOException e) {
            throw new RuntimeException("Erro ao gerar QR Code bytes", e);
        }
    }
}
