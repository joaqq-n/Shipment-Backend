import sequelize from "sequelize";
import misionero from "../models/mision";

export async function createMissions(req, res) {
  const { contenido } = req.body;
  try {
    let newMision = await misionero.create(
      {
        contenido,
        creado: sequelize.literal("CURRENT_TIMESTAMP"),
        estado: "Activo",
      },
      {
        fields: ["contenido", "creado", "estado"],
      }
    );
    if (newMision) {
      return res.json({
        resultado: true,
        newMision,
      });
    } else {
      console.log(error);
      res.status(500).json({
        resultado: false,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      resultado: false,
    });
  }
}

export async function getAllMissions(req, res) {
  const allMisiones = await misionero.findAll({
    attributes: ["id", "contenido", "creado", "estado"],
    order: [["id", "DESC"]],
    attributes: ["id", "contenido", "estado"],
  });

  res.json(allMisiones);
}

export async function getMision(req, res) {
  const { id } = req.params;
  try {
    const mision = await misionero.findOne({
      where: {
        id,
      },
      attributes: ["id", "contenido", "estado"],
    });
    res.json({ resultado: true, mision });
  } catch (error) {
    console.log({ resultado: false, error });
  }
}

export async function getActiveMissions(req, res) {
  try {
    const activas = await misionero.findAll({
      where: {
        estado: "Activo",
      },
      attributes: ["id", "contenido", "estado"],
      order: [["id", "DESC"]],
    });
    res.json({ resultado: true, activas });
  } catch (error) {
    console.log({ resultado: false, error });
  }
}

export async function getFinalizedMissions(req, res) {
  try {
    const finalizadas = await misionero.findAll({
      where: {
        estado: "Finalizado",
      },
      attributes: ["id", "contenido", "estado"],
      order: [["id", "DESC"]],
    });
    res.json({ resultado: true, finalizadas });
  } catch (error) {
    console.log({ resultado: false, error });
  }
}

export async function deleteMision(req, res) {
  const { id } = req.body;

  try {
    const deletemisionera = await misionero.destroy({
      where: {
        id,
      },
    });
    res.json({
      resultado: true,
      message: "Mision eliminada correctamente",
    });
  } catch (error) {
    console.log(error);
  }
}

export async function updateMision(req, res) {
  const { id } = req.params;
  const { contenido, estado } = req.body;

  const misionUpdate = await misionero.update(
    {
      contenido,
      estado,
    },
    {
      where: { id },
    }
  );
  res.json({
    resultado: true,
    message: "Mision update Succesfully! (: ",
  });
}
