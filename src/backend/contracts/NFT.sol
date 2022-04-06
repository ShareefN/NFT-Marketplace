// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract NFT is ERC721URIStorage {
    uint256 public _tokenCount;

    constructor() ERC721("NFT", "NFT_SN") {}

    function mint(string memory _tokenURI) external returns (uint256) {
        _tokenCount++;
        _safeMint(msg.sender, _tokenCount);
        _setTokenURI(_tokenCount, _tokenURI);
        return (_tokenCount);
    }
}
