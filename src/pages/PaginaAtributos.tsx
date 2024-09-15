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
  IonFooter,
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
  observacao: string;
  xp: number;
};

const PainelDeAtributos: React.FC = () => {
  const [atributoItens, definirAtributoItens] = useState<Array<atributoItem>>();
  const [estadoCarregamento, definirCarregamento] = useState(false);

  const { executarAcaoSQL, iniciado } = usaSQLiteDB();

  let respostaAtributosQuery = `SELECT 
  atributo.id,
  atributo.nome, 
  atributo.observacao, 
  atributo.xp
  FROM 
    atributo
  WHERE 
    atributo.ativo = 1`;

  useEffect(() => {
    carregaAtributos();
  }, [iniciado]);

  const recarregarPagina = () => {
    location.reload();
  };

  const carregaAtributos = async () => {
    definirCarregamento(true);
    try {
      await executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
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

  const calculaNivel = async (xp: number) => {
    let nivel = 0;
    let custoProxNivel = 500;
    let xpSobrando = 0;

    while (xp - custoProxNivel >= 0) {
      xp -= custoProxNivel;
      nivel += 1;
      custoProxNivel += custoProxNivel;
    }

    xpSobrando = xp;

    const resultados = [
      { nivel: nivel },
      { xpExcedente: xpSobrando },
      { xpProxNivel: custoProxNivel },
    ];
  };

  return (
    <IonPage>
      <IonHeader>
        <TituloBotaoVoltar
          titulo="Atributos"
          icone={rose}
        />
      </IonHeader>
      <IonContent color="tertiary">

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
                  <div className="ion-text-center">{item.observacao}</div>
                  <div className="ion-text-center">
                    <IonLabel
                      style={{ fontSize: "1.2rem", marginLeft: "0.3rem" }}
                    >
                      Nivel: {0} {item.xp}
                    </IonLabel>
                    <br></br>
                    <IonProgressBar value={0}></IonProgressBar>
                    <br></br>
                  </div>
                  <IonButtons class="flex-center-icon-text">
                    <IonButton
                      href={`/PaginaAtributoEdicao?id=${item.id}`}
                    >
                      <IonIcon size="large" icon={create}></IonIcon>
                    </IonButton>
                    <IonButton
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
      </IonContent>
      <IonFooter>
        <BarraInferior />
      </IonFooter>
    </IonPage>
  );
};

export default PainelDeAtributos;
