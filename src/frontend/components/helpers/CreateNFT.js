export const createNFT = async (client, image, name, description) => {
  if (!client || !image || !name || !description) return;
  try {
    const result = await client.add(
      JSON.stringify({ name, image, description })
    );
    return result;
  } catch (err) {
    console.log(`Error creating NFT: ${err}`);
  }
};
