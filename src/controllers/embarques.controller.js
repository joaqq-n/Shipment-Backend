import embarques from "../models/embarques";
import dataembarque from "../models/dataembarque";
import timeline from "../models/lineadetiempo";
import sequelize from "sequelize";
import valordata from "../models/valordata";
import timelines from "../models/lineadetiempo";
import comentarios from "../models/comentarioslineadetiempo";
import finanza from "../models/finanzas";
import itemfinanza from "../models/item_finanzas";
import datalcl from "../models/datalcl";
import datafcl from "../models/datafcl";
import transbordo from "../models/trasbordos";
import documentos from "../models/documentos";
import documento from "../models/documento";

export async function createEmbarque(req, res) {
  try {
    const {
      //embarque
      tipo_operacion,
      n_operacion,
      medio_transporte,
      referencia,
      etd,
      eta,

      //dataEmbarque
      intercom,
      exportador,
      importador,
      embarcador, //operador logistico
      agencia_aduana,
      motonave,
      puertoembarque,
      puertodestino,
      lugardestino,
      naviera,
      viaje,
      valor_cif,

      tipo_documento,
      documento,
      reserva,

      //arreglo de trasbordos
      trasbordos,
      //arreglo de mercancias
      mercancias,

      //datos lcl
      contenedor,
      cant_bultos,
      peso,
      volumen,
      lugar_destino,

      //datos fcl
      deposito_contenedores,
      cont_tipo,
      sello,
    } = req.body;

    const newEmbarque = await embarques.create(
      {
        tipo_operacion,
        n_operacion,
        estado: "origen",
        referencia,
        etd,
        eta,
        medio_transporte,
      },
      {
        fields: [
          "tipo_operacion",
          "n_operacion",
          "estado",
          "referencia",
          "etd",
          "eta",
          "medio_transporte",
        ],
        attributes: ["id"],
      }
    );
    if (newEmbarque) {
      const newDataEmbarque = await dataembarque.create(
        {
          id_embarque: newEmbarque.id,
          intercom: intercom,
          exportador,
          importador,
          embarcador,
          agencia_aduana,
          motonave,
          puertoembarque,
          puertodestino,
          lugardestino,
          naviera,
          viaje,
          reserva,
          tipo_documento,
          valor_cif,
          documento,

          fecha_inicio: sequelize.literal("CURRENT_TIMESTAMP"),
        },
        {
          fields: [
            "id_embarque",
            "intercom",
            "exportador",
            "importador",
            "embarcador",
            "agencia_aduana",
            "motonave",
            "puertoembarque",
            "puertodestino",
            "lugardestino",
            "naviera",
            "viaje",
            "reserva",
            "tipo_documento",
            "documento",
            "valor_cif",
            "fecha_inicio",
          ],
          attributes: ["id"],
        }
      );

      if (mercancias) {
        //itera segun cuantos datos se importen de mercancias
        mercancias.map(async (mercancia) => {
          const newValorData = await valordata.create(
            {
              id_data: newDataEmbarque.id,
              nombre_mercancia: mercancia.nombre_mercancia,
              valor_usd: mercancia.valor_usd,
              flete_usd: mercancia.flete_usd,
              seguro_usd: mercancia.seguro_usd,
            },
            {
              fields: [
                "id_data",
                "nombre_mercancia",
                "valor_usd",
                "flete_usd",
                "seguro_usd",
              ],
            }
          );
        });
      }

      if (trasbordos) {
        //itera segun cuantos trasbordos se maneden
        trasbordos.map(async (trasbordo) => {
          const newTrasbordo = await transbordo.create(
            {
              id_data: newDataEmbarque.id,
              puerto_transb: trasbordo.puerto_transb,
              nave: trasbordo.nave,
              fecha: trasbordo.fecha,
            },
            {
              fields: [
                "id_data",
                "id_embarque",
                "puerto_transb",
                "nave",
                "fecha",
              ],
            }
          );
        });
      }
      //crear el lcl y el fcl segun el medio de transporte

      if (medio_transporte == "LCL") {
        //creo el lcl
        const createLCL = await datalcl.create(
          {
            id_data: newDataEmbarque.id,
            contenedor,
            cant_bultos,
            peso,
            volumen,
            lugar_destino,
          },
          {
            fields: [
              "id_data",
              "contenedor",
              "cant_bultos",
              "peso",
              "volumen",
              "lugar_destino",
            ],
          },
          {
            attributes: ["id"],
          }
        );
      } else if (medio_transporte == "FCL") {
        //creo el fcl
        const createFCL = await datafcl.create(
          {
            id_data: newDataEmbarque.id,
            deposito_contenedores,
            cont_tipo,
            sello,
          },
          {
            fields: ["id_data", "deposito_contenedores", "cont_tipo", "sello"],
          }
        );
      }

      //tenemos que crear la linea de tiempo con titulo Origen contenido: a la espera de salir
      const createTimeline = await timeline.create(
        {
          id_embarque: newEmbarque.id,
          estado: "Activo",
        },
        {
          fields: ["id_embarque", "estado"],
        }
      );

      if (createTimeline) {
        //consigo el id del timeline
        const getTimeline = await timelines.findOne({
          where: {
            id_embarque: newEmbarque.id,
          },
          attributes: ["id"],
        });
        if (getTimeline) {
          const createComentario = await comentarios.create(
            {
              id_linea_tiempo: getTimeline.id,
              titulo: "Origen",
              contenido: "A la espera de salir",
              estado: "Activo",
              creado: sequelize.literal("CURRENT_TIMESTAMP"),
            },
            {
              fields: [
                "id_linea_tiempo",
                "titulo",
                "contenido",
                "estado",
                "creado",
              ],
            }
          );
        } else {
          res.json({
            respuesta: false,
            message: "No se pudo obtener la linea de tiempo",
          });
        }
      } else {
        res.json({
          respuesta: false,
          message: "No se pudo crear la linea de tiempo",
        });
      }

      const payload = {
        tipo_operacion: newEmbarque.tipo_operacion,
        n_operacion: newEmbarque.n_operacion,
        medio_transporte: newEmbarque.medio_transporte,
        referencia: newEmbarque.referencia,
        etd: newEmbarque.etd,
        eta: newEmbarque.eta,

        //dataEmbarque
        intercom: newDataEmbarque.intercom,
        exportador: newDataEmbarque.exportador,
        importador: newDataEmbarque.importador,
        embarcador: newDataEmbarque.embarcador, //operador logistico
        agencia_aduana: newDataEmbarque.agencia_aduana,
        motonave: newDataEmbarque.motonave,
        puertoembarque: newDataEmbarque.puertoembarque,
        puertodestino: newDataEmbarque.puertodestino,
        lugardestino: newDataEmbarque.lugardestino,
        naviera: newDataEmbarque.naviera,
        viaje: newDataEmbarque.viaje,
        valor_cif: newDataEmbarque.valor_cif,

        tipo_documento: newDataEmbarque.tipo_documento,
        documento: newDataEmbarque.documento,
        reserva: newDataEmbarque.reserva,

        // //arreglo de trasbordos
        // trasbordos,
        // //arreglo de mercancias
        // mercancias,
      };

      res.json({ respuesta: true, payload });
    }

    // //creamos el comentario
    // if (newDataEmbarque && createTimeline) {
    //   return res.json({
    //     message: "Embarque creado Satisfactoriamente",
    //   });
    // } else {
    //   console.log(error);
    //   res.status(500).json({
    //     message: "Oops algo salio mal/:",
    //   });
    // }
  } catch (error) {
    console.log(error);
  }
}

export async function getEmbarque(req, res) {
  const { id } = req.params;
  try {
    const embarque = await embarques.findOne({
      where: {
        id,
      },
    });
    if (embarque) {
      let data_transporte;
      const datoEmbarque = await dataembarque.findOne({
        where: {
          id_embarque: id,
        },
      });

      const valorEmbarque = await valordata.findAll({
        where: {
          id_data: datoEmbarque.id,
        },
      });

      const transbordoEmbarque = await transbordo.findAll({
        where: {
          id_data: datoEmbarque.id,
        },
      });
      if (embarque.medio_transporte == "LCL") {
        data_transporte = await datalcl.findOne({
          where: {
            id_data: datoEmbarque.id,
          },
        });
      } else if (embarque.medio_transporte == "FCL") {
        data_transporte = await datafcl.findOne({
          where: {
            id_data: datoEmbarque.id,
          },
        });
      }

      const payload = {
        id: embarque.id,
        tipo_operacion: embarque.tipo_operacion,
        n_operacion: embarque.n_operacion,
        estado: embarque.estado,
        referencia: embarque.referencia,
        etd: embarque.etd,
        eta: embarque.eta,
        medio_transporte: embarque.medio_transporte,

        intercom: datoEmbarque.intercom,
        exportador: datoEmbarque.exportador,
        importador: datoEmbarque.importador,
        embarcador: datoEmbarque.embarcador,
        agencia_aduana: datoEmbarque.agencia_aduana,
        tipo_documento: datoEmbarque.tipo_documento,
        documento: datoEmbarque.documento,
        puertoembarque: datoEmbarque.puertoembarque,
        puertodestino: datoEmbarque.puertodestino,
        lugardestino: datoEmbarque.lugardestino,
        motonave: datoEmbarque.motonave,
        viaje: datoEmbarque.viaje,
        naviera: datoEmbarque.naviera,
        transbordo: datoEmbarque.transbordo,
        reserva: datoEmbarque.reserva,

        sello: data_transporte.sello,
        cont_tipo: data_transporte.cont_tipo,
        deposito_contenedores: data_transporte.deposito_contenedores,

        data_transporte,

        mercancias: valorEmbarque,
        trasbordos: transbordoEmbarque,
      };
      res.json({ resultado: true, data: payload }).status(200);
    } else {
      res.json({ resultado: false, message: "ID inexistente" }).status(400);
    }
  } catch (error) {
    console.log({ resultado: false, error: error }).status(400);
  }
}

export async function getallEmbarques(req, res) {
  try {
    const embarque = await embarques.findAll({});
    res.json(embarque);
  } catch (error) {
    console.log(error);
  }
}

export async function deleteEmbarque(req, res) {
  const { id } = req.body;
  //al eliminar un embarque elimino los comentarios asociados
  try {
    //eliminar los comentarios y archivos de un embarque

    //necesito el data embarque id para poder eliminar el valordata
    if (id) {
      id.map(async (idEmbarque) => {
        const getvalorDataId = await dataembarque.findOne({
          where: {
            id_embarque: idEmbarque,
          },
          attributes: ["id"],
        });
        if (getvalorDataId) {
          const deleteValorData = await valordata.destroy({
            where: {
              id_data: getvalorDataId.id,
            },
          });
        }
        const getTimelines = await timelines.findOne({
          where: {
            id_embarque: idEmbarque,
          },
          attributes: ["id"],
        });
        if (getTimelines) {
          const deleteComentaries = await comentarios.destroy({
            where: {
              id_linea_tiempo: getTimelines.id,
            },
          });
          const deleteTimelines = await timelines.destroy({
            where: {
              id_embarque: idEmbarque,
            },
          });
        }

        const getdataembarque = await dataembarque.findOne({
          where: {
            id_embarque: idEmbarque,
          },
          attributes: ["id"],
        });
        if (getdataembarque) {
          //borrar datalcl
          const deletelcl = await datalcl.destroy({
            where: { id_data: getdataembarque.id },
          });
          //borrarfcl
          const deletefcl = await datafcl.destroy({
            where: { id_data: getdataembarque.id },
          });
          //borrartransbordos
          const deletetransbordos = await transbordo.destroy({
            where: { id_data: getdataembarque.id },
          });
          const getdocuments = await documentos.findOne({
            where: { id_embarque: idEmbarque },
            attributes: ["id"],
          });
          if (getdocuments) {
            const deleteDocumento = await documento.destroy({
              where: {
                id_documentos: getdocuments.id,
              },
            });
          }
          const deleteDocumentos = await documentos.destroy({
            where: {
              id_embarque: idEmbarque,
            },
          });
        }

        const deleteDataEmbarque = await dataembarque.destroy({
          where: {
            id_embarque: idEmbarque,
          },
        });
        //borrar item_finanza y finanza
        const getfinanza = await finanza.findOne({
          where: {
            id_embarque: idEmbarque,
          },
          attributes: ["id"],
        });
        if (getfinanza) {
          const deleteItemFinanza = await itemfinanza.destroy({
            where: {
              id_finanza: getfinanza.id,
            },
          });
        }
        const deletefinanza = await finanza.destroy({
          where: {
            id_embarque: idEmbarque,
          },
        });

        const deleteEmbarques = await embarques.destroy({
          where: {
            id,
          },
        });
      });
      res.json({
        message: "Embarque eliminadado correctamente",
        deleteDataEmbarque,
        deleteEmbarques,
      });
    } else {
      res.json({ respuesta: false, mesagge: "error, los id ya no existen):" });
    }
  } catch (error) {
    console.log(error);
  }
}

export async function updateEmbarques(req, res) {
  try {
    const {
      tipo_operacion,
      n_operacion,
      medio_transporte,
      referencia,
      etd,
      eta,
      estado,

      //dataEmbarque
      intercom,
      exportador,
      importador,
      embarcador, //operador logistico
      agencia_aduana,
      motonave,
      puertoembarque,
      puertodestino,
      lugardestino,
      naviera,
      viaje,
      valor_cif,

      tipo_documento,
      documento,
      reserva,

      //arreglo de trasbordos
      trasbordos,
      //arreglo de mercancias
      mercancias,

      //datos lcl
      contenedor,
      cant_bultos,
      peso,
      volumen,
      lugar_destino,

      //datos fcl
      deposito_contenedores,
      cont_tipo,
      sello,
    } = req.body;
    const { id } = req.params;

    const getEmbarque = await embarques.findOne(
      {
        where: {
          id,
        },
      },
      {
        attributes: ["id", "estado"],
      }
    );

    //si existe el id cambio el estado y completo la actividad anterior
    if (getEmbarque) {
      const getDataEmbarque = await dataembarque.findOne({
        where: {
          id_embarque: id,
        },
      });
      const EmbarquesUpdate = await embarques.update(
        {
          tipo_operacion,
          n_operacion,
          estado,
          referencia,
          etd,
          eta,
          medio_transporte,
        },
        {
          where: { id },
        }
      );
      //dependiendo del estado al que cambio es el comentario que creo

      //si el estado actual es origen y pasa a Abordo
      if (estado == "Abordo") {
        //obtengo el id de la linea de tiempo para crear el comentario
        const getTimelineId = await timeline.findOne(
          {
            where: {
              id_embarque: id,
            },
          },
          {
            attributes: ["id"],
          }
        );

        //cambio el estado de la linea de tiempo anterior a finalizado
        const setTimelineState = await comentarios.update(
          {
            estado: "Finalizado",
          },
          {
            where: {
              titulo: "Origen",
            },
          }
        );
        //creo un comentario  linea de tiempo para Abordo
        const createComTimeline = await comentarios.create(
          {
            id_linea_tiempo: getTimelineId.id,
            titulo: "Abordo",
            contenido: "Viajando a destino",
            estado: "Activo",
            creado: sequelize.literal("CURRENT_TIMESTAMP"),
          },
          {
            fields: [
              "id_linea_tiempo",
              "titulo",
              "contenido",
              "estado",
              "creado",
            ],
          }
        );
        res.json({ Respuesta: "Estado cambiado a Abordo" });
      }

      //si el estado actual es Abordo y pasa a Llegado
      else if (estado == "Llegado") {
        //obtengo el id de la linea de tiempo para crear el comentario
        const getTimelineId = await timeline.findOne(
          {
            where: {
              id_embarque: id,
            },
          },
          {
            attributes: ["id"],
          }
        );

        //cambio el estado de la linea de tiempo anterior a finalizado
        const setTimelineState = await comentarios.update(
          {
            estado: "Finalizado",
          },
          {
            where: {
              estado: "Abordo",
            },
          }
        );
        //creo un comentario  linea de tiempo para Abordo
        const createComTimeline = await comentarios.create(
          {
            id_linea_tiempo: getTimelineId.id,
            titulo: "Llegado",
            contenido: "Llego a destino",
            estado: "Activo",
            creado: sequelize.literal("CURRENT_TIMESTAMP"),
          },
          {
            fields: [
              "id_linea_tiempo",
              "titulo",
              "contenido",
              "estado",
              "creado",
            ],
          }
        );
        res.json({ Respuesta: "Estado cambiado a Llegado" });
      }

      //si el estado actual es Llegado y pasa a Origen
      else if (estado == "Finalizado") {
        //obtengo el id de la linea de tiempo para crear el comentario
        const getTimelineId = await timeline.findOne(
          {
            where: {
              id_embarque: id,
            },
          },
          {
            attributes: ["id"],
          }
        );

        //cambio el estado de la linea de tiempo anterior a finalizado
        const setTimelineState = await comentarios.update(
          {
            estado: "Finalizado",
          },
          {
            where: {
              estado: "Llegado",
            },
          }
        );
        //cambio el estado de el embarque
        const setEmbarqueState = await embarque.update(
          {
            estado: "Finalizado",
          },
          {
            where: {
              estado: "Llegado",
            },
          }
        );
        //del dataEmbarque le agrego el tiempo_fin
        const setTime = await dataembarque.update({
          fecha_fin: sequelize.literal("CURRENT_TIMESTAMP"),
        });
        //creo un comentario  linea de tiempo para Abordo
        const createComTimeline = await comentarios.create(
          {
            id_linea_tiempo: getTimelineId.id,
            titulo: "Finalizado",
            contenido: "Emabarque finalizado!",
            estado: "Finalizado",
            creado: sequelize.literal("CURRENT_TIMESTAMP"),
          },
          {
            fields: [
              "id_linea_tiempo",
              "titulo",
              "contenido",
              "estado",
              "creado",
            ],
          }
        );
        res.json({ Respuesta: "Embarque Finalizado" });
      }

      const dataembarqueupdate = await dataembarque.update(
        {
          intercom: intercom,
          exportador,
          importador,
          embarcador,
          agencia_aduana,
          tipo_documento,
          documento,
          motonave,
          puertoembarque,
          puertodestino,
          lugardestino,
          viaje,
          naviera,
          reserva,
          valor_cif,
        },
        {
          where: { id_embarque: id },
        }
      );
      const caca = getDataEmbarque.id;

      if (mercancias) {
        //se eliminan las mercancias actuales
        const deleteMercancias = await valordata.destroy({
          where: {
            id_data: getDataEmbarque.id,
          },
        });

        //itera segun cuantos datos se importen de mercancias
        mercancias.map(async (mercancia) => {
          const valorDataUpdate = await valordata.create(
            {
              id_data: getDataEmbarque.id,
              nombre_mercancia: mercancia.nombre_mercancia,
              valor_usd: mercancia.valor_usd,
              flete_usd: mercancia.flete_usd,
              seguro_usd: mercancia.seguro_usd,
            },
            {
              fields: [
                "id_data",
                "nombre_mercancia",
                "valor_usd",
                "flete_usd",
                "seguro_usd",
              ],
            }
          );
        });
      }

      if (trasbordos) {
        //se eliminan las mercancias actuales
        const deleteTrasbordos = await transbordo.destroy({
          where: {
            id_data: getDataEmbarque.id,
          },
        });

        //itera segun cuantos trasbordos se maneden
        trasbordos.map((trasbordo) => {
          const createTrasbordo = transbordo.create(
            {
              id_data: getDataEmbarque.id,
              puerto_transb: trasbordo.puerto_transb,
              nave: trasbordo.nave,
              fecha: trasbordo.fecha,
            },
            {
              fields: [
                "id_data",
                "id_embarque",
                "puerto_transb",
                "nave",
                "fecha",
              ],
            }
          );
        });
      }

      if (medio_transporte == "LCL") {
        const deleteFCL = await datafcl.destroy({
          where: { id_data: getDataEmbarque.id },
        });

        const deleteLCL = await datalcl.destroy({
          where: { id_data: getDataEmbarque.id },
        });

        const creaaaar = await datalcl.create(
          {
            id_data: getDataEmbarque.id,
            contenedor,
            cant_bultos,
            peso,
            volumen,
            lugar_destino,
          },
          {
            fields: [
              "id_data",
              "contenedor",
              "cant_bultos",
              "peso",
              "volumen",
              "lugar_destino",
            ],
          },
          {
            attributes: ["id"],
          }
        );
      }
      if (medio_transporte == "FCL") {
        const deleteFCL = await datafcl.destroy({
          where: { id_data: getDataEmbarque.id },
        });

        const deleteLCL = await datalcl.destroy({
          where: { id_data: getDataEmbarque.id },
        });

        //creo el fcl
        const updateFCL = await datafcl.create(
          {
            id_data: getDataEmbarque.id,
            deposito_contenedores,
            cont_tipo,
            sello,
          },
          {
            fields: ["id_data", "deposito_contenedores", "cont_tipo", "sello"],
          }
        );
      }

      const payload = {
        id: getEmbarque.id,
        tipo_operacion: getEmbarque.tipo_operacion,
        n_operacion: getEmbarque.n_operacion,
        medio_transporte: getEmbarque.medio_transporte,
        referencia: getEmbarque.referencia,
        etd: getEmbarque.etd,
        eta: getEmbarque.eta,
        estado: getEmbarque.estado,

        //dataEmbarque
        intercom: getDataEmbarque.intercom,
        exportador: getDataEmbarque.exportador,
        importador: getDataEmbarque.importador,
        embarcador: getDataEmbarque.embarcador, //operador logistico
        agencia_aduana: getDataEmbarque.agencia_aduana,
        motonave: getDataEmbarque.motonave,
        puertoembarque: getDataEmbarque.puertoembarque,
        puertodestino: getDataEmbarque.puertodestino,
        lugardestino: getDataEmbarque.lugardestino,
        naviera: getDataEmbarque.naviera,
        viaje: getDataEmbarque.viaje,
        valor_cif: getDataEmbarque.valor_cif,

        tipo_documento: getDataEmbarque.tipo_documento,
        documento: getDataEmbarque.documento,
        reserva: getDataEmbarque.reserva,

        // //arreglo de trasbordos
        trasbordos: trasbordos,
        // //arreglo de mercancias
        mercancias: mercancias,
      };

      res.json({
        message: "Embarque actualizado correctamente",
        payload,
      });
    } else {
      res.json({
        respuesta: false,
        message: "no se pudo encontrar dicho embarque",
      });
    }
  } catch (error) {
    res.status(350).json(error);
  }
}

export async function getEstado(req, res) {
  const allActivos = await embarques.findAll({
    where: {
      estado: "Origen",
    },
  });
  const allAbordos = await embarques.findAll({
    where: {
      estado: "Abordo",
    },
  });
  const allLlegadas = await embarques.findAll({
    where: {
      estado: "Llegada",
    },
  });
  const allFinalizados = await embarques.findAll({
    where: {
      estado: "Finalizado",
    },
  });
  var FinalizadosId = [];
  var OrigenId = [];
  allFinalizados.forEach(({ id }) => FinalizadosId.push(id));
  allActivos.forEach(({ id }) => OrigenId.push(id));
  const allFin = await dataembarque.findAll({
    where: {
      id_embarque: FinalizadosId,
    },
  });

  const allOrigen = await dataembarque.findAll({
    where: {
      id_embarque: OrigenId,
    },
  });

  var ValorId = [];
  allFin.forEach(({ id }) => ValorId.push(id));

  const allValue = await valordata.findAll({
    where: {
      id_data: ValorId,
    },
  });

  const monthCount = new Array(12).fill(0);
  const typeValue = new Array(3).fill(0);
  const dayCount = new Array(31).fill(0);
  allFin.forEach(
    ({ fecha_inicio }) => (monthCount[new Date(fecha_inicio).getMonth()] += 1)
  );
  allValue.forEach((Value) => {
    typeValue[0] += Value.valor_usd;
    typeValue[1] += Value.flete_usd;
    typeValue[2] += Value.seguro_usd;
  });
  allOrigen.forEach(({ fecha_inicio }) => {
    var today = new Date();
    if (today.getMonth() == new Date(fecha_inicio).getMonth()) {
      dayCount[new Date(fecha_inicio).getDay()] += 1;
    }
  });

  const Estado = {
    Activos: allActivos.length,
    Abordos: allAbordos.length,
    Llegadas: allLlegadas.length,
    Finalizados: allFinalizados.length,
    anualGraph: monthCount,
    monthGraph: dayCount,
    valueGraph: typeValue,
  };

  res.json({ resultado: true, data: Estado });
}
export async function getActivos(req, res) {
  const allActivos = await embarques.findAll({
    attributes: [
      "id",
      "n_operacion",
      "estado",
      "referencia",
      "etd",
      "eta",
      "medio_transporte",
    ],
    order: [["id", "DESC"]],
    where: {
      estado: "Origen",
    },
  });
  res.json(allActivos.length);
}

export async function getFinalizados(req, res) {
  const allFinalizados = await embarques.findAll({
    attributes: [
      "id",

      "n_operacion",

      "estado",
      "referencia",
      "etd",
      "eta",
      "medio_transporte",
    ],
    order: [["id", "DESC"]],
    where: {
      estado: "Finalizado",
    },
  });
  res.json(allFinalizados.length);
}
