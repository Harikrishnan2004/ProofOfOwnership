'use client';
import { useEffect, useState } from "react";
import { readContract, prepareContractCall } from "thirdweb";
import { getContract } from "thirdweb";
import { TransactionButton } from "thirdweb/react";
import { sepolia } from "thirdweb/chains";
import { client } from "./client";
import { PROOFOFOWNERSHIPFACTORY } from "./constants/contracts";

export default function Home() {
  const [ownershipRecords, setOwnershipRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ethToUsdRate, setEthToUsdRate] = useState(0); // State for exchange rate

  // Fetch ETH to USD exchange rate
  const fetchEthToUsdRate = async () => {
    try {
      const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");
      const data = await response.json();
      setEthToUsdRate(data.ethereum.usd); // Update exchange rate
    } catch (error) {
      console.error("Error fetching ETH to USD rate:", error);
    }
  };

  const fetchOwnershipRecords = async () => {
    try {
      const contract = getContract({
        client: client,
        chain: sepolia,
        address: PROOFOFOWNERSHIPFACTORY,
      });

      const totalContracts = await readContract({
        contract,
        method: "function getTotalDeployedContracts() view returns (uint256)",
        params: [],
      });

      const records = [];

      for (let i = 0; i < totalContracts; i++) {
        const record = await readContract({
          contract,
          method: "function ownershipRecords(uint256) view returns (address, address)",
          params: [i],
        });

        const proofOfOwnershipContract = getContract({
          client: client,
          chain: sepolia,
          address: record[1],
        });

        const [title, creatorName, description, IPFSLink, category, email, fileFormat, isActive] = await Promise.all([
          readContract({ contract: proofOfOwnershipContract, method: "function title() view returns (string)", params: [] }),
          readContract({ contract: proofOfOwnershipContract, method: "function creatorName() view returns (string)", params: [] }),
          readContract({ contract: proofOfOwnershipContract, method: "function description() view returns (string)", params: [] }),
          readContract({ contract: proofOfOwnershipContract, method: "function IPFSLink() view returns (string)", params: [] }),
          readContract({ contract: proofOfOwnershipContract, method: "function category() view returns (string)", params: [] }),
          readContract({ contract: proofOfOwnershipContract, method: "function email() view returns (string)", params: [] }),
          readContract({ contract: proofOfOwnershipContract, method: "function fileFormat() view returns (string)", params: [] }),
          readContract({ contract: proofOfOwnershipContract, method: "function isActive() view returns (bool)", params: [] }),
        ]);

        const copyrightOptions = [];

        for (const duration of [1, 6, 12]) {
          const option = await readContract({
            contract: proofOfOwnershipContract,
            method: "function copyrightOptions(uint256) view returns (uint256 price, uint256 buyersCount, uint256 duration, bool isAvailable)",
            params: [duration],
          });

          const [price, buyersCount, optionDuration, isAvailable] = option;

          if (isAvailable) {
            copyrightOptions.push({
              price: parseFloat(price.toString()) / 1e18,
              priceInUSD: (parseFloat(price.toString()) / 1e18) * ethToUsdRate, // Convert to USD
              buyersCount: parseInt(buyersCount.toString(), 10),
              duration: parseInt(optionDuration.toString(), 10),
              contract: proofOfOwnershipContract,
              isAvailable,
            });
          }
        }

        records.push({
          title,
          creatorName,
          description,
          IPFSLink,
          category,
          email,
          fileFormat,
          isActive,
          copyrightOptions,
        });
      }

      setOwnershipRecords(records);
    } catch (error) {
      console.error("Error fetching ownership records:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEthToUsdRate();
    fetchOwnershipRecords();
  }, [ethToUsdRate]);

  return (
    <main className="p-8 pb-12 min-h-[100vh] flex flex-col container mx-auto bg-gradient-to-br from-gray-50 to-gray-200">
      {loading ? (
        <p className="text-lg font-medium text-gray-700 animate-pulse">Loading...</p>
      ) : ownershipRecords.length === 0 ? (
        <p className="text-gray-500 mt-6">No contracts deployed yet.</p>
      ) : (
        <div className="space-y-6">
          {ownershipRecords.map((record, index) => (
            <div
              key={index}
              className="w-full bg-white shadow-md rounded-lg p-6 border border-gray-300 flex flex-col lg:flex-row hover:shadow-xl transition-shadow duration-300 ease-in-out"
            >
              {/* Left Section */}
              <div className="flex-1">
                <h2 className="text-2xl font-semibold mb-2 text-gray-800 truncate">{record.title}</h2>
                <p className="text-gray-700 mb-1"><strong>Creator:</strong> {record.creatorName}</p>
                <p className="text-gray-700 mb-3"><strong>Description:</strong> {record.description}</p>
                <p className="text-gray-600 mb-1"><strong>Category:</strong> {record.category}</p>
                <p className="text-gray-600 mb-1"><strong>Contact Email:</strong> {record.email}</p>
                <p className="text-gray-600 mb-3"><strong>File Format:</strong> {record.fileFormat}</p>
                <p className={`text-sm font-medium ${record.isActive ? "text-green-600" : "text-red-600"}`}>
                  Status: {record.isActive ? "Active" : "Inactive"}
                </p>
                {record.IPFSLink && (
                  <div className="mt-4">
                    <h3 className="text-lg font-medium mb-2 text-gray-800">IPFS Link:</h3>
                    <a
                      href={record.IPFSLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {record.IPFSLink}
                    </a>
                  </div>
                )}
              </div>

              {/* Right Section */}
              <div className="lg:ml-8 mt-6 lg:mt-0 flex-shrink-0">
                {record.copyrightOptions.length > 0 ? (
                  <div className="space-y-4">
                    {record.copyrightOptions.map((option, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-100 p-4 rounded-md border border-gray-300 flex flex-col space-y-2"
                      >
                        <p className="text-gray-800">
                          <strong>Duration:</strong> {option.duration} months
                        </p>
                        <p className="text-gray-800">
                          <strong>Price:</strong> {option.price} ETH (${option.priceInUSD.toFixed(2)})
                        </p>
                        <TransactionButton
                          transaction={() =>
                            prepareContractCall({
                              contract: option.contract,
                              method: "function purchaseRights(uint256)",
                              params: [BigInt(option.duration)],
                              value: BigInt(option.price * 1e18),
                            })
                          }
                          onError={(error) => alert(`Purchase failed: ${error.message}`)}
                          onTransactionConfirmed={() => alert("Purchase successful!")}
                          style={{
                            marginTop: "0.5rem",
                            backgroundColor: "#2563EB",
                            color: "white",
                            padding: "0.5rem 1rem",
                            borderRadius: "0.375rem",
                            cursor: "pointer",
                          }}
                        >
                          Purchase Rights
                        </TransactionButton>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No available options.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
