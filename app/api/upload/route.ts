import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'Aucun fichier fourni' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sécurisation et nettoyage du nom du fichier
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const originalName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filename = `${uniqueSuffix}-${originalName}`;
    
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');

    // Crée le dossier d'upload s'il n'existe pas encore
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);

    // Renvoie l'URL publique pour l'enregistrer en base de données
    const fileUrl = `/uploads/${filename}`;

    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error('[API Upload] Erreur lors de l\'enregistrement:', error);
    return NextResponse.json({ success: false, error: 'Erreur interne du serveur lors de l\'upload' }, { status: 500 });
  }
}