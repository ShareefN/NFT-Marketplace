export const uploadToIPFS = async (client, file) => {
  if (typeof file === "undefined") return;
  try {
    const reuslt = await client.add(file);
    return reuslt;
  } catch (err) {
    console.log(`Error uploading to IPFS: ${err}`);
  }
};
