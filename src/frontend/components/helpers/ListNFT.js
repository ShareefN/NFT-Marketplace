import { ethers } from "ethers";

export const ListNFT = async (nft, marketplace, path, price) => {
  const url = `${process.env.REACT_APP_IPFS_URL}${path}`;
  // Mint NFT
  await (await nft.mint(url)).wait();
  // Get NFT token Id
  const id = await nft._tokenCount();
  // Approve marketplace to sell NFT
  await (await nft.setApprovalForAll(marketplace.address, true)).wait();
  // Add NFT to marketplace
  const listingPrice = await ethers.utils.parseEther(price.toString());

  await (await marketplace.makeItem(nft.address, id, listingPrice)).wait();
};
