import { Request, Response } from "express";
import admin from "firebase-admin";

const db = admin.firestore();
const collection = db.collection("navigation");

export const getNavigation = async (req: Request, res: Response) => {
  try {
    const snapshot = await collection.orderBy("order", "asc").get();
    const navItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(navItems);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createNavigation = async (req: Request, res: Response) => {
  try {
    const docRef = await collection.add({
      ...req.body,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.status(201).json({ id: docRef.id, ...req.body });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateNavigation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await collection.doc(id).update({
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.json({ id, ...req.body });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteNavigation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await collection.doc(id).delete();
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
