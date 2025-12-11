package com.sistemamoeda.mapper;

import com.sistemamoeda.dto.AlunoResponseDTO;
import com.sistemamoeda.model.Aluno;

public final class AlunoMapper {

    private AlunoMapper() {}

    public static AlunoResponseDTO toDto(Aluno aluno) {
        AlunoResponseDTO dto = new AlunoResponseDTO();
        dto.setId(aluno.getId());
        dto.setUsuarioId(aluno.getUsuario().getId());
        dto.setNome(aluno.getUsuario().getNome());
        dto.setEmail(aluno.getUsuario().getEmail());
        dto.setTipoUsuario(aluno.getUsuario().getTipoUsuario().name());
        dto.setDataCriacao(aluno.getUsuario().getDataCriacao());
        dto.setAtivo(aluno.getUsuario().getAtivo());
        dto.setInstituicaoId(aluno.getInstituicao().getId());
        dto.setInstituicaoNome(aluno.getInstituicao().getNome());
        dto.setCpf(aluno.getCpf());
        dto.setRg(aluno.getRg());
        dto.setEndereco(aluno.getEndereco());
        dto.setCurso(aluno.getCurso());
        dto.setSaldoMoedas(aluno.getSaldoMoedas());
        dto.setDataCadastro(aluno.getDataCadastro());
        return dto;
    }
}
