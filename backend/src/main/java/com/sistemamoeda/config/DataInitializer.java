package com.sistemamoeda.config;

// Imports dos Models
import com.sistemamoeda.model.Aluno;
import com.sistemamoeda.model.Empresa;
import com.sistemamoeda.model.Instituicao;
import com.sistemamoeda.model.Professor;
import com.sistemamoeda.model.TipoUsuario;
import com.sistemamoeda.model.Usuario;
import com.sistemamoeda.model.Vantagem;

// Imports dos Repositories
import com.sistemamoeda.repository.AlunoRepository;
import com.sistemamoeda.repository.EmpresaRepository;
import com.sistemamoeda.repository.InstituicaoRepository;
import com.sistemamoeda.repository.ProfessorRepository;
import com.sistemamoeda.repository.UsuarioRepository;
import com.sistemamoeda.repository.VantagemRepository;

// Imports do Spring e Java
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.math.BigDecimal;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner loadData(
            UsuarioRepository usuarioRepo,
            InstituicaoRepository instituicaoRepo,
            AlunoRepository alunoRepo,
            ProfessorRepository professorRepo,
            EmpresaRepository empresaRepo,
            VantagemRepository vantagemRepo,
            PasswordEncoder passwordEncoder) {
                
        return args -> {
            
            // 1. Criar Usuário ADMIN
            String adminEmail = "admin@gmail.com";
            if (!usuarioRepo.existsByEmail(adminEmail)) {
                Usuario admin = new Usuario(
                        "Admin",
                        adminEmail,
                        passwordEncoder.encode("admin123"),
                        TipoUsuario.ADMIN
                );
                usuarioRepo.save(admin);
                System.out.println(">>> Usuário ADMIN 'admin@gmail.com' criado <<<");
            }

            // 2. Criar Instituição de Teste
            // (Aluno e Professor precisam de uma Instituição)
            Instituicao instituicao;
            if (instituicaoRepo.count() == 0) {
                instituicao = new Instituicao("Universidade Teste", "Av. Principal, 123", "31999998888", "contato@ut.edu.br");
                instituicaoRepo.save(instituicao);
                System.out.println(">>> Instituição 'Universidade Teste' criada <<<");
            } else {
                instituicao = instituicaoRepo.findAll().get(0); // Pega a primeira que existir
            }

            // 3. Criar Usuário ALUNO
            String alunoEmail = "pedromaiasilva17@gmail.com";
            if (!usuarioRepo.existsByEmail(alunoEmail)) {
                Usuario userAluno = new Usuario(
                        "Aluno Teste",
                        alunoEmail,
                        passwordEncoder.encode("123456"),
                        TipoUsuario.ALUNO
                );
                usuarioRepo.save(userAluno);

                Aluno aluno = new Aluno(
                        userAluno,
                        instituicao,
                        "111.111.111-11", // CPF com máscara (exigido pelo @Pattern)
                        "MG-11.111.111",  // RG
                        "Rua dos Testes, 123",
                        "Engenharia de Software"
                );
                alunoRepo.save(aluno);
                System.out.println(">>> Usuário ALUNO 'aluno@teste.com' criado <<<");
            }

            // 4. Criar Usuário PROFESSOR
            String profEmail = "professor@teste.com";
            if (!usuarioRepo.existsByEmail(profEmail)) {
                Usuario userProf = new Usuario(
                        "Professor Teste",
                        profEmail,
                        passwordEncoder.encode("123456"),
                        TipoUsuario.PROFESSOR
                );
                usuarioRepo.save(userProf);

                Professor prof = new Professor(
                        userProf,
                        instituicao,
                        "222.222.222-22", // CPF com máscara
                        "Departamento de Computação"
                );
                professorRepo.save(prof);
                System.out.println(">>> Usuário PROFESSOR 'professor@teste.com' criado <<<");
            }
            
            // 5. Criar Usuário EMPRESA
            String empresaEmail = "empresa@teste.com";
            Empresa empresa;
            if (!usuarioRepo.existsByEmail(empresaEmail)) {
                Usuario userEmpresa = new Usuario(
                        "Empresa Teste S/A",
                        empresaEmail,
                        passwordEncoder.encode("123456"),
                        TipoUsuario.EMPRESA
                );
                usuarioRepo.save(userEmpresa);

                empresa = new Empresa(
                        userEmpresa,
                        "Lanchonete da Esquina",
                        "11.111.111/0001-11", // CNPJ com máscara
                        "Rua da Cantina, 456",
                        "(31) 98888-7777",
                        "A melhor lanchonete da região"
                );
                empresaRepo.save(empresa);
                System.out.println(">>> Usuário EMPRESA 'empresa@teste.com' criado <<<");
            } else {
                empresa = empresaRepo.findAll().stream()
                        .filter(e -> e.getUsuario().getEmail().equals(empresaEmail))
                        .findFirst()
                        .orElse(null);
            }

            // 6. Criar VANTAGEM (ligada à Empresa)
            if (empresa != null && vantagemRepo.count() == 0) {
                Vantagem vantagem = new Vantagem(
                        empresa,
                        "Café + Pão de Queijo",
                        "Um copo de café 200ml e uma porção de pão de queijo.",
                        new BigDecimal("15.00"),
                        null 
                );
                vantagemRepo.save(vantagem);
                System.out.println(">>> Vantagem 'Café + Pão de Queijo' criada <<<");
            }
        };
    }
}