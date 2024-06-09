import React, { useEffect, useState } from "react";
import armazenamento from "../armazenamento";
import { useHistory, useLocation } from "react-router";

const ExpiraSessao: React.FC = () => {
  const navegar = useHistory();
  const localizacao = useLocation();

  const limparHistorico = () => {
    const { length } = navegar;
    for (let i = 0; i < length; i++) {
      navegar.replace("/");
    }
  };

  useEffect(() => {
    console.log("verifica vencimento desse sessão");

    const expirarSessao = async () => {
      const tokenSessao = await armazenamento.get("token");
      const estadoTempoLimite = await armazenamento.get("tempoLimite");
      const estadoTempoLimiteData = new Date(estadoTempoLimite);
      const dataAtual = new Date();

      const parametrosUrl = new URLSearchParams(localizacao.search! || "");
      const modoDev = Boolean(parametrosUrl.get(`dev`));
      const cadastro = Boolean(parametrosUrl.get(`cadastro`));

      if (
        /*(dataAtual.getTime() - estadoTempoLimiteData.getTime() >= 1 * 60 * 60 * 1000) ||
        (!estadoTempoLimite ||*/
        !cadastro &&
        !tokenSessao /*)*/ &&
        !modoDev
      ) {
        console.log(
          `Sessão Expirada : Token : ${tokenSessao} | TempoLimite : ${estadoTempoLimite}`
        );
        await armazenamento.remove("token");
        await armazenamento.remove("tempoLimite");
        limparHistorico();
        navegar.replace("/PaginaLogin");
      } else {
        console.log("Sessão mantida");
      }
    };
    expirarSessao();
  }, []);

  return null;
};

export default ExpiraSessao;
