'use client';
import { useState, useEffect } from 'react';
import { getContract, prepareContractCall, readContract, sendTransaction } from 'thirdweb';
import { useActiveAccount } from 'thirdweb/react';
import { TransactionButton } from 'thirdweb/react';
import { sepolia } from 'thirdweb/chains';
import { client } from '../../client';
import { PROOFOFOWNERSHIPFACTORY } from '../../constants/contracts';
import { PinataSDK } from 'pinata-web3';

// Initialize Pinata SDK with your JWT
const pinata = new PinataSDK({
  pinataJwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJhN2Q4ZTI4Zi03OWE1LTQ4YzctYWZhMS0wOWMyOTk1NjA0YWUiLCJlbWFpbCI6ImhhcmlqYXNoMzFAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjgzYjhmYzRlYjdiMmRjMWI5YTBmIiwic2NvcGVkS2V5U2VjcmV0IjoiYjU3NWQ2YjU4ZTNjOWY4ZTdhODNhNzNiZjYwNzViMzMzYzJjNWY5MmY2NDMyNTEyMGQzMDZlNWI5YmJmYWFhZSIsImV4cCI6MTc2ODY1NTQ5N30.ddbQAKDdNuTDJczQJUeRQstewbFSSYGQBi2vhx0yiYU',  // Replace with your actual JWT
  pinataGateway: 'https://gateway.pinata.cloud',
});

export default function Dashboard() {
  const [formData, setFormData] = useState({
    title: '',
    creatorName: '',
    description: '',
    category: '',
    email: '',
    fileFormat: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [ipfsData, setIpfsData] = useState({ hash: '', link: '' });
  const [uploading, setUploading] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [deployedContracts, setDeployedContracts] = useState([]);
  const [contractTitles, setContractTitles] = useState([]);
  const [showCopyrightForm, setShowCopyrightForm] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [copyrightData, setCopyrightData] = useState({ duration: '', price: '', isAvailable: true });
  const account = useActiveAccount();

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle file input
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // Upload file to IPFS
  const uploadToIPFS = async () => {
    if (!selectedFile) {
      alert('Please select a file to upload.');
      return;
    }

    setUploading(true);
    try {
      const uploadResponse = await pinata.upload.file(selectedFile);
      const ipfsHash = uploadResponse.IpfsHash;
      const ipfsLink = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      setIpfsData({ hash: ipfsHash, link: ipfsLink });
      setUploading(false);
      alert('File uploaded successfully to IPFS.');
    } catch (error) {
      console.error('IPFS upload failed:', error);
      setUploading(false);
      alert('Failed to upload the file to IPFS.');
    }
  };

  // Prepare the contract deployment
  const prepareDeployment = async () => {
    const contract = getContract({
      client,
      chain: sepolia,
      address: PROOFOFOWNERSHIPFACTORY,
    });

    return prepareContractCall({
      contract,
      method: 'function deployProofOfOwnership(string,string,string,string,string,string,string,string) external',
      params: [
        formData.title,
        formData.creatorName,
        formData.description,
        ipfsData.hash,
        ipfsData.link,
        formData.category,
        formData.email,
        formData.fileFormat,
      ],
    });
  };

  // Fetch deployed contracts and their titles
  const fetchDeployedContracts = async () => {
    const contract = getContract({
      client,
      chain: sepolia,
      address: PROOFOFOWNERSHIPFACTORY,
    });

    // Get the list of deployed contracts by owner
    const data = await readContract({
      contract,
      method: 'function getContractsByOwner(address owner) view returns (address[])',
      params: [account?.address],
    });

    // Fetch titles for each deployed contract
    const titles = await Promise.all(
      data.map(async (contractAddress) => {
        const contractInstance = getContract({
          client,
          chain: sepolia,
          address: contractAddress,
        });

        const title = await readContract({
          contract: contractInstance,
          method: 'function title() view returns (string)',
          params: [],
        });

        return title;
      })
    );

    setDeployedContracts(data);
    setContractTitles(titles);
  };

  // Fetch deployed contracts on mount and when account changes
  useEffect(() => {
    if (account?.address) {
      fetchDeployedContracts();
    }
  }, [account?.address]);

  // Function to handle adding purchase rights
  const addPurchaseRights = async (contractAddress) => {
    setSelectedContract(contractAddress);
    setShowCopyrightForm(true);
  };

  // Function to handle going back from the copyright form
  const handleBack = () => {
    setShowCopyrightForm(false);
    setSelectedContract(null);
  };

  // Handle submitting the add purchase rights form
  const handleCopyrightFormSubmit = async (e) => {
    e.preventDefault();
    const { duration, price, isAvailable } = copyrightData;

    if (!account?.address) {
      alert("You must be the owner to add purchase rights.");
      return;
    }

    const contract = getContract({
      client,
      chain: sepolia,
      address: selectedContract,
    });

    try {
      const transaction = await prepareContractCall({
        contract,
        method: 'function setCopyrightOption(address _caller, uint256 duration, uint256 price, bool isAvailable)',
        params: [account.address, duration, price, isAvailable],
      });

      const { transactionHash } = await sendTransaction({
        transaction,
        account,
      });

      alert(`Purchase rights added! Transaction hash: ${transactionHash}`);
      setShowCopyrightForm(false); // Close the form after successful transaction
    } catch (error) {
      console.error('Error adding purchase rights:', error);
      alert('Failed to add purchase rights.');
    }
  };

  // Handle input change in copyright form
  const handleCopyrightInputChange = (e) => {
    const { name, value } = e.target;
    setCopyrightData({ ...copyrightData, [name]: value });
  };

  return (
    <main className="p-8 pb-12 min-h-[100vh] flex flex-col container mx-auto bg-gradient-to-br from-gray-50 to-gray-200">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">Deploy Proof of Ownership Contract</h1>

      <form className="space-y-4">
        {/* Render form inputs dynamically */}
        {Object.keys(formData).map((key) => (
          <div key={key} className="flex flex-col">
            <label htmlFor={key} className="text-gray-700 font-medium mb-1">
              {key.charAt(0).toUpperCase() + key.slice(1)}:
            </label>
            <input
              type="text"
              id={key}
              name={key}
              value={formData[key]}
              onChange={handleInputChange}
              className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-500"
              placeholder={`Enter ${key}`}
              required
            />
          </div>
        ))}

        {/* File upload section */}
        <div className="flex flex-col">
          <label htmlFor="file" className="text-gray-700 font-medium mb-1">File:</label>
          <input
            type="file"
            id="file"
            onChange={handleFileChange}
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="button"
          onClick={uploadToIPFS}
          disabled={uploading}
          className={`mt-4 px-4 py-2 rounded-md ${uploading ? 'bg-gray-400' : 'bg-blue-600 text-white'} hover:bg-blue-700 transition-all duration-300`}
        >
          {uploading ? 'Uploading...' : 'Upload to IPFS'}
        </button>
      </form>

      {/* Display IPFS link */}
      {ipfsData.link && (
        <p className="mt-4 text-green-700">
          File uploaded: <a href={ipfsData.link} target="_blank" rel="noopener noreferrer">{ipfsData.link}</a>
        </p>
      )}

      {/* Deploy contract button */}
      <TransactionButton
        transaction={prepareDeployment}
        onError={(error) => alert(`Deployment failed: ${error.message}`)}
        onTransactionConfirmed={() => {
          alert('Contract deployed successfully!');
          fetchDeployedContracts();  // Refresh the deployed contracts list after successful deployment
        }}
        disabled={!ipfsData.hash || deploying}
        className={`mt-8 px-6 py-3 rounded-md ${deploying ? 'bg-gray-400' : 'bg-green-600 text-white'} hover:bg-green-700 transition-all duration-300`}
      >
        {deploying ? 'Deploying...' : 'Deploy Contract'}
      </TransactionButton>

      {/* Display deployed contracts */}
      <div className="mt-8">
        <h2 className="text-2xl font-medium text-gray-800">Deployed Contracts</h2>
        {deployedContracts.length > 0 ? (
          deployedContracts.map((contractAddress, index) => (
            <div key={contractAddress} className="bg-white p-4 rounded-lg shadow-md mt-4">
              <h3 className="text-xl font-medium">{contractTitles[index] || `Contract #${index + 1}`}</h3>
              <button
                onClick={() => addPurchaseRights(contractAddress)}
                className="mt-4 text-blue-600 hover:underline"
              >
                Add Copyright
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-600">No contracts deployed yet.</p>
        )}
      </div>

      {/* Copyright form modal */}
      {showCopyrightForm && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-md w-96">
            <h3 className="text-xl font-medium mb-4">Add Purchase Rights</h3>
            <form onSubmit={handleCopyrightFormSubmit}>
              <div className="flex flex-col mb-4">
                <label htmlFor="duration" className="font-medium text-gray-700">Duration (days):</label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  value={copyrightData.duration}
                  onChange={handleCopyrightInputChange}
                  className="border border-gray-300 rounded-md p-2"
                  required
                />
              </div>
              <div className="flex flex-col mb-4">
                <label htmlFor="price" className="font-medium text-gray-700">Price (ETH):</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={copyrightData.price}
                  onChange={handleCopyrightInputChange}
                  className="border border-gray-300 rounded-md p-2"
                  required
                />
              </div>
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="isAvailable"
                  name="isAvailable"
                  checked={copyrightData.isAvailable}
                  onChange={(e) => setCopyrightData({ ...copyrightData, isAvailable: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="isAvailable" className="text-gray-700">Available for purchase</label>
              </div>
              <button type="submit" className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Add Purchase Rights
              </button>
              <button
                type="button"
                onClick={handleBack}
                className="w-full mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Back
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
