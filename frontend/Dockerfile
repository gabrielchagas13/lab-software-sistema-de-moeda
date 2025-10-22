# Etapa 1: usar uma imagem base leve do Nginx
FROM nginx:1.25-alpine

# Definir o autor da imagem (opcional, mas soma linhas e boas práticas)
LABEL maintainer="arthur.pedra@pucminas.br"
LABEL description="Frontend estático do Sistema de Moeda Estudantil servido via Nginx"

# Apagar a configuração padrão do Nginx (para substituir pela nossa)
RUN rm -rf /usr/share/nginx/html/*

# Copiar todos os arquivos do projeto para dentro da pasta servida pelo Nginx
COPY . /usr/share/nginx/html

# Expor a porta padrão do Nginx
EXPOSE 80

# Rodar o Nginx em primeiro plano (necessário para o container não encerrar)
CMD ["nginx", "-g", "daemon off;"]
