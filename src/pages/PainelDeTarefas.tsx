import {
  IonAlert,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonImg,
  IonInput,
  IonItem,
  IonLabel,
  IonModal,
  IonPage,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonText,
  IonTitle,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import usaSQLiteDB from "../composables/usaSQLiteDB";
import TituloBotaoVoltar from "../components/BarraSuperior";
import CirculoCarregamento from "../components/CirculoDeCarregamento";
import {
  book,
  checkbox,
  checkmarkCircle,
  closeCircle,
  create,
  diamond,
  ellipse,
  grid,
  radio,
  radioButtonOff,
  reader,
  search,
  today,
  trash,
} from "ionicons/icons";
import { meses } from "../globalConstants/constantesGlobais";
import BarraInferior from "../components/BarraInferiorControles";

import HurtHeroi from "../animacoes/Hero/Hurt.png";
import IdleHeroi from "../animacoes/Hero/Idle.png";
import AttackHeroi from "../animacoes/Hero/Attack.png";

import HurtMonstOlho from "../animacoes/Flying_eye/Hurt.png";
import DeathMonstOlho from "../animacoes/Flying_eye/Death.png";
import IdleMonstOlho from "../animacoes/Flying_eye/Idle.png";
import AttackMonstOlho from "../animacoes/Flying_eye/Attack.png";

import HurtMonstGoblin from "../animacoes/Goblin/Hurt.png";
import DeathMonstGoblin from "../animacoes/Goblin/Death.png";
import IdleMonstGoblin from "../animacoes/Goblin/Idle.png";
import AttackMonstGoblin from "../animacoes/Goblin/Attack.png";

import HurtMonstCogumelo from "../animacoes/Mushroom/Hurt.png";
import DeathMonstCogumelo from "../animacoes/Mushroom/Death.png";
import IdleMonstCogumelo from "../animacoes/Mushroom/Idle.png";
import AttackMonstCogumelo from "../animacoes/Mushroom/Attack.png";

import HurtMonstEsqueleto from "../animacoes/Skeleton/Hurt.png";
import DeathMonstEsqueleto from "../animacoes/Skeleton/Death.png";
import IdleMonstEsqueleto from "../animacoes/Skeleton/Idle.png";
import AttackMonstEsqueleto from "../animacoes/Skeleton/Attack.png";

import BackGround from "../animacoes/background.gif";
import Fumaca from "../animacoes/fumaca.gif";

const PainelDeTarefas: React.FC = () => {
  const [estadoCarregamento, definirCarregamento] = useState(false);
  const [mostraFiltro, definirMostraFiltro] = useState<boolean>(false);
  const [linhasFiltro, defineLinhasFiltro] = useState([0]);
  const [tarefaFiltradas, definirTarefaFiltradas] = useState<Array<any>>();
  const [modal, mostraModal] = useState<boolean>(false);
  const [modalDel, mostraModalDel] = useState<boolean>(false);
  const [idTarefaSel, defIdTarefaSel] = useState<number>(0);

  const [mostraModalFiltro, defMostraModalFiltro] = useState<boolean>(false);
  const [mostraModalLogico, defMostraModalLogico] = useState<boolean>(false);
  const [modalFiltroSel, defModalFiltroSel] = useState<number>(0);

  const [atributos, definirAtributos] = useState<any>([]);
  const [mostraModalAtributo, defMostraModalAtributo] =
    useState<boolean>(false);

  const [itensFiltro, defItensFiltro] = useState<Array<any>>([
    {
      id: 0,
      valorLabel: "SELECIONE",
      valorInput: "",
      valorLogico: "⦿",
      imagem: "",
    },
  ]);

  const { executarAcaoSQL, iniciado, iniciaTabelas } = usaSQLiteDB();

  const quantidadeDeCards = tarefaFiltradas?.length;

  const respostaTarefasQuery = ` SELECT 
        tarefa.id,
        tarefa.nome, 
        tarefa.observacao, 
        tarefa.dataInicio,
        tarefa.dataFim,
        GROUP_CONCAT(atributo.id) as atributo_ids,
        GROUP_CONCAT(atributo.imagem) as imagens,
        GROUP_CONCAT(atributo.nome) as atributo_nome
    FROM 
        tarefa
    LEFT JOIN
        ListaAtributos ON tarefa.id = ListaAtributos.tarefa_id
    LEFT JOIN
        Atributo ON ListaAtributos.atributo_id = Atributo.id
    WHERE 
        tarefa.ativo = 1
    AND 
        tarefa.completa = 0
    `;
  useEffect(() => {
    iniciaTabelas();
  }, []);
  useEffect(() => {
    try {
      carregaTarefas();
      buscaAtributos();
    } catch (erro) {
      console.error(erro);
    } finally {
      aplicaFiltro();
    }
  }, [iniciado]);

  const buscaAtributos = async () => {
    try {
      await executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
        const resultado = await db?.query(`SELECT * FROM ATRIBUTO 
          WHERE ativo = 1`);
        console.log(resultado);
        definirAtributos(resultado?.values);
      });
    } catch (erro) {
      console.log(erro);
    }
  };

  const aplicaFiltro = async () => {
    let comandoSQL = respostaTarefasQuery;

    if (
      itensFiltro.length > 0 &&
      itensFiltro[0].valorLabel !== "SELECIONE" &&
      itensFiltro[0].valorInput !== ""
    ) {
      comandoSQL += ` 
    AND `;
    }

    for (const item of itensFiltro) {
      if (item.valorLabel !== "SELECIONE" && item.valorInput !== "") {
        switch (item.valorLabel) {
          case "ATRIBUTOS":
            comandoSQL += ` EXISTS (
                  SELECT 1
                  FROM Atributo at
                  JOIN ListaAtributos la ON at.id = la.atributo_id
                  WHERE la.tarefa_id = tarefa.id AND at.id = ${item.valorInput}
              ) `;
            break;
          case "NOME":
            comandoSQL += ` tarefa.nome LIKE '%${item.valorInput}%' `;
            break;
          case "OBSERVAÇÃO":
            comandoSQL += ` tarefa.observacao LIKE '%${item.valorInput}%' `;
            break;
          case "IMPORTÂNCIA":
            comandoSQL += ` tarefa.importancia LIKE '%${item.valorInput}%' `;
            break;
          case "DIFICULDADE":
            comandoSQL += ` tarefa.dificuldade LIKE '%${item.valorInput}%' `;
            break;
          case "DATA INICIAL":
            comandoSQL += ` tarefa.dataInicio LIKE '%${item.valorInput}%' `;
            break;
          case "DATA FINAL":
            comandoSQL += ` tarefa.dataFim LIKE '%${item.valorInput}%' `;
            break;
        }

        switch (item.valorLogico) {
          case "E":
            comandoSQL += ` AND `;
            break;
          case "OU":
            comandoSQL += ` OR `;
            break;
          case "⦿":
            break;
        }

        if (item.valorLogico === "⦿") {
          break;
        }
      }
    }

    comandoSQL = comandoSQL.trim().replace(/(AND|OR)$/i, "");

    comandoSQL += `
    GROUP BY 
      tarefa.id
    ORDER BY 
      tarefa.dataFim; `;
    await executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
      const respostaTarefas = await db?.query(comandoSQL);
      definirTarefaFiltradas(respostaTarefas?.values);
      console.log(tarefaFiltradas);
    });

    console.log(itensFiltro);
  };

  const carregaTarefas = async () => {
    definirCarregamento(true);
    try {
      await executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
        const respostaTarefas = await db?.query(respostaTarefasQuery);
        definirTarefaFiltradas(respostaTarefas?.values);
      });
    } catch (erro) {
      console.log(erro);
      definirTarefaFiltradas([]);
    } finally {
      definirCarregamento(false);
    }
  };

  const confirmaDelecao = async (id: number) => {
    console.log(`Realiza Deleção do tarefa : ${id}`);
    let tarefaDelecao = `
      UPDATE Tarefa SET ativo = 0 WHERE id = ${id};`;

    let tarefaDelecao2 = `
      UPDATE ListaAtributos SET ativo = 0 WHERE tarefa_id = ${id};`;

    try {
      await executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
        await db?.query(tarefaDelecao);
        await db?.query(tarefaDelecao2);
      });
    } catch (erro) {
      console.log(erro);
    } finally {
      aplicaFiltro();
      fecharModais();
    }
  };

  const completarTarefa = async (id: number) => {
    try {
      const sqlXPZerado = ` SELECT * FROM ATRIBUTO WHERE XP < 0 `;
      const sqlXPZerado1 = ` SELECT * FROM USUARIO WHERE XP < 0 `;
      await executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
        const resultado = await db?.query(sqlXPZerado);
        const resultado1 = await db?.query(sqlXPZerado1);

        if (resultado && resultado.values && resultado.values.length > 0) {
          const comandoSQL = ` UPDATE ATRIBUTO SET XP = 0 WHERE ID = ? `;
          for (const res of resultado.values) {
            await db?.query(comandoSQL, [res.id]);
          }
        }

        if (resultado1 && resultado1.values && resultado1.values.length > 0) {
          const comandoSQL1 = ` UPDATE USUARIO SET XP = 0 WHERE ID = ? `;
          for (const res of resultado1.values) {
            await db?.query(comandoSQL1, [res.id]);
          }
        }
      });

      defAcaoHeroi(AttackHeroi);

      setTimeout(() => {
        defAcaoMonstro(monstrosHurt[monstroId]);
      }, 900);

      setTimeout(() => {
        defAcaoHeroi(IdleHeroi);
        defAcaoMonstro(monstrosDeath[monstroId]);
      }, 1800);

      setTimeout(() => {
        defEstadoFumaca(true);
      }, 2000);

      setTimeout(() => {
        sorteiaMonstro();
        defEstadoFumaca(false);
      }, 2400);
    } catch (erro) {
      console.error(erro);
    }

    let incremento = 0;
    const comandoSQLSelect = ` SELECT dificuldade, importancia
      FROM Tarefa
      WHERE id = ? `;
    const comandoCompleta = `UPDATE Tarefa SET completa = 1 WHERE id = ?`;
    try {
      await executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
        await db?.query(comandoCompleta, [id]); 
        const respostaSelect = await db?.query(comandoSQLSelect, [id]);

        if (
          respostaSelect &&
          respostaSelect.values &&
          respostaSelect.values?.length > 0
        ) {
          const dificuldade = respostaSelect.values?.[0].dificuldade;
          const importancia = respostaSelect.values?.[0].importancia;
          incremento = (dificuldade + importancia) * 50;
          console.log("INCREMENTO : " + incremento);
          console.log("ID : " + id);

          const comandoSQLUpdate = ` UPDATE Atributo
            SET xp = COALESCE(xp, 0) + ?
            WHERE id IN (
              SELECT atributo_id
              FROM ListaAtributos
              WHERE tarefa_id = ?
            ); `;

          const comandoSQLUpdate1 = ` UPDATE Usuario
            SET xp = COALESCE(xp, 0) + ?  `;

          await db?.query(comandoSQLUpdate, [incremento, id]);
          await db?.query(comandoSQLUpdate1, [incremento]);
          console.log(`XP atualizado em ${incremento} para tarefa_id ${id}`);
        } else {
          console.log("Nenhuma tarefa encontrada com o id fornecido");
        }
      });
    } catch (erro) {
      console.log(erro);
    } finally {
      aplicaFiltro();
    }
  };

  const falharTarefa = async (id: number) => {
    let incremento = 0;
    const comandoSQLSelect = ` SELECT dificuldade, importancia
      FROM Tarefa
      WHERE id = ? `;
    const comandoCompleta = `UPDATE Tarefa SET completa = 1 WHERE id = ?`;
    try {
      await executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
        await db?.query(comandoCompleta, [id]);
        const respostaSelect = await db?.query(comandoSQLSelect, [id]);

        if (
          respostaSelect &&
          respostaSelect.values &&
          respostaSelect.values?.length > 0
        ) {
          const dificuldade = respostaSelect.values?.[0].dificuldade;
          const importancia = respostaSelect.values?.[0].importancia;
          incremento = (dificuldade + importancia) * 50;

          const comandoSQLUpdate = ` UPDATE Atributo
            SET xp = COALESCE(xp, 0) - ?
            WHERE id IN (
              SELECT atributo_id
              FROM ListaAtributos
              WHERE tarefa_id = ?
            ); `;

          const comandoSQLUpdate1 = ` UPDATE Usuario
            SET xp = COALESCE(xp, 0) - ?  `;

          await db?.query(comandoSQLUpdate, [incremento, id]);
          await db?.query(comandoSQLUpdate1, [incremento]);
          console.log(`XP atualizado em ${incremento} para tarefa_id ${id}`);
        } else {
          console.log("Nenhuma tarefa encontrada com o id fornecido");
        }
      });
    } catch (erro) {
      console.log(erro);
    } finally {
      aplicaFiltro();
      fecharModais();

      defAcaoMonstro(monstrosAttack[monstroId]);

      setTimeout(() => {
        defAcaoHeroi(HurtHeroi);
      }, 100);

      const timeout2 = setTimeout(() => {
        defAcaoMonstro(monstrosIdle[monstroId]);
        defAcaoHeroi(IdleHeroi);
      }, 1000);
    }
  };

  const formatarData = (data: string) => {
    const dataPartes = data.split("-");
    const ano = parseInt(dataPartes[0], 10);
    const mes = parseInt(dataPartes[1], 10);
    const dia = parseInt(dataPartes[2], 10);

    const nomeMes = meses[mes - 1];
    return `${dia} de ${nomeMes}`;

    return data;
  };

  const separaImagens = (imagens: string) => {
    if (imagens) {
      const imagensArray = imagens.split(",");
      const filtraElementos = imagensArray.filter(
        (imagem, index) => (index + 1) % 2 === 0
      );

      return filtraElementos;
    } else return [null];
  };

  const IniciarBanco = async () => {
    const comandos = [
      `CREATE TABLE IF NOT EXISTS Usuario (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      nome TEXT(200),
      descricao TEXT(500),
      imagem TEXT,
      xp INTEGER
    );`,
      `CREATE TABLE IF NOT EXISTS Atributo (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      nome TEXT,
      observacao TEXT,
      xp INTEGER,
      imagem TEXT,
      ativo INTEGER
    );`,
      `CREATE TABLE IF NOT EXISTS Tarefa (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      nome TEXT,
      observacao TEXT,
      importancia INTEGER,
      dificuldade INTEGER,
      dataInicio TEXT,
      dataFim TEXT,
      usuario_id INTEGER,
      completa INTEGER,
      ativo INTEGER
    );`,
      `CREATE TABLE IF NOT EXISTS Template (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      nome TEXT,
      observacao TEXT,
      importancia INTEGER,
      dificuldade INTEGER,
      dataInicio TEXT,
      dataFim TEXT,
      usuario_id INTEGER,
      ativo INTEGER
    );`,
      `CREATE TABLE IF NOT EXISTS ListaAtributos (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      atributo_id INTEGER,
      tarefa_id INTEGER,
      ativo INTEGER,
      FOREIGN KEY (atributo_id) REFERENCES Atributo(id),
      FOREIGN KEY (tarefa_id) REFERENCES Tarefa(id)
    );`,
    ];
    await executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
      for (const comando of comandos) {
        console.log(comando);
        await db?.query(comando);
      }
    });
  };

  const carregaModal = (id: number) => {
    defIdTarefaSel(id);
    mostraModal(true);
  };

  const fecharModais = () => {
    mostraModal(false);
    mostraModalDel(false);
  };

  const deletaCampoFiltro = () => {
    const filtro = itensFiltro.find((item) => item.id === modalFiltroSel);

    if (filtro && itensFiltro.length > 1) {
      const filtrosAtt = itensFiltro.filter(
        (item) => item.id !== modalFiltroSel
      );

      defItensFiltro(filtrosAtt);
    }

    defMostraModalLogico(false);
  };

  const executaModalFiltro = (modalId: number) => {
    defModalFiltroSel(modalId);
    defMostraModalFiltro(true);
  };

  const executaModalLogico = (modalId: number) => {
    defModalFiltroSel(modalId);
    defMostraModalLogico(true);
  };

  const modFiltroLabel = (label: string) => {
    const filtro = itensFiltro.find((item) => item.id === modalFiltroSel);

    if (filtro) {
      const filtroAtt = { ...filtro, valorLabel: label };

      const filtrosAtt = itensFiltro.map((item) =>
        item.id === modalFiltroSel ? filtroAtt : item
      );

      defItensFiltro(filtrosAtt);
    }

    defMostraModalFiltro(false);
  };

  const modFiltroValorLogico = (label: string) => {
    const filtro = itensFiltro.find((item) => item.id === modalFiltroSel);

    if (filtro) {
      const filtroAtt = { ...filtro, valorLogico: label };
      const filtrosAtt = itensFiltro.map((item) =>
        item.id === modalFiltroSel ? filtroAtt : item
      );
      defItensFiltro(filtrosAtt);
    }

    const maxId = Math.max(...itensFiltro.map((item) => item.id));

    if ((label === "E" || label === "OU") && maxId === modalFiltroSel) {
      const novoId = maxId + 1;
      const novoCampo = {
        id: novoId,
        valorLabel: "SELECIONE",
        valorInput: "",
        valorLogico: "⦿",
        imagem: "",
      };
      defItensFiltro((filtrosAntes) => [...filtrosAntes, novoCampo]);
    }

    defMostraModalLogico(false);
  };

  const modFiltroInput = (id: number, input: any) => {
    const filtro = itensFiltro.find((item) => item.id === id);
    if (filtro) {
      const filtroAtt = { ...filtro, valorInput: input };
      const filtrosAtt = itensFiltro.map((item) =>
        item.id === id ? filtroAtt : item
      );

      defItensFiltro(filtrosAtt);
    }
  };

  const addAtributoFiltro = (id: number, imagem: string) => {
    const filtrosAtt = itensFiltro.map((item) => {
      if (item.id === modalFiltroSel) {
        return { ...item, valorInput: id, imagem };
      }
    });

    defItensFiltro(filtrosAtt);
    defMostraModalAtributo(false);
  };

  const abreModalAtt = (id: number) => {
    defModalFiltroSel(id);
    defMostraModalAtributo(true);
  };

  const [frameHeroi, defFrameHeroi] = useState(0);
  const [qtdFrameHeroi, defQtdFrameHeroi] = useState(4);
  const [qtdFrameMonstro, defQtdFrameMonstro] = useState(4);
  const [frameMonstro, defFrameMonstro] = useState(0);
  const [monstroId, defMonstroId] = useState(0);

  const [estadoFumaca, defEstadoFumaca] = useState(false);
  const [acaoHeroi, defAcaoHeroi] = useState(IdleHeroi);
  const [acaoMonstro, defAcaoMonstro] = useState(IdleMonstEsqueleto);

  useEffect(() => {
    const intervalo = setInterval(() => {
      defFrameHeroi((ultimoFrame) => (ultimoFrame + 1) % 4);
    }, 300);
    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    const intervalo = setInterval(() => {
      defFrameMonstro((ultimoFrame) => (ultimoFrame + 1) % 4);
    }, 300);
    return () => clearInterval(intervalo);
  }, []);

  const monstrosIdle = [IdleMonstCogumelo, IdleMonstGoblin, IdleMonstEsqueleto];
  const monstrosHurt = [HurtMonstCogumelo, HurtMonstGoblin, HurtMonstEsqueleto];
  const monstrosDeath = [DeathMonstCogumelo, DeathMonstGoblin, DeathMonstEsqueleto];
  const monstrosAttack = [AttackMonstCogumelo, AttackMonstGoblin, AttackMonstEsqueleto];

  const sorteiaMonstro = () => {
    const idmMnstroRandom = Math.floor(Math.random() * monstrosIdle.length);
    defMonstroId(idmMnstroRandom);
    defAcaoMonstro(monstrosIdle[idmMnstroRandom]);
  };

  useEffect(() => {
    const idmMnstroRandom = Math.floor(Math.random() * monstrosIdle.length);
    defMonstroId(idmMnstroRandom);
    defAcaoMonstro(monstrosIdle[idmMnstroRandom]);
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <TituloBotaoVoltar
          titulo="Tarefas"
          icone={book}
          filtro={true}
          definirMostraFiltro={definirMostraFiltro}
          mostraFiltro={mostraFiltro}
        />
      </IonHeader>
      <IonContent color="tertiary">
        {mostraFiltro == true ? (
          <IonCard color="secondary">
            <IonCardContent style={{ padding: "0rem" }}>
              <IonGrid style={{ padding: "0rem" }}>
                {itensFiltro.map((objFiltro) => (
                  <IonRow
                    key={objFiltro.id}
                    class="ion-align-items-center ion-justify-content-center"
                    style={{ height: "100%" }}
                  >
                    <IonCol
                      onClick={() => executaModalFiltro(objFiltro.id)}
                      size="4"
                      class="ion-text-center"
                    >
                      {" "}
                      <IonButton color="primary" fill="clear">
                        <IonLabel>{objFiltro.valorLabel}</IonLabel>
                      </IonButton>
                    </IonCol>
                    <IonCol size="6">
                      {objFiltro.valorLabel === "SELECIONE" ? (
                        <IonItem lines="none" color="secondary">
                          <IonInput disabled class="desativado"></IonInput>
                        </IonItem>
                      ) : null}
                      {objFiltro.valorLabel === "NOME" ||
                      objFiltro.valorLabel === "OBSERVAÇÃO" ? (
                        <IonItem lines="none" color="secondary">
                          <IonInput
                            onIonInput={(e) =>
                              modFiltroInput(objFiltro.id, e.detail.value)
                            }
                            placeholder="Escreva aqui"
                          ></IonInput>
                        </IonItem>
                      ) : null}
                      {objFiltro.valorLabel === "IMPORTÂNCIA" ||
                      objFiltro.valorLabel === "DIFICULDADE" ? (
                        <IonItem lines="none" color="secondary">
                          <IonInput
                            onIonInput={(e) =>
                              modFiltroInput(objFiltro.id, e.detail.value)
                            }
                            class="ion-text-center"
                            type="number"
                            placeholder="0"
                          ></IonInput>
                        </IonItem>
                      ) : null}
                      {objFiltro.valorLabel === "DATA INICIAL" ||
                      objFiltro.valorLabel === "DATA FINAL" ? (
                        <IonItem lines="none" color="secondary">
                          <IonInput
                            onIonInput={(e) =>
                              modFiltroInput(objFiltro.id, e.detail.value)
                            }
                            type="date"
                            color="dark"
                          ></IonInput>
                        </IonItem>
                      ) : null}
                      {objFiltro.valorLabel === "ATRIBUTOS" ? (
                        <IonItem
                          onClick={() => abreModalAtt(objFiltro.id)}
                          lines="none"
                          color="secondary"
                        >
                          <div
                            className="ion-justify-content-center ion-align-items-center"
                            style={{
                              display: "flex",
                              width: "100%",
                              height: "100%",
                            }}
                          >
                            <IonImg
                              style={{
                                width: "2.5rem",
                                height: "2.5rem",
                                borderRadius: "50%",
                                objectFit: "cover",
                                overflow: "hidden",
                              }}
                              src={objFiltro.imagem}
                            ></IonImg>
                          </div>

                          {objFiltro == "" ? (
                            <IonText>Adicionar att.</IonText>
                          ) : null}
                        </IonItem>
                      ) : null}
                    </IonCol>
                    <IonCol
                      onClick={() => executaModalLogico(objFiltro.id)}
                      size="2"
                    >
                      <IonButton fill="clear">
                        {objFiltro.valorLogico}
                      </IonButton>
                    </IonCol>
                  </IonRow>
                ))}
                <IonRow
                  style={{ paddingBottom: "0.5rem" }}
                  class="ion-align-items-center ion-justify-content-center"
                >
                  <IonButton fill="clear" onClick={aplicaFiltro}>
                    <IonIcon className="icon-large" icon={search}></IonIcon>
                  </IonButton>
                </IonRow>
                <IonRow
                  style={{ paddingBottom: "1rem" }}
                  class="ion-align-items-center ion-justify-content-center"
                  key="total"
                >
                  <IonText style={{ fontSize: "1.2rem" }}>
                    Total: {quantidadeDeCards}
                  </IonText>
                </IonRow>
              </IonGrid>
            </IonCardContent>
          </IonCard>
        ) : null}

        <IonCard
          style={{
            backgroundImage: `url("${BackGround}")`,
            backgroundSize: "cover",
            backgroundPosition: "center -95px",
            backgroundRepeat: "no-repeat",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "95vw",
            height: "15vh",
            overflow: "hidden",
          }}
          color="secondary"
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              paddingLeft: "2rem",
              paddingRight: "2rem",
            }}
          >
            <div
              style={{
                position: "relative",
                width: "80px",
                height: "80px",
                overflow: "hidden",
              }}
            >
              <IonImg
                style={{
                  position: "absolute",
                  width: "320px",
                  height: "80px",
                  transform: `translateX(-${frameHeroi * 80}px)`,
                }}
                src={`${acaoHeroi}`}
              ></IonImg>
            </div>

            <div
              style={{
                position: "relative",
                width: "80px",
                height: "80px",
                overflow: "hidden",
              }}
            >
              <IonImg
                style={{
                  position: "absolute",
                  width: "700px",
                  height: "175px",
                  top: "-40px",
                  left: "-30px",
                  transform: `scaleX(-1) translateX(${frameMonstro * 175}px)`,
                }}
                src={`${acaoMonstro}`}
              />

              {estadoFumaca ? <IonImg style={{ zIndex : "100" }} src={Fumaca} /> : null}
            </div>
          </div>
        </IonCard>

        <div>
          {estadoCarregamento ? (
            <CirculoCarregamento />
          ) : (
            tarefaFiltradas?.map((item, indice) => (
              <IonCard color="secondary" key={indice}>
                <IonGrid>
                  <IonRow>
                    <IonCol
                      style={{
                        padding: "0px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                      size="2"
                    >
                      <IonButton
                        fill="clear"
                        color="primary"
                        onClick={() => carregaModal(item.id)}
                      >
                        <IonIcon
                          style={{ width: "1.5rem", height: "1.5rem" }}
                          icon={grid}
                        ></IonIcon>
                      </IonButton>
                    </IonCol>
                    <IonCol style={{ paddingBottom: "0rem" }}>
                      <IonCardHeader
                        style={{
                          padding: "0rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <IonCardTitle
                          style={{ fontWeight: "bold" }}
                          className="ion-text-center"
                          color="light"
                        >
                          • {item.nome}
                        </IonCardTitle>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          {separaImagens(item.imagens).map((imagem, indice) =>
                            imagem ? (
                              <IonImg
                                style={{
                                  width: "2.5rem",
                                  height: "2.5rem",
                                  borderRadius: "50%",
                                  objectFit: "cover",
                                  overflow: "hidden",
                                }}
                                key={indice}
                                src={`data:image/jpeg;base64,${imagem}`}
                              />
                            ) : null
                          )}
                        </div>
                      </IonCardHeader>
                    </IonCol>
                    <IonCol
                      style={{
                        padding: "0px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                      size="2"
                    >
                      <IonButton
                        fill="clear"
                        color="primary"
                        onClick={() => completarTarefa(item.id)}
                      >
                        <IonIcon
                          style={{
                            backgroundColor: "white",
                            borderRadius: "50%",
                          }}
                          size="large"
                          icon={radioButtonOff}
                        ></IonIcon>
                      </IonButton>
                    </IonCol>
                  </IonRow>
                  <IonCardContent style={{ padding: "0px" }}>
                    <IonRow>
                      <IonCol style={{ paddingBottom: "0rem" }}>
                        <div className="ion-text-center">
                          <IonLabel>{item.observacao}</IonLabel>
                        </div>
                      </IonCol>
                    </IonRow>
                    <IonRow>
                      <IonCol></IonCol>
                      <IonCol size="7" style={{ paddingBottom: "0rem" }}>
                        <div className="ion-text-center">
                          <IonIcon slot="start" icon={today}></IonIcon>
                          <IonLabel
                            style={{
                              fontSize: "1.2rem",
                              marginLeft: "0.3rem",
                            }}
                          >
                            {/*formatarData(item.dataInicio)*/}{" "}
                            {formatarData(item.dataFim)}
                          </IonLabel>
                        </div>
                      </IonCol>
                      <IonCol></IonCol>
                    </IonRow>
                  </IonCardContent>
                </IonGrid>
              </IonCard>
            ))
          )}
        </div>
        <IonButton
          /*
          onClick={insereExemplo}*/
          href="./PaginaTarefaCadastro"
          shape="round"
          className="custom-botao"
          color="primary"
        >
          +
        </IonButton>
        {atributos ? (
          <IonModal
            isOpen={mostraModalAtributo}
            onDidDismiss={() => defMostraModalAtributo(false)}
            className="custom-modal"
          >
            {atributos.map((atributo: any) => (
              <IonItem
                onClick={() => addAtributoFiltro(atributo.id, atributo.imagem)}
                key={atributo.id}
                color="secondary"
              >
                <IonImg
                  style={{
                    width: "2.5rem",
                    height: "2.5rem",
                    borderRadius: "50%",
                    objectFit: "cover",
                    overflow: "hidden",
                  }}
                  src={atributo.imagem}
                >
                  {atributo.imagem}
                </IonImg>
                <IonTitle>{atributo.nome}</IonTitle>
              </IonItem>
            ))}
          </IonModal>
        ) : null}

        <br></br>
        <IonModal
          isOpen={mostraModalFiltro}
          onDidDismiss={() => defMostraModalFiltro(false)}
          className="custom-modal"
        >
          <IonItem
            onClick={() => modFiltroLabel("ATRIBUTOS")}
            lines="none"
            className="ion-text-center"
          >
            <IonTitle color="primary">➤ Atributos</IonTitle>
          </IonItem>
          <IonItem
            onClick={() => modFiltroLabel("NOME")}
            lines="none"
            className="ion-text-center"
          >
            <IonTitle color="primary">➤ Nome</IonTitle>
          </IonItem>
          <IonItem
            onClick={() => modFiltroLabel("OBSERVAÇÃO")}
            lines="none"
            className="ion-text-center"
          >
            <IonTitle color="primary">➤ Observação</IonTitle>
          </IonItem>
          <IonItem
            onClick={() => modFiltroLabel("IMPORTÂNCIA")}
            lines="none"
            className="ion-text-center"
          >
            <IonTitle color="primary">➤ Importância</IonTitle>
          </IonItem>
          <IonItem
            onClick={() => modFiltroLabel("DIFICULDADE")}
            lines="none"
            className="ion-text-center"
          >
            <IonTitle color="primary">➤ Dificuldade</IonTitle>
          </IonItem>
          <IonItem
            onClick={() => modFiltroLabel("DATA INICIAL")}
            lines="none"
            className="ion-text-center"
          >
            <IonTitle color="primary">➤ Data Inicial</IonTitle>
          </IonItem>
          <IonItem
            onClick={() => modFiltroLabel("DATA FINAL")}
            lines="none"
            className="ion-text-center"
          >
            <IonTitle color="primary">➤ Data Final</IonTitle>
          </IonItem>
        </IonModal>

        <IonModal
          isOpen={mostraModalLogico}
          onDidDismiss={() => defMostraModalLogico(false)}
          className="custom-modal"
        >
          <IonItem
            onClick={deletaCampoFiltro}
            lines="none"
            className="ion-text-center"
          >
            <IonTitle color="primary"> ➤ ⦿ </IonTitle>
          </IonItem>
          <IonItem
            onClick={() => modFiltroValorLogico("E")}
            lines="none"
            className="ion-text-center"
          >
            <IonTitle color="primary"> ➤ E</IonTitle>
          </IonItem>
          <IonItem
            onClick={() => modFiltroValorLogico("OU")}
            lines="none"
            className="ion-text-center"
          >
            <IonTitle color="primary">➤ OU</IonTitle>
          </IonItem>
        </IonModal>

        <IonModal
          isOpen={modal}
          onDidDismiss={() => mostraModal(false)}
          className="custom-modal"
        >
          <IonItem color="secondary">
            <IonButton
              fill="clear"
              color="danger"
              onClick={() => falharTarefa(idTarefaSel)}
            >
              <IonIcon size="large" icon={closeCircle}></IonIcon>
              <IonTitle>Falhar</IonTitle>
            </IonButton>
          </IonItem>
          <IonItem color="secondary">
            <IonButton
              href={`/PaginaTarefaEdicao?id=${idTarefaSel}`}
              fill="clear"
            >
              <IonIcon size="large" icon={create}></IonIcon>
              <IonTitle>Editar</IonTitle>
            </IonButton>
          </IonItem>
          <IonItem color="secondary">
            <IonButton
              fill="clear"
              color="danger"
              onClick={() => mostraModalDel(true)}
            >
              <IonIcon size="large" icon={trash}></IonIcon>
              <IonTitle>Deletar</IonTitle>
            </IonButton>
          </IonItem>
        </IonModal>

        <IonModal
          isOpen={modalDel}
          onDidDismiss={() => mostraModalDel(false)}
          className="custom-modal"
        >
          <IonCard color="secondary">
            <IonCardHeader>
              <IonCardTitle className="ion-text-center">
                Tem certeza que deseja deletar essa tarefa?
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent className="ion-padding">
              <div className="ion-text-center">
                Essa ação não pode ser desfeita.
              </div>
              <IonItem lines="none" color="secondary">
                <IonButton
                  onClick={() => confirmaDelecao(idTarefaSel)}
                  color="danger"
                >
                  Confirmar
                </IonButton>
                <IonButton onClick={fecharModais} color="light">
                  Cancelar
                </IonButton>
              </IonItem>
            </IonCardContent>
          </IonCard>
        </IonModal>
      </IonContent>
      <BarraInferior />
    </IonPage>
  );
};

export default PainelDeTarefas;
