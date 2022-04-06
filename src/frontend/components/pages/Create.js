import React, { useState } from "react";
import { ethers } from "ethers";
import { create as ipfsHttpClient } from "ipfs-http-client";
import { Form, Row, Button } from "react-bootstrap";

const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

function Create({ marketplace, nft }) {
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState({
    image: "",
    price: null,
    description: "",
    name: "",
  });

  const uploadToIPFS = async (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    if (typeof file !== "undefined") {
      try {
        const result = await client.add(file);
        console.log(result);
        setItem({
          ...item,
          image: `https://ipfs.infura.io/ipfs/${result.path}`,
        });
      } catch (err) {
        console.log(`Error uploading to IPFS: ${err}`);
      }
    }
  };

  const createNFT = async () => {
    const { image, name, description, price } = item;
    if (!image || !name || !description || !price) return;
    try {
      const result = await client.add(
        JSON.stringify({ name, image, description })
      );
      mintThenList(result);
    } catch (err) {
      console.log(`Error creating NFT: ${err}`);
    }
  };

  const mintThenList = async (result) => {
    const { price } = item;
    const url = `https://ipfs.infura.io/ipfs/${result.path}`;
    // mint NFT
    await (await nft.mint(url)).wait();
    // Get token of new NFT
    const id = await nft._tokenCount();
    // Approve marketplace to sell NFT
    await (await nft.setApprovalForAll(marketplace.address, true)).wait();
    // Add NFT to marketplace
    const listingPrice = await ethers.utils.parseEther(price.toString());

    await (await marketplace.makeItem(nft.address, id, listingPrice)).wait();
  };

  const handleInputChange = (e) => {
    setItem({ ...item, [e.target.name]: e.target.value });
  };

  return (
    <div className="container-fluid mt-5">
      <div className="row">
        <main
          role="main"
          className="col-lg-12 mx-auto"
          style={{ maxWidth: "1000px" }}
        >
          <div className="content mx-auto">
            <Row className="g-4">
              <Form.Control
                type="file"
                required
                name="file"
                onChange={uploadToIPFS}
              />
              <Form.Control
                onChange={(e) => handleInputChange(e)}
                size="lg"
                required
                name="name"
                type="text"
                placeholder="Name"
              />
              <Form.Control
                onChange={(e) => handleInputChange(e)}
                size="lg"
                required
                name="description"
                as="textarea"
                placeholder="Description"
              />
              <Form.Control
                onChange={(e) => handleInputChange(e)}
                size="lg"
                required
                name="price"
                type="number"
                placeholder="Price in ETH"
              />
              <div className="d-grid px-0">
                <Button onClick={createNFT} variant="primary" size="lg">
                  Create & List NFT!
                </Button>
              </div>
            </Row>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Create;
