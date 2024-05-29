import {ethers} from "ethers";

const ERC721_ABI = [
    // Only the ownerOf function is needed for this example
    "function ownerOf(uint256 tokenId) external view returns (address)"
];

export const verifySignature = (message, signature, walletAddress) => {
    // Recover the address that signed the message
    const recoveredAddress = ethers.utils.verifyMessage(message, signature);

    // Compare the recovered address with the provided wallet address
    return recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
};

export const verifyNFTOwner = async (nftAddress, tokenId, walletAddress) => {
    // Recover the address that signed the message
    console.log(nftAddress, tokenId, walletAddress)
    const provider = new ethers.providers.JsonRpcProvider('https://eth-rpc-api.thetatoken.org');
    const contract = new ethers.Contract(ethers.utils.getAddress(nftAddress), ERC721_ABI, provider);

    try {
        // Get the owner of the token
        const owner = await contract.ownerOf(tokenId);
        // Compare the owner address with the wallet address
        return owner.toLowerCase() === walletAddress.toLowerCase();
    } catch (error) {
        console.error('Error checking NFT ownership:', error);
        return false;
    }
};