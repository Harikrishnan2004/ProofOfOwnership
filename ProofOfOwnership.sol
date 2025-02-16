pragma solidity ^0.8.0;
// SPDX-License-Identifier: UNLICENSED

import {PriceConvertor} from "./PriceConvertor.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ProofOfOwnership is ERC721 {

    uint256 private _tokenIds; // Counter for NFT token IDs

    string public title;
    string public creatorName;
    string public description;
    string public IPFSHash;
    string public IPFSLink;
    string public category;
    string public email;
    string public fileFormat;
    bool public isActive;
    address public owner;

    struct CopyrightInfo {
        uint256 price; 
        uint256 buyersCount; 
        uint256 duration; 
        bool isAvailable; 
    }

    struct NFTMetadata {
        uint256 duration;
        uint256 purchaseTimestamp;
        uint256 expiryTimestamp;
        address buyer;
        string contractTitle;
        address contractAddress;
        string durationString;
    }

    mapping(uint256 => CopyrightInfo) public copyrightOptions;
    mapping(uint256 => NFTMetadata) public nftMetadata; // Token ID => Metadata
    mapping(address => uint256[]) public buyerTokenIDs; // Buyer address => Array of Token IDs

    using PriceConvertor for uint256;

    constructor(address _owner) ERC721("ProofOfOwnershipNFT", "POONFT") {
        owner = _owner; 
        _tokenIds = 0; // Initialize tokenId counter
    }

    modifier onlyActive(){
        require(isActive == true, "Contract is not active");
        _;
    }

    modifier onlyOwner(address caller) {
        require(caller == owner, "Caller is not the owner");
        _;
    }

    function setDetails(
        address _caller,
        string memory _title,
        string memory _creatorName,
        string memory _description,
        string memory _IPFSHash,
        string memory _IPFSLink,
        string memory _category,
        string memory _email,
        string memory _fileFormat
    ) public onlyOwner(_caller) {
        title = _title;
        creatorName = _creatorName;
        description = _description;
        IPFSHash = _IPFSHash;
        IPFSLink = _IPFSLink;
        category = _category;
        email = _email;
        fileFormat = _fileFormat;
        isActive = true;
    }

    function setCopyrightOption(
        address _caller,
        uint256 duration,
        uint256 price,
        bool isAvailable
    ) public onlyOwner(_caller) onlyActive{
        copyrightOptions[duration] = CopyrightInfo({
            price: price,
            buyersCount: 0,
            duration: duration,
            isAvailable: isAvailable
        });
    }

    function purchaseRights(uint256 duration) public payable onlyActive{
        CopyrightInfo storage option = copyrightOptions[duration];

        require(option.isAvailable, "Rights not available for this duration");
        require(msg.value.getConversionRate() >= option.price, "Insufficient funds sent");

        option.buyersCount += 1;

        // Mint an NFT for the buyer
        uint256 tokenId = _mintNFT(msg.sender);

        buyerTokenIDs[msg.sender].push(tokenId);

        uint256 purchaseTimestamp = block.timestamp;
        uint256 expiryTimestamp = block.timestamp + (duration * 30 days);

        nftMetadata[tokenId] = NFTMetadata({
            duration: duration,
            purchaseTimestamp: purchaseTimestamp,
            expiryTimestamp: expiryTimestamp,
            buyer: msg.sender,
            contractTitle: title,
            contractAddress: address(this),
            durationString: string(abi.encodePacked(duration, " months"))
        });
    }

    function _mintNFT(address to) private returns (uint256) {
        _tokenIds++; // Increment tokenId manually
        uint256 newTokenId = _tokenIds; // Use the new tokenId
        _safeMint(to, newTokenId); 
        return newTokenId;
    }

    function getNFTMetadata(uint256 tokenId) public view returns (uint256, uint256, uint256, address, string memory, address, string memory) {
        NFTMetadata memory metadata = nftMetadata[tokenId];
        return (
            metadata.duration,
            metadata.purchaseTimestamp,
            metadata.expiryTimestamp,
            metadata.buyer,
            metadata.contractTitle,
            metadata.contractAddress,
            metadata.durationString
        );
    }

    function withdrawFunds(address _caller) public onlyOwner(_caller) {
        payable(owner).transfer(address(this).balance);
    }

    function checkTokenValidity(uint256 tokenId) public view returns (string memory) {
        NFTMetadata memory metadata = nftMetadata[tokenId];
         
        if (block.timestamp > metadata.expiryTimestamp) {
            return "Invalid"; 
        } else {
            return "Valid"; 
        }
    }

    function deactivate(address _caller) public onlyOwner(_caller) onlyActive(){
        isActive = false;
    }
}
