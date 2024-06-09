import React, { useEffect, useRef, useState } from "react";
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCheckbox,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonPage,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonText,
  IonTextarea,
} from "@ionic/react";
import TituloBotaoVoltar from "../components/BarraSuperior";
import JanelaExpoeTexto from "../components/janelaExpoeTexto";
import { useLocation } from "react-router-dom";
import CirculoCarregamento from "../components/CirculoDeCarregamento";
import armazenamento from "../armazenamento";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import usaSQLiteDB from "../composables/usaSQLiteDB";
import { eye, glasses, glassesOutline, search } from "ionicons/icons";
import detectElementOverflow from "detect-element-overflow";

type SQLItemDisciplina = {
  Id_local: number;
  Disciplina: string;
};

type SQLItemUnidade = {
  Id_local: number;
  Unidade: string;
};

type SQLItemTurma = {
  Id_local: number;
  Turma: string;
};

type SQLItemPlanejamento = {
  Id_local: number;
  IdLocal_Instituicao: number;
  IdLocal_Turma: number;
  IdLocal_Disciplina: number;
};

const PaginaModificarPlanejamento: React.FC = () => {
  const localizacao = useLocation();
  const parametrosUrl = new URLSearchParams(localizacao.search! || "");
  const [titulo, definirTitulo] = useState("");
  const [mesSelecionado, definirMesSelecionado] = useState<number>(
    new Date().getMonth() + 1
  );
  const [anoSelecionado, definirAnoSelecionado] = useState<number>(
    new Date().getFullYear()
  );
  const [estadoCarregamento, definirCarregamento] = useState(true);
  const [dadosPlanejamento, definirDadosPlanejamento] =
    useState<Array<SQLItemPlanejamento>>();

  const [unidades, definirUnidades] = useState<Array<SQLItemUnidade>>();
  const [turmas, definirTurmas] = useState<Array<SQLItemTurma>>();
  const [disciplinas, definirDisciplina] = useState<Array<SQLItemDisciplina>>();
  const idLocalInstituicao = dadosPlanejamento?.[0].IdLocal_Instituicao;
  const idLocalTurma = dadosPlanejamento?.[0].IdLocal_Turma;
  const idLocalDisciplina = dadosPlanejamento?.[0].IdLocal_Disciplina;

  const { executarAcaoSQL, iniciado } = usaSQLiteDB();

  const modoEdicao = Boolean(parametrosUrl.get(`edicao`));

  const obterPlanejamento = async () => {
    return await armazenamento.get("planejamentoEdicao");
  };

  const carregarDadosEdicao = async () => {
    await executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
      const comandoSQLDisciplina = `SELECT 
      ac_tb_diario.Id_Local AS Id_local,
      ac_tb_diario.Disciplina AS Disciplina from ac_tb_diario`;
      const resultadoDisciplina = await db?.query(comandoSQLDisciplina);
      definirDisciplina(resultadoDisciplina?.values);
      console.log("Disciplinas: ");
      console.log(disciplinas);

      const comandoSQLUnidade = `SELECT 
      InstitEstab.Id_Local AS Id_local, 
      InstitEstab.Instituicao AS Unidade from InstitEstab`;
      const resultadoUnidade = await db?.query(comandoSQLUnidade);
      definirUnidades(resultadoUnidade?.values);
      console.log("Unidades: ");
      console.log(unidades);
    });
  };

  const buscaDadosPlanejamento = async () => {
    const planejamento = await obterPlanejamento();
    console.log("PLANEJAMENTO: ");
    console.log(planejamento);
    const idPlanejamento = planejamento;

    await executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
      const comandoSQL = `SELECT 
      ac_tb_aulasdadas.Id_local as Id_local,
      ac_tb_diario.Id_local AS IdLocal_Disciplina,
      Turma.Id_local AS IdLocal_Turma,
      InstitEstab.Id_local AS IdLocal_Instituicao
        FROM
          ac_tb_aulasdadas
        INNER JOIN
          ac_tb_diario on ac_tb_diario.Id = ac_tb_aulasdadas.Id_Ac_Tb_Diario
        INNER JOIN
          Turma ON ac_tb_diario.Id_Turma = Turma.Id
        INNER JOIN
          InstitEstab ON Turma.Id_InstitEstab = InstitEstab.Id
        WHERE
          ac_tb_aulasdadas.Id_local = ${idPlanejamento}`;

      const resultado = await db?.query(comandoSQL);
      console.log("IDs Resultado: ");
      console.log(resultado);

      definirDadosPlanejamento(resultado?.values);
      console.log("Dados Planejamento");
      console.log(dadosPlanejamento);
    });
  };

  const validaEdicao = async (modoEdicao: boolean) => {
    if (modoEdicao == true) {
      definirTitulo("Editar Planejamento");
      buscaDadosPlanejamento();
    } else if (modoEdicao == false) {
      definirTitulo("Adicionar Planejamento");
    } else {
      definirTitulo("Error");
    }
  };

  function normalizaTitulo(titulo: string) {
    return titulo
      .toLowerCase()
      .replace(/(?:^|\s)\S/g, function (caractereCoincide) {
        return caractereCoincide.toUpperCase();
      });
  }

  useEffect(() => {
    const carregaDados = async () => {
      await carregarDadosEdicao();
      await validaEdicao(modoEdicao);
    };

    definirCarregamento(false);
    carregaDados();
  }, [iniciado]);

  const checkboxRef = useRef<HTMLElement | null>(null);
  const [estadosOverflow, definirEstadosOverflow] = useState<{
    [key: string]: boolean;
  }>({});

  const definirCheckboxRef = (ref: HTMLElement | null) => {
    checkboxRef.current = ref;
  };

  useEffect(() => {
    const atualizaEstadosOverflow = () => {
      const checkboxes = document.querySelectorAll(".checkbox-overflow");
      const estadosOverflow: { [key: string]: boolean } = {};
      checkboxes.forEach((checkbox) => {
        const linhaIon = checkbox.parentElement as HTMLElement;
        if (linhaIon) {
          const colisao = detectElementOverflow(
            checkbox as HTMLElement,
            linhaIon
          );
          estadosOverflow[checkbox.id] =
            colisao.collidedRight || colisao.collidedLeft;
        }
      });

      definirEstadosOverflow(estadosOverflow);
    };

    atualizaEstadosOverflow();
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <TituloBotaoVoltar titulo={titulo} />
      </IonHeader>
      <IonContent color="tertiary">
        {estadoCarregamento ? (
          <CirculoCarregamento />
        ) : (
          <div>
            <IonCard className="coloracao-cartao">
              <IonCardHeader>
                <IonCardTitle>• Dados da Turma</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonGrid>
                  {!modoEdicao && unidades && unidades.length > 0 && (
                    <IonRow>
                      <IonCol>
                        <IonSelect color="light" label="Unidade" labelPlacement="floating">
                          {unidades?.map((unidade) => (
                            <IonSelectOption
                              key={unidade.Id_local}
                              value={unidade.Id_local}
                            >
                              {unidade.Unidade}
                            </IonSelectOption>
                          ))}
                        </IonSelect>
                      </IonCol>
                    </IonRow>
                  )}
                  {modoEdicao && unidades && unidades.length > 0 && (
                    <IonRow>
                      <IonCol color="light">
                        <IonSelect
                          disabled={true}
                          value={idLocalInstituicao}
                          label="Unidade"
                          labelPlacement="floating"
                        >
                          {unidades?.map((unidade) => (
                            <IonSelectOption
                              key={unidade.Id_local}
                              value={unidade.Id_local}
                            >
                              {unidade.Unidade}
                            </IonSelectOption>
                          ))}
                        </IonSelect>
                      </IonCol>
                    </IonRow>
                  )}

                  {modoEdicao && turmas && turmas.length > 0 && (
                    <IonRow>
                      <IonCol color="light">
                        <IonSelect
                          disabled={true}
                          value={idLocalTurma}
                          label="Turma"
                          labelPlacement="floating"
                        >
                          {turmas?.map((turma) => (
                            <IonSelectOption
                              key={turma.Id_local}
                              value={turma.Id_local}
                            >
                              {turma.Turma}
                            </IonSelectOption>
                          ))}
                        </IonSelect>
                      </IonCol>
                    </IonRow>
                  )}

                  {!modoEdicao && disciplinas && disciplinas.length > 0 && (
                    <IonRow>
                      <IonCol color="light">
                        <IonSelect label="Disciplina" labelPlacement="floating">
                          {disciplinas?.map((disciplina) => (
                            <IonSelectOption
                              key={disciplina.Id_local}
                              value={disciplina.Id_local}
                            >
                              {disciplina.Disciplina}
                            </IonSelectOption>
                          ))}
                        </IonSelect>
                      </IonCol>
                    </IonRow>
                  )}
                  {modoEdicao && disciplinas && disciplinas.length > 0 && (
                    <IonRow>
                      <IonCol color="light">
                        <IonSelect
                          disabled={true}
                          value={idLocalDisciplina}
                          label="Disciplina"
                          labelPlacement="floating"
                        >
                          {disciplinas?.map((disciplina) => (
                            <IonSelectOption
                              key={disciplina.Id_local}
                              value={disciplina.Id_local}
                            >
                              {disciplina.Disciplina}
                            </IonSelectOption>
                          ))}
                        </IonSelect>
                      </IonCol>
                    </IonRow>
                  )}
                </IonGrid>
              </IonCardContent>
            </IonCard>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default PaginaModificarPlanejamento;
