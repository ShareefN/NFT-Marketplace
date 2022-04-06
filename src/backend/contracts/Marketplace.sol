// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Marketplace is ReentrancyGuard {
    // the account that receives fees
    address payable public immutable _feeAccount;
    // the fee percentage on sales
    uint256 public immutable _feePercent;
    uint256 public _itemCount;

    struct Item {
        uint256 _itemId;
        IERC721 _nft;
        uint256 _tokenId;
        uint256 _price;
        address payable _seller;
        bool _isSold;
    }

    event Offered(
        uint256 itemId,
        address indexed nft,
        uint256 tokenId,
        uint256 price,
        address indexed seller
    );

    event Purchase(
        uint256 itemId,
        address indexed buyer,
        address indexed seller,
        uint256 price,
        uint256 indexed itemToken
    );

    mapping(uint256 => Item) public _items;

    constructor(uint256 _percent) {
        _feeAccount = payable(msg.sender);
        _feePercent = _percent;
    }

    function makeItem(
        IERC721 nft,
        uint256 tokenId,
        uint256 price
    ) external nonReentrant {
        require(price > 0, "Price must be greater than zero.");
        // Increment item count;
        _itemCount++;
        // Transfer NFT
        nft.transferFrom(msg.sender, address(this), tokenId);
        // Create new item and save to items struct
        _items[_itemCount] = Item(
            _itemCount,
            nft,
            tokenId,
            price,
            payable(msg.sender),
            false
        );
        // Emit event when item created
        emit Offered(_itemCount, address(nft), tokenId, price, msg.sender);
    }

    function purchaseItem(uint256 _itemId) external payable nonReentrant {
        uint256 _totalPrice = getPrice(_itemId);
        Item storage item = _items[_itemId];
        require(_itemId > 0 && _itemId <= _itemCount, "Item not found");
        require(msg.value == _totalPrice, "Not enough Eth to purchase item");
        require(!item._isSold, "Item already sold");
        // Pay seller and feeAccount
        item._seller.transfer(item._price);
        // Update item to sold
        item._isSold = true;
        // transfer NFT to buyer
        item._nft.transferFrom(address(this), msg.sender, item._tokenId);
        // Emit purchase event
        emit Purchase(
            _itemId,
            msg.sender,
            item._seller,
            _totalPrice,
            item._tokenId
        );
    }

    // Get price of item with market fees
    function getPrice(uint256 itemId) public view returns (uint256) {
        return ((_items[itemId]._price * (100 * _feePercent)) / 100);
    }
}
