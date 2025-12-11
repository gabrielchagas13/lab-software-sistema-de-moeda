package com.sistemamoeda.mapper;

import com.sistemamoeda.dto.EmpresaResponseDTO;
import com.sistemamoeda.model.Empresa;

public final class EmpresaMapper {

    private EmpresaMapper() {}

    public static EmpresaResponseDTO toDto(Empresa empresa) {
        EmpresaResponseDTO dto = new EmpresaResponseDTO();
        dto.setId(empresa.getId());
        dto.setUsuarioId(empresa.getUsuario().getId());
        dto.setNome(empresa.getUsuario().getNome());
        dto.setEmail(empresa.getUsuario().getEmail());
        dto.setTipoUsuario(empresa.getUsuario().getTipoUsuario().name());
        dto.setDataCriacao(empresa.getUsuario().getDataCriacao());
        dto.setAtivo(empresa.getUsuario().getAtivo());
        dto.setNomeFantasia(empresa.getNomeFantasia());
        dto.setCnpj(empresa.getCnpj());
        dto.setEndereco(empresa.getEndereco());
        dto.setTelefone(empresa.getTelefone());
        dto.setDescricao(empresa.getDescricao());
        dto.setDataCadastro(empresa.getDataCadastro());
        return dto;
    }
}
