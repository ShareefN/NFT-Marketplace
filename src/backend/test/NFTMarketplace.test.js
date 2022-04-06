const { expect } = require("chai");
const { ethers } = require("hardhat");

const toWei = (num) => ethers.utils.parseEther(num.toString());

describe("NFTMarketPlace", () => {
  let deployer, addr1, addr2, nft, marketplace;
  let feePercent = 1;
  let URI = "Sample URI";

  beforeEach(async () => {
    // Get the contract factories
    const NFT = await ethers.getContractFactory("NFT");
    const Marketplace = await ethers.getContractFactory("Marketplace");

    // Get signers
    [deployer, addr1, addr2] = await ethers.getSigners();

    // deploy contracts
    nft = await NFT.deploy();
    marketplace = await Marketplace.deploy(feePercent);
  });

  describe("Deployment", () => {
    it("Should track name and sybmol of NFT collection", async () => {
      expect(await nft.name()).to.equals("NFT");
      expect(await nft.symbol()).to.equals("NFT_SN");
    });

    it("Should track Fee Account and Fee Percent from market place", async () => {
      expect(await marketplace._feeAccount()).to.equals(deployer.address);
      expect(await marketplace._feePercent()).to.equals(feePercent);
    });
  });

  describe("Mint NFT", () => {
    it("Should track minted NFT", async () => {
      // Address 1 mints an NFT
      await nft.connect(addr1).mint(URI);
      expect(await nft._tokenCount()).to.equal(1);
      expect(await nft.balanceOf(addr1.address)).to.equal(1);
      expect(await nft.tokenURI(await nft._tokenCount())).to.equal(URI);
      // Address 2 mints an NFT
      await nft.connect(addr2).mint(URI);
      expect(await nft._tokenCount()).to.equal(2);
      expect(await nft.balanceOf(addr2.address)).to.equal(1);
      expect(await nft.tokenURI(await nft._tokenCount())).to.equal(URI);
    });
  });

  describe("Making market place items", async () => {
    beforeEach(async () => {
      // addr1 mints an NFT
      await nft.connect(addr1).mint(URI);
      // addr1 approves marketplace to spend NFT
      await nft.connect(addr1).setApprovalForAll(marketplace.address, true);
    });

    it("Should track newly created item, transfer NFT from seller to marketplace and emit event", async () => {
      await expect(
        marketplace.connect(addr1).makeItem(nft.address, 1, toWei(1))
      )
        .to.emit(marketplace, "Offered")
        .withArgs(1, nft.address, 1, toWei(1), addr1.address);

      // Marketplace should be the owner of the NFT
      expect(await nft.ownerOf(1)).to.equal(marketplace.address);
      // Item count should be 1
      expect(await marketplace._itemCount()).to.equal(1);
      // Validate NFT data is correct
      const item = await marketplace._items(1);
      expect(item._itemId).to.equal(1);
      expect(item._nft).to.equal(nft.address);
      expect(item._tokenId).to.equal(1);
      expect(item._price).to.equal(toWei(1));
      expect(item._seller).to.equal(addr1.address);
      expect(item._isSold).to.equal(false);
    });

    it("Should fail if price is set to zero", async () => {
      await expect(
        marketplace.connect(addr1).makeItem(nft.address, 1, 0)
      ).to.be.revertedWith("Price must be greater than zero.");
    });
  });

  describe("Purchasing item from marketplace", async () => {
    let price = 2;
    beforeEach(async () => {
      // addr1 mints an NFT
      await nft.connect(addr1).mint(URI);
      // addr1 approves marketplace to spend NFT
      await nft.connect(addr1).setApprovalForAll(marketplace.address, true);
      // addr1 mints an NFT on the marketpalce
      await marketplace.connect(addr1).makeItem(nft.address, 1, toWei(2));
    });

    it("Should update item as sold, transfer NFT to buyer, charge fees and emit event", async () => {
      // Get items total price + fees
      const _totalPrice = await marketplace.getPrice(1);
      // addr2 Purchase item
      await expect(
        marketplace.connect(addr2).purchaseItem(1, { value: _totalPrice })
      )
        .to.emit(marketplace, "Purchase")
        .withArgs(1, addr2.address, addr1.address, toWei(price), 1);
      // Check the new owner of the NFT
      expect(await nft.ownerOf(1)).to.equal(addr2.address);
      // Check if item flag is set to isSold = true
      expect((await marketplace._items(1))._isSold).to.equal(true);
    });

    it("Should fail if price is less than listed price", async () => {
      await expect(
        marketplace.connect(addr2).purchaseItem(1, { value: toWei(1) })
      ).to.be.revertedWith("Not enough Eth to purchase item");
    });
  });
});
