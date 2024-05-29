import { Router } from 'express';
import axios from 'axios';
import {ethers} from "ethers";
import {verifyNFTOwner, verifySignature} from "../utils/general.js";
import {getAllTicketsOfWallet, getRedeemableTicketId, getTicket, setRedeemable, setTicket} from "../utils/database.js";
import * as crypto from "crypto";
const router = Router();

let tokens = {

}

router.get('/token', async (req, res) => {
    const randomToken = 'bfc3f0a9405bad43d354bbe576546a321096853b6a631ddc0c9841ef04e7c1fb';
    res.json({ message: 'Token', token: randomToken});
});

router.get('/userInfo', async (req, res) => {
    const { walletAddress } = req.query;  // Use req.query for GET requests
    console.log("Wallet:", req.query)
    if (!walletAddress) {
        return res.status(400).send('walletAddress query parameter is required');
    }
    let tickets = []
    let bottles = []
    let allTickets = null;

    for(let wallet of walletAddress) {
        let resTickets = await axios.get(`https://api.opentheta.io/v1/items?contractAddress=0x76fd3bae6531733b8a4f4f63b621bf303d5eb95f&ownerAddress=${wallet}&status=owned`)
        let resBottlesOverview = await axios.get(`https://api.opentheta.io/v1/items?contractAddress=0xe9aaf27d8c900ed22c1f58157da4d56cc37936c0&ownerAddress=${wallet}&status=owned`)
        if(resBottlesOverview.data.items[0]) {
            let resBottles = await axios.get(`https://api.opentheta.io/edition?contract=0xe9aaf27d8c900ed22c1f58157da4d56cc37936c0&ID=${resBottlesOverview.data.items[0].metadataID}&filter=all&ownerAddress=${wallet}`)
            for(let item of resBottles.data.editions) {
                if(item.listedPrice == null) {
                    bottles.push({
                        tokenId: item.tokenId,
                        name: resBottlesOverview.data.items[0].name,
                        imageUrl: resBottlesOverview.data.items[0].imageUrl,
                        setTicketId: await getRedeemableTicketId(item.tokenId),
                        wallet: wallet
                    })
                }
            }
        }
        if(resTickets.data.items) {
            for(let item of resTickets.data.items) {
                const userInfo = await getTicket(item.tokenId)
                tickets.push({
                    tokenId: item.tokenId,
                    name: item.name,
                    imageUrl: item.imageUrl,
                    userInfo: userInfo,
                    wallet: wallet
                })
            }
        }
    }
    allTickets = await getAllTicketsOfWallet(walletAddress);
    // Implement NFT check logic here using ethers.js or web3.js
    // Check if walletAddress holds NFTs from the specified collections
    res.json({ message: 'User Data', nfts: {tickets: tickets, bottles: bottles, userTickets: allTickets}, wallets: walletAddress });
});

router.post('/signin', async (req, res) => {
    const { message, signature, walletAddress } = req.body;
    const jsonMessage = JSON.parse(message)
    const isOwner = await verifyNFTOwner(jsonMessage.contractAddress, jsonMessage.tokenId, walletAddress)
    if(verifySignature(message, signature, walletAddress) && isOwner) {
        try {
            const ticket = await setTicket(jsonMessage.firstName, jsonMessage.lastName, jsonMessage.address, jsonMessage.idNumber, walletAddress, jsonMessage.email, jsonMessage.tokenId)
            console.log(ticket.success)
            res.json({ message: 'User Signed Ticket', success: ticket.success, id: ticket.id });
        } catch {
            res.json({message: 'Error Adding Info to Database', success: false})
        }
    } else {
        res.json({message: 'Wrong signature', success: false})
    }
});

router.post('/signinTD', async (req, res) => {
    const { message, signature, info, walletAddress } = req.body;
    const isOwner = await verifyNFTOwner(info.contractAddress, info.tokenId, walletAddress)
    console.log(message, signature, walletAddress)
    if(verifySignature(message, signature, walletAddress) && isOwner) {
        try {
            const ticket = await setTicket(info.firstName, info.lastName, info.address, info.idNumber, walletAddress, info.email, info.tokenId)
            console.log(ticket.success)
            res.json({ message: 'User Signed Ticket', success: ticket.success, id: ticket.id });
        } catch {
            res.json({message: 'Error Adding Info to Database', success: false})
        }
    } else {
        res.json({message: 'Wrong signature', success: false})
    }
});

router.post('/signRedeemable', async (req, res) => {
    const { message, signature, walletAddress } = req.body;
    const jsonMessage = JSON.parse(message)
    const isOwner = await verifyNFTOwner(jsonMessage.contractAddress, jsonMessage.tokenId, walletAddress)
    if(verifySignature(message, signature, walletAddress) && isOwner) {
        try {
            const redeemable = await setRedeemable(jsonMessage.ticketId, jsonMessage.tokenId)
            console.log(redeemable.success)
            res.json({ message: 'User Signed Redeemable', success: redeemable.success, id: redeemable.id });
        } catch {
            res.json({message: 'Error Adding Info to Database', success: false})
        }
    } else {
        res.json({message: 'Wrong signature', success: false})
    }
});

export default router;