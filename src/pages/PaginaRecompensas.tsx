import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonIcon,
  IonLabel,
  IonPage,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import usaSQLiteDB from "../composables/usaSQLiteDB";
import TituloBotaoVoltar from "../components/BarraSuperior";
import CirculoCarregamento from "../components/CirculoDeCarregamento";
import {
  cash,
  diamond,
  logoBitcoin,
} from "ionicons/icons";
import BarraInferior from "../components/BarraInferiorControles";

type recompensaItem = {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
};

const PaginaRecompensas: React.FC = () => {
  const [recompensaItens, definirRecompensaItens] =
    useState<Array<recompensaItem>>();
  /*const [recompensaFiltro, definirRecompensaFiltro] = useState<string>("");*/
  const [estadoCarregamento, definirCarregamento] = useState(false);
  const [mostraFiltro, definirMostraFiltro] = useState<boolean>(true);

  const { executarAcaoSQL, iniciado } = usaSQLiteDB();

  /*
  const respostaRecompensasQuery = `SELECT 
  recompensa.id,
  recompensa.nome, 
  recompensa.descricao, 
  recompensa.xp
  FROM 
    recompensa
  WHERE 
    ativo = 1`;*/

  useEffect(() => {
    /*carregaRecompensas();*/
    teste();
  }, [iniciado]);

  const teste = () => {
    const recompensas = [
      {
        id: 1,
        nome: "Sorvete Especial",
        preco: 5.0,
        descricao: "Você merece um sorvete especial, vá pegar um campeão",
      },
      {
        id: 2,
        nome: "Massagem Relaxante",
        preco: 50.0,
        descricao: "Aproveite uma massagem relaxante para aliviar o estresse",
      },
      {
        id: 3,
        nome: "Filme no Cinema",
        preco: 15.0,
        descricao: "Desfrute de um filme no cinema com pipoca e refrigerante",
      },
      {
        id: 4,
        nome: "Dia no SPA",
        preco: 200.0,
        descricao: "Um dia completo de relaxamento e cuidados no SPA",
      },
      {
        id: 5,
        nome: "Jantar em Restaurante",
        preco: 80.0,
        descricao: "Saboreie um jantar delicioso em seu restaurante favorito",
      },
      {
        id: 6,
        nome: "Sessão de Jogos",
        preco: 100.0,
        descricao: "Permita-se um tempo para jogar seus jogos favoritos",
      },
      {
        id: 7,
        nome: "Passeio de Helicóptero",
        preco: 300.0,
        descricao: "Experimente a emoção de um passeio de helicóptero",
      },
      {
        id: 8,
        nome: "Compras no Shopping",
        preco: 100.0,
        descricao: "Aproveite um dia de compras e compre algo que você ama",
      },
      {
        id: 9,
        nome: "Férias de Fim de Semana",
        preco: 500.0,
        descricao:
          "Relaxe e se divirta com uma pequena viagem de fim de semana",
      },
      {
        id: 10,
        nome: "Aula de Culinária",
        preco: 50.0,
        descricao: "Aprenda novas receitas em uma divertida aula de culinária",
      },
    ];
    definirRecompensaItens(recompensas);
    console.log(recompensas);
  };

  const recarregarPagina = () => {
    location.reload();
  };

  /*
  const carregaRecompensas = async () => {
    definirCarregamento(true);
    try {
      executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
        const respostaRecompensas = await db?.query(respostaRecompensasQuery);
        definirRecompensaItens(respostaRecompensas?.values);
      });
    } catch (erro) {
      console.log(erro);
      definirRecompensaItens([]);
    } finally {
      definirCarregamento(false);
    }
  };

  /*
  const capturaMudancaRecompensa = (evento: CustomEvent) => {
    const valor = (evento.target as HTMLInputElement).value;
    console.log("Valor filtro Recompensa: ", valor);
    definirRecompensaFiltro(valor);
  };

  const aplicaFiltro = () => {
    const respostaRecompensasQuery = `SELECT 
    recompensa.id,
    recompensa.nome, 
    recompensa.descricao, 
    recompensa.xp
    FROM 
      recompensa
    WHERE 
      ativo = 1
     AND
      (recompensa.nome LIKE '%${recompensaFiltro}%' OR recompensa.descricao LIKE '%${recompensaFiltro}%')`;

    console.log(respostaRecompensasQuery);

    try {
      executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
        const respostaRecompensas = await db?.query(respostaRecompensasQuery);
        definirRecompensaItens(respostaRecompensas?.values);
      });
    } catch (erro) {
      console.log(erro);
      definirRecompensaItens([]);
    }
  };*/

  const confirmaDelecao = (id: number) => {
    console.log(`Realiza Deleção do recompensa : ${id}`);
    let recompensaDelecao = `
      UPDATE Recompensa SET ativo = 0 WHERE id = ${id};`;

    try {
      executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
        await db?.query(recompensaDelecao);
      });
    } catch (erro) {
      console.log(erro);
    } finally {
      recarregarPagina();
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <TituloBotaoVoltar
          titulo="Recompensas"
          icone={logoBitcoin}
          definirMostraFiltro={definirMostraFiltro}
          mostraFiltro={mostraFiltro}
        />
      </IonHeader>
      <IonContent color="tertiary">
        {/* mostraFiltro == true ? (
            <IonCard>
              <IonCardContent>
                <IonGrid>
                  <IonRow>
                    <IonCol>
                      <IonInput
                        placeholder="Nome do Recompensa"
                        onIonInput={capturaMudancaRecompensa}
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
          ) : null */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
          }}
        >
          {estadoCarregamento ? (
            <CirculoCarregamento />
          ) : (
            recompensaItens?.map((item, indice) => (
              <IonCard color="secondary" key={indice}>
                <IonCardContent>
                  <div className="ion-text-center">
                    <IonLabel> • {item.nome} </IonLabel>
                    <br></br>
                    <IonIcon icon={diamond} slot="start"></IonIcon>
                    <IonLabel
                      style={{ fontSize: "1.2rem", marginLeft: "0.3rem" }}
                    >
                      {item.preco}
                    </IonLabel><br></br>
                    <IonButton color="success"><IonIcon icon={cash}></IonIcon></IonButton>
                  </div>
                  {/*
                  <IonButtons class="flex-center-icon-text">
                    <IonButton
                      fill="solid"
                      color="warning"
                      style={{ border: "solid 1px black" }}
                      href={`/PaginaRecompensaEdicao?id=${item.id}`}
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
                        header="Deletar Recompensa?"
                        message="Tem certeza que deseja deletar essa recompensa?"
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
                  </IonButtons> */}
                </IonCardContent>
              </IonCard>
            ))
          )}
        </div>
        <IonButton
          href="./PaginaRecompensaCadastro"
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

export default PaginaRecompensas;
