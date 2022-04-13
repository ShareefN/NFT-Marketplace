import React, { useState } from "react";
import { ethers } from "ethers";
import { Button, Row, Form } from "react-bootstrap";

function Mint({ nft, marketplace }) {
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState({
    count: 1,
  });

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
                onChange={(e) => handleInputChange(e)}
                size="lg"
                required
                name="count"
                type="number"
                placeholder="Collection Count"
                max="12"
              />
              <div className="d-grid px-0">
                <Button variant="primary" size="lg">
                  Generate Random Collection
                </Button>
              </div>
            </Row>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Mint;
