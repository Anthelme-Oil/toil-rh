export const uploadClientService = {
  async uploadFile(file: File, folder: string = 'actualites'): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await fetch('/api/saver', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Impossible d’effectuer le téléversement.');
    }

    return data.url;
  },
};