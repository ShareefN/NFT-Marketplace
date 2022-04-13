import React, { useState } from "react";
import { ethers } from "ethers";
import { create as ipfsHttpClient } from "ipfs-http-client";
import { Form, Row, Button } from "react-bootstrap";
import { uploadToIPFS } from "../helpers/IPFSUpload";
import { createNFT } from "../helpers/CreateNFT";
import { ListNFT } from "../helpers/ListNFT";

const client = ipfsHttpClient(process.env.REACT_APP_IPFS_CLIENT);

function Create({ marketplace, nft }) {
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState({
    image: "",
    price: null,
    description: "",
    name: "",
  });

  const onUploadChange = async (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    const result = await uploadToIPFS(client, file);
    setItem({ ...item, image: result.path });
  };

  const onCreatePress = async () => {
    const { image, name, description, price } = item;
    console.log({image, name, description, price});
    if (!image || !name || !description || !price) return;
    const result = await createNFT(client, image, name, description);
    await ListNFT(nft, marketplace, result.path, price);
    setItem({ image: "", price: null, description: "", name: "" });
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
                onChange={onUploadChange}
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
                <Button onClick={onCreatePress} variant="primary" size="lg">
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
