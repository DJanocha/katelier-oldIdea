import { Request, Response } from 'express';
// import mongoose from 'mongoose';
import Achievement from '../models/achievement';

// const catchAsync = () => {}

const getAll = async (req: Request, res: Response) => {
  try {
    const achievements = await Achievement.find();
    return res
      .status(500)
      .json({ role: 'get all items', ready: false, achievements });
  } catch (error) {
    return res.status(400).json({ ok: false, message: 'something went wrong' });
  }
};

const createOne = async (req: Request, res: Response) => {
  console.log({ body: req.body });
  const result = await Achievement.create({ ...req.body });

  console.log({ result });
  res.status(500).json({ role: 'create single item', ready: false });
  // res.status(500).json({result});
};

const getOne = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const one = await Achievement.findById(id);
    res.status(500).json({ role: 'get single item', ready: false, id, one });
  } catch (error) {
    return res
      .status(400)
      .json({ ok: false, message: 'achievement not found' });
  }
};

const updateOne = (req: Request, res: Response) => {
  const { params, body } = req;
  const id = Number(params.id);

  res
    .status(500)
    .json({ role: 'update single item', ready: false, id, ...body });
};

const deleteOne = (req: Request, res: Response) => {
  const { params } = req;
  const id = Number(params.id);

  res.status(500).json({ role: 'delete single item', ready: false, id });
};

export { getAll, createOne, getOne, updateOne, deleteOne };
