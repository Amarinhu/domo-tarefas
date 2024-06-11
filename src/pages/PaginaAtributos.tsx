import {
  IonAlert,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonInput,
  IonLabel,
  IonPage,
  IonProgressBar,
  IonRow,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import usaSQLiteDB from "../composables/usaSQLiteDB";
import TituloBotaoVoltar from "../components/BarraSuperior";
import CirculoCarregamento from "../components/CirculoDeCarregamento";
import { create, rose, search, trash } from "ionicons/icons";
import BarraInferior from "../components/BarraInferiorControles";
import armazenamento from "../armazenamento";

type atributoItem = {
  id: number;
  nome: string;
  descricao: string;
  xp: number;
};

const PainelDeAtributos: React.FC = () => {
  const [atributoItens, definirAtributoItens] = useState<Array<atributoItem>>();
  const [atributoFiltro, definirAtributoFiltro] = useState<string>("");
  const [estadoCarregamento, definirCarregamento] = useState(false);
  const [mostraFiltro, definirMostraFiltro] = useState<boolean>(true);
  const [idUsuario, definirIdUsuario] = useState();

  const { executarAcaoSQL, iniciado } = usaSQLiteDB();

  const quantidadeDeCards = atributoItens?.length ? atributoItens?.length : 0;

  const respostaAtributosQuery = `SELECT 
  atributo.id,
  atributo.nome, 
  atributo.descricao, 
  atributo.xp
  FROM 
    atributo
  JOIN
      Usuario on atributo.usuario_id = usuario.id
  WHERE 
    atributo.ativo = 1
  AND
    atributo.usuario_id = ${idUsuario}`;

  const capturaIdUsuarioPromise = async () => {
    const resultado = await armazenamento.get("idUsuario");
    return await resultado;
  };

  const obterIdUsuario = async () => {
    const idUsuarioAtual: any = await capturaIdUsuarioPromise();
    definirIdUsuario(idUsuarioAtual);
  };

  useEffect(() => {
    obterIdUsuario();
    carregaAtributos();
  }, [iniciado]);

  const recarregarPagina = () => {
    location.reload();
  };

  const carregaAtributos = async () => {
    definirCarregamento(true);
    try {
      executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
        const respostaAtributos = await db?.query(respostaAtributosQuery);
        definirAtributoItens(respostaAtributos?.values);
      });
    } catch (erro) {
      console.log(erro);
      definirAtributoItens([]);
    } finally {
      definirCarregamento(false);
    }
  };

  const capturaMudancaAtributo = (evento: CustomEvent) => {
    const valor = (evento.target as HTMLInputElement).value;
    console.log("Valor filtro Atributo: ", valor);
    definirAtributoFiltro(valor);
  };

  const aplicaFiltro = () => {
    console.log(atributoItens);
    const respostaAtributosQuery = `SELECT 
    atributo.id,
    atributo.nome, 
    atributo.descricao, 
    atributo.xp
    FROM 
      atributo
    JOIN
        Usuario on atributo.usuario_id = usuario.id
    WHERE 
      atributo.ativo = 1
    AND
      atributo.usuario_id = ${idUsuario}
    AND
      (atributo.nome LIKE '%${atributoFiltro}%' OR atributo.descricao LIKE '%${atributoFiltro}%')`;

    console.log(respostaAtributosQuery);

    try {
      executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
        const respostaAtributos = await db?.query(respostaAtributosQuery);
        definirAtributoItens(respostaAtributos?.values);
      });
    } catch (erro) {
      console.log(erro);
      definirAtributoItens([]);
    }
  };

  const confirmaDelecao = (id: number) => {
    console.log(`Realiza Deleção do atributo : ${id}`);
    let atributoDelecao = `
      UPDATE Atributo SET ativo = 0 WHERE id = ${id};`;

    try {
      executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
        await db?.query(atributoDelecao);
      });
    } catch (erro) {
      console.log(erro);
    } finally {
      recarregarPagina();
    }
  };

  const calculaBarra = (xp: number) => {
    let maxXP = 1000;
    while (xp >= maxXP) {
      maxXP += 1000;
    }
    const porcentagem = (xp % 1000) / 1000;
    return porcentagem;
  };

  const calculaNivel = (xp: number) => {
    let nivel = 0;
    let maxXP = 1000;
    while (xp >= maxXP) {
      nivel++;
      maxXP += 1000;
    }
    return nivel;
  };

  return (
    <IonPage>
      <IonHeader>
        <TituloBotaoVoltar
          titulo="Atributos"
          icone={rose}
          filtro={true}
          definirMostraFiltro={definirMostraFiltro}
          mostraFiltro={mostraFiltro}
        />
      </IonHeader>
      <IonContent color="tertiary">
        {mostraFiltro == true ? (
          <IonCard>
            <IonCardContent>
              <IonGrid>
                <IonRow>
                  <IonCol>
                    <IonInput
                      placeholder="Nome do Atributo"
                      onIonInput={capturaMudancaAtributo}
                    ></IonInput>
                  </IonCol>
                </IonRow>
                <IonRow>
                  <IonCol className="flex-center-icon-text">
                    <IonButtons>
                      <IonButton onClick={aplicaFiltro}>
                        <IonIcon className="icon-large" icon={search}></IonIcon>
                      </IonButton>
                    </IonButtons>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonCardContent>
          </IonCard>
        ) : null}

        <IonCard>
          <IonCardHeader>
            <IonCardTitle
              style={{ fontSize: "1.5rem" }}
              className="ion-text-center"
            >
              Total: {quantidadeDeCards}
            </IonCardTitle>
          </IonCardHeader>
        </IonCard>

        <div className="ion-padding">
          {estadoCarregamento ? (
            <CirculoCarregamento />
          ) : (
            atributoItens?.map((item, indice) => (
              <IonCard color="secondary" key={indice}>
                <IonCardHeader>
                  <IonCardTitle
                    style={{ fontWeight: "bold" }}
                    className="ion-text-center"
                    color="light"
                  >
                    • {item.nome}
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <div className="ion-text-center">{item.descricao}</div>
                  <div className="ion-text-center">
                    <IonLabel
                      style={{ fontSize: "1.2rem", marginLeft: "0.3rem" }}
                    >
                      Nivel: {calculaNivel(item.xp)}
                    </IonLabel>
                    <br></br>
                    <IonProgressBar
                      value={calculaBarra(item.xp)}
                    ></IonProgressBar>
                    <br></br>
                  </div>
                  <IonButtons class="flex-center-icon-text">
                    <IonButton
                      fill="solid"
                      color="warning"
                      style={{ border: "solid 1px black" }}
                      href={`/PaginaAtributoEdicao?id=${item.id}`}
                    >
                      <IonIcon size="large" icon={create}></IonIcon>
                    </IonButton>
                    <IonButton
                      fill="solid"
                      color="danger"
                      style={{ border: "solid 1px black" }}
                      id={`delecao-alerta-${item.id}`}
                    >
                      <IonIcon size="large" icon={trash}></IonIcon>
                    </IonButton>
                    <div>
                      <IonAlert
                        trigger={`delecao-alerta-${item.id}`}
                        header="Deletar Atributo?"
                        message="Tem certeza que deseja deletar essa atributo?"
                        buttons={[
                          {
                            text: "Confirmar",
                            handler: () => confirmaDelecao(item.id),
                          },
                          {
                            text: "Cancelar",
                          },
                        ]}
                      ></IonAlert>
                    </div>
                  </IonButtons>
                </IonCardContent>
              </IonCard>
            ))
          )}
        </div>
        <IonButton
          href="./PaginaAtributoCadastro"
          shape="round"
          className="custom-botao"
          color="primary"
        >
          +
        </IonButton>
        <BarraInferior />
      </IonContent>
    </IonPage>
  );
};

export default PainelDeAtributos;
