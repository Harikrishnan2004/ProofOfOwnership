pragma solidity ^0.8.0;
// SPDX-License-Identifier: UNLICENSED

import "./ProofOfOwnership.sol";

contract ProofOfOwnershipFactory {
    struct OwnershipDetails {
        address owner; 
        address contractAddress; 
    }

    OwnershipDetails[] public ownershipRecords; 
    mapping(address => address[]) public ownerContracts; 

    function deployProofOfOwnership(
        string memory _title,
        string memory _creatorName,
        string memory _description,
        string memory _IPFSHash,
        string memory _IPFSLink,
        string memory _category,
        string memory _email,
        string memory _fileFormat
    ) public{
        ProofOfOwnership newContract = new ProofOfOwnership(msg.sender);

        newContract.setDetails(
            msg.sender,
            _title,
            _creatorName,
            _description,
            _IPFSHash,
            _IPFSLink,
            _category,
            _email,
            _fileFormat
        );

        ownershipRecords.push(OwnershipDetails({
            owner: msg.sender,
            contractAddress: address(newContract)
        }));
        ownerContracts[msg.sender].push(address(newContract));
    }

    function getContractsByOwner(address owner) public view returns (address[] memory) {
        return ownerContracts[owner];
    }

    function getTotalDeployedContracts() public view returns (uint256) {
        return ownershipRecords.length;
    }

    function destroyContract(address contractAddress) public {
        ProofOfOwnership targetContract = ProofOfOwnership(contractAddress);

        require(targetContract.owner() == msg.sender, "You are not the owner of this contract");

        targetContract.deactivate(msg.sender);

        for (uint i = 0; i < ownershipRecords.length; i++) {
            if (ownershipRecords[i].contractAddress == contractAddress) {
                ownershipRecords[i] = ownershipRecords[ownershipRecords.length - 1];
                ownershipRecords.pop();
                break;
            }
        }

        address[] storage contracts = ownerContracts[msg.sender];
        for (uint i = 0; i < contracts.length; i++) {
            if (contracts[i] == contractAddress) {
                contracts[i] = contracts[contracts.length - 1];
                contracts.pop();
                break;
            }
        }
    }
}
