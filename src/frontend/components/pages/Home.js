import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Row, Col, Button, Card } from "react-bootstrap";
import Loader from "../atoms/Loader";

function Home({ marketplace, nft }) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState(null);

  useEffect(() => {
    laodMarketplaceItems();
  }, []);

  const laodMarketplaceItems = async () => {
    // Load items count from the bloackchain
    const count = await marketplace._itemCount();
    console.log("this is the count ", count.toString());
    // Init items array
    let items = [];
    // Iterate and store items in the array
    for (var i = 0; i < count.toString(); i++) {
      // Get item from the blockchain
      let item = await marketplace._items(1);
      if (!item._isSold) {
        // Get URI url from NFT contract
        const uri = await nft.tokenURI(item?._tokenId);
        // Use URI to fetch NFT metadata from IPFS
        const response = await fetch(uri);
        const metadata = await response.json();
        // Get item total price from the blockchain
        const totalprice = await marketplace.getPrice(item._itemId);
        // Store item in object
        const { _itemId, _seller } = item;
        const _item = {
          totalprice,
          itemId: _itemId,
          sellet: _seller,
          name: metadata.name,
          description: metadata.description,
          image: metadata.image,
        };
        // Push _item to items array
        items.push(_item);
      }
    }
    setItems(items);
    setLoading(false);
  };

  const buyItem = async (id, totalprice) => {
    id = id.toString();
    totalprice = totalprice.toString();
    await (await marketplace.purchaseItem(id, { value: totalprice })).wait();
    laodMarketplaceItems();
  };

  if (loading) {
    return <Loader text="Loading NFT's..." />;
  }

  return (
    <div className="flex justify-center">
      {items && items.length > 0 ? (
        <div className="px-5 container">
          <Row xs={1} md={2} lg={4} className="g-4 py-5">
            {items.map((item, idx) => (
              <Col key={idx} className="overflow-hidden">
                <Card>
                  <Card.Img variant="top" src={item.image} />
                  <Card.Body color="secondary">
                    <Card.Title>{item?.name ?? "--"}</Card.Title>
                    <Card.Text>{item?.description ?? "--"}</Card.Text>
                  </Card.Body>
                  <Card.Footer>
                    <div className="d-grid">
                      <Button
                        onClick={() => buyItem(item?.itemId, item?.totalprice)}
                        variant="primary"
                        size="lg"
                      >
                        {/* Buy for {ethers.utils.formatEther(item.totalPrice)} ETH */}
                        Buy for ETH
                      </Button>
                    </div>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ) : (
        <main style={{ padding: "1rem 0" }}>
          <h2>No listed assets</h2>
        </main>
      )}
    </div>
  );
}

export default Home;
