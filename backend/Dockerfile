# Etapa 1: construir o JAR (compilação)
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /app

# Copia o POM e baixa dependências primeiro (para aproveitar cache)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copia o restante do código e compila o projeto
COPY src ./src
RUN mvn clean package -DskipTests

# Etapa 2: rodar o JAR gerado
FROM eclipse-temurin:17-jdk
WORKDIR /app

# Copia o JAR do estágio de build
COPY --from=builder /app/target/sistema-moeda-backend-1.0.0.jar app.jar

# Expõe a porta padrão do Spring Boot
EXPOSE 8080

# Configura variáveis de ambiente para o MySQL (dentro do docker-compose)
ENV SPRING_DATASOURCE_URL=jdbc:mysql://db:3306/sistema_moeda?createDatabaseIfNotExist=true&useSSL=false&useTimezone=true&serverTimezone=UTC&allowPublicKeyRetrieval=true
ENV SPRING_DATASOURCE_USERNAME=root
ENV SPRING_DATASOURCE_PASSWORD=root

ENTRYPOINT ["java", "-jar", "app.jar"]
